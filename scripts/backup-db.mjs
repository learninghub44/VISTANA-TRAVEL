#!/usr/bin/env node
/**
 * Backs up every application table to timestamped JSON files.
 *
 * Why this exists: there was no backup strategy for the Supabase database
 * at all (see AGENTS.md). This is a plain Node script rather than a GitHub
 * Action or other CI-specific tooling, so it can be run however fits your
 * setup — a manual `node scripts/backup-db.mjs`, a cron job on Render/
 * Railway, a scheduled task elsewhere, etc.
 *
 * Requires (server-only, never commit these):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS — see supabase/migrations)
 *
 * Optional, to also upload the backup to a private Supabase Storage bucket
 * instead of only writing it locally (uses the same credentials as above —
 * no separate setup needed):
 *   SUPABASE_BACKUP_BUCKET   (defaults to "backups")
 *
 * Usage:
 *   node scripts/backup-db.mjs
 *
 * Restoring: each table's rows are written as a plain JSON array, so a
 * restore is `upsert`-ing that array back into the same table (e.g. via the
 * Supabase JS client or SQL `insert ... on conflict do nothing`). There is
 * no automated restore script yet — write one before you actually need it,
 * not during an incident.
 */

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const TABLES = [
  "destinations",
  "tours",
  "hotels",
  "vehicles",
  "guides",
  "profiles",
  "bookings",
  "reviews",
  "blogs",
  "testimonials",
  "partners",
  "faqs",
  "newsletter_subscribers",
  "gallery_images",
  "social_posts",
  "audit_logs",
  "site_settings",
];

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Nothing to back up against."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(process.cwd(), "backups", timestamp);
  await mkdir(outDir, { recursive: true });

  const manifest = { timestamp, tables: {} };
  let hadError = false;

  for (const table of TABLES) {
    process.stdout.write(`Backing up "${table}"... `);
    const { data, error } = await supabase.from(table).select("*");

    if (error) {
      console.log(`FAILED (${error.message})`);
      manifest.tables[table] = { error: error.message };
      hadError = true;
      continue;
    }

    const filePath = path.join(outDir, `${table}.json`);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    manifest.tables[table] = { rowCount: data.length };
    console.log(`${data.length} rows`);
  }

  await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\nBackup written to ${outDir}`);

  await maybeUploadToSupabaseStorage(supabase, outDir, timestamp);

  if (hadError) {
    console.error("\nOne or more tables failed to back up — see manifest.json.");
    process.exit(1);
  }
}

async function maybeUploadToSupabaseStorage(supabase, outDir, timestamp) {
  // Uses the same service-role client as the table reads above, so no
  // separate credentials are needed. The bucket is private (not public like
  // the "images" bucket) since backups contain sensitive data such as
  // password_hash — only the service-role key can read/write it, same as
  // every other table in this project.
  const bucket = process.env.SUPABASE_BACKUP_BUCKET || "backups";

  const { readdir, readFile } = await import("node:fs/promises");
  const files = await readdir(outDir);

  for (const file of files) {
    const body = await readFile(path.join(outDir, file));
    const key = `${timestamp}/${file}`;
    const { error } = await supabase.storage.from(bucket).upload(key, body, {
      contentType: "application/json",
      upsert: true,
    });
    if (error) {
      console.log(`FAILED to upload ${key} to Supabase Storage: ${error.message}`);
      continue;
    }
    console.log(`Uploaded ${key} to Supabase Storage bucket "${bucket}"`);
  }
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
