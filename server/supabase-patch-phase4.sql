-- ============================================================
--  ליגת הניחושים - מונדיאל 2026  |  Schema PATCH (Phase 4)
--  Group creator tracking, milestone flag, referral-points cap.
--  Idempotent — safe to re-run.
-- ============================================================

-- Group creator + one-time milestone flag
alter table public.groups
  add column if not exists creator_member_id uuid references public.members (id) on delete set null,
  add column if not exists milestone_awarded boolean not null default false;

comment on column public.groups.creator_member_id is 'החבר שיצר את הקבוצה (לזיכוי בונוס אבן-דרך)';
comment on column public.groups.milestone_awarded is 'האם בונוס 9 חברים כבר הוענק (פעם אחת בלבד)';

-- Referral points are hard-capped at 100, and total_points is kept in sync.
-- Enforced in a trigger so the cap holds no matter who writes.
create or replace function public.enforce_referral_cap()
returns trigger
language plpgsql
as $$
begin
  if new.referral_points < 0   then new.referral_points := 0;   end if;
  if new.referral_points > 100 then new.referral_points := 100; end if;
  new.total_points := coalesce(new.prediction_points, 0) + new.referral_points;
  return new;
end;
$$;

drop trigger if exists trg_referral_cap on public.members;
create trigger trg_referral_cap
  before insert or update on public.members
  for each row execute function public.enforce_referral_cap();
