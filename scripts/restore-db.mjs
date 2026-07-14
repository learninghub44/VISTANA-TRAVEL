#!/usr/bin/env node
/**
 * Restores a backup produced by scripts/backup-db.mjs.
 *
 * This upserts each table's JSON array back in — it does NOT delete rows
 * that exist now but weren't in the backup (so it's safe to run against a
 * database that already has newer data in it, at the cost of not being a
 * true point-in-time restore). If you need an exact rollback, restore into
 * a fresh Supabase project instead of an existing one.
 *
 * Requires (server-only):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS — see supabase/migrations)
 *
 * Usage:
 *   node scripts/restore-db.mjs ./backups/2026-07-14T03-42-00-000Z
 *   node scripts/restore-db.mjs ./backups/2026-07-14T03-42-00-000Z --only=bookings,profiles
 */

import { createClient } from "@supabase/supabase-js";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const backupDir = process.argv[2];
  if (!backupDir) {
    console.error("Usage: node scripts/restore-db.mjs <path-to-backup-dir> [--only=table1,table2]");
    process.exit(1);
  }

  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const onlyTables = onlyArg ? new Set(onlyArg.replace("--only=", "").split(",")) : null;

  const supabase = createClient(supabaseUrl, serviceKey);
  const files = (await readdir(backupDir)).filter((f) => f.endsWith(".json") && f !== "manifest.json");

  console.log(`Restoring from ${backupDir}${onlyTables ? ` (only: ${[...onlyTables].join(", ")})` : ""}\n`);
  console.log("This upserts rows — it will NOT remove rows added since the backup was taken.\n");

  let hadError = false;

  for (const file of files) {
    const table = file.replace(/\.json$/, "");
    if (onlyTables && !onlyTables.has(table)) continue;

    const raw = await readFile(path.join(backupDir, file), "utf-8");
    const rows = JSON.parse(raw);

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`"${table}": nothing to restore, skipping.`);
      continue;
    }

    process.stdout.write(`Restoring "${table}" (${rows.length} rows)... `);
    const { error } = await supabase.from(table).upsert(rows);

    if (error) {
      console.log(`FAILED (${error.message})`);
      hadError = true;
      continue;
    }
    console.log("done");
  }

  if (hadError) {
    console.error("\nOne or more tables failed to restore — check errors above before assuming this worked.");
    process.exit(1);
  }

  console.log("\nRestore complete. Spot-check a few rows before trusting this fully.");
}

main().catch((err) => {
  console.error("Restore failed:", err);
  process.exit(1);
});
