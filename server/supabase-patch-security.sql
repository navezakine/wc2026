-- ============================================================
--  ליגת הניחושים - מונדיאל 2026  |  SECURITY LOCKDOWN
--  The app talks to the DB ONLY through the Express server, which
--  uses the service_role key (bypasses RLS). The public anon key
--  must therefore have NO direct access to any data.
--
--  With RLS enabled and no permissive policies, anon/authenticated
--  are denied by default. We also revoke table grants for defense
--  in depth. service_role is unaffected (BYPASSRLS).
--  Idempotent.
-- ============================================================

-- 1) Drop the permissive "readable by all" policies
drop policy if exists "matches readable by all"         on public.matches;
drop policy if exists "groups readable by all"          on public.groups;
drop policy if exists "members readable by all"         on public.members;
drop policy if exists "predictions readable by all"     on public.predictions;
drop policy if exists "referral_events readable by all" on public.referral_events;
drop policy if exists "winners readable by all"         on public.winners;

-- 2) Make sure RLS is ON for every table (default-deny without policies)
alter table public.groups          enable row level security;
alter table public.members         enable row level security;
alter table public.matches         enable row level security;
alter table public.predictions     enable row level security;
alter table public.referral_events enable row level security;
alter table public.winners         enable row level security;
alter table public.payments        enable row level security;

-- 3) Revoke direct access from the public API roles (anon = the key shipped
--    to browsers; authenticated = any signed-in Supabase user). The server's
--    service_role keeps full access.
revoke select, insert, update, delete on all tables in schema public from anon, authenticated;
revoke all on public.matches_view, public.leaderboard from anon, authenticated;
