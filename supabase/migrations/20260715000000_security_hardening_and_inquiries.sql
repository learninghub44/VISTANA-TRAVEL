-- Security hardening + real contact inquiries.
--
-- 1. profiles.password_changed_at  — lets the app invalidate sessions issued
--    before a password reset (see getVerifiedSession in src/services/auth).
-- 2. Case-insensitive unique email  — "Jane@X.com" and "jane@x.com" must be
--    one account (the app now lower-cases every email it stores/looks up).
-- 3. Token hygiene                  — verification/reset tokens are now stored
--    as SHA-256 hashes. Any plaintext tokens already in the table can no
--    longer match and are just leaked secrets, so they are cleared here.
--    (Users who never verified can request a new link; password-reset links
--    issued before this deploy stop working — users simply request a new one.)
-- 4. inquiries table                — the contact form used to discard every
--    message; now they are stored (and emailed to the office).

alter table profiles add column if not exists password_changed_at timestamptz;

update profiles
   set reset_token = null,
       reset_token_expires = null,
       verification_token = null
 where reset_token is not null or verification_token is not null;

do $$
begin
  create unique index if not exists profiles_email_lower_uniq on profiles (lower(email));
exception when unique_violation then
  raise notice 'Duplicate emails differing only by case exist — merge them, then re-run this index creation.';
end $$;

create index if not exists profiles_reset_token_idx on profiles (reset_token) where reset_token is not null;
create index if not exists profiles_verification_token_idx on profiles (verification_token) where verification_token is not null;

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'New' check (status in ('New', 'Replied', 'Archived')),
  created_at timestamptz not null default now()
);

create index if not exists inquiries_status_created_idx on inquiries (status, created_at desc);

-- Same default-deny pattern as every other table: no policies, service-role only.
alter table inquiries enable row level security;

