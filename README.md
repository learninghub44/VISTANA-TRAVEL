# Vistana Tours & Travel

Booking and management platform for a tours company operating in Kenya and
Tanzania: public marketing site, customer booking portal, and admin
dashboard. Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
Supabase (Postgres + Storage) for data and file storage.

## Getting started

```bash
npm install
npm run dev
```

Without `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` set, the
app falls back to a local JSON file at `src/data/local_db.json` — fine for
local dev, not for production.

## Environment variables

Required:
- `SESSION_SECRET` — 32+ random chars (`openssl rand -base64 32`), signs auth session JWTs
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` — server-side DB access bypassing RLS; without it the app falls back to the anon key, which is only safe with RLS disabled (not recommended — see `supabase/migrations/20260714000001_enable_rls.sql`)
- `NEXT_PUBLIC_APP_URL` — production URL, used to build email links
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — seeds the first admin account on boot

Recommended (feature degrades gracefully without it):
- `RESEND_API_KEY` — emails are console-logged instead of sent if unset
- `SUPABASE_STORAGE_BUCKET` — defaults to `images`; without Supabase configured at all, uploads fall back to local filesystem storage, which does not persist on Workers/Pages (see `supabase/migrations/20260714120001_create_storage_bucket.sql` for the bucket setup)
- `GROQ_API_KEY`, `GROQ_MODEL` — AI assistant feature is disabled without a key

Not wired up yet (safe to leave unset): `STRIPE_SECRET_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` — payments and WhatsApp integration are future-ready abstraction layers only, per the original spec.

## Database

First-time setup: run `supabase/migrations/*.sql` in order against your
Supabase project (SQL editor, or `supabase db push`). Add one new numbered
migration file per schema change going forward — don't edit the baseline.

## Deploying

Recommended target: **Cloudflare Workers via the OpenNext adapter**
(`@opennextjs/cloudflare`) — Cloudflare's currently-recommended way to run
Next.js, with full Node.js runtime support (needed here for bcryptjs,
custom JWT sessions, and Server Actions). Cloudflare Pages via
`next-on-pages` is deprecated and Edge-runtime-only; don't use it for this
app.

```bash
npm run preview   # builds and runs locally against the Workers runtime
npm run deploy     # builds and deploys to Cloudflare Workers
```

Config lives in `wrangler.jsonc` and `open-next.config.ts`. Set secrets with:

```bash
npx wrangler secret put SESSION_SECRET
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put GROQ_API_KEY
# ...etc for any other secret values
```

Non-secret vars (`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`) are set in `wrangler.jsonc` under `vars` —
but note `NEXT_PUBLIC_*` values are inlined into the client bundle at
**build** time, so they must also be present as env vars wherever
`npm run deploy` actually runs (CI secrets or a local `.env.production`),
not just in `wrangler.jsonc`.

`ADMIN_EMAIL`, `SUPABASE_STORAGE_BUCKET`, and `GROQ_MODEL` aren't secret and
can go in `wrangler.jsonc`'s `vars` too.
