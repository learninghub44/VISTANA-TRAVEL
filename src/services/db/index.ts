import { DatabaseAdapter } from "./types";
import { localDb } from "./localDb";
import { supabaseDb } from "./supabaseDb";
import { withResilience } from "./resilient";

const useSupabase = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only the remote database needs timeouts/retries/stale fallback; the local JSON file does not.
// In production ALL data lives in Supabase. Falling back to the local JSON file
// there would silently keep bookings/users on a throwaway disk, so refuse
// instead (lazily — `next build` legitimately runs without runtime env).
const missingDbInProduction =
  process.env.NODE_ENV === "production" && !useSupabase && process.env.NEXT_PHASE !== "phase-production-build";

const unavailable: DatabaseAdapter = new Proxy({} as DatabaseAdapter, {
  get() {
    throw new Error(
      "Supabase is not configured in production (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
        "Refusing to fall back to the local JSON database."
    );
  },
});

export const db: DatabaseAdapter = missingDbInProduction
  ? unavailable
  : useSupabase
    ? withResilience(supabaseDb, process.env.NEXT_PHASE === "phase-production-build" ? { timeoutMs: 3000, retries: 0 } : {})
    : localDb;

console.log(`[Vistana DB Service] Active database provider: ${useSupabase ? "Supabase (PostgreSQL)" : "Local JSON persistent file"}`);
export * from "./types";
export { localDb } from "./localDb";
export { supabaseDb } from "./supabaseDb";
export { DatabaseUnavailableError } from "./resilient";
export type { DatabaseAdapter };
