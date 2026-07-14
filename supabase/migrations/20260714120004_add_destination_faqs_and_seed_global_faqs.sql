-- Add per-destination FAQs (mirrors the existing tours.faqs jsonb column)
-- so destination pages can show and admins can edit destination-specific
-- frequently asked questions, same as tours already support.
alter table destinations
  add column if not exists faqs jsonb not null default '[]';

-- Seed the site-wide FAQ list (used by /faqs and the homepage FAQ section)
-- with sensible starter content. Previously this table had no default rows,
-- so those pages rendered as empty until an admin manually added entries.
insert into faqs (id, question, answer, "order")
select gen_random_uuid(), q.question, q.answer, q.ord
from (values
  ('How do I book a safari or tour?', 'Browse tours on the site, select your dates and group size, and submit a booking request. Our team will confirm availability and follow up with payment details via email or WhatsApp.', 1),
  ('What payment methods do you accept?', 'We accept M-Pesa, major credit/debit cards, and bank transfer. A deposit secures your booking, with the balance due before departure.', 2),
  ('Do I need a visa to travel to Kenya or Tanzania?', 'Most visitors need a visa or eTA for Kenya and Tanzania. Requirements vary by nationality, so check with the relevant embassy or apply online in advance of your trip.', 3),
  ('What is your cancellation and refund policy?', 'Refund terms depend on how far in advance you cancel. See our Refund Policy page for full details, or contact us directly for your specific booking.', 4),
  ('What should I pack for a safari?', 'Neutral-colored lightweight clothing, a warm layer for early mornings and evenings, sturdy closed shoes, sun protection, and any personal medication. We will send a detailed packing list once your trip is confirmed.', 5),
  ('Is travel insurance required?', 'We strongly recommend comprehensive travel insurance covering medical evacuation, trip cancellation, and lost luggage for all safari and travel bookings.', 6)
) as q(question, answer, ord)
where not exists (select 1 from faqs);
