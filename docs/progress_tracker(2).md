# Progress Tracker — Mess Management Platform MVP

## Purpose

This file is the **commit-wise implementation roadmap** for the Mess Management Platform MVP.

It is intentionally organized by **small, reviewable Git commits**, not development phases.

The goal is to let an AI/developer implement one commit at a time, validate it, mark the corresponding checkbox as complete, and then stop so the user can review the changes and create the Git commit manually.

This tracker is derived from the requirements in `PRD.md` and is designed to keep the MVP focused on the smallest complete product that a real mess can start using quickly.

---

# IMPORTANT — AI / DEVELOPER GIT RULE

## NEVER COMMIT BY YOURSELF

**The AI must NOT create Git commits unless the user explicitly instructs it to commit.**

The normal workflow is:

```text
Read PRD.md
      ↓
Read the applicable section(s)
      ↓
Inspect current repository state
      ↓
Implement ONLY the requested commit
      ↓
Run validation
      ↓
Review the diff
      ↓
Update this tracker checkbox
      ↓
Report what was implemented
      ↓
Provide suggested commit message
      ↓
Explicitly say: "I did NOT create a commit."
      ↓
STOP
```

### The AI must NOT automatically run

```text
git commit
git push
git reset --hard
git reset --merge
git clean -fd
git rebase
git merge
git cherry-pick
git revert
git branch -D
```

or any other command that changes Git history or destroys work, unless the user explicitly asks for that Git operation.

### Read-only Git commands are allowed

```text
git status
git diff
git diff --cached
git log
git branch
git show
git ls-files
```

### Important distinction

Checking a box in this file means:

> **The requested commit's implementation is complete and has been validated. The changes are ready for the user to review and manually commit.**

It does **NOT** mean:

> A Git commit was created.

---

# REQUIRED BEHAVIOR AFTER EACH COMPLETED COMMIT

When one tracker item is completed, the AI must:

1. Implement only that commit.
2. Run the relevant validation.
3. Review the resulting diff.
4. Change the commit checkbox from `[ ]` to `[x]` only when implementation and validation are complete.
5. Explain what changed.
6. State what was validated.
7. Provide the suggested commit message.
8. Explicitly state that **no Git commit was created**.
9. Stop and wait for the user's next instruction.

### Required completion response

```text
Commit XX completed.

Progress:
[x] Commit XX — <name>

Implemented:
- ...

Validated:
- ...

Suggested commit message:
<commit message>

I did NOT create a Git commit.
The changes are ready for your review and manual commit.
```

If implementation or validation is incomplete, leave the checkbox as `[ ]` and explain what remains.

---

# TRACKER CHECKBOX RULES

```text
[ ] = Not implemented
[x] = Implemented and validated by the AI
```

The AI must:

- Check `[x]` only after the requested commit is actually implemented.
- Run relevant tests/typechecks/build checks before checking `[x]`.
- Never check `[x]` merely because files were created.
- Never check `[x]` when important validation is failing.
- Never check multiple unrelated commits because they happened to be implemented together.
- Never create a Git commit because a checkbox was checked.
- Prefer splitting work rather than silently expanding a commit's scope.

---

# DOCUMENTATION RULE

`PRD.md` is the source of truth for product scope and architecture.

Before implementing any commit, the AI must read:

```text
PRD.md
```

and the relevant section(s) for the commit being implemented.

When a later documentation file is introduced, the AI must also read the applicable document before implementing work covered by it.

Do not invent product behavior that conflicts with `PRD.md`.

Do not pull features from future/non-MVP scope into an earlier commit unless the user explicitly requests it.

---

# MVP BOUNDARY

The tracker prioritizes the complete business loop:

```text
Register
   ↓
Discover Mess
   ↓
Subscribe
   ↓
Pay
   ↓
Owner Approval
   ↓
Active Subscriber
   ↓
Book / Skip / Extra
   ↓
QR / Manual Attendance
   ↓
History
```

The following are deliberately not required before the core MVP can ship:

- Advanced expense tracking
- Complex coupons/offers
- Advanced analytics
- Complex complaint workflows
- Multi-branch management
- Native mobile application
- Advanced automation not required for daily mess operations

---

# COMMIT ROADMAP

## Commit 00 — Repository and Monorepo Foundation

### Objective

Create the root project structure for a TypeScript monorepo using Turborepo.

### Implement

- Initialize repository structure.
- Configure package manager/workspaces.
- Configure Turborepo.
- Create `apps/` and `packages/`.
- Create root TypeScript configuration.
- Create root lint/format configuration.
- Create `.gitignore`.
- Create `.env.example`.
- Create a basic README with local setup commands.
- Ensure the repository is structured so frontend and backend can evolve independently.

### Expected structure

```text
apps/
packages/
docs/
.github/
.env.example
.gitignore
package.json
turbo.json
tsconfig.json
```

### Validation

```text
[x] Dependencies install successfully
[x] Turbo commands execute
[x] Root typecheck/configuration works
[x] No secrets are committed
```

