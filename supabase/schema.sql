-- Destroy The Decibel — registration storage.
-- Run once in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

create table if not exists public.registrations (
  id                  uuid primary key default gen_random_uuid(),
  reference           text not null unique check (reference ~ '^DTD-[A-Z0-9]{8}$'),

  full_name           text not null check (char_length(full_name) between 2 and 80),
  phone               text not null check (phone ~ '^[6-9][0-9]{9}$'),
  email               text not null check (char_length(email) <= 254),
  organization        text check (char_length(organization) <= 120),

  vehicle_make        text not null check (char_length(vehicle_make) between 1 and 40),
  vehicle_model       text not null check (char_length(vehicle_model) between 1 and 60),
  manufacturing_year  integer check (manufacturing_year between 1950 and 2100),
  engine_cc           integer not null check (engine_cc between 50 and 2000),
  -- Normalized (upper-case, no separators). One registration per vehicle.
  vehicle_number      text not null unique check (vehicle_number ~ '^[A-Z0-9]{5,11}$'),

  rules_accepted_at   timestamptz not null,

  status              text not null default 'pending'
                        check (status in ('pending', 'paid', 'failed', 'cancelled')),
  amount_paise        integer not null check (amount_paise > 0),
  currency            text not null default 'INR',
  -- Unique so one order / one payment can never confirm two registrations.
  razorpay_order_id   text unique,
  razorpay_payment_id text unique,
  paid_at             timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- A row is "paid" only with a payment id and timestamp, and vice versa.
  constraint paid_requires_payment check (
    (status = 'paid') = (razorpay_payment_id is not null and paid_at is not null)
  )
);

create index if not exists registrations_status_idx on public.registrations (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists registrations_set_updated_at on public.registrations;
create trigger registrations_set_updated_at
  before update on public.registrations
  for each row execute function public.set_updated_at();

-- Row Level Security: enabled with NO policies for anon/authenticated, so the
-- public API keys can read and write nothing. The site talks to this table
-- only from the server with the service-role key, which bypasses RLS.
alter table public.registrations enable row level security;
alter table public.registrations force row level security;

revoke all on public.registrations from anon, authenticated;

-- Explicit deny-all policies document the intent (RLS already denies by default).
drop policy if exists "deny anon" on public.registrations;
create policy "deny anon" on public.registrations
  as restrictive for all to anon using (false) with check (false);

drop policy if exists "deny authenticated" on public.registrations;
create policy "deny authenticated" on public.registrations
  as restrictive for all to authenticated using (false) with check (false);
