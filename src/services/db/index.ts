import { DatabaseAdapter } from "./types";
import { localDb } from "./localDb";
import { supabaseDb } from "./supabaseDb";

const useSupabase = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const db: DatabaseAdapter = useSupabase ? supabaseDb : localDb;

console.log(`[Vistana DB Service] Active database provider: ${useSupabase ? "Supabase (PostgreSQL)" : "Local JSON persistent file"}`);
export * from "./types";
export { localDb } from "./localDb";
export { supabaseDb, supabase } from "./supabaseDb";
export type { DatabaseAdapter };
