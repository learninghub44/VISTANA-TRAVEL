-- Vistana Tours & Travel — baseline schema
--
-- This is the first migration for this project (see AGENTS.md — there was
-- previously no migrations folder, so Supabase tables had to be created by
-- hand to match src/services/db/types.ts). It captures the full schema as
-- implemented today. Run once against a fresh Supabase Postgres database:
--
--   supabase db push
--   -- or, using the Supabase SQL editor: paste this whole file and run it.
--
-- Going forward, add one new numbered file per schema change instead of
-- editing this one, and update the `DatabaseAdapter` interface in
-- src/services/db/types.ts (and both adapters) in the same PR.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Destinations
-- ---------------------------------------------------------------------------
create table if not exists destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  overview text not null,
  images jsonb not null default '[]',
  attractions jsonb not null default '[]',
  activities jsonb not null default '[]',
  weather text not null,
  latitude double precision not null,
  longitude double precision not null,
  travel_tips jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tours
-- ---------------------------------------------------------------------------
create table if not exists tours (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references destinations(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null,
  images jsonb not null default '[]',
  duration_days int not null,
  price_usd numeric(10, 2) not null,
  category text not null,
  difficulty text not null check (difficulty in ('Easy', 'Moderate', 'Hard', 'Challenging')),
  inclusions jsonb not null default '[]',
  exclusions jsonb not null default '[]',
  pickup_location text not null,
  dropoff_location text not null,
  max_guests int not null,
  min_guests int not null,
  languages jsonb not null default '[]',
  guide_id uuid,
  faqs jsonb not null default '[]',
  itinerary jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Hotels
-- ---------------------------------------------------------------------------
create table if not exists hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  star_rating int not null,
  images jsonb not null default '[]',
  room_types jsonb not null default '[]',
  amenities jsonb not null default '[]',
  contact_details jsonb not null default '{}',
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Vehicles
-- ---------------------------------------------------------------------------
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('Safari Land Cruiser', 'Tour Van', 'Bus', 'SUV')),
  capacity int not null,
  driver_name text not null,
  license_plate text not null,
  status text not null default 'Available' check (status in ('Available', 'Maintenance', 'Assigned')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Guides
-- ---------------------------------------------------------------------------
create table if not exists guides (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  languages jsonb not null default '[]',
  experience_years int not null default 0,
  availability boolean not null default true,
  rating numeric(2, 1) not null default 0,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- Now that guides/tours both exist, wire up the FK left dangling above.
alter table tours
  drop constraint if exists tours_guide_id_fkey,
  add constraint tours_guide_id_fkey foreign key (guide_id) references guides(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Profiles (customers + admin; auth is custom bcrypt+JWT, not Supabase Auth)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  name text not null,
  phone text,
  avatar_url text,
  password_hash text,
  email_verified boolean not null default false,
  verification_token text,
  reset_token text,
  reset_token_expires timestamptz,
  favorite_tour_ids jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references tours(id) on delete restrict,
  customer_id uuid not null references profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  adults int not null default 1,
  children int not null default 0,
  special_requests text,
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Awaiting Payment', 'Paid', 'Completed', 'Cancelled', 'Refunded')),
  guide_id uuid references guides(id) on delete set null,
  vehicle_id uuid references vehicles(id) on delete set null,
  total_price numeric(10, 2) not null,
  -- Customer-uploaded documents (passport scans, visa letters, etc.),
  -- populated via uploadBookingDocumentAction.
  document_urls jsonb,
  created_at timestamptz not null default now()
);

create index if not exists bookings_customer_id_idx on bookings(customer_id);
create index if not exists bookings_tour_id_idx on bookings(tour_id);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references tours(id) on delete cascade,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  content text not null,
  images jsonb,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_tour_id_idx on reviews(tour_id);

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------
create table if not exists blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  category text not null,
  author text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Testimonials
-- ---------------------------------------------------------------------------
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_location text,
  avatar_url text,
  content text not null,
  rating int not null check (rating between 1 and 5),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Partners
-- ---------------------------------------------------------------------------
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  website_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FAQs
-- ---------------------------------------------------------------------------
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Newsletter subscribers
-- ---------------------------------------------------------------------------
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------------
create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  category text,
  destination_id uuid references destinations(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Social Feed (admin-curated — no live Instagram/Facebook API integration)
-- ---------------------------------------------------------------------------
create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  platform text not null check (platform in ('instagram', 'facebook', 'tiktok', 'twitter')),
  post_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Audit Logs
-- ---------------------------------------------------------------------------
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  actor_name text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on audit_logs(created_at desc);

-- ---------------------------------------------------------------------------
-- Site Settings — single row keyed by a fixed id
-- ---------------------------------------------------------------------------
create table if not exists site_settings (
  id text primary key default 'site-settings',
  facebook_url text,
  instagram_url text,
  twitter_url text,
  tiktok_url text,
  youtube_url text,
  linkedin_url text,
  whatsapp_number text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values ('site-settings')
on conflict (id) do nothing;
