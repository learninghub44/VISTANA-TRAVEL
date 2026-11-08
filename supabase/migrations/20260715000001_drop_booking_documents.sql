-- Customer document uploads (passport/visa scans) are no longer collected.
--
-- RUN ONLY AFTER `node scripts/purge-booking-documents.mjs --apply` has deleted
-- the stored files: this column is the only record of where they live.
alter table bookings drop column if exists document_urls;
