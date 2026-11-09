-- Newer Supabase projects no longer hand table privileges to service_role
-- automatically, so every server-side query failed with
--   42501 "permission denied for table ..."
-- even with the correct service key. The app talks to the database ONLY through
-- the service-role key on the server (RLS stays enabled with no policies, so
-- anon/authenticated keys still cannot read or write anything).

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Cover tables/functions created by future migrations too.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;
