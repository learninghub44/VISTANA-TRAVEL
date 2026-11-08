import { DatabaseAdapter } from "./types";
import { localDb } from "./localDb";
import { supabaseDb } from "./supabaseDb";
import { withResilience } from "./resilient";

const useSupabase = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only the remote database needs timeouts/retries/stale fallback; the local JSON file does not.
export const db: DatabaseAdapter = useSupabase ? withResilience(supabaseDb) : localDb;

console.log(`[Vistana DB Service] Active database provider: ${useSupabase ? "Supabase (PostgreSQL)" : "Local JSON persistent file"}`);
export * from "./types";
export { localDb } from "./localDb";
export { supabaseDb } from "./supabaseDb";
export { DatabaseUnavailableError } from "./resilient";
export type { DatabaseAdapter };