### Suggested commit

```text
chore: initialize turborepo
```

---

## Commit 01 — Application Skeleton

### Objective

Create the MVP applications.

### Implement

- `apps/web`
  - Next.js
  - TypeScript
- `apps/api`
  - Node.js
  - Express
  - TypeScript

Do not create unnecessary services yet.

### Validation

```text
[ ] Web starts locally
[ ] API starts locally
[ ] Both build successfully
[ ] Turbo can run both applications
```

### Suggested commit

```text
chore: create web and api apps
```

---

## Commit 02 — Shared Package Foundation

### Objective

Create shared packages needed by both applications.

### Implement

Recommended initial packages:

```text
packages/db
packages/types
packages/validation
packages/config
packages/shared
```

Keep these packages small.

### Do NOT implement yet

- Full business logic
- Payment integration
- QR logic
- Large UI system
- Advanced notification system

### Validation

```text
[ ] Packages resolve correctly
[ ] Web and API can import shared packages
[ ] Typecheck succeeds
[ ] Turbo build succeeds
```

### Suggested commit

```text
chore: initialize shared packages
```

---

## Commit 03 — Database Foundation

### Objective

Set up PostgreSQL and Drizzle ORM.

### Implement

- PostgreSQL connection.
- Drizzle ORM.
- Drizzle configuration.
- Migration configuration.
- Environment-based `DATABASE_URL`.
- Shared database client package.
- Local PostgreSQL setup through Docker Compose.

### Validation

```text
[ ] PostgreSQL starts locally
[ ] Application connects successfully
[ ] Drizzle commands work
[ ] A test migration can be generated/applied
```

### Suggested commit

```text
chore: setup postgres and drizzle
```

---

## Commit 04 — Core Database Schema: Identity and Mess

### Objective

Create the minimum schema required to represent users, roles, and messes.

### Implement

#### Users

Support:

- Name
- Phone
- Email
- Role
- User type
- Profile photo URL
- Status
- Timestamps

#### Messes

Support:

- Owner
- Name
- Description
- Cover image
- Address
- Contact
- Monthly price
- Meals per day
- Status
- Timestamps

### Roles

```text
USER
OWNER
ADMIN
```

### User Types

```text
STUDENT
PROFESSIONAL
```

### Account Status

```text
ACTIVE
DISABLED
```

### Validation

```text
[ ] Migrations apply
[ ] Foreign keys work
[ ] Required uniqueness constraints exist
[ ] Schema typechecks
```

### Suggested commit

```text
feat: add user and mess schema
```

---

## Commit 05 — Core Database Schema: Subscription and Menu

### Objective

Create the entities required for a user to subscribe to a mess and for an owner to publish a menu.

### Implement

#### Subscription

Support:

```text
PENDING_PAYMENT
PENDING_APPROVAL
ACTIVE
REJECTED
EXPIRED
CANCELLED
```

#### Menu

Support:

```text
DRAFT
PUBLISHED
ARCHIVED
```

#### Menu Item

Support:

```text
BREAKFAST
LUNCH
DINNER
```

Include:

- Item name
- Description
- Optional image
- Display order

### Validation

```text
[ ] Subscription belongs to user and mess
[ ] Menu belongs to mess
[ ] Menu items belong to menu
[ ] Appropriate indexes/constraints exist
[ ] Migration applies cleanly
```

### Suggested commit

```text
feat: add subscription and menu schema
```

---

## Commit 06 — Core Database Schema: Booking, Attendance, Payments, Invoice, Audit

### Objective

Create the remaining MVP persistence model.

### Implement

#### Meal Booking

Fields for:

- User
- Mess
- Date
- Meal type
- Status
- Timestamps

Statuses:

```text
BOOKED
SKIPPED
EXTRA
CANCELLED
```

#### Attendance

Fields for:

- User
- Mess
- Date
- Meal type
- Status
- Method
- Timestamps

Attendance states:

```text
PRESENT
ABSENT
EXTRA
```

Methods:

```text
QR
MANUAL
```

#### Payment

Include:

- User
- Mess
- Subscription
- Provider
- Provider payment ID
- Amount
- Currency
- Status
- Paid timestamp
- Metadata

Payment states:

```text
PENDING
SUCCESS
FAILED
CANCELLED
REFUNDED
```

#### Invoice

Include:

- Payment
- Invoice number
- File URL
- WhatsApp status
- Timestamps

#### Audit Event

Include:

- Actor
- Actor role
- Action
- Entity type
- Entity ID
- Metadata
- Timestamp

### Validation

```text
[ ] All migrations apply
[ ] Financial amounts use a safe representation
[ ] Provider payment IDs have appropriate uniqueness
[ ] Duplicate booking protection exists
[ ] Foreign keys are correct
[ ] Schema typechecks
```

### Suggested commit

```text
feat: add booking payment and attendance schema
```

---

## Commit 07 — Configuration and Environment Validation

### Objective

Make runtime configuration explicit and validated.

### Implement

Validate at startup:

