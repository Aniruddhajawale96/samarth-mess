# Audit Report — Samarth Mess

> Audit date: September 4, 2026  ·  Repo: https://github.com/Aniruddhajawale96/samarth-mess.git  ·  Branch: main

---

## 1. Summary

Samarth Mess is a mobile-first "mess management platform" MVP (Turborepo + pnpm monorepo) that connects students/professionals with mess owners: users discover messes, subscribe, pay a monthly fee (Razorpay), book/skip meals with cutoff rules, and scan a QR code for attendance; owners manage menus, customers, attendance, approvals and payments; admins moderate owners/messes/users and view an audit trail. The backend (`apps/api`, Express + Drizzle + PostgreSQL) is genuinely well-engineered — clean route/middleware separation, strict Zod-validated environment config, consistent JSON error envelope, structured logging, scrypt password hashing, HMAC-verified payment signatures, idempotent webhooks, and an audit table. The frontend (`apps/web`, Next.js 15 App Router) is where the project breaks down: a **legacy single-page demo app still lives at `/`** alongside a half-migrated routed app, **all server-rendered pages cannot authenticate** (the browser cookie is never forwarded to server-side fetches), the QR-scan flow dereferences an unwrapped API response, invoices use a field that doesn't exist, and amounts are inconsistently treated as rupees vs. paise (`/100`). **A real production Supabase database password is committed in `.env.example`.** Several deploy paths (Dockerfiles, `docker compose`, CD) are broken: shared packages are never built inside the images, migration `0007` installs Supabase RLS policies that reference `auth.uid()` on a plain Postgres, and the web image defaults its API proxy to `http://localhost:4000` inside its own container.

**Verdict: 🔶 Solid API architecture on an unstable base — not production-ready.** The backend is closer to production quality than its testing/deployment story suggests, but the committed credential, broken frontend data flow, and non-deployable Docker/CD setup must be resolved before launch. Estimated: 2–3 weeks of focused hardening for an MVP deployment.

| Dimension | Score |
|---|---|
| Code Quality | 6.5 / 10 |
| Security | 5.5 / 10 |
| Performance | 6 / 10 |
| Testing | 4 / 10 |
| Best Practices | 6 / 10 |

---

## 2. Scope & Method

- **Method:** full clone of `main` (`HEAD 4bbdc23`), manual read of every API route file, all middleware, all shared-package sources, the DB schema + 8 migration files, the Next.js pages/layouts, both Dockerfiles, compose file, all CI/CD workflows, and the docs folder. No runtime execution or dynamic scans were performed; findings are static-analysis based with `file:line` evidence.
- **Coverage:** API (16 routers, ~25 middleware/helper modules), web (33 pages + components), `packages/{config,db,types,validation,shared}`, infra (`docker-compose.yml`, `render.yaml`, `vercel.json`, Dockerfiles, `.github/workflows/{ci,cd}.yml`).
- **Not covered:** live DB contents, real Razorpay/Supabase behavior, load testing, dependency-CVE database lookups.

---

## 3. Project Overview

**Purpose:** a three-sided marketplace for mess (canteen/dining) operations — Students/Professionals (USER), Mess Owners (OWNER), Platform Admins (ADMIN).

Main features:
- **Discovery & subscription:** browse ACTIVE messes with search + pagination, request a monthly subscription → payment row (PENDING) → Razorpay checkout → owner approval → ACTIVE.
- **Meal management:** owner publishes per-date menus (draft/publish/archive); users book/skip meals with an owner-configured skip cutoff; EXTRA meals; daily attendance marked manually or by scanning the user's QR token.
- **Billing:** payments, Razorpay signature verification on client-initiated verify + signed webhooks (idempotent), invoice PDF generated server-side and delivered over WhatsApp (BullMQ queue).
- **Ops/admin:** owner dashboard (counts/revenue/attendance), customer enable/disable, admin moderation of users/owners/messes, full audit log.
- **Architecture goals visible in code:** RBAC enforcement at route layer, RLS-aware DB access (Supabase), durable notification/audit records, graceful queue fallback.

---

## 4. Project Structure

