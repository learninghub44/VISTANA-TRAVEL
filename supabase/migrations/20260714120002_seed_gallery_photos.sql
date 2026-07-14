-- Seeds the Photo Gallery section on the homepage (empty by default) with a
-- curated set of safari/beach/nature photos matching this project's
-- destinations (Maasai Mara, Serengeti, Zanzibar, Diani Beach). Same source
-- images already used elsewhere in src/services/db/localDb.ts, so they're
-- consistent with the rest of the site.
--
-- Idempotent: fixed ids + `on conflict do nothing`, safe to re-run.

insert into gallery_images (id, image_url, caption, category, created_at) values
  ('11111111-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80', 'The Great Wildebeest Migration crossing the Maasai Mara', 'Safari', now() - interval '2 days'),
  ('11111111-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80', 'Golden hour over the Mara savanna', 'Safari', now() - interval '4 days'),
  ('11111111-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80', 'Game drive at sunset, Maasai Mara National Reserve', 'Wildlife', now() - interval '6 days'),
  ('11111111-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80', 'The endless plains of the Serengeti', 'Nature', now() - interval '8 days'),
  ('11111111-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=1200&q=80', 'Wildlife up close in the Serengeti ecosystem', 'Wildlife', now() - interval '10 days'),
  ('11111111-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=1200&q=80', 'Turquoise waters off the Zanzibar Archipelago', 'Beach', now() - interval '12 days'),
  ('11111111-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1200&q=80', 'Sunset dhow cruise, Zanzibar', 'Beach', now() - interval '14 days'),
  ('11111111-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 'Pristine white sands of Diani Beach', 'Beach', now() - interval '16 days'),
  ('11111111-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=1200&q=80', 'Palm groves along the Diani coastline', 'Nature', now() - interval '18 days')
on conflict (id) do nothing;