- Node environment
- API port
- Database URL
- Frontend URL
- Payment credentials placeholders
- WhatsApp credentials placeholders
- Storage configuration if required
- Security/session configuration

### Rules

- Fail fast on invalid required configuration.
- Never silently fall back to insecure production values.
- Never log secrets.

### Validation

```text
[ ] Missing required config fails clearly
[ ] Valid config starts application
[ ] Secrets are not printed in logs
[ ] `.env.example` is current
```

### Suggested commit

```text
feat: add validated application configuration
```

---

## Commit 08 — Express API Foundation

### Objective

Create a production-quality API base before adding business endpoints.

### Implement

- Express app factory.
- JSON parsing.
- CORS.
- Helmet/security middleware.
- Request ID/correlation ID.
- Central error handling.
- 404 handling.
- API version prefix.
- Health endpoint.
- Basic structured logging.

Recommended prefix:

```text
/api/v1
```

### Validation

```text
[ ] GET /health works
[ ] GET /api/v1/health works
[ ] Errors use one consistent JSON shape
[ ] Request ID is available
[ ] Typecheck/build succeeds
```

### Suggested commit

```text
feat: establish express api foundation
```

---

## Commit 09 — Shared Validation Layer

### Objective

Establish runtime validation at API boundaries.

### Implement

Zod schemas for:

- Register
- Login
- Profile updates
- Mess creation/editing
- Menu creation/editing
- Subscription requests
- Bookings
- Attendance
- Payment identifiers
- Pagination/filtering

### Rules

- Controllers must not trust raw request input.
- Business logic receives validated input.
- Validation errors use the standard API error format.

### Validation

```text
[ ] Invalid request is rejected
[ ] Valid request passes
[ ] Error response identifies invalid fields
[ ] Shared validation package is reusable
```

### Suggested commit

```text
feat: add api input validation
```

---

## Commit 10 — Authentication

### Objective

Implement secure user/owner/admin authentication.

### Implement

- Registration.
- Login.
- Password/credential handling.
- Authentication token/session strategy.
- Current-user endpoint.
- Logout.
- Phone verification flow stub/contract if actual OTP provider is introduced later.

### Registration requirements

Support:

```text
Student
Professional
Owner
```

according to the selected registration flow.

### Validation

```text
[ ] User can register
[ ] Duplicate identity is rejected
[ ] User can log in
[ ] Invalid credentials fail safely
[ ] Authenticated user can retrieve own profile
[ ] Protected endpoint rejects unauthenticated requests
```

### Suggested commit

```text
feat: implement authentication
```

---

## Commit 11 — Role-Based Authorization

### Objective

Enforce role permissions on the backend.

### Implement

Role guards for:

```text
USER
OWNER
ADMIN
```

Resource ownership checks for owner operations.

### Critical rule

The frontend must never be the only authorization layer.

### Validation

```text
[ ] User cannot call owner endpoints
[ ] Owner cannot access another owner's mess
[ ] User cannot access admin endpoints
[ ] Admin can access admin endpoints
[ ] Unauthorized resource access returns a safe error
```

### Suggested commit

```text
feat: add role based authorization
```

---

## Commit 12 — User Profile and Profile Photo

### Objective

Complete basic user profile management.

### Implement

- Get current profile.
- Edit profile.
- Profile photo upload.
- Profile photo replacement.
- Safe storage/reference to image URL.

### Validation

```text
[ ] User can update own profile
[ ] User cannot modify another user
[ ] Photo upload works
[ ] Photo URL is persisted
[ ] Invalid upload is rejected
```

### Suggested commit

```text
feat: add user profile management
```

---

## Commit 13 — Mess Management for Owners

### Objective

Allow an owner to create and manage the mess used by the MVP.

### Implement

- Create mess.
- Edit mess.
- View own mess.
- Upload/update cover image.
- Set monthly price.
- Set meal count.
- Set contact/address information.
- Active/disabled mess status.

### Validation

```text
[ ] Owner can create mess
[ ] Owner can edit own mess
[ ] Owner cannot edit another owner's mess
[ ] User can only see available messes
[ ] Disabled mess cannot accept subscriptions
```

### Suggested commit

```text
feat: add owner mess management
```

---

## Commit 14 — Mess Discovery and Details

### Objective

Allow users to discover and inspect a mess.

### Implement

- Mess list.
- Basic search.
- Basic filtering where practical.
- Mess details endpoint/page.
- Cover image.
- Rating placeholder/data model as appropriate.
- Monthly price.
- Meals per day.
- Address/contact.
- Menu preview.

### Keep simple

Do not build advanced recommendation/ranking logic.

### Validation

```text
[ ] User can list active messes
[ ] User can open a mess
[ ] Disabled messes are excluded
[ ] Mess details render correctly
```

### Suggested commit

```text
feat: add mess discovery
```

---

## Commit 15 — Owner Menu Management

### Objective

Allow owners to create and publish menus.

### Implement

