# Session Context — Samarth Mess (Mess Management Platform MVP)

## Purpose

This document provides full context for starting a new coding session. Copy-paste this file when starting a new conversation with the AI to give it complete project context.

---

## Project Overview

**Samarth Mess** is a mobile-first Mess Management Platform for students/professionals and mess owners, with an administrative management panel.

### Core Business Loop

```text
REGISTER
   ↓
DISCOVER MESS
   ↓
SUBSCRIBE
   ↓
PAY
   ↓
OWNER APPROVAL
   ↓
ACTIVE SUBSCRIBER
   ↓
BOOK / SKIP / EXTRA
   ↓
QR / MANUAL ATTENDANCE
   ↓
HISTORY
```

### Three User Roles

| Role | Description |
|------|-------------|
| **USER** | Student/Professional who subscribes to a mess |
| **OWNER** | Mess owner who manages the mess |
| **ADMIN** | Platform administrator |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js + TypeScript |
| Backend | Express + Node.js + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Monorepo | Turborepo + pnpm |
| Auth | JWT tokens (via Supabase Auth) |
| Payments | (Pending integration) |
| WhatsApp | (Pending integration) |

---

## Repository Structure

```text
samarth-mess/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Express backend
├── packages/
│   ├── db/               # Drizzle schema + migrations
│   ├── types/            # Shared TypeScript types
│   ├── validation/       # Zod validation schemas
│   ├── config/           # Environment config
│   └── shared/           # Utility functions
├── docs/                 # Documentation
├── .github/              # CI/CD workflows
├── docker-compose.yml    # Local dev services
├── pnpm-workspace.yaml   # Workspace config
├── turbo.json            # Turborepo config
└── package.json          # Root dependencies
```

---

## Database Schema

### Tables Implemented

1. **users** — User accounts (USER, OWNER, ADMIN roles)
2. **messes** — Mess profiles owned by owners
3. **subscriptions** — Monthly subscriptions (PENDING_PAYMENT → PENDING_APPROVAL → ACTIVE)
4. **menus** — Daily menus (DRAFT → PUBLISHED → ARCHIVED)
5. **menu_items** — Individual food items (BREAKFAST, LUNCH, DINNER)
6. **meal_bookings** — Daily meal bookings (BOOKED, SKIPPED, EXTRA, CANCELLED)
7. **attendance** — Attendance records (PRESENT, ABSENT, EXTRA; QR or MANUAL)
8. **payments** — Payment records (PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED)
9. **invoices** — Generated invoices for payments
10. **audit_events** — Audit trail for important actions
11. **notification_attempts** — Notification delivery tracking
12. **payment_webhook_events** — Payment provider webhook events

### Key Relationships

- Users can subscribe to one mess at a time
- Messes have owners (USER → MESS ownership)
- Subscriptions link users to messes
- Menus belong to messes
- Menu items belong to menus
- Meal bookings are per user/date/meal_type
- Attendance is per user/date/meal_type/mess
- Payments are for subscriptions
- Invoices are generated from payments

### Row Level Security (RLS)

The database uses Supabase RLS policies for data access control. See `packages/db/drizzle/0007_supabase_rls_policies.sql` for the complete policy definitions.

**Important:** RLS policies use `DROP POLICY IF EXISTS` before each `CREATE POLICY` to make the migration idempotent (can be run multiple times safely).

---

## API Structure

### Route Files

```text
apps/api/src/
├── app.ts                    # Express app setup
├── middleware/
│   └── userContext.ts        # JWT auth middleware
└── routes/
    ├── auth.ts               # Registration, login
    ├── attendance.ts         # Attendance management
    ├── approvals.ts          # Subscription approvals
    ├── customers.ts          # Customer management
    ├── bookings.ts           # Meal bookings
    ├── menus.ts              # Menu management
    ├── messes.ts             # Mess CRUD
    ├── notifications.ts      # Notifications
    ├── ownerDashboard.ts     # Owner dashboard data
    ├── payments.ts           # Payment processing
    ├── qr.ts                 # QR code generation
    ├── subscriptions.ts      # Subscription management
    ├── admin.ts              # Admin operations
    └── history.ts            # User history
```

### API Base URL

```text
/api/v1
```

### Auth

- JWT tokens stored in httpOnly cookies
- Supabase Auth for JWT verification
- Service role key for privileged operations

---

## Configuration

### Environment Variables

See `.env.example` for all required variables:

```text
# Database
DATABASE_URL=postgresql://...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# API
API_PORT=4000
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=...
COOKIE_SECRET=...
```

---

## What Has Been Built (Current State)

### Completed

