-- =====================================================================
-- CHII authentication: user roles (4 November 2026)
-- Each signed-in user has one row here, which sets what they may open:
--   admin -> HEMP, HENT, HECO and EXECUTIVE dashboards
--   HEMP  -> HEMP only
--   HENT  -> HENT only
--   HECO  -> HECO only
-- Users are created by an admin in Supabase (Authentication -> Users), then
-- given a row here. Users without a row cannot open any dashboard.
-- A user can read only their own row.
-- Run with: npx supabase db push
-- =====================================================================
begin;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'HEMP', 'HENT', 'HECO')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "users read own profile" on profiles;
create policy "users read own profile" on profiles
  for select to authenticated
  using (auth.uid() = id);

-- No insert, update or delete policy: only an admin (service role) changes roles.

commit;

-- Example: give a user the HENT role (replace the email address):
--   insert into profiles (id, role)
--   select id, 'HENT' from auth.users where email = 'person@example.org';
