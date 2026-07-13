<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Vistana Tours & Travel — Agent Guide

This file is the single source of truth for any AI coding agent (Claude, Cursor,
Gemini, Copilot, etc.) working on this repo. Other agent config files
(`CLAUDE.md`, `.cursorrules`, `GEMINI.md`) just point back here — edit this
file, not those.

## What this project is

A premium Tours & Travel booking and management platform for a company
operating in Kenya and Tanzania (brand: **Vistana Tours & Travel**). Public
marketing site + customer booking portal + admin operations dashboard.

## Hard rules — do not violate these

1. **No mock/placeholder data, ever.** Every list on the public site (tours,
   destinations, testimonials, partners, FAQs, blog, gallery, reviews) must
   come from the database via `src/services/db`. If a collection is empty,
   render a proper empty state ("No tours available yet"), never a hardcoded
   fallback array. If you find hardcoded arrays feeding a public page, that's
   a bug — move the data into the DB and give admins a CRUD UI for it.
2. **Never reintroduce a hardcoded credential or backdoor.** The admin
   account is bootstrapped once from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars
   (see `src/services/auth/bootstrap.ts`) and hashed with bcrypt. Do not add
   any code path that grants admin/session access based on a fixed email or
   password string.
3. **Sessions are signed JWTs, not raw IDs.** Auth state lives in the
   `vistana_session` cookie, created/verified via `src/services/auth/session.ts`
   (uses `jose`, secret from `SESSION_SECRET`). Never read a session by
   trusting a cookie value directly — always go through `getSession()`.
4. **Passwords are always bcrypt-hashed** (`src/services/auth/password.ts`,
   12 salt rounds). Never store or compare plaintext passwords.
5. **Every DB-touching feature needs both adapters implemented**:
   `src/services/db/localDb.ts` (JSON-file fallback, dev only) AND
   `src/services/db/supabaseDb.ts` (production). Add new methods to the
   `DatabaseAdapter` interface in `src/services/db/types.ts` first, then
   implement in both files. If you add a Supabase table, note the required
   schema/SQL in your PR description or a comment — there's no migrations
   folder yet (see Known Gaps).
6. **Validate all API route input with zod.** Look at
   `src/app/api/auth/*/route.ts` for the pattern to follow.
7. **Rate-limit any public-facing write endpoint** that could be abused
   (auth, contact form, newsletter signup, review submission) using
   `src/services/auth/rateLimit.ts`.

