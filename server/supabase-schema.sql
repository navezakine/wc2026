-- ============================================================
--  ליגת הניחושים - מונדיאל 2026  |  Supabase schema (Phase 2)
--  קבוצות ניחוש מבוססות-טלפון, עם חישוב נקודות אוטומטי.
--  הריצו את הקובץ כולו בעורך ה-SQL של Supabase.
-- ============================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid() / gen_random_bytes()

-- ------------------------------------------------------------
--  איפוס (אופציונלי): הסירו את ההערות כדי למחוק טבלאות קיימות
--  מגרסה קודמת ולהתחיל מאפס. שימו לב — פעולה הרסנית!
-- ------------------------------------------------------------
-- drop view  if exists public.leaderboard   cascade;
-- drop view  if exists public.matches_view  cascade;
-- drop table if exists public.predictions   cascade;
-- drop table if exists public.matches       cascade;
-- drop table if exists public.members       cascade;
-- drop table if exists public.groups        cascade;
-- drop table if exists public.profiles      cascade;  -- טבלה ישנה מ-Phase 1

-- ============================================================
--  עזר: יצירת קוד הזמנה קצר וקריא להצטרפות לקבוצה
-- ============================================================
create or replace function public.gen_invite_code()
returns text
language sql volatile
as $$
  select upper(substring(encode(gen_random_bytes(6), 'hex') from 1 for 8));
$$;

-- ============================================================
--  1) GROUPS — קבוצות / ליגות ניחוש פרטיות
-- ============================================================
create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid references auth.users (id) on delete set null,
  invite_code text not null unique default public.gen_invite_code(),
  qr_code_url text,
  created_at  timestamptz not null default now(),
  tier        text not null default 'free'
              check (tier in ('free', 'paid'))
);

comment on table  public.groups            is 'קבוצות ניחוש (ליגות פרטיות)';
comment on column public.groups.name        is 'שם הקבוצה';
comment on column public.groups.created_by  is 'מזהה המשתמש שיצר את הקבוצה (auth.users)';
comment on column public.groups.invite_code is 'קוד הזמנה ייחודי להצטרפות לקבוצה';
comment on column public.groups.qr_code_url is 'קישור לתמונת קוד QR להצטרפות מהירה';
comment on column public.groups.created_at  is 'מועד יצירת הקבוצה';
comment on column public.groups.tier        is 'רמת מנוי: free (חינמי) / paid (בתשלום)';

-- ============================================================
--  2) MEMBERS — חברי הקבוצה (זיהוי לפי מספר טלפון)
-- ============================================================
create table if not exists public.members (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references public.groups (id) on delete cascade,
  phone_number text not null,
  display_name text not null,
  joined_at    timestamptz not null default now(),
  unique (group_id, phone_number)   -- כל מספר טלפון מצטרף פעם אחת לכל קבוצה
);

comment on table  public.members              is 'חברי הקבוצות (משתתפי הניחושים)';
comment on column public.members.group_id     is 'שיוך לקבוצה';
comment on column public.members.phone_number is 'מספר טלפון — לאימות והתראות Twilio';
comment on column public.members.display_name is 'שם תצוגה בטבלת הדירוג';
comment on column public.members.joined_at    is 'מועד ההצטרפות לקבוצה';

create index if not exists idx_members_group on public.members (group_id);

-- ============================================================
--  3) MATCHES — משחקי המונדיאל
-- ============================================================
create table if not exists public.matches (
  id         uuid primary key default gen_random_uuid(),
  home_team  text not null,
  away_team  text not null,
  match_date timestamptz not null,
  home_score int check (home_score >= 0),
  away_score int check (away_score >= 0),
  top_scorer text,
  status     text not null default 'scheduled'
             check (status in ('scheduled', 'live', 'finished'))
);

comment on table  public.matches            is 'משחקי המונדיאל';
comment on column public.matches.home_team   is 'קבוצת הבית';
comment on column public.matches.away_team   is 'קבוצת החוץ';
comment on column public.matches.match_date  is 'מועד תחילת המשחק';
comment on column public.matches.home_score  is 'שערי הבית בפועל (מתמלא לאחר סיום)';
comment on column public.matches.away_score  is 'שערי החוץ בפועל (מתמלא לאחר סיום)';
comment on column public.matches.top_scorer  is 'מלך השערים של המשחק (לצורך ניקוד)';
comment on column public.matches.status      is 'סטטוס: scheduled (טרם החל) / live (חי) / finished (הסתיים)';