- Create menu for date.
- Add breakfast items.
- Add lunch items.
- Add dinner items.
- Edit items.
- Delete items.
- Optional item photo.
- Save as draft.
- Publish menu.
- View menu history.

### Validation

```text
[ ] Owner can create menu
[ ] Owner can edit own menu
[ ] Draft menu is not public
[ ] Published menu is visible to users
[ ] Menu history is preserved
```

### Suggested commit

```text
feat: add owner menu management
```

---

## Commit 16 — User Menu Viewing

### Objective

Allow users to browse daily and date-based menus.

### Implement

- Today's menu.
- Future menu.
- Past menu.
- Breakfast/lunch/dinner grouping.
- Date navigation.
- Meal times if configured by the mess.

### Validation

```text
[ ] User can view today's menu
[ ] User can change date
[ ] Only published menus are visible
[ ] Empty-menu state is handled
```

### Suggested commit

```text
feat: add user menu browsing
```

---

## Commit 17 — Subscription Creation

### Objective

Allow a user to request a monthly subscription.

### Implement

- Select mess.
- Select monthly plan.
- Create subscription record.
- Create payment intent/request.
- Prevent invalid duplicate active subscriptions.

### Important state separation

Payment and activation are separate.

```text
Payment = SUCCESS
Subscription = PENDING_APPROVAL
```

### Validation

```text
[ ] User can request subscription
[ ] Invalid/disabled mess is rejected
[ ] Duplicate subscription is handled
[ ] Subscription starts in correct state
```

### Suggested commit

```text
feat: add mess subscription flow
```

---

## Commit 18 — Payment Integration

### Objective

Integrate the selected payment provider for monthly plan payment.

### Implement

- Create payment request/order.
- Return safe payment initiation data to frontend.
- Persist pending payment.
- Verify payment server-side.
- Add provider IDs.
- Add payment status transitions.

### Critical rule

A frontend callback alone must never be treated as payment truth.

### Validation

```text
[ ] Payment can be initiated
[ ] Payment success is verified server-side
[ ] Failed payment is persisted correctly
[ ] Duplicate provider events do not duplicate payment
[ ] Subscription does not activate automatically
```

### Suggested commit

```text
feat: integrate subscription payments
```

---

## Commit 19 — Payment Webhooks and Idempotency

### Objective

Make payment processing reliable enough for production use.

### Implement

- Payment webhook endpoint.
- Webhook signature verification.
- Idempotency by provider event/payment ID.
- Payment state synchronization.
- Successful payment → subscription moves to `PENDING_APPROVAL`.

### Validation

```text
[ ] Valid webhook accepted
[ ] Invalid signature rejected
[ ] Duplicate webhook is idempotent
[ ] Payment state updates correctly
[ ] Subscription approval state updates only once
```

### Suggested commit

```text
feat: add payment webhooks and idempotency
```

---

## Commit 20 — Owner Subscription Approval

### Objective

Complete the approval workflow.

### Implement

Owner can:

- View pending subscription requests.
- View user information needed for approval.
- Approve.
- Reject.

Approval:

```text
PENDING_APPROVAL → ACTIVE
```

Rejection:

```text
PENDING_APPROVAL → REJECTED
```

### Validation

```text
[ ] Owner can see pending requests for own mess
[ ] Owner cannot approve another owner's subscription
[ ] Approve activates subscription
[ ] Reject changes state correctly
[ ] User can see current approval state
```

### Suggested commit

```text
feat: add subscription approval workflow
```

---

## Commit 21 — Meal Booking

### Objective

Allow active subscribers to book meals.

### Implement

- Calendar/date selection.
- Breakfast booking.
- Lunch booking.
- Dinner booking.
- Save/update booking.
- Booking history.
- Enforce active subscription.

### Validation

```text
[ ] Only ACTIVE subscribers can book
[ ] Booking is tied to date and meal type
[ ] Duplicate booking is prevented/updated safely
[ ] Booking history works
```

### Suggested commit

```text
feat: add meal booking
```

---

## Commit 22 — Meal Skip Cutoff

### Objective

Enforce the configured skip deadline.

### Implement

- Server-side cutoff validation.
- Skip meal.
- Reject skip after cutoff.
- Clear error returned to frontend.
- Configurable cutoff per mess/platform as appropriate.

### Important rule

The backend, not the client clock, is authoritative.

### Validation

```text
[ ] Skip works before cutoff
[ ] Skip is rejected after cutoff
[ ] Time comparison is server-side
[ ] Existing booking history remains correct
```

### Suggested commit

```text
feat: enforce meal skip cutoff
```

---

## Commit 23 — Extra Meals

### Objective

Support extra meal requests.

### Implement

- Extra meal action.
- Extra meal record.
- Link extra meal to date/meal type.
- Owner visibility.
- Payment integration only if the business requires payment at this stage.

Do not invent complex pricing rules.

### Validation

```text
[ ] Active subscriber can request extra meal
[ ] Owner can see extra meals
[ ] Duplicate extra requests are controlled
[ ] History shows extra meal records
```

### Suggested commit

