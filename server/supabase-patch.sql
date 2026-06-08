-- ============================================================
--  ליגת הניחושים - מונדיאל 2026  |  Schema PATCH (Phase 3)
--  Idempotent: only ALTERs / CREATE IF NOT EXISTS — never recreates
--  existing tables. Safe to run more than once.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
--  1) MEMBERS — referral + scoring columns
-- ============================================================
alter table public.members
  add column if not exists referral_code            text,
  add column if not exists referred_by              uuid references public.members (id) on delete set null,
  add column if not exists competition_entered      boolean not null default false,
  add column if not exists total_points             int     not null default 0,
  add column if not exists prediction_points        int     not null default 0,
  add column if not exists referral_points          int     not null default 0,
  add column if not exists is_early_bird            boolean not null default false,
  add column if not exists referred_prediction_count int    not null default 0;

-- Backfill + default + unique + not-null for referral_code
update public.members set referral_code = public.gen_invite_code() where referral_code is null;
alter table public.members alter column referral_code set default public.gen_invite_code();
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'members_referral_code_key') then
    alter table public.members add constraint members_referral_code_key unique (referral_code);
  end if;
end $$;
alter table public.members alter column referral_code set not null;

comment on column public.members.referral_code      is 'קוד הפניה ייחודי של החבר (לשיתוף)';
comment on column public.members.referred_by        is 'מי הפנה את החבר הזה (members.id)';
comment on column public.members.competition_entered is 'האם החבר נכנס לתחרות הפרסים';
comment on column public.members.total_points       is 'ניקוד כולל = ניקוד ניחושים + min(ניקוד הפניות,100)';
comment on column public.members.prediction_points  is 'ניקוד מניחושים בלבד';
comment on column public.members.referral_points    is 'ניקוד מהפניות (מוגבל ל-100 בחישוב הכולל)';
comment on column public.members.is_early_bird      is 'נרשם מוקדם (early bird)';
comment on column public.members.referred_prediction_count is 'כמה ניחושים ביצע החבר המופנה (מפעיל בונוס לממליץ ב-3)';

-- ============================================================
--  2) MATCHES — round + external id + uppercase status set
-- ============================================================
alter table public.matches
  add column if not exists round       text,
  add column if not exists external_id text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'matches_external_id_key') then
    alter table public.matches add constraint matches_external_id_key unique (external_id);
  end if;
end $$;

-- Drop the old status CHECK constraint(s) FIRST (so the uppercase migration
-- below is not rejected by the old lowercase-only constraint)
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.matches'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute 'alter table public.matches drop constraint ' || quote_ident(c);
  end loop;
end $$;

-- Migrate any old lowercase statuses to the new uppercase set
update public.matches set status = upper(status)
 where status in ('scheduled', 'live', 'finished');

alter table public.matches alter column status set default 'SCHEDULED';
alter table public.matches
  add constraint matches_status_check
  check (status in ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED'));

comment on column public.matches.round       is 'שלב התחרות: בתים / שמינית / רבע / חצי / גמר';
comment on column public.matches.external_id is 'מזהה המשחק במקור החיצוני (football-data.org) — לסנכרון';
comment on column public.matches.status      is 'SCHEDULED / LIVE / FINISHED / POSTPONED / CANCELLED';

-- ============================================================
--  3) PREDICTIONS — outcome + updated_at + voided
-- ============================================================
alter table public.predictions
  add column if not exists predicted_outcome text,
  add column if not exists updated_at        timestamptz not null default now(),
  add column if not exists voided            boolean not null default false;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'predictions_outcome_check') then
    alter table public.predictions add constraint predictions_outcome_check
      check (predicted_outcome is null or predicted_outcome in ('home', 'away', 'draw'));
  end if;
end $$;

-- Backfill outcome from existing predicted winner / scores
update public.predictions
   set predicted_outcome = coalesce(
       predicted_winner,
       case when predicted_home_score > predicted_away_score then 'home'
            when predicted_home_score < predicted_away_score then 'away'
            else 'draw' end)
 where predicted_outcome is null;

-- Ensure the dedupe constraint exists (one prediction per member per match)
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.predictions'::regclass and contype = 'u'
      and conname = 'predictions_member_id_match_id_key'
  ) then
    alter table public.predictions add constraint predictions_member_id_match_id_key unique (member_id, match_id);
  end if;
end $$;

comment on column public.predictions.predicted_outcome is 'ניחוש תוצאה: home / away / draw (לחישוב מנצחת/תיקו)';
comment on column public.predictions.updated_at        is 'מועד עדכון אחרון (נקבע בכל upsert)';
comment on column public.predictions.voided            is 'הניחוש בוטל (משחק שבוטל) — לא נספר בניקוד';

-- ============================================================
--  4) REFERRAL EVENTS
-- ============================================================
create table if not exists public.referral_events (
  id                 uuid primary key default gen_random_uuid(),
  referrer_id        uuid references public.members (id) on delete cascade,
  referred_member_id uuid references public.members (id) on delete cascade,
  event_type         text check (event_type in
                       ('link_join','group_join','group_milestone','streak','perfect_round','early_bird')),
  points_awarded     int not null default 0,
  created_at         timestamptz not null default now()
);
comment on table public.referral_events is 'אירועי הפניה ובונוסים שהוענקו';

-- ============================================================
--  5) WINNERS
-- ============================================================
create table if not exists public.winners (
  id                uuid primary key default gen_random_uuid(),
  member_id         uuid references public.members (id) on delete cascade,
  group_id          uuid references public.groups (id) on delete cascade,
  prize_description text,
  paid_out          boolean not null default false,
  announced_at      timestamptz default now()
);
comment on table public.winners is 'זוכי פרסים בקבוצות';