-- ============================================================
--  4) PREDICTIONS — ניחושי המשתתפים (ניחוש אחד לכל חבר לכל משחק)
-- ============================================================
create table if not exists public.predictions (
  id                   uuid primary key default gen_random_uuid(),
  member_id            uuid not null references public.members (id) on delete cascade,
  match_id             uuid not null references public.matches (id) on delete cascade,
  predicted_winner     text check (predicted_winner in ('home', 'away', 'draw')),
  predicted_home_score int  check (predicted_home_score >= 0),
  predicted_away_score int  check (predicted_away_score >= 0),
  predicted_top_scorer text,
  points_earned        int  not null default 0,
  submitted_at         timestamptz not null default now(),
  unique (member_id, match_id)
);

comment on table  public.predictions                      is 'ניחושי המשתתפים';
comment on column public.predictions.member_id            is 'המשתתף המנחש';
comment on column public.predictions.match_id             is 'המשחק שעליו נוחש';
comment on column public.predictions.predicted_winner     is 'ניחוש המנצחת: home (בית) / away (חוץ) / draw (תיקו)';
comment on column public.predictions.predicted_home_score is 'ניחוש שערי הבית';
comment on column public.predictions.predicted_away_score is 'ניחוש שערי החוץ';
comment on column public.predictions.predicted_top_scorer is 'ניחוש מלך השערים';
comment on column public.predictions.points_earned        is 'נקודות שנצברו (מחושב אוטומטית בסיום המשחק)';
comment on column public.predictions.submitted_at         is 'מועד שליחת הניחוש';

create index if not exists idx_predictions_member on public.predictions (member_id);
create index if not exists idx_predictions_match  on public.predictions (match_id);

-- ============================================================
--  ניקוד: מנצחת נכונה = 3 | תוצאה מדויקת = 5 | מלך שערים = 2
--  (הניקוד מצטבר — ניחוש מושלם שווה 10 נקודות)
-- ============================================================
create or replace function public.calc_points(
  p_winner text, p_home int, p_away int, p_scorer text,
  a_home int, a_away int, a_scorer text
)
returns int
language plpgsql immutable
as $$
declare
  pts int := 0;
  actual_winner text;
begin
  -- ללא תוצאה בפועל אין נקודות
  if a_home is null or a_away is null then
    return 0;
  end if;

  actual_winner := case
    when a_home > a_away then 'home'
    when a_home < a_away then 'away'
    else 'draw'
  end;

  -- מנצחת נכונה: 3 נקודות
  if p_winner is not null and p_winner = actual_winner then
    pts := pts + 3;
  end if;

  -- תוצאה מדויקת: 5 נקודות
  if p_home is not null and p_away is not null
     and p_home = a_home and p_away = a_away then
    pts := pts + 5;
  end if;

  -- מלך שערים נכון: 2 נקודות
  if p_scorer is not null and a_scorer is not null
     and lower(btrim(p_scorer)) = lower(btrim(a_scorer)) then
    pts := pts + 2;
  end if;

  return pts;
end;
$$;

comment on function public.calc_points is 'חישוב נקודות לניחוש בודד מול תוצאת המשחק';

-- ------------------------------------------------------------
--  טריגר: בעת סיום משחק (או עדכון תוצאה) — חישוב מחדש של כל
--  הניחושים של אותו משחק.
-- ------------------------------------------------------------
create or replace function public.apply_match_results()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'finished'
     and new.home_score is not null
     and new.away_score is not null then
    update public.predictions p
       set points_earned = public.calc_points(
             p.predicted_winner,
             p.predicted_home_score,
             p.predicted_away_score,
             p.predicted_top_scorer,
             new.home_score,
             new.away_score,
             new.top_scorer
           )
     where p.match_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_apply_match_results on public.matches;
create trigger trg_apply_match_results
  after update of status, home_score, away_score, top_scorer
  on public.matches
  for each row
  execute function public.apply_match_results();

-- ------------------------------------------------------------
--  טריגר: ולידציה של ניחוש לפני שמירה — הודעות שגיאה בעברית.
-- ------------------------------------------------------------
create or replace function public.validate_prediction()
returns trigger
language plpgsql
as $$
declare
  m_status text;