```text
feat: add extra meal requests
```

---

## Commit 24 — User QR Identity

### Objective

Create a secure QR representation for attendance.

### Implement

- Stable opaque QR identifier/token.
- User QR screen.
- Token must not expose sensitive user data.
- QR payload is validated server-side.

### Validation

```text
[ ] Active user can display QR
[ ] QR contains only safe opaque data
[ ] Token can be resolved by backend
[ ] Invalid token is rejected
```

### Suggested commit

```text
feat: add user attendance qr
```

---

## Commit 25 — Manual Attendance

### Objective

Allow the owner to record attendance manually.

### Implement

- Today's attendance screen.
- Customer list.
- Present.
- Absent.
- Extra.
- Batch save.
- Attendance history.

### Validation

```text
[ ] Owner sees customers for own mess
[ ] Owner can mark present
[ ] Owner can mark absent
[ ] Owner can mark extra
[ ] Batch save works
[ ] Duplicate attendance is controlled
```

### Suggested commit

```text
feat: add manual attendance
```

---

## Commit 26 — QR Attendance

### Objective

Allow owners to scan the user QR and automatically record attendance.

### Implement

- QR scanner in owner UI.
- Send scanned token to backend.
- Resolve user.
- Validate mess ownership.
- Validate active subscription.
- Create/update attendance.
- Record method as `QR`.

### Validation

```text
[ ] Valid QR marks correct user
[ ] Wrong-mess user is rejected
[ ] Inactive subscriber is rejected
[ ] Invalid QR is rejected
[ ] Attendance method is QR
[ ] Duplicate scan is safe
```

### Suggested commit

```text
feat: add qr attendance scanning
```

---

## Commit 27 — Payment History and Invoice Access

### Objective

Give users persistent payment history and invoice access.

### Implement

- Payment history screen.
- Payment details.
- Invoice number.
- Invoice retrieval/download.
- Payment status.
- Subscription association.

### Validation

```text
[ ] User sees own payments only
[ ] Payment statuses are accurate
[ ] Invoice can be retrieved
[ ] Missing invoice is handled safely
```

### Suggested commit

```text
feat: add payment history and invoices
```

---

## Commit 28 — Invoice Generation

### Objective

Generate an application invoice after verified payment.

### Implement

- Invoice numbering.
- Invoice data.
- PDF/document generation.
- Store invoice reference.
- Link invoice to successful payment.
- Prevent duplicate invoices on repeated payment events.

### Validation

```text
[ ] Successful payment generates one invoice
[ ] Duplicate payment event does not create duplicate invoice
[ ] Invoice can be retrieved
[ ] Invoice contains correct customer/mess/payment data
```

### Suggested commit

```text
feat: generate payment invoices
```

---

## Commit 29 — WhatsApp Invoice Delivery

### Objective

Send the verified payment invoice through WhatsApp.

### Implement

- WhatsApp service abstraction.
- Provider integration.
- Invoice document delivery.
- Delivery status recording.
- Retry-safe delivery.
- Failure logging.

### Critical rule

WhatsApp failure must not change a successful payment back to failed.

### Validation

```text
[ ] Successful payment triggers invoice delivery
[ ] Delivery status is stored
[ ] Provider failure is logged
[ ] Payment remains successful if WhatsApp fails
[ ] Duplicate webhook does not send uncontrolled duplicates
```

### Suggested commit

```text
feat: add whatsapp invoice delivery
```

---

## Commit 30 — User History

### Objective

Provide the user with a useful operational history.

### Implement

History for:

- Bookings
- Attendance
- Payments
- Subscription

Use pagination where necessary.

### Validation

```text
[ ] User can view booking history
[ ] User can view attendance history
[ ] User can view payment history
[ ] User can view subscription state/history
[ ] User cannot see another user's history
```

### Suggested commit

```text
feat: add user activity history
```

---

## Commit 31 — Owner Dashboard

### Objective

Give the mess owner a useful daily operating dashboard.

### Show

- Total customers
- Active customers
- Pending approvals
- Today's expected meals
- Present
- Absent
- Extra
- Basic payment/revenue summary

### Primary actions

- Menu
- Approvals
- Customers
- Attendance

### Validation

```text
[ ] Dashboard loads real backend data
[ ] Values respect owner/mess scope
[ ] Empty states work
[ ] Loading/error states work
```

### Suggested commit

```text
feat: build owner dashboard
```

---

## Commit 32 — Owner Customer Management

### Objective

Allow owners to manage their customer list.

### Implement

- Customer list.
- Search.
- Active/disabled filter.
- Customer detail.
- Enable/disable customer.
- Subscription summary.

### Validation

```text
[ ] Owner can list own customers
[ ] Search works
[ ] Status filtering works
[ ] Disable works
[ ] Disabled customer cannot create new bookings
```

### Suggested commit

```text
feat: add owner customer management
```

---

## Commit 33 — User Dashboard

### Objective

Create the main mobile-first user experience.

### Show

