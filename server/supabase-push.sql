-- ============================================================
--  Push Subscriptions — Web Push notifications
--  Run via: node server/scripts/run-sql.js server/supabase-push.sql
-- ============================================================

create table if not exists public.push_subscriptions (
  id          uuid        default gen_random_uuid() primary key,
  member_id   uuid        not null references public.members(id) on delete cascade,
  endpoint    text        not null,
  p256dh      text        not null,
  auth        text        not null,
  created_at  timestamptz default now(),
  constraint push_subscriptions_endpoint_unique unique (endpoint)
);

-- RLS: server-only (service_role bypasses RLS; no public policies)
alter table public.push_subscriptions enable row level security;

comment on table public.push_subscriptions is 'Web Push subscriptions — one row per device';
