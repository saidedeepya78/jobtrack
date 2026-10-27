-- ============================================================================
-- JobTrack database schema for Supabase
-- Run this entire file once in the Supabase SQL Editor.
--
-- SECURITY NOTE
-- This assignment app has no sign-in, so the policies below are intentionally
-- open to the public "anon" role. Anyone who has your deployed site's public
-- anon key can read or modify these rows. That is acceptable for a class demo,
-- but do NOT put real personal data here. Before real-world use, enable
-- Supabase Auth, add a user_id column, and restrict every policy to auth.uid().
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  company text not null check (char_length(btrim(company)) between 1 and 120),
  role text not null check (char_length(btrim(role)) between 1 and 120),
  job_url text check (job_url is null or char_length(job_url) <= 500),
  application_date date not null default current_date,
  status text not null default 'Applied'
    check (status in ('Applied', 'Interview', 'Offer', 'Rejected')),
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_application_date_idx
  on public.applications (application_date desc);

create index if not exists applications_status_idx
  on public.applications (status);

create index if not exists applications_is_sample_idx
  on public.applications (is_sample);

-- Keep updated_at accurate without extra client code.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row
  execute function public.set_updated_at();

-- Row Level Security is enabled. These policies are deliberately permissive
-- for a single-user, no-auth demo. Replace them before using real user data.
alter table public.applications enable row level security;

drop policy if exists "JobTrack demo read" on public.applications;
create policy "JobTrack demo read"
  on public.applications
  for select
  to anon, authenticated
  using (true);

drop policy if exists "JobTrack demo insert" on public.applications;
create policy "JobTrack demo insert"
  on public.applications
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "JobTrack demo update" on public.applications;
create policy "JobTrack demo update"
  on public.applications
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "JobTrack demo delete" on public.applications;
create policy "JobTrack demo delete"
  on public.applications
  for delete
  to anon, authenticated
  using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.applications to anon, authenticated;

-- Done. The app can now use the Project URL and anon/public key.
