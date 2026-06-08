-- ============================================================
--  ליגת הניחושים - מונדיאל 2026  |  Schema PATCH (Phase 6)
--  Payment-ready infrastructure (NO payment provider wired yet).
--  Idempotent.
-- ============================================================

-- groups: PayPlus page ref (filled later)
alter table public.groups
  add column if not exists page_request_uid text;
comment on column public.groups.page_request_uid is 'מזהה דף תשלום PayPlus (יתמלא בשלב התשלומים)';

-- payments table
create table if not exists public.payments (
  id               uuid primary key default gen_random_uuid(),
  group_id         uuid references public.groups (id) on delete set null,
  member_id        uuid references public.members (id) on delete set null,
  transaction_uid  text,                       -- PayPlus transaction_uid (ריק בינתיים)
  page_request_uid text,                       -- PayPlus page_request_uid (ריק בינתיים)
  amount           int  not null default 29,
  currency         text not null default 'ILS',
  status           text not null check (status in ('approved', 'failed', 'cancelled', 'manual')),
  created_at       timestamptz not null default now()
);

comment on table  public.payments         is 'תשלומי שדרוג קבוצות (29 ש"ח)';
comment on column public.payments.status  is 'approved / failed / cancelled / manual (שדרוג ידני)';
comment on column public.payments.amount  is 'סכום בש"ח (תמיד 29)';

create index if not exists idx_payments_group on public.payments (group_id);

-- RLS: payments are sensitive — accessible only via the server (service_role,
-- which bypasses RLS). No anon/authenticated policies => deny by default.
alter table public.payments enable row level security;