- Greeting
- Today's menu
- Current mess
- Subscription status
- Approval state
- Book Meal action
- QR action
- Payment/history actions

### Navigation

Recommended:

```text
Home
Menu
Book Meal
Payments
Profile
```

### Validation

```text
[ ] Dashboard is mobile-first
[ ] Today's information loads from API
[ ] Active/pending/rejected states are clear
[ ] Primary actions are easy to reach
```

### Suggested commit

```text
feat: build user dashboard
```

---

## Commit 34 — Owner Menu and Attendance UX Integration

### Objective

Make the owner experience usable as a daily operational tool rather than isolated screens.

### Implement

Connect:

```text
Dashboard
→ Menu
→ Customers
→ Approvals
→ Attendance
```

Provide consistent navigation and loading/error/empty states.

### Validation

```text
[ ] Owner can complete daily workflow without dead-end pages
[ ] Navigation is consistent
[ ] API errors are displayed safely
[ ] Mobile/tablet layouts remain usable
```

### Suggested commit

```text
feat: integrate owner operations ui
```

---

## Commit 35 — Admin Foundation

### Objective

Create the minimum admin interface required to operate the platform.

### Implement

- Admin login/access.
- Admin dashboard shell.
- User list.
- Owner list.
- Basic search/filter.
- Account disable/enable.
- Basic owner approval where required.

### Validation

```text
[ ] Only admins can access admin routes
[ ] User list works
[ ] Owner list works
[ ] Disable/enable works
[ ] Important actions are audited
```

### Suggested commit

```text
feat: add admin operations
```

---

## Commit 36 — Notifications Foundation

### Objective

Implement the minimum operational notification framework.

### Required notifications

User:

- Payment successful
- Subscription approved/rejected
- Invoice available

Owner:

- New subscription request

### Implement

Use a provider-agnostic notification service.

### Validation

```text
[ ] Core events create notification attempts
[ ] Notification failures do not corrupt core business state
[ ] Notification events can be logged
```

### Suggested commit

```text
feat: add operational notifications
```

---

## Commit 37 — Audit and Operational Activity

### Objective

Make important MVP operations traceable.

### Audit:

- Subscription requested
- Payment status changed
- Subscription approved/rejected
- Booking changed
- Attendance changed
- Account disabled/enabled
- Owner approved/disabled

### Validation

```text
[ ] Important operations create audit records
[ ] Audit records contain actor/action/entity
[ ] Audit data is not editable through normal APIs
[ ] Admin can inspect basic audit activity
```

### Suggested commit

```text
feat: add mvp audit trail
```

---

## Commit 38 — Background Job Foundation

### Objective

Introduce asynchronous processing only where it materially improves reliability.

### Implement

Use Redis + BullMQ for:

- Invoice generation if asynchronous
- WhatsApp delivery
- Retryable notification delivery
- Retryable integration work

Do not move every API operation into a queue.

### Validation

```text
[ ] Queue starts
[ ] Worker starts
[ ] Job can be created
[ ] Job succeeds
[ ] Failed jobs are observable
[ ] Retry behavior is bounded
```

### Suggested commit

```text
feat: add background job processing
```

---

## Commit 39 — Error Handling and Reliability Hardening

### Objective

Make the MVP safe to operate with normal external/API failures.

### Handle

- Payment API timeout
- WhatsApp failure
- Database failure
- Duplicate requests
- Duplicate webhooks
- QR double scans
- Booking double submission
- Worker restart

### Validation

```text
[ ] Duplicate requests do not create duplicate business records
[ ] External provider failures are surfaced/logged
[ ] Core state does not become inconsistent
[ ] Error responses remain predictable
```

### Suggested commit

```text
feat: harden mvp reliability
```

---

## Commit 40 — Security Hardening

### Objective

Harden the production MVP.

### Implement/review

- Secret handling
- Secure cookies/tokens/session behavior
- CORS restrictions
- Rate limiting where appropriate
- Input validation
- Authorization
- Webhook verification
- File upload validation
- Safe error responses
- Security headers
- Sensitive-data logging review

### Validation

```text
[ ] Secrets are not committed
[ ] Protected routes are actually protected
[ ] Cross-role access is rejected
[ ] Webhooks are verified
[ ] Sensitive values are not present in logs
```

### Suggested commit

```text
feat: harden mvp security
```

---

## Commit 41 — CI Pipeline

### Objective

Make every change automatically validated.

### Implement

CI should run on pull requests and main branch changes.

At minimum:

```text
Install
 ↓
Lint
 ↓
Typecheck
 ↓
Test
 ↓
Build
```

### Validation

```text
[ ] CI workflow runs
[ ] PR checks fail on type errors
[ ] PR checks fail on tests
[ ] PR checks fail on build failures
[ ] Main branch cannot silently ship broken code
```

### Suggested commit

```text
ci: add pull request checks
```

---

## Commit 42 — CD and Environment Deployment

### Objective

Continuously deploy validated changes.

### Implement

At minimum:

```text
main
 ↓
Build
 ↓
Deploy
 ↓
Database migration
 ↓
Health check
```

