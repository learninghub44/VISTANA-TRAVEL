import { createClient, SupabaseClient } from "@supabase/supabase-js";

// NOTE ON INITIALIZATION TIMING: this client must be built lazily, on first
// use inside a request, not once at module top-level. On Cloudflare Workers
// (via the OpenNext adapter), reading process.env at import time is risky —
// module-level code can run before per-request env population has happened
// for a given isolate, silently falling back to the anon key. RLS is
// enabled with zero policies on every table (see
// supabase/migrations/20260714000001_enable_rls.sql), so an anon-key client
// can SELECT (returns empty rows, no error) but every INSERT/UPDATE fails
// with 42501 "new row violates row-level security policy". Building lazily
// removes that ordering risk entirely: env vars are always read at call
// time, never at import time.
//
// Shared by src/services/db/supabaseDb.ts (database tables) and
// src/services/storage/index.ts (Supabase Storage buckets) — both need the
// same service-role client and the same fallback/diagnostic behavior.
let client: SupabaseClient | null = null;
let warnedAboutFallback = false;
let loggedKeySource = false;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  // This is only ever used server-side (server actions / server components —
  // verified no "use client" file imports it), so it's safe to use the
  // service-role key here, which bypasses Row Level Security. This is
  // required once RLS is enabled since the app does its own auth checks in
  // src/app/actions/index.ts rather than relying on Supabase Auth /
  // auth.uid(). Falls back to the anon key with a loud warning so existing
  // setups don't silently break, but that fallback only works for reads if
  // RLS is left disabled — not recommended for production, and never works
  // for writes once RLS is on.
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabaseKey = supabaseServiceKey || supabaseAnonKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and either " +
      "SUPABASE_SERVICE_ROLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY as runtime " +
      "secrets/vars in Cloudflare (wrangler secret put ..., not just wrangler.jsonc `vars`)."
    );
  }

  if (!loggedKeySource) {
    // Safe diagnostic: confirms which key was actually picked up at runtime
    // without ever printing the key itself. Check `wrangler tail` for this
    // line after a deploy to instantly see whether the service key landed.
    console.log(
      `[Vistana DB Service] Supabase client using ${supabaseServiceKey ? "SERVICE ROLE" : "ANON"} key ` +
      `(service key present: ${Boolean(supabaseServiceKey)}, length: ${supabaseServiceKey.length || 0}).`
    );
    loggedKeySource = true;
  }

  if (!supabaseServiceKey && !warnedAboutFallback) {
    console.warn(
      "[Vistana DB Service] SUPABASE_SERVICE_ROLE_KEY is not set (or not visible at runtime) — falling back to the " +
      "anon key for server-side database/storage access. With RLS enabled and zero policies (the current setup), this " +
      "means every table read will silently return empty results, every table write will fail with 42501 'row-level " +
      "security policy' errors, and Storage uploads will fail unless the bucket is public. Run " +
      "`npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY` against the correct environment and redeploy."
    );
    warnedAboutFallback = true;
  }

  client = createClient(supabaseUrl, supabaseKey);
  return client;
}