- [x] Monorepo setup (Turborepo + pnpm)
- [x] Next.js frontend app skeleton
- [x] Express backend API skeleton
- [x] PostgreSQL + Drizzle ORM setup
- [x] Full database schema (all 12 tables)
- [x] Authentication middleware (JWT + httpOnly cookies)
- [x] Role-based authorization (USER, OWNER, ADMIN)
- [x] All API routes with full business logic
- [x] Supabase RLS policies (fixed for idempotency)
- [x] Configuration management with validation
- [x] Payment integration (Razorpay — init, verify, webhooks)
- [x] WhatsApp invoice delivery (Meta Graph API)
- [x] QR code generation and scanning for attendance
- [x] Background job processing (BullMQ + Redis)
- [x] Complete user flow (register → subscribe → book → attend)
- [x] Owner approval workflow
- [x] Invoice generation (PDF)
- [x] Notifications system (IN_APP provider)
- [x] Admin panel (user/mess management, audit)
- [x] Audit trail for important operations
- [x] Owner dashboard with aggregated data
- [x] Owner customer management (search, enable/disable)
- [x] User payment history and invoice access
- [x] Meal booking with skip cutoff and extra meals
- [x] CI/CD pipeline (GitHub Actions)
- [x] Docker compose + Dockerfiles (API, web, worker)
- [x] Seed data for demo/testing
- [x] Integration test covering full business journey
- [x] Security hardening (rate limiting, CORS, helmet)
- [x] Input validation (Zod schemas)
- [x] Structured logging
- [x] Graceful shutdown handling

### In Progress

- [ ] Frontend UI components and pages

### Not Started

- [ ] Production deployment (hosting, SSL, domain)
- [ ] Advanced analytics and reporting
- [ ] Multi-mess / multi-branch support

---

## Key Decisions Made

1. **Supabase for Auth** — Using Supabase Auth for JWT verification instead of building custom auth
2. **RLS for Data Access** — Using Supabase RLS policies instead of application-level permission checks
3. **Service Role for Privileged Operations** — Using Supabase service role key for operations that bypass RLS
4. **Idempotent Migrations** — All SQL migrations use `DROP POLICY IF EXISTS` before `CREATE POLICY` to allow re-running

---

## Recent Changes

### Backend Audit & Reliability Hardening

**Date:** 2026-09-03

**Issues Fixed:**
1. **Race condition in subscription creation** — Moved duplicate check inside `SELECT ... FOR UPDATE` transaction
2. **Attendance validation race** — Moved customer validation inside the batch transaction
3. **Graceful shutdown** — Added SIGINT/SIGTERM handlers with 10s forced exit
4. **Promise chain pattern** — Fixed `requireMessOwner` and `requireMenuOwner` void promise patterns
5. **WhatsApp delivery guard** — Skip delivery attempts when provider is not configured
6. **Health endpoint** — Added database connectivity check (returns 503 when DB is unavailable)
7. **Slow request logging** — Requests > 2s now logged as warnings
8. **Rate limiter memory leak** — Added periodic cleanup of expired buckets

### RLS Migration Fix

**File:** `packages/db/drizzle/0007_supabase_rls_policies.sql`

**Problem:** Running the migration failed with `ERROR: 42710: policy "users_select_own" for table "users" already exists`

**Solution:** Added `DROP POLICY IF EXISTS` before all 47 `CREATE POLICY` statements

**Documentation:** `docs/rls_migration_fix.md`

---

## How to Start a New Session

1. Copy-paste this file into the new conversation
2. The AI will have full context about:
   - What the project is
   - Current state of implementation
   - Database schema
   - API structure
   - Key decisions
   - What needs to be done next

### Quick Commands

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build all
pnpm build

# Type check
pnpm check-types

# Lint
pnpm lint
```

---

## Useful Links

- **PRD:** `docs/PRD.md` — Full product requirements
- **Progress Tracker:** `docs/progress_tracker(2).md` — Commit-by-commit implementation plan
- **Deployment:** `docs/deployment.md` — Deployment procedures
- **RLS Fix:** `docs/rls_migration_fix.md` — Recent migration fix documentation

---

## Notes for AI Assistant

- Always read `PRD.md` before implementing new features
- Follow the commit roadmap in `progress_tracker(2).md`
- Do NOT create Git commits unless explicitly asked
- Run typecheck after changes: `pnpm check-types`
- Keep changes minimal and focused
- Match existing code conventions
- The backend is fully implemented — only frontend UI remains
- Use `DbLike = Pick<Database, "select" | "insert" | "update" | "delete">` for functions that accept both regular DB and transaction contexts