Support:

```text
development
staging
production
```

where infrastructure allows.

### Requirements

- Production secrets managed outside Git.
- Deployment is repeatable.
- Failed health check marks deployment unhealthy.
- Rollback procedure is documented.

### Validation

```text
[ ] Deployment succeeds from main
[ ] Production health endpoint works
[ ] Database migrations run safely
[ ] Environment variables are documented
[ ] Rollback procedure is documented
```

### Suggested commit

```text
ci: add continuous deployment
```

---

## Commit 43 — Dockerized Application Runtime

### Objective

Make the application reproducible in deployment environments.

### Implement

Container configuration for:

- Next.js web
- Express API
- Worker if required
- PostgreSQL
- Redis

Local development should remain simple.

### Validation

```text
[ ] Docker builds
[ ] Containers start
[ ] API can reach database
[ ] Worker can reach Redis
[ ] Web can reach API
```

### Suggested commit

```text
chore: containerize mvp services
```

---

## Commit 44 — Testing the Core Business Journey

### Objective

Protect the complete MVP loop with automated tests.

### E2E flow

```text
Register
→ Login
→ Discover Mess
→ View Menu
→ Subscribe
→ Pay/Test Payment
→ Owner Approval
→ Book Meal
→ Attendance
→ View History
```

### Also test

- Skip before cutoff
- Skip after cutoff
- Manual attendance
- QR attendance
- Duplicate payment webhook
- Role authorization

### Validation

```text
[ ] Core journey passes
[ ] Authorization tests pass
[ ] Payment idempotency test passes
[ ] Booking rules pass
[ ] Attendance rules pass
```

### Suggested commit

```text
test: cover mvp end to end flow
```

---

## Commit 45 — Production Seed / Demo Data

### Objective

Provide safe non-production seed data that makes the system immediately testable.

### Seed

- Admin
- Demo owner
- Demo mess
- Example menu
- Demo users
- Example subscription states

### Rules

- Never include real secrets.
- Demo data must be clearly identified.
- Production seed must not overwrite real data.

### Validation

```text
[ ] Fresh database can be seeded
[ ] Demo login data works where intended
[ ] Seed is idempotent or safely repeatable
[ ] No sensitive data is present
```

### Suggested commit

```text
chore: add mvp seed data
```

---

## Commit 46 — MVP UX Polish

### Objective

Make the first release feel simple, sober, and production-ready.

### Review

- Typography
- Spacing
- Navigation
- Buttons
- Forms
- Cards
- Loading states
- Empty states
- Error states
- Mobile responsiveness
- Accessibility basics
- Confirmation messages
- Status badges

Do not add new business features here.

### Validation

```text
[ ] Main user journey is visually coherent
[ ] Main owner journey is visually coherent
[ ] Important states are understandable
[ ] Mobile layouts are usable
```

### Suggested commit

```text
style: polish mvp experience
```

---

## Commit 47 — MVP Release Readiness

### Objective

Verify that the product is ready for a real mess to start using.

### Verify User

```text
[ ] Registration/login works
[ ] Student/Professional selection works
[ ] Profile works
[ ] Mess discovery works
[ ] Mess details work
[ ] Menu viewing works
[ ] Subscription works
[ ] Payment works
[ ] Approval status works
[ ] Booking works
[ ] Skip cutoff works
[ ] Extra meal works
[ ] QR works
[ ] History works
[ ] Invoice works
```

### Verify Owner

```text
[ ] Owner login works
[ ] Mess management works
[ ] Menu management works
[ ] Customer list works
[ ] Approval workflow works
[ ] Manual attendance works
[ ] QR attendance works
[ ] Dashboard works
```

### Verify Admin

```text
[ ] Admin access works
[ ] Users can be viewed
[ ] Owners can be viewed
[ ] Account status can be managed
[ ] Audit activity can be inspected
```

### Verify Platform

```text
[ ] CI passes
[ ] CD works
[ ] Database migrations work
[ ] Payment webhooks are idempotent
[ ] No secrets are committed
[ ] Health checks work
[ ] Error handling works
[ ] Core E2E test passes
```

### Suggested commit

```text
chore: prepare mvp release
```

---

# CURRENT PROGRESS

Use this section as the quick status overview.