## Tech stack (actual, as implemented — do not swap without being asked)

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4
- Supabase — Postgres + the primary DB adapter (`NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Falls back to a local JSON file at
  `src/data/local_db.json` when unset (dev convenience only, never use in
  production).
- Auth: custom-built (not Supabase Auth) — bcrypt + signed JWT session
  cookies, see `src/services/auth/`.
- Email: Resend (`RESEND_API_KEY`), raw `fetch` call in
  `src/services/email/index.ts`. Falls back to console-logging if unset.
- File storage: Cloudflare R2 via `@aws-sdk/client-s3` (S3-compatible),
  `src/services/storage/index.ts`. Falls back to local disk
  (`public/uploads`) if R2 env vars are unset — dev only.
- Payments: `src/services/payments/index.ts` is an intentional
  **future-ready abstraction layer only** — M-Pesa/Stripe/Bank Transfer
  providers are mocked by design (original spec: "no live payment
  integration is required initially, only the architecture"). Don't wire
  real payment gateways unless explicitly asked.
- WhatsApp: `src/services/whatsapp/index.ts` is intentionally disabled by
  default (`isEnabled = false`), also future-ready-only by design.
- Deployment target: Cloudflare Pages (frontend) + Supabase (DB) + Cloudflare
  R2 (storage) + Resend (email), per original spec.

## Directory map

```
src/app/
  page.tsx                 Home page
  destinations/, tours/, blog/, contact/     Public marketing pages
  portal/                  Customer auth + dashboard (login, register, page.tsx)
  admin/                   Admin dashboard (layout.tsx gates on session.role === "admin")
    bookings/, destinations/, tours/         Existing admin CRUD pages
  api/auth/                Auth API routes (login, register, logout, session,
                            verify-email, request-reset, reset-password)
  actions/index.ts         Server actions used by admin components (CRUD)
src/components/
  admin/                   Admin CRUD UI (BookingsManager, DestinationsManager, ToursManager)
  portal/                  Customer portal UI (BookingsList)
  tours/, contact/, ui/, layout/             Public site UI
src/services/
  auth/                    session.ts, password.ts, rateLimit.ts, bootstrap.ts
  db/                      types.ts (DatabaseAdapter + all entity types),
                           localDb.ts, supabaseDb.ts, index.ts (picks adapter)
  email/, payments/, storage/, whatsapp/     Provider abstraction layers
```

## Data models

See `src/services/db/types.ts` for the full `DatabaseAdapter` interface and
every entity: `Destination`, `Tour`, `Hotel`, `Vehicle`, `Guide`, `Booking`,
`Review`, `Blog`, `Profile`, `Testimonial`, `Partner`, `Faq`,
`NewsletterSubscriber`, `GalleryImage`, `AuditLog`.

## Environment variables

See `.env.example` at repo root — it's the authoritative list. Never commit
a real `.env` file (already gitignored). `SESSION_SECRET` is required or the
app throws on first session read.

## Known gaps / roadmap (as of the last audit)

Phase 1 (auth security) is done — see git log. Still outstanding, roughly in
priority order:

- [ ] **Kill hardcoded homepage mock data.** `src/app/page.tsx` has
  hardcoded `testimonials` and `partners` arrays. The DB types/adapters for
  `Testimonial` and `Partner` already exist (Phase 1) — wire the homepage to
  fetch from `db.getTestimonials()` / `db.getPartners()` and build an admin
  CRUD page for both.
- [ ] Missing admin modules: `/admin/hotels`, `/admin/vehicles`,
  `/admin/guides`, `/admin/customers`, `/admin/reviews`, `/admin/blog` — the
  sidebar in `admin/layout.tsx` links to all of these but only bookings,
  destinations, and tours actually exist. These are dead links today.
- [ ] Homepage missing sections from spec: FAQ (DB model `Faq` exists),
  newsletter signup (`NewsletterSubscriber` model exists), a real
  gallery/albums feature (`GalleryImage` model exists), Instagram feed.
- [ ] Customer portal: no "save favorite tours" feature yet (`Profile.
  favorite_tour_ids` field exists on the type, not wired to UI/actions).
- [ ] SEO: only a single static title/description in root `layout.tsx`. No
  per-page metadata, no `sitemap.ts`/`robots.ts`, no Open Graph tags, no
  JSON-LD structured data, no canonical URLs.
- [ ] No custom `not-found.tsx`, `error.tsx`, or `loading.tsx` anywhere —
  falls back to generic Next.js defaults.
- [ ] No reports/analytics export (PDF/Excel/CSV) for bookings/revenue/etc.
- [ ] No CSRF protection beyond `sameSite: lax` cookies, no audit-log
  writes yet on admin mutations (the `AuditLog` model/adapter methods exist
  but nothing calls `db.addAuditLog()` yet), no automated backups.
- [ ] Booking flow has no document upload step (spec: "upload required
  documents if necessary").
- [ ] No Prisma/migrations — Supabase tables must be created manually to
  match `src/services/db/types.ts`. If you add a new entity, document the
  SQL needed.
- [ ] No automated tests anywhere in the repo.

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in at least SESSION_SECRET
npm run dev
```

Without `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` set, the app uses the local
JSON-file DB (`src/data/local_db.json`, auto-created, gitignored) — fine for
UI work, never for anything that needs to reflect production data.
