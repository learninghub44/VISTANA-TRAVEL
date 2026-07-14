#!/usr/bin/env node
/**
 * Runs scripts/backup-db.mjs on a fixed interval, for hosts that don't have
 * their own cron/scheduled-task feature. Deliberately not a GitHub Action —
 * intended to run as a small always-on worker process instead (e.g. a
 * second service on Render/Railway pointed at `node scripts/backup-scheduler.mjs`).
 *
 * If your host DOES have native scheduled tasks (Render Cron Jobs, Railway
 * Cron Jobs, a plain crontab on a VM, etc.), prefer that over this script —
 * point it at `npm run backup` directly and skip running this file at all.
 * This script only exists for hosts where that isn't an option.
 *
 * Env:
 *   BACKUP_INTERVAL_HOURS   how often to run (default: 24)
 *   (plus everything scripts/backup-db.mjs itself needs)
 *
 * Usage:
 *   node scripts/backup-scheduler.mjs
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const intervalHours = Number(process.env.BACKUP_INTERVAL_HOURS || 24);
const intervalMs = intervalHours * 60 * 60 * 1000;

function runBackup() {
  const startedAt = new Date().toISOString();
  console.log(`[backup-scheduler] Starting backup at ${startedAt}`);

  const child = spawn(process.execPath, [path.join(__dirname, "backup-db.mjs")], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code) => {
    console.log(`[backup-scheduler] Backup finished with exit code ${code}`);
  });
}

console.log(`[backup-scheduler] Running every ${intervalHours}h. First backup starting now.`);
runBackup();
setInterval(runBackup, intervalMs);
