-- Leads: one row per person (by email), enriched every time they get in touch
-- (contact form, newsletter, meeting request, tour quote request).

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  phone text,
  source text not null check (source in ('contact', 'newsletter', 'meeting', 'quote', 'assistant')),
  interest text,
  message text,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Qualified', 'Won', 'Lost')),
  notes text,
  touches integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists leads_email_lower_uniq on leads (lower(email));
create index if not exists leads_status_updated_idx on leads (status, updated_at desc);

alter table leads enable row level security; -- no policies: service-role only
grant all on leads to service_role;
