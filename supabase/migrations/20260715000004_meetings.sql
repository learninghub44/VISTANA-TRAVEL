-- Meeting / consultation requests, created by customers through the AI
-- assistant (or the site) and handled by the team in /admin/meetings.

create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  topic text not null,
  channel text not null check (channel in ('Video call', 'Phone call', 'WhatsApp call', 'Office visit')),
  preferred_date date not null,
  preferred_time text not null,
  notes text,
  tour_slug text,
  status text not null default 'Requested' check (status in ('Requested', 'Confirmed', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists meetings_status_date_idx on meetings (status, preferred_date);

alter table meetings enable row level security; -- no policies: service-role only
grant all on meetings to service_role;
