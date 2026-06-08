-- ============================================================
--  ליגת הניחושים - מונדיאל 2026  |  Schema PATCH (Phase 5)
--  Competition consent timestamp. Idempotent.
-- ============================================================

alter table public.members
  add column if not exists competition_consent_at timestamptz;

comment on column public.members.competition_consent_at
  is 'מועד אישור תקנון התחרות (גיל 18+)';
