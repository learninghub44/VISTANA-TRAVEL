<div align="center">

<img src="public/brand/vistana-logo-transparent.png" alt="Vistana Tours & Travel" width="220" />

# Vistana Tours & Travel

**Booking and management platform for a safari & travel operator across Kenya, Tanzania, and Zanzibar.**

Public marketing site · Customer booking portal · Admin dashboard

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_Storage-3ECF8E?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/license-Proprietary-red)

</div>

---

## Overview

Vistana Tours & Travel is a full-stack booking platform for an East African
tour operator, built to handle everything from discovery to post-trip
review:

- **Public site** — destinations, tour packages, hotels, flights, holiday
  packages, blog/journal, FAQs, and an AI-powered travel assistant with
  WhatsApp handoff.
- **Customer portal** — accounts, bookings, favorites, and reviews.
- **Admin dashboard** — content management for destinations, tours, hotels,
  vehicles, guides, bookings, customers, reviews, partners, gallery, social
  posts, FAQs, blog, and site-wide settings (contact details, social links).

## Features

| Area | Highlights |
|---|---|
| **Bookings** | Request → confirm workflow, guide/vehicle assignment, status-change emails and WhatsApp notifications |
| **Content management** | Every public-facing section (destinations, tours, FAQs, blog, contact info) is editable from `/admin` — no code changes needed for day-to-day updates |
| **AI travel assistant** | Groq-powered chat widget grounded in real site content, with a WhatsApp handoff for human follow-up |
| **Auth** | Email/password with verification, password reset, and signed JWT sessions |
| **Reviews** | Customer-submitted, admin-moderated |
| **Legal/compliance pages** | Terms of Service, Privacy Policy, DPA, Refund Policy, MSA, Cyber Liability statement |
| **Audit logging** | Admin actions are recorded for accountability |

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions, Turbopack)
- **UI:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide icons
- **Data:** Supabase (Postgres + Storage), with a local JSON fallback for
  development (see below)
- **Auth:** `jose` (JWT) + `bcryptjs`
- **Email:** Resend
- **AI:** Groq
- **Testing:** Vitest
- **Deployment:** Cloudflare Workers via the OpenNext adapter

## Getting Started

```bash
npm install
npm run dev
```

Without `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, the
app falls back to a local JSON file at `src/data/local_db.json` — fine for
local development, **not** for production.

## Environment Variables

**Required:**

| Variable | Purpose |
|---|---|
| `SESSION_SECRET` | 32+ random chars (`openssl rand -base64 32`); signs auth session JWTs |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project connection |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access bypassing RLS; without it the app falls back to the anon key, which is only safe with RLS disabled (not recommended — see `supabase/migrations/20260714000001_enable_rls.sql`) |
| `NEXT_PUBLIC_APP_URL` | Production URL, used to build email links |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seeds the first admin account on boot |

**Recommended** (feature degrades gracefully without it):

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Emails are console-logged instead of sent if unset |
| `SUPABASE_STORAGE_BUCKET` | Defaults to `images`; without Supabase configured at all, uploads fall back to local filesystem storage, which does not persist on Workers/Pages (see `supabase/migrations/20260714120001_create_storage_bucket.sql`) |
| `GROQ_API_KEY`, `GROQ_MODEL` | AI assistant feature is disabled without a key |

**Not wired up yet** (safe to leave unset): `STRIPE_SECRET_KEY`,
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` —
payments and WhatsApp integration are future-ready abstraction layers only,
per the original spec.

## Database

First-time setup: run `supabase/migrations/*.sql` in order against your
Supabase project (SQL editor, or `supabase db push`). Add one new numbered
migration file per schema change going forward — don't edit the baseline.

## Project Structure

```
src/
├── app/                  # Next.js App Router — pages, layouts, Server Actions
│   ├── admin/            # Admin dashboard (destinations, tours, bookings, settings, ...)
│   ├── actions/          # Server Actions (mutations, validation)
│   └── ...                # Public routes (destinations, tours, blog, faqs, contact, ...)
├── components/           # UI, layout, admin, and feature components
├── services/
│   ├── db/               # DatabaseAdapter interface + Supabase/local implementations
│   ├── auth/             # Session handling
│   └── ai/               # AI assistant integration
└── data/                 # Local dev JSON fallback (git-ignored)
supabase/migrations/      # Numbered SQL migrations (source of truth for schema)
```

## Testing

```bash
npm run test
```

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

## Database Backups

```bash
npm run backup             # one-off backup
npm run backup:scheduler   # scheduled backup runner
npm run restore            # restore from a backup
```

See `scripts/` for implementation details.

## License

This project is proprietary, closed-source software. See [`LICENSE`](./LICENSE)
for terms. All rights reserved.

## Contact

Built and maintained for **Vistana Tours & Travel**. For business inquiries
about the platform itself, see the site's [Contact page](/contact).
