import { db } from "@/services/db";
import { hashPassword } from "./password";

/**
 * Ensures exactly one admin account exists, created from ADMIN_EMAIL / ADMIN_PASSWORD
 * env vars. This replaces the old hardcoded "admin@vistana.com" / "admin" backdoor.
 * Safe to call on every login/register request — it's a cheap no-op once an admin exists.
 */
// Once an admin is known to exist this stays true for the isolate's lifetime,
// so logins stop scanning the whole profiles table.
let adminKnownToExist = false;

export async function ensureAdminSeeded(): Promise<void> {
  if (adminKnownToExist) return;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) return; // nothing to seed with

  const profiles = await db.getProfiles();
  const adminExists = profiles.some((p) => p.role === "admin");
  if (adminExists) {
    adminKnownToExist = true;
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  await db.saveProfile({
    id: crypto.randomUUID(),
    email: adminEmail.trim().toLowerCase(),
    role: "admin",
    name: "Admin",
    password_hash: passwordHash,
    email_verified: true,
    created_at: new Date().toISOString(),
  });

  adminKnownToExist = true;
  console.log("[Vistana Auth] Seeded initial admin account from ADMIN_EMAIL. Remove ADMIN_EMAIL/ADMIN_PASSWORD from the environment now.");
}
