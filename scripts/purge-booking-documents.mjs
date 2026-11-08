// Deletes every previously uploaded booking document from Supabase Storage.
// Dry run by default; pass --apply to actually delete.
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/purge-booking-documents.mjs --apply
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await supabase.from("bookings").select("id, document_urls").not("document_urls", "is", null);
if (error) {
  if (/document_urls/.test(error.message)) {
    console.log("No document_urls column — nothing to purge.");
    process.exit(0);
  }
  throw error;
}

// Old rows hold public URLs (…/object/public/<bucket>/<path>); some may hold bare paths.
const byBucket = {};
for (const row of data) {
  for (const ref of row.document_urls || []) {
    const m = String(ref).match(/\/object\/(?:public|sign)\/([^/]+)\/([^?]+)/);
    const bucket = m ? m[1] : "booking-documents";
    const path = decodeURIComponent(m ? m[2] : String(ref));
    (byBucket[bucket] ||= []).push(path);
  }
}

for (const [bucket, paths] of Object.entries(byBucket)) {
  console.log(`${apply ? "Deleting" : "Would delete"} ${paths.length} file(s) from "${bucket}"`);
  if (apply) {
    const { error: rmErr } = await supabase.storage.from(bucket).remove(paths);
    if (rmErr) throw rmErr;
  }
}
if (apply) {
  const { error: upErr } = await supabase.from("bookings").update({ document_urls: null }).not("document_urls", "is", null);
  if (upErr) throw upErr;
}
console.log(apply ? "Done." : "Dry run only. Re-run with --apply to delete.");