```text
[ ] Commit 00 — Repository and Monorepo Foundation
[ ] Commit 01 — Application Skeleton
[ ] Commit 02 — Shared Package Foundation
[ ] Commit 03 — Database Foundation
[ ] Commit 04 — Core Database Schema: Identity and Mess
[ ] Commit 05 — Core Database Schema: Subscription and Menu
[ ] Commit 06 — Core Database Schema: Booking, Attendance, Payments, Invoice, Audit
[ ] Commit 07 — Configuration and Environment Validation
[ ] Commit 08 — Express API Foundation
[ ] Commit 09 — Shared Validation Layer
[ ] Commit 10 — Authentication
[ ] Commit 11 — Role-Based Authorization
[ ] Commit 12 — User Profile and Profile Photo
[ ] Commit 13 — Mess Management for Owners
[ ] Commit 14 — Mess Discovery and Details
[ ] Commit 15 — Owner Menu Management
[ ] Commit 16 — User Menu Viewing
[ ] Commit 17 — Subscription Creation
[ ] Commit 18 — Payment Integration
[ ] Commit 19 — Payment Webhooks and Idempotency
[ ] Commit 20 — Owner Subscription Approval
[ ] Commit 21 — Meal Booking
[ ] Commit 22 — Meal Skip Cutoff
[ ] Commit 23 — Extra Meals
[ ] Commit 24 — User QR Identity
[ ] Commit 25 — Manual Attendance
[ ] Commit 26 — QR Attendance
[ ] Commit 27 — Payment History and Invoice Access
[ ] Commit 28 — Invoice Generation
[ ] Commit 29 — WhatsApp Invoice Delivery
[ ] Commit 30 — User History
[ ] Commit 31 — Owner Dashboard
[ ] Commit 32 — Owner Customer Management
[ ] Commit 33 — User Dashboard
[ ] Commit 34 — Owner Menu and Attendance UX Integration
[ ] Commit 35 — Admin Foundation
[ ] Commit 36 — Notifications Foundation
[ ] Commit 37 — Audit and Operational Activity
[ ] Commit 38 — Background Job Foundation
[ ] Commit 39 — Error Handling and Reliability Hardening
[ ] Commit 40 — Security Hardening
[ ] Commit 41 — CI Pipeline
[ ] Commit 42 — CD and Environment Deployment
[ ] Commit 43 — Dockerized Application Runtime
[ ] Commit 44 — Testing the Core Business Journey
[ ] Commit 45 — Production Seed / Demo Data
[ ] Commit 46 — MVP UX Polish
[ ] Commit 47 — MVP Release Readiness
```

---

# RECOMMENDED FIRST PRODUCTION CHECKPOINT

The fastest useful shipping point is **before every enhancement is complete**.

The first serious production checkpoint is:

```text
Commit 00
→ Commit 01
→ Commit 02
→ Commit 03
→ Commit 04
→ Commit 05
→ Commit 06
→ Commit 07
→ Commit 08
→ Commit 09
→ Commit 10
→ Commit 11
→ Commit 13
→ Commit 14
→ Commit 15
→ Commit 16
→ Commit 17
→ Commit 18
→ Commit 19
→ Commit 20
→ Commit 21
→ Commit 22
→ Commit 25
→ Commit 31
→ Commit 33
```

This gives the product a working foundation and the essential:

```text
User
→ Mess
→ Menu
→ Subscription
→ Payment
→ Approval
→ Booking
→ Attendance
```

After that, continue shipping the next commits without needing to rewrite the core architecture.

---

# FUTURE / POST-MVP ITEMS

These are intentionally outside the initial tracker-critical path:

```text
[ ] Advanced expense tracker
[ ] Complaint management
[ ] Coupons and offers
[ ] Advanced revenue reports
[ ] Advanced analytics
[ ] Multi-mess / multi-branch operations
[ ] Rich automated notifications
[ ] Native mobile client
[ ] Offline attendance
[ ] Advanced operational automation
```

Do not pull these into earlier commits unless the user explicitly changes MVP scope.

---

# AI IMPLEMENTATION DISCIPLINE

## One user request should normally map to one tracker commit

Example:

```text
User:
"Implement Commit 21."
```

The AI should:

```text
Read PRD.md
   ↓
Read Commit 21 requirements here
   ↓
Inspect repository
   ↓
Implement only Commit 21
   ↓
Test it
   ↓
Review diff
   ↓
[x] Commit 21
   ↓
Report
   ↓
STOP
```

It must not continue automatically to Commit 22.

### If implementation reveals a missing prerequisite

Do not silently implement several future commits.

Instead:

```text
- Explain the prerequisite.
- Implement only the minimum required change if it belongs to the current commit.
- Otherwise stop and tell the user which tracker commit should come first.
```

### If a commit becomes too large

Split it into additional tracker commits and update this file rather than hiding unrelated work inside one commit.

---

# FINAL RULE

This file is a **roadmap, checklist, and implementation contract**.

It is not permission to:

- commit automatically,
- push automatically,
- modify Git history,
- implement the entire roadmap in one run,
- mark unchecked work as completed,
- or silently expand MVP scope.

The intended workflow is:

```text
User:
"Do Commit 21"

        ↓

AI reads PRD.md

        ↓

AI implements Commit 21 only

        ↓

AI validates Commit 21

        ↓

AI marks:
[x] Commit 21

        ↓

AI reports:
- implemented
- validated
- suggested commit message

        ↓

AI states:
"I did NOT create a Git commit."

        ↓

STOP

        ↓

User reviews the diff

        ↓

User manually commits

        ↓

User asks for next commit
```

**Never automatically commit, push, reset, squash, rebase, merge, or otherwise modify Git history without explicit user instruction.**