```text
samarth-mess/
├── .env.example                 # ⚠️ contains a REAL Supabase DB password + project URL
├── .github/workflows/
│   ├── ci.yml                   # typecheck/lint/test/build (lint + test are no-ops)
│   └── cd.yml                   # docker-compose deploy to a GH runner host (no cloud target)
├── apps/
│   ├── api/                     # Express API (ESM, TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts         # entry, graceful shutdown
│   │   │   ├── app.ts           # app factory (helmet/cors/rate-limit/routes/error handler)
│   │   │   ├── worker.ts        # BullMQ worker (invoice delivery over WhatsApp)
│   │   │   ├── middleware/      # authenticate, authorize (role+mess+menu owner), validate
│   │   │   │                    #   (zod), userContext (RLS), rateLimit (in-memory), upload,
│   │   │   │                    #   errorHandler, requestId, requestLogger
│   │   │   ├── routes/          # 16 routers (auth, messes, menus, subscriptions, payments,
│   │   │   │                    #   approvals, bookings, qr, attendance, history, dashboard,
│   │   │   │                    #   customers, admin, notifications, access, health)
│   │   │   └── lib/             # auth (scrypt+JWT), invoice PDF, whatsapp, queue, notify,
│   │   │                        #   audit, logger, booking-cutoff math
│   │   └── src/integration.test.ts  # one big end-to-end smoke test (manual only)
│   └── web/                     # Next.js 15 (App Router, mostly client components)
│       ├── app/                 # /, /login /register, /user/*, /owner/*, /admin/*
│       ├── components/{ui,domain}/  # hand-rolled UI kit + domain components
│       └── lib/{api,auth}/      # typed API client (fetch wrapper) + session helpers
├── packages/
│   ├── config/                  # Zod env parsing, fail-fast, insecure-value guards (prod)
│   ├── db/                      # Drizzle schema (12 tables), pool + RLS user-context, drizzle-kit
│   │   └── drizzle/             # 0000–0007 incl. Supabase RLS policies (0007)
│   ├── types/ shared/           # small, largely unused
│   └── validation/              # shared Zod schemas (good reuse across API)
├── docs/                        # PRD, commit-by-commit tracker, deployment notes
├── docker-compose.yml           # api/migrate/worker/web/postgres/redis
└── render.yaml / vercel.json    # Render (API) + Vercel (web) configs
```

---

## 5. Tech Stack & Dependencies

| Layer | Choice | Assessment |
|---|---|---|
| Monorepo | Turborepo + pnpm 11 (`pnpm-workspace.yaml`) | fine; **CI/render pin pnpm 9** while `packageManager` says 11.21.0 — works but inconsistent |
| API | Express 4.21, TypeScript 5.8 strict, ESM, `tsx` dev / `tsup` build | current, reasonable |
| ORM/DB | Drizzle 0.39 + `pg` + PostgreSQL (Supabase/Neon; local `postgres:16`) | current |
| Queue | BullMQ 6 + ioredis 6 | current |
| Validation | Zod 3.25 (workspace `validation` pkg) | current |
| Frontend | Next 15.5.24 (lockfile), React 19, html5-qrcode | Next lockfile version is a current patched 15.x; range `^15.2.1` is loose |
| Payments | Razorpay **client-side only** (no server SDK) | ⚠️ see §9/§18 |
| Infra | Docker compose, GitHub Actions, Render (API), Vercel (web) | ⚠️ multiple broken paths, see §16 |

Notes:
- Dependencies are broadly current (Express 4.21.2 and multer 2.x post-date the well-known 2024–25 advisories; helmet 8; no lodash/moment-style baggage). No `npm audit` run was possible here.
- **No ESLint anywhere** — both apps' `lint` scripts are `echo "... lint ok"` no-ops (`apps/api/package.json`, `apps/web/package.json`), so CI "lint" verifies nothing.
- `@supabase/supabase-js` is a dependency of `packages/db` but is never imported; `packages/types` and `packages/shared` add little (mostly empty re-exports).
- Node engine pinned `>=24 <25` (root `package.json`) while the README says `>=20` and `.nvmrc` says 24 — inconsistent docs.

---

## 6. Architecture & Design

**What is done well:**
- Monorepo separation of `config / db / validation` enables fail-fast config and shared schemas; routes consume validators instead of hand-parsing.
- Express app is a factory (`createApp()`, `apps/api/src/app.ts`) so tests can bind an ephemeral port.
- Middleware chain is ordered sensibly: helmet → CORS → body/raw-body → request-id → request logging → rate limits → RLS user-context → routers → 404 → central error handler.
- Consistent response envelope `{ success, data|error, timestamp }` and error shape `{ code, message, requestId }` everywhere, client unwraps it in one place (`apps/web/lib/api/client.ts`).
- Clear ownership checks: `requireRole`, `requireMessOwner`, `requireMenuOwner` (`apps/api/src/middleware/authorize.ts`) with query-level ownership guards on every cross-entity route.
- Transactionality is respected in the money paths: payment success + subscription transition + invoice creation all in one transaction (`markPaymentSuccessful`, payments webhook handler).

