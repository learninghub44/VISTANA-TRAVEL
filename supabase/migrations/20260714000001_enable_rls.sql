-- Lock down direct access to every table via Supabase's public REST API.
--
-- Context: NEXT_PUBLIC_SUPABASE_ANON_KEY is, by design, shipped to browsers
-- and is not a secret. Without Row Level Security, anyone holding that key
-- (or the anon key of any Supabase project, since it's guessable from the
-- project URL in many setups) can call the PostgREST API directly and
-- read/write every row in every table below — completely bypassing this
-- app's own auth checks (getAdminSession/getCustomerSession in
-- src/app/actions/index.ts), which only protect Next.js server actions, not
-- the database itself.
--
-- This app doesn't use Supabase Auth (auth.uid()), so there's no per-request
-- identity for RLS policies to key off. The simplest correct fix here is:
-- enable RLS with NO policies at all, which denies every request made with
-- the anon or authenticated role, and do all real reads/writes server-side
-- with the service-role key (see src/services/db/supabaseDb.ts and
-- SUPABASE_SERVICE_ROLE_KEY in .env.example), which bypasses RLS entirely.
--
-- Run this after the app has been switched over to SUPABASE_SERVICE_ROLE_KEY
-- — if you apply it while still running on the anon key only, every
-- database call in the app will start failing.

alter table destinations enable row level security;
alter table tours enable row level security;
alter table hotels enable row level security;
alter table vehicles enable row level security;
alter table guides enable row level security;
alter table profiles enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table blogs enable row level security;
alter table testimonials enable row level security;
alter table partners enable row level security;
alter table faqs enable row level security;
alter table newsletter_subscribers enable row level security;
alter table gallery_images enable row level security;
alter table social_posts enable row level security;
alter table audit_logs enable row level security;
alter table site_settings enable row level security;

-- No `create policy` statements follow on purpose: with RLS enabled and zero
-- policies, every table denies all access to the anon/authenticated roles by
-- default. Only the service-role key (used server-side) can read or write.
