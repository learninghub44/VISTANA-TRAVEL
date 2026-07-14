-- Storage bucket for image uploads (gallery, blog covers, destination/tour
-- photos, etc.) — replaces the old Cloudflare R2 storage provider.
--
-- Uploads always go through the server (src/services/storage/index.ts),
-- authenticated with SUPABASE_SERVICE_ROLE_KEY, which bypasses storage RLS
-- entirely — same pattern as every other table in this project (see
-- 20260714000001_enable_rls.sql). The bucket is marked `public = true` so
-- that once an image is uploaded, its public URL
-- (https://<project>.supabase.co/storage/v1/object/public/images/<file>)
-- can be embedded directly in pages without any signing or auth on reads.
--
-- `public = true` only affects reads of files already in the bucket — it
-- does NOT allow anonymous uploads/deletes, since there are no storage
-- policies granting the anon/authenticated role write access below.

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- Private bucket for scripts/backup-db.mjs. Backups contain sensitive data
-- (e.g. profiles.password_hash), so this is intentionally NOT public —
-- reads/writes only work via the service-role key, same as every table.
insert into storage.buckets (id, name, public)
values ('backups', 'backups', false)
on conflict (id) do update set public = false;