-- ============================================================
--  6) RLS for the new tables (read public, writes via service_role)
-- ============================================================
alter table public.referral_events enable row level security;
alter table public.winners        enable row level security;

drop policy if exists "referral_events readable by all" on public.referral_events;
create policy "referral_events readable by all" on public.referral_events for select using (true);

drop policy if exists "winners readable by all" on public.winners;
create policy "winners readable by all" on public.winners for select using (true);

grant select on public.referral_events, public.winners to anon, authenticated;

-- ============================================================
--  7) Prediction validation + updated_at (uppercase statuses,
--     editable only while SCHEDULED or POSTPONED, Hebrew error)
-- ============================================================
create or replace function public.validate_prediction()
returns trigger
language plpgsql
as $$
declare
  m_status text;
begin
  -- System-only updates (points/voided) — content unchanged: allow, skip checks
  if tg_op = 'UPDATE'
     and new.predicted_outcome    is not distinct from old.predicted_outcome
     and new.predicted_winner     is not distinct from old.predicted_winner
     and new.predicted_home_score is not distinct from old.predicted_home_score
     and new.predicted_away_score is not distinct from old.predicted_away_score
     and new.predicted_top_scorer is not distinct from old.predicted_top_scorer then
    return new;
  end if;

  select status into m_status from public.matches where id = new.match_id;
  if m_status is null then
    raise exception 'המשחק המבוקש לא נמצא';
  end if;

  -- Editable before kick-off only (SCHEDULED), or while POSTPONED
  if m_status not in ('SCHEDULED', 'POSTPONED') then
    raise exception 'לא ניתן לשנות ניחוש לאחר תחילת המשחק';
  end if;

  if coalesce(new.predicted_home_score, 0) < 0 or coalesce(new.predicted_away_score, 0) < 0 then
    raise exception 'תוצאות הניחוש חייבות להיות מספר אי-שלילי';
  end if;

  -- Derive outcome from the scores if not provided
  if new.predicted_outcome is null and new.predicted_home_score is not null
     and new.predicted_away_score is not null then
    new.predicted_outcome := case
      when new.predicted_home_score > new.predicted_away_score then 'home'
      when new.predicted_home_score < new.predicted_away_score then 'away'
      else 'draw' end;
  end if;
  new.predicted_winner := new.predicted_outcome; -- keep legacy column in sync
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_validate_prediction on public.predictions;
create trigger trg_validate_prediction
  before insert or update on public.predictions
  for each row execute function public.validate_prediction();

-- Points are now calculated by the match-data service (Node), so retire the
-- old DB auto-calc trigger to avoid double counting / stale scoring.
drop trigger if exists trg_apply_match_results on public.matches;

-- ============================================================
--  8) Referral-loop prevention (self / mutual / transitive cycles)
-- ============================================================
create or replace function public.prevent_referral_loops()
returns trigger
language plpgsql
as $$
declare
  cur uuid;
  depth int := 0;
begin
  if new.referred_by is null then
    return new;
  end if;

  -- self referral
  if new.referred_by = new.id then
    new.referred_by := null;
    return new;
  end if;

  -- climb the chain from the proposed referrer; if we reach this member, it's a loop
  cur := new.referred_by;
  while cur is not null and depth < 100 loop
    if cur = new.id then
      new.referred_by := null;   -- loop detected -> nullify (no points awarded)
      return new;
    end if;
    select referred_by into cur from public.members where id = cur;
    depth := depth + 1;
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_prevent_referral_loops on public.members;
create trigger trg_prevent_referral_loops
  before insert or update of referred_by on public.members
  for each row execute function public.prevent_referral_loops();

-- ============================================================
--  9) Match cancellation -> void predictions (postponement keeps them)
-- ============================================================
create or replace function public.handle_match_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'CANCELLED' and old.status is distinct from 'CANCELLED' then
    update public.predictions set voided = true where match_id = new.id;
  elsif new.status <> 'CANCELLED' and old.status = 'CANCELLED' then
    -- un-cancel: restore predictions
    update public.predictions set voided = false where match_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_handle_match_status on public.matches;
create trigger trg_handle_match_status
  after update of status on public.matches
  for each row execute function public.handle_match_status_change();

-- ============================================================
-- 10) Views — Hebrew status labels (5 states) + leaderboard by total_points
-- ============================================================
drop view if exists public.matches_view;
create view public.matches_view as
select
  m.*,
  case m.status
    when 'SCHEDULED' then 'טרם החל'
    when 'LIVE'      then 'משחק חי'
    when 'FINISHED'  then 'הסתיים'
    when 'POSTPONED' then 'המשחק נדחה'
    when 'CANCELLED' then 'המשחק בוטל'
  end as status_label
from public.matches m;
comment on view public.matches_view is 'משחקים עם תווית סטטוס בעברית';

drop view if exists public.leaderboard;
create view public.leaderboard as
select
  m.group_id,
  m.id                as member_id,
  m.display_name,
  m.total_points,
  m.prediction_points,
  m.referral_points,
  (select count(*) from public.predictions p
     where p.member_id = m.id and not p.voided)                          as predictions_count,
  (select count(*) from public.predictions p
     where p.member_id = m.id and not p.voided and p.points_earned >= 10) as exact_scores,
  rank() over (partition by m.group_id order by m.total_points desc)      as rank
from public.members m;
comment on view public.leaderboard is 'טבלת דירוג לפי total_points לכל חבר בכל קבוצה';

grant select on public.matches_view, public.leaderboard to anon, authenticated;
