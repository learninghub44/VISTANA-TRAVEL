-- Add editable office contact fields to site_settings so the real Nairobi
-- office details (and only real offices) are admin-managed instead of
-- hardcoded in the Contact page / Footer.
alter table site_settings
  add column if not exists office_address text,
  add column if not exists office_phone text,
  add column if not exists office_email text;

update site_settings
set
  office_address = coalesce(office_address, 'Vistana Plaza, 4th Floor, Ngong Road, Nairobi, Kenya'),
  office_phone = coalesce(office_phone, '+254 701 059 192'),
  office_email = coalesce(office_email, 'info@vistanatours.com')
where id = 'site-settings';