**Structural problems:**
- **Two frontends coexist.** `apps/web/app/page.tsx` (~500 lines) is a leftover single-page demo workspace (with a "role-switch" button letting a USER view the OWNER UI — `app/page.tsx:462-468`) while real routed pages live under `/user`, `/owner`, `/admin`. The root route renders the legacy SPA, so the app's "home" is not the routed app.
- **Server components cannot authenticate** — see §18 (#2). The `user`, `owner`, `admin` *layouts* call `fetchSession()` (server-side) which hits `/api/proxy/auth/me` without the browser's cookie; every directly-visited routed page therefore redirects to `/login`.
- **RLS user-context machinery is dead code**: `userContextMiddleware` checks out a dedicated pool connection, runs `SET request.jwt.claims`, exposes `req.userDb`, and releases on response `finish` (`apps/api/src/middleware/userContext.ts`) — but **zero routes or libs ever use `req.userDb`**. Every authenticated request pays for an extra connection round-trip for nothing.
- Data flow: web → same-origin `/api/proxy/*` (Next rewrite) → Express API → Drizzle. Cookie is set by the API but only works because the browser sees the web origin's host via the proxy (no domain attribute). Server-rendered pages fetch via the same proxy without cookie forwarding (broken); client components work.

---

## 7. Code Quality — **6.5 / 10**

*Justification: the API is consistently structured, typed, and readable; the frontend undermines it with a duplicated legacy SPA, pervasive `any`-typed state, fake data, and dead abstractions.*

**Strengths**
- Route handlers are uniform (validate → authorize → query → envelope), small, and readable; helper duplication is low.
- Middleware comments explain intent ("Do not distinguish a missing mess from another owner's mess", `authorize.ts`).
- Naming is consistent (`createApiError`, `recordAudit`, `publicUser/publicMess` mappers).
- `packages/config` and `packages/validation` show real craft (e.g., `INSECURE_SECRETS` + `.refine(notInsecureInProduction)`).

**Weaknesses**
- Frontend mixes paradigms with no owner: ~50% of pages are `"use client"` components doing their own fetch/loading/error state, several server components duplicate the same data fetching, and shared contracts drift (e.g., `InvoiceRecord.pdfUrl` in `apps/web/lib/api/payments.ts:25` — backend column is `file_url`; pages read `subscription.planType` which does not exist in the schema — used in `owner/approvals`, `owner/attendance`, `owner/customers`).
- Legacy SPA + routed pages duplicate the same screens (menus, payments, attendance, approvals) with different implementations.
- Dead code: `userDb` RLS context (see §6), `COOKIE_SECRET` parsed but never used anywhere, `packages/shared` & `packages/types` nearly empty, unused `@supabase/supabase-js` dependency.
- Fake/hard-coded UI data: "4.5 ★" and "500m away" in `apps/web/app/user/messes/page.tsx:68,75`; mock OTP "1234" in `register/page.tsx:32`; `rating: null, distance: null` hard-coded in `messes.ts` (`publicMess`).
- Some convoluted expressions (e.g., the conditional that decides whether an update "skips" on `PATCH /bookings/:id`), and an in-request `throw` inside a `.then()` chain in `middleware/upload.ts` that is hard to follow.
- `git log` messages are noise ("idk", "idk bhai bass kar diya", "finl commit") — not code quality per se, but a signal for history hygiene.

---

## 8. Security Review — **5.5 / 10**

*Justification: strong authn/authz design and good hygiene in code, undone by a committed production credential, unauthenticated invoice files, client-side-only verification flows, and RLS that isn't actually enforced.*

**Critical**
- 🔴 **Production credentials committed.** `.env.example:9` ships a live Supabase pooled `DATABASE_URL` with an embedded password (`...:GTR35%40nissan123@aws-0-ap-southeast-1.pooler.supabase.com...`) plus the real project URL (`line 12`). Anyone with repo access can connect to the production database. This must be rotated and scrubbed from history. (Local `.env` itself is gitignored and untracked — good.)

**High**
- 🟠 **Invoices served unauthenticated.** `app.use("/uploads", express.static(...))` (`apps/api/src/app.ts:67`) exposes every uploaded image and every generated invoice PDF (`/uploads/invoices/INV-...pdf`, containing customer name, phone, amount) to anyone who knows/guesses the URL — no auth, no per-user ACL. Combined with WhatsApp delivery links that embed these public URLs (`lib/whatsapp.ts`), invoices are effectively public documents.
- 🟠 **RLS is decorative.** All queries use the service-role `db`; `userDb` (RLS) is never used (§6). Row-level policies in migration `0007` therefore enforce nothing against the API. The only real control is application-level RBAC — which is mostly correct, but a bug in any one query silently widens access. (The "silent fallback to global db on RLS failure" in `userContext.ts:52-55` makes this worse if it were ever used.)

**Medium**
- 🟡 No CSRF defense beyond `SameSite=Lax` on the auth cookie (`lib/auth.ts` `setAuthCookie`). Acceptable for the current same-site proxy topology, but any future cross-site embedding or `SameSite` change reintroduces risk. Cookie is missing `Secure` in non-prod only — correct.
- 🟡 Phone enumeration: register returns `409 DUPLICATE_IDENTITY` for an existing phone (`routes/auth.ts`), and login's scrypt is only run when the user exists (timing oracle) (`routes/auth.ts` `const valid = user ? await verifyPassword(...) : false`).
- 🟡 Token revocation is an in-memory `Set` (`lib/auth.ts`) — lost on restart, not shared across API instances; "logout" is cosmetic in a multi-instance or restarted deployment.
- 🟡 `rejectUnauthorized: false` for SSL in `packages/db/src/index.ts` (`ssl: { rejectUnauthorized: false }`) — TLS is used but certificates aren't verified.
- 🟡 Hand-rolled JWT (HS256) is implemented correctly (constant-time compare, exp check, no alg confusion possible) but a maintained library would remove risk of subtle regressions.
- 🟡 Rate limiting is in-memory per-process keyed on `req.ip` (`middleware/rateLimit.ts`) — ineffective across instances/behind proxies and trivially bypassed with spoofed/X-Forwarded headers if a trust-proxy is ever enabled.

**Good**
- Secrets never logged (logger strips bodies/headers; worker masks redis URL; config error output lists only *field names*).
- Upload validation: MIME filter + magic-byte sniffing + 5 MB cap (`middleware/upload.ts`), UUID filenames.
- Env config rejects placeholder secrets in production (`packages/config`).
- Password hashing via scrypt with per-user salt and `timingSafeEqual`; JWT signature checks are constant-time; Razorpay webhook signature verified against the raw body with a stored-secret HMAC.
- Webhook idempotency via unique `provider_event_id` + `23505` dedupe; amount cross-check inside the webhook transaction.

---

## 9. API & Endpoints Review

All 16 routers were read. Summary (method, path, auth, notes):

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health`, `/api/v1/health` | none | liveness only |
| POST | `/auth/register` | none | creates USER **or OWNER** directly; 409 on dup phone; sets cookie + returns token |
| POST | `/auth/login` | none | cookie + token; no lockout beyond 20/min rate limit |
| GET | `/auth/me`, `/users/me` | ✅ | — |
| PATCH | `/users/me` | ✅ | profile update |
| POST | `/auth/verify-phone` | ✅ | **501 stub** (`auth.ts`) — wired in UI as hard-coded "1234" OTP |
| POST | `/auth/logout` | none | in-memory revocation only |
| GET | `/{user,owner,admin}/access-check`, `/owner/messes/:messId/access-check` | ✅+role | trivial probes |
| GET | `/messes`, `/messes/:messId`, `/messes/:messId/menu` | none | public ACTIVE only; query-validated |
| GET/POST | `/owner/mess(es)` | OWNER | ⚠️ new mess inserted with **default status ACTIVE — no admin approval gate** (`routes/messes.ts`, schema default) |
| PATCH | `/owner/messes/:messId[/status]`, cover-image | OWNER+owner-check | audited |
| POST | `/users/me/profile-photo` | ✅ | multer, magic-byte checked |
| GET/POST/PATCH/DELETE | `/owner/menus*` | OWNER+menu-owner-check | items replaced by delete+insert (not transactional on update) |
| POST | `/messes/:messId/subscriptions` | USER | creates subscription + PENDING payment in a transaction; notifies owner |
| GET | `/subscriptions/me` | ✅ | — |
| GET | `/subscriptions/:subscriptionId` | USER owner-of-sub | — |
| POST | `/payments` | USER | ⚠️ **fabricates `order_<uuid>` — never calls Razorpay Orders API** (`routes/payments.ts:44`); returns fake order to checkout SDK |
| POST | `/payments/:paymentId/verify` | USER | signature `orderId|paymentId` HMAC-verified with server secret — sound *if* the order were real |
| GET | `/payments`, `/payments/:paymentId`, `/payments/:paymentId/invoice` | USER owner-of-payment | invoice endpoint verified ownership ✅ |
| POST | `/webhooks/payment` | signature | idempotent; amount check; transaction; duplicate-safe ✅ |
| GET | `/owner/payments` | OWNER | pagination parsed manually (not via schema); totals via 3 aggregate queries |
| GET/POST | `/owner/subscriptions/pending|approve|reject` | OWNER + mess-scoped | state-guarded transitions, audited |
| POST/GET/PATCH | `/bookings`, `/extra-meals`, `/owner/extra-meals` | USER/OWNER | cutoffs enforced via `canSkip` using **IST meal times**; ⚠️ bookings for past dates aren't blocked (only skip-after-cutoff is) |
| GET | `/users/me/qr`, POST `/qr/resolve` | any role / OWNER | QR token minted once, 256-bit random ✅ |
| GET/POST | `/owner/attendance[/manual|qr]` | OWNER + mess scope | customer must hold active subscription on the date ✅ |
| GET | `/attendance/me` | USER | — |
| GET | `/users/me/history` | ✅ | 4 queries in parallel, no totals |
| GET | `/owner/dashboard` | OWNER | — |
| GET | `/owner/customers`, `/:userId`, PATCH `/status` | OWNER | ⚠️ **SQL pagination is an illusion** — whole table is fetched, deduped in JS, then sliced (`routes/customers.ts`) |
| GET | `/admin/*`, PATCH statuses, GET `/admin/audit` | ADMIN | all guarded ✅; audit list capped 1–100 |
| GET | `/users/me/notifications`, `/admin/notifications` | ✅/ADMIN | capped 50/100 |

Notable gaps:
- Public `/uploads` (see §8) and no auth on invoice *files* even though invoice *metadata* endpoints are ownership-checked — inconsistent trust model.
- Missing validations/consistency: `PATCH /bookings/:id` re-fetches the mess twice and falls back to 120 minutes silently; `GET /owner/customers` search uses `ilike %term%` (see §11); webhook failure returns error to Razorpay (good) but the event row insert rolls back (also good).
- No `rate` limiting on webhooks beyond global 120/min (Razorpay retries could spike); no dedicated webhook secret rotation story.
- Response shapes are occasionally duplicated by hand between API and typed client and already drifted (`pdfUrl` vs `fileUrl`, `InvoiceRecord.pdfUrl`).

---

## 10. Database & Data Layer

**Schema (12 tables)** — clean, consistent Drizzle definitions with enums, FKs (`onDelete` behavior chosen per table), and timestamp columns everywhere: `users, messes, subscriptions, menus/menu_items, meal_bookings, attendance, payments, payment_webhook_events, invoices, audit_events, notification_attempts` (`packages/db/src/schema/*`).

**Good**
- Unique constraints encode the core domain rules: one booking per (user, date, meal), one attendance row per (user, mess, date, meal) — with `onConflictDoUpdate` upserts.
- Unique `provider_payment_id` and `provider_event_id` enable payment/webhook idempotency.
- Consistent `text` UUIDs (generated in app code with `randomUUID()`).
- Migrations are committed (`drizzle/0000–0007`) and mostly incremental; `0007` made idempotent with `DROP POLICY IF EXISTS`.
- All queries go through the Drizzle query builder — **no string-built SQL anywhere** except `sql` template tags with parameters (`payments.ts` aggregates).

**Concerns**
- 🟠 **RLS migration is not portable.** `drizzle/0007_supabase_rls_policies.sql` enables RLS and creates 47 policies referencing `auth.uid()`, `is_admin()`, `owns_mess()`, `has_active_subscription()` — these only exist on Supabase. `docker-compose.yml` and the CD workflow run `drizzle-kit migrate` against a **plain `postgres:16`** container, where `auth.uid()` does not exist → migration fails → `docker compose up`/CD deploy cannot succeed.
- 🟠 No indexes beyond PKs and the two composite uniques. FK columns used as query roots (`payments.messId`, `subscriptions.messId/userId`, `messes.ownerId`, `attendance.date`, `notificationAttempts.recipientUserId`, `auditEvents.createdAt`, …) are unindexed; `ilike '%term%'` searches cannot use indexes either. Fine at MVP scale, not at scale.
- RLS user-context (`packages/db/src/index.ts` `createUserContext`) fabricates JWT claims in a `SET request.jwt.claims = '...'` statement with only quote-escaping, on a pool connection — fragile and unused (see §6). Because claims are *not* a real Supabase JWT and are set by a superuser-ish connection, this pattern also quietly bypasses RLS for anything that *did* use it.
- `migrate.ts` uses `RUN_MIGRATIONS` env but the compose migrate service runs `drizzle-kit migrate` (config in `drizzle.config.ts`) — two different migration mechanisms; drizzle-kit's migrate does not require `RUN_MIGRATIONS`, but this split is confusing.
- Payments `amount` is documented and stored as **INR rupees** (`schema/payments.ts`, `schema/messes.ts` `monthly_price`) while Razorpay and the UI treat the same number as **paise** — see §18 (#4).

---

## 11. Performance — **6 / 10**

*Justification: no obvious catastrophic hot paths, but several unbounded queries, in-memory pagination, a wasted per-request DB connection, and in-process rate limiting cap scalability.*

- 🔴 **Per-request dead connection**: `userContextMiddleware` checks out a dedicated Postgres connection, issues `SET`/`RESET`, for every authenticated request — and the result is never used. Adds a pool round-trip per request and raises connection pressure under load.
- 🟠 **In-memory pagination in `GET /owner/customers`**: loads *all* subscription rows for a mess, dedupes in JS, then slices (`routes/customers.ts`) — unbounded by `limit`.
- 🟠 Unbounded queries: `GET /owner/attendance` (all customers of a mess), `GET /owner/extra-meals`, `GET /owner/menus`, `GET /owner/subscriptions/pending`, `GET /admin/messes` (`.limit(100)` only) — no server-side pagination/counts.
- 🟡 `ilike('%...%')` on name/phone/email (customers, admin users) — full-table scans; use trigram indexes or prefix search at scale.
- 🟡 In-memory rate-limit buckets (`Map` keyed by `req.ip`) don't scale horizontally.
- 🟡 `publishedMenuPreview` runs a query per mess-detail request with a left-join then filters nulls in JS; menu date match is by `startDate` range rather than `date BETWEEN startDate AND endDate`, so a menu with a long window isn't found (correctness + extra queries on the client, which then falls back).
- Good: parallel `Promise.all` aggregates on dashboards/history; transaction scopes are tight; invoice generation is offloaded to a worker queue with in-memory `inFlight` dedupe; `qrcode` generation is request-local and small.

---

## 12. Testing — **4 / 10**

*Justification: one meaningful end-to-end script exists but it never runs in CI (CI "test" is an echo), has no unit layer, depends on a live seeded database, and the frontend has zero tests.*

- `apps/api/src/integration.test.ts` is a genuinely valuable **end-to-end journey** (register → mess → menu → subscribe → payment verify with real HMAC → approve → dashboard → bookings incl. cutoff rejection → manual + QR attendance → extra meal → webhook + idempotency → invoice → admin moderation) with cleanup. Good assertions on status codes and state transitions.
  - But: it is *not* run by `pnpm test` (which runs the no-op `echo "api smoke tests passed"`), only via the manual `test:integration` script, and CI runs `pnpm test` → nothing real executes.
  - It requires a live Postgres with **migrations applied and the demo seed run** (it logs in as seeded admin `9000000001` / `DemoPass123!`), plus test Razorpay secrets — no fixtures, no DB provisioning in CI.
  - Single linear script: a mid-suite failure leaves no diagnostic isolation; cleanup uses fixed patterns that can collide on parallel runs.
- Zero unit tests for pure logic that clearly deserves them: `lib/auth.ts` (token sign/verify/expiry edge cases), `lib/booking.ts` cutoff math, `middleware/rateLimit`, `packages/validation` schemas, invoice PDF builder, config env validation.
- Frontend: no component or e2e tests at all (no Vitest/Playwright/Testing Library in the workspace).
- CI runs `pnpm check-types` (real) and `pnpm lint` (echo no-op) and `pnpm build` (real, catches type/build breakage) — so types and builds are guarded; behavior is not.

---

## 13. Error Handling & Logging

**Strengths**
- Central 4-arg error handler with a stable JSON shape and `requestId` correlation; 500s never leak stacks to clients (`middleware/errorHandler.ts`).
- Structured JSON logger to stdout/stderr with request IDs; slow requests (>2 s) and 5xx are promoted to warnings (`requestLogger.ts`); logging policy explicitly avoids bodies and auth headers.
- Express async handlers consistently `next(error)`; createApiError carries `code` + optional `details`.
- Config failure is loud and fails fast (`process.exit(1)` in config) without echoing secrets.
- Graceful shutdown for API (`index.ts`) and worker (`worker.ts`); BullMQ job failures are logged with job IDs; queue-down falls back to synchronous delivery (`lib/queue.ts`).

**Gaps**
- No `process.on('unhandledRejection'/'uncaughtException')` handlers in the API entrypoint; an unhandled async rejection kills the process by default (Node ≥15) with no structured log.
- `userContextMiddleware` failure is silently downgraded (route proceeds on the global db) — see §6.
- Inconsistent UX fallbacks on the frontend: many pages catch and just `console.error` then render empty states; server pages swallow errors into empty lists ("No payments yet" when the fetch actually 401'd) — masks real outages.
- `notify()` marks attempts "SENT" immediately after persisting without any delivery (documented as in-app "durable attempt") — an honest semantic caveat, but the status column then overstates delivery.
- Frontend uses `alert()`/`confirm()` and a fixed-position toast that overlaps content; error copy is inconsistent between pages and the legacy SPA.

---

## 14. Environment & Config

**Good:** `.env.example` is comprehensive; `packages/config` validates on boot (URL formats, min secret length ≥32, paired Razorpay/WhatsApp keys, production-only rules like "COOKIE_SECRET required in production" and placeholder rejection); typed `config` object; dotenv path auto-discovery walks up directories.

**Problems**
- 🔴 `.env.example` contains a **real** `DATABASE_URL` + Supabase project URL (see §8) — this is the file developers are told to `cp` from, so it both leaks prod credentials and causes accidental prod-adjacent connections during dev.
- Junk header lines `[TEMPLATE]` at the top of `.env.example` (lines 1–2) — template-copy artifact.
- `COOKIE_SECRET` is validated but **never used** (nothing signs/encrypts the session; the token is a raw JWT in an HttpOnly cookie) — either drop it or use it.
- README documents only `pnpm dev` with local defaults; the real deployment env matrix (Supabase vs Neon, Render vs compose) lives across `render.yaml` / `docs/deployment.md` and is inconsistent with the compose defaults (e.g., compose's in-container `REDIS_URL=redis://127.0.0.1:6379` from `.env` points at the container itself, not the `redis` service; only CD overrides it).
- `NEXT_PUBLIC_API_URL` is baked at build time (next.config `rewrites()`), so one build serves only one API origin — fine for single-env, brittle for staging/prod promotion.

---

## 15. Documentation

- README: decent orientation (monorepo tree, prerequisites, `pnpm dev`), but no env-variable table, no seed instructions (`db:seed` isn't mentioned; the demo password is discoverable only in `seed.ts`), no test instructions (`test:integration` requirements), and no API overview.
- `docs/PRD.md`, `docs/progress_tracker(2).md`, `docs/session_context.md`, `docs/DASHBOARD(1).md` are extensive (some >2,000 lines) but are **AI-workflow scratchpads** ("commit-wise roadmap", Git-rule instructions for an AI), not user documentation.
- `docs/deployment.md` (22 lines) describes environments/release/rollback at a high level and documents the CD flow that currently cannot succeed (see §16).
- Missing: API reference (only ad-hoc JSDoc in `lib/api/*.ts`), OpenAPI/RAML spec, contribution guide, environment variable table, backup/restore and data-retention notes, error-code catalog, seed/demo-account instructions.

---

## 16. Deployment & CI-CD

Multiple paths exist and **several are broken**:

- **CI (`ci.yml`)** — checkout → node 24 → pnpm 9 → install → `check-types` → `lint` (no-op) → `test` (no-op echo) → `build` (real). Types and builds are genuinely verified; behavior is not.
- **CD (`cd.yml`)** — runs `docker compose build` → `up postgres redis` → `run migrate` → `up api worker web` → health check, all on the GH runner. Problems:
  1. 🟠 `0007` RLS migration fails on the compose plain Postgres (`auth.uid()` missing) → the migrate step errors out (unless the DB already has those objects).
  2. 🟠 The web image bakes `NEXT_PUBLIC_API_URL` default `http://localhost:4000` — inside the web container that points at *itself*, so the `/api/proxy` rewrites fail. Compose passes `WEB_API_URL` only as an optional arg that CD never sets.
  3. 🟡 `cd.yml` writes `.env` with `DATABASE_URL` etc. *inside the checkout dir* then `docker compose up` — but the checked-out `.env.example`/config loading expects root `.env`; the compose `env_file: .env` will pick it up (works), yet secrets end up on the runner filesystem and in image build context (not baked, but present during build).
- **Dockerfiles (`apps/api/Dockerfile`, `apps/web/Dockerfile`)** — both install deps and build only their own app (`pnpm --filter @samarth-mess/api build` / `...web build`). The workspace packages (`config/db/types/validation/shared`) are **never built**, yet their `exports` point at `./dist/*.js` — and tsup externalizes workspace deps, so the runtime image lacks `packages/*/dist` → module-not-found at boot. (`render.yaml` correctly builds each package first, which is why that path likely works — the compose/CD path doesn't.)
- **Web Dockerfile** additionally assumes `output: "standalone"` (`COPY .next/standalone`), but `next.config.mjs` never sets `output: 'standalone'` → `.next/standalone` won't exist → COPY fails.
- **render.yaml** — builds and starts the API only (free plan); reasonable shape, but `PNPM_VERSION: 9` vs `packageManager: pnpm@11.21.0`, and the worker (`apps/api/dist/worker.js`) has **no service definition** anywhere in Render/compose-with-worker contexts (compose has a worker service ✅, Render does not → invoices queue up undelivered in prod if Render is the API host).
- **vercel.json** — rewrites `/api/proxy` to itself (no-op rule), build command builds web only after building packages ✅; cookie flow via proxy works on Vercel only if the API origin is reachable from Vercel serverless (server-side proxy rewrites to `NEXT_PUBLIC_API_URL`), and the server-component auth bug (§18 #2) applies there too.
- Local `docker compose up --build` suffers the package-dist problem + `0007` migration failure + in-container `localhost` proxy defaults — i.e., the documented local container runtime does not work as-is.

---

## 17. Best Practices — **6 / 10**

*Justification: strong TypeScript-strict discipline, tidy layering, and real security-mindedness in the API; undone by no linting/formatting enforcement, no test automation in CI, demo hacks shipped in prod UI, and credential/commit hygiene failures.*

- ✅ Strict TS everywhere, consistent monorepo conventions, dependency-light (no framework bloat).
- ✅ API "senior-engineer-grade" habits: error envelope + request IDs, audit events, idempotent webhooks, transaction boundaries, rate limiting (even if in-memory), upload validation, no secret logging.
- ❌ **No linter/formatter configured anywhere**; lint scripts are echoes, so style/`any`-spread goes unchecked.
- ❌ Demo artifacts shipped: hard-coded OTP "1234" in the real register page, "4.5 ★"/"500m away" fake ratings, USER-can-preview-OWNER role switch in the root page, demo seed baked into `seed.ts` with fixed UUIDs/passwords (fine for dev; no guard against running against prod).
- ❌ Git hygiene: commit messages like "idk", "finl commit"; oversized AI-rollup commits ("commit 44 and 45"); real credentials in `.env.example`.
- ❌ No CHANGELOG, no semantic versioning story (all 0.1.0), docs folder mixes product docs with AI scratch files named `(1)`, `(2)`.
- ❌ Frontend types rely on `any` liberally (`as Data`, `any[]`) with `eslint` absent, defeating the strict TS config's intent at the component layer.

---

## 18. Critical Issues Found

### 🔴 Critical
1. **Production database credentials committed** — `.env.example:9` contains a live Supabase pooled `DATABASE_URL` with password, plus real project URL (line 12). Rotate the DB password, scrub history (e.g., `git filter-repo`), and audit for reuse. *(Security)*
2. **Server-rendered pages can't authenticate → routed frontend is broken** — layouts/pages call `fetchSession()`/API modules server-side through `/api/proxy` (`apps/web/lib/auth/session.ts`, `lib/api/client.ts`) but never forward the browser's cookie (`cookies()` is never used anywhere). Every direct visit to `/user/*`, `/owner/*`, `/admin/*` server components redirects to `/login`; server pages show empty data instead of content. Only the legacy SPA at `/` (client-side) works. *(Functional)*
3. **Docker/compose/CD deployment cannot succeed** — (a) workspace packages never built in `apps/*/Dockerfile` but resolved from `dist`; (b) `apps/web/Dockerfile` copies `.next/standalone` while `output: "standalone"` isn't set; (c) `0007_supabase_rls_policies.sql` requires Supabase's `auth.uid()` but compose/CD run it on plain Postgres; (d) web proxies to `http://localhost:4000` *inside its own container*. *(Deployment)*

### 🟠 High
4. **Money unit confusion (rupees vs paise)** — DB stores `monthly_price`/`amount` as rupees, but the Razorpay checkout passes `amount: summary.payment.amount` (interpreting it as paise, `checkout/page.tsx:70`) and the UI divides by 100 (`checkout/page.tsx:151,164`, both payments pages, admin owners page). Result: customers are charged and shown **1/100th** of the actual price (₹25 for a ₹2500 plan) while dashboards report ₹2500. Decide one unit (paise) end-to-end.
5. **Razorpay orders are fabricated, not created** — `POST /payments` returns `order_${randomUUID()}` (`routes/payments.ts:44`) without calling the Razorpay Orders API; real checkout will reject the fake order ID, so live payments likely fail entirely (the integration test signs its own payloads, masking this).
6. **QR attendance scan flow is broken** — `ScanScanner.tsx:110-111` does `const user = resolveRes.data.user` but `qrApi.resolveQr` already unwraps the envelope, so `user` is `undefined` and every scan errors.
7. **Invoice/field contract drift** — frontend reads `invoice.pdfUrl` (`lib/api/payments.ts:25`) but the API returns `fileUrl` (Drizzle column `file_url`); invoice PDF link never renders. Same family of drift: `subscription.planType` rendered in three owner pages but absent from the schema.
8. **RLS context machinery unused + silently degrades** — `userContext` per-request connections are created and discarded; `req.userDb` never used (0 references in routes/libs), while middleware falls back to the service-role db on failure. Either wire routes through RLS or delete the machinery.
9. **Unauthenticated static file serving of invoices** — `/uploads` (images + PDF invoices with PII) is public (app.ts:67); WhatsApp invoice URLs are therefore public too.

### 🟡 Medium
10. Integration test never runs in CI (`test` scripts are echoes); no unit tests; no frontend tests.
11. Unbounded queries / JS-side pagination (`/owner/customers`), no FK indexes, `ilike %…%` searches.
12. No ESLint/Prettier; lint scripts are no-ops.
13. In-memory token revocation + in-memory rate limiting — both wrong for multi-instance/restart.
14. New messes default to `ACTIVE` on creation (`messes` schema) so the admin "owner/mess approval" workflow is never triggered by registration — the PRD's approval gate is not enforced.
15. Registration UX: mock OTP `1234` in the register page; `/auth/verify-phone` is a 501 stub.
16. Legacy SPA `app/page.tsx` (~500 lines incl. a USER→OWNER role-switch demo) still serves `/` and duplicates the routed app.
17. `ssl: { rejectUnauthorized: false }`; phone enumeration via 409 + login timing; missing process-level unhandledRejection handlers.

### 🔵 Low
18. `COOKIE_SECRET` parsed/required in prod but never used; `packages/shared`/`types` near-empty; unused `@supabase/supabase-js` dep.
19. Commit-message hygiene ("idk", "finl commit") and junk `[TEMPLATE]` lines in `.env.example`.
20. README/docs drift (Node >=20 vs >=24; `.nvmrc` 24; two migration mechanisms; seed instructions missing).

---

## 19. Improvement Roadmap

**Short-term (days 1–5 — before anyone pays real money)**
1. Rotate & scrub the Supabase credentials from `.env.example` and git history; add a `.env.example` that only contains placeholders; consider secret scanning in CI.
2. Fix the money-unit bug end-to-end (store paise; remove `/100` hacks) and implement real server-side Razorpay order creation + webhook-driven state only (drop the client "verify" as the source of truth or keep it purely UX).
3. Forward cookies to server-side fetches (read `cookies()` in `next/headers` and pass `Cookie` header, or convert remaining server pages to client components / route handlers) — then fix the QR-scan unwrap bug and the `pdfUrl`/`fileUrl` contract.
4. Make compose/CD green: prebuild workspace packages in Dockerfiles, add `output: "standalone"` (or drop standalone), gate RLS migration to Supabase-only, set `WEB_API_URL` correctly.

**Medium-term (weeks 1–3)**
5. Wire routes through `req.userDb` or remove the RLS/userContext layer; keep the single `db` path and application RBAC as the documented control.
6. Delete the legacy SPA at `/` and point it to the routed app; remove demo artifacts (OTP 1234, fake ratings, role-switch, seed credentials guard).
7. Introduce real testing: unit tests for `lib/auth`, cutoff math, validation schemas; run `integration.test.ts` in CI with an ephemeral Postgres + seed; add ESLint/Prettier with CI enforcement.
8. Harden `/uploads`: serve files through an authenticated, ownership-checked route (or signed URLs) instead of `express.static`.
9. Move rate limiting and token revocation to Redis; add FK/composite indexes and server-side pagination for the unbounded owner/admin lists.

**Long-term (quarter)**
10. Replace hand-rolled JWT/session code with a maintained library (or Supabase Auth) and derive RLS identity from real tokens; enable certificate verification.
11. Standardize on one deploy target (Render/Vercel vs compose/CD) with environments/staging; add a Render worker service for the BullMQ worker; instrument with an APM and error-tracking (Sentry) and add structured request tracing.
12. Publish an API reference (OpenAPI), env var table, seed/demo guide, and contribution guidelines; introduce conventional commits + PR template.

---

## 20. Conclusion

Samarth Mess has a **strong backend skeleton** — disciplined Express layering, typed and validated everything, transactional payments, idempotent webhooks, audit logging, and honest code comments — which is more than most MVP audits reveal. It is undone by four compounding realities: a **committed production credential**, a **frontend whose server-rendered half cannot authenticate** (leaving a legacy demo SPA as the de-facto UI), **money handled in two units at once with orders that are never really created at Razorpay**, and **deployment artifacts (Dockerfiles, compose, CD, RLS migration) that cannot build/run as written**. None of these are architectural dead ends — they are concentrated, fixable issues with clear remediation. With the short-term roadmap executed, this can be a credible v1; as-is, shipping it would risk a public data leak, silent payment under-charging, and a broken production deploy. **Recommend: fix Critical items 1–3 first, then High items 4–9, before any real-money launch.**