begin
  -- בעדכון: אם תוכן הניחוש לא השתנה (למשל חישוב נקודות אוטומטי לאחר
  -- סיום המשחק) — אין צורך לאמת מחדש ולחסום.
  if tg_op = 'UPDATE'
     and new.predicted_winner     is not distinct from old.predicted_winner
     and new.predicted_home_score is not distinct from old.predicted_home_score
     and new.predicted_away_score is not distinct from old.predicted_away_score
     and new.predicted_top_scorer is not distinct from old.predicted_top_scorer then
    return new;
  end if;

  -- המשחק חייב להתקיים
  select status into m_status from public.matches where id = new.match_id;
  if m_status is null then
    raise exception 'המשחק המבוקש לא נמצא';
  end if;

  -- לא ניתן לנחש לאחר תחילת המשחק
  if m_status <> 'scheduled' then
    raise exception 'לא ניתן לשלוח או לעדכן ניחוש לאחר תחילת המשחק';
  end if;

  -- תוצאות חייבות להיות אי-שליליות
  if coalesce(new.predicted_home_score, 0) < 0
     or coalesce(new.predicted_away_score, 0) < 0 then
    raise exception 'תוצאות הניחוש חייבות להיות מספר אי-שלילי';
  end if;

  new.submitted_at := now();
  return new;
end;
$$;

drop trigger if exists trg_validate_prediction on public.predictions;
create trigger trg_validate_prediction
  before insert or update on public.predictions
  for each row
  execute function public.validate_prediction();

-- ============================================================
--  5) LEADERBOARD — טבלת דירוג: סך נקודות לכל חבר בכל קבוצה
-- ============================================================
create or replace view public.leaderboard as
select
  m.group_id,
  m.id                                              as member_id,
  m.display_name,
  coalesce(sum(p.points_earned), 0)                 as total_points,
  count(p.id)                                       as predictions_count,
  count(p.id) filter (where p.points_earned >= 5)   as exact_scores,
  rank() over (
    partition by m.group_id
    order by coalesce(sum(p.points_earned), 0) desc
  )                                                 as rank
from public.members m
left join public.predictions p on p.member_id = m.id
group by m.group_id, m.id, m.display_name;

comment on view public.leaderboard is 'טבלת דירוג: סך הנקודות, מספר הניחושים והדירוג לכל חבר בכל קבוצה';

-- ------------------------------------------------------------
--  עזר: תצוגת משחקים עם תווית סטטוס בעברית
-- ------------------------------------------------------------
create or replace view public.matches_view as
select
  m.*,
  case m.status
    when 'scheduled' then 'טרם החל'
    when 'live'      then 'משחק חי'
    when 'finished'  then 'הסתיים'
  end as status_label
from public.matches m;

comment on view public.matches_view is 'משחקים עם תווית סטטוס מתורגמת לעברית';

-- ============================================================
--  6) אבטחה (RLS) — אופציונלי, מותאם לעבודה דרך השרת
--  ------------------------------------------------------------
--  ההגדרה כאן: קריאה ציבורית למשחקים ולטבלת הדירוג, ושאר
--  פעולות הכתיבה מתבצעות דרך שרת ה-Express עם מפתח ה-
--  service_role (שעוקף RLS). אם תעדיפו כתיבה ישירה מהדפדפן עם
--  אימות טלפון של Supabase — החליפו את המדיניות במדיניות
--  מבוססת auth.jwt() (דוגמה בהערה בתחתית).
-- ============================================================
alter table public.groups      enable row level security;
alter table public.members     enable row level security;
alter table public.matches     enable row level security;
alter table public.predictions enable row level security;

-- קריאה ציבורית של משחקים (לעמודים הפתוחים)
drop policy if exists "matches readable by all" on public.matches;
create policy "matches readable by all"
  on public.matches for select using (true);

-- קריאה ציבורית של קבוצות (לתצוגת שם הקבוצה לפי קוד הזמנה)
drop policy if exists "groups readable by all" on public.groups;
create policy "groups readable by all"
  on public.groups for select using (true);

-- קריאה ציבורית של חברים וניחושים (לטבלת הדירוג)
drop policy if exists "members readable by all" on public.members;
create policy "members readable by all"
  on public.members for select using (true);

drop policy if exists "predictions readable by all" on public.predictions;
create policy "predictions readable by all"
  on public.predictions for select using (true);

-- שים לב: לא הוגדרו מדיניות INSERT/UPDATE/DELETE עבור anon,
-- ולכן כל פעולות הכתיבה חייבות לעבור דרך השרת (service_role).

-- ------------------------------------------------------------
--  חלופה: כתיבה ישירה מהדפדפן עם אימות טלפון (Supabase phone auth).
--  במידה ותקשרו את members.phone_number ל-auth.jwt()->>'phone':
--
--  create policy "member manages own predictions"
--    on public.predictions for all
--    using (exists (
--      select 1 from public.members mm
--      where mm.id = predictions.member_id
--        and mm.phone_number = (auth.jwt() ->> 'phone')
--    ))
--    with check (exists (
--      select 1 from public.members mm
--      where mm.id = predictions.member_id
--        and mm.phone_number = (auth.jwt() ->> 'phone')
--    ));
-- ------------------------------------------------------------
