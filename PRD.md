# PRD — Mess Management Platform MVP

## 1. Product Overview

### Product Name

**Mess Management Platform**

### Product Type

Mobile-first web application for students/professionals and mess owners, with a web administration panel.

### Core Objective

Build a simple, production-ready mess management platform that can be used by a real mess immediately.

The MVP must solve the complete core operating loop:

**User registers → discovers mess → subscribes → pays → owner approves → user books/skips meals → owner records attendance → user sees history and payment information**

The product should be deliberately narrow in the first release. Every feature included in the MVP must support this operating loop or be required to run it safely.

### Primary MVP Users

| User | Purpose |
|---|---|
| **Student / Professional** | Find a mess, subscribe, pay, manage meals, view history |
| **Mess Owner** | Manage menu, approve subscribers, manage customers, record attendance |
| **Admin** | Manage users/owners and provide basic platform oversight |

### MVP Product Principle

**Ship a usable product first, then add capabilities without redesigning the foundation.**

---

## 2. Product Goals

### Primary Goals

1. Allow a real user to create an account and select **Student** or **Professional**.
2. Allow users to discover a mess and view its basic information and menu.
3. Allow a user to purchase a monthly mess plan.
4. Require mess-owner approval after successful payment.
5. Allow active subscribers to book, skip, and request extra meals.
6. Allow owners to mark attendance manually and through QR scanning.
7. Provide payment history, booking history, and attendance history.
8. Generate a payment invoice and support WhatsApp delivery.
9. Give the owner a useful daily dashboard.
10. Provide an admin panel for basic platform management.
11. Deploy continuously so completed features can be released independently.

### Secondary Goals

- Keep the UI simple and sober.
- Make the first version mobile-first.
- Keep business rules on the backend.
- Keep role permissions explicit.
- Keep the database and API structured so a future mobile client can reuse the same backend.

---

## 3. Non-Goals for MVP

The following are intentionally excluded from the first production release:

- Advanced expense tracking
- Complex coupon/offer engine
- Advanced analytics and forecasting
- Multi-branch enterprise management
- Automated complaint-resolution workflows
- Sophisticated recommendation systems
- Chatbot functionality
- Native iOS/Android application
- Complex subscription pricing rules
- Advanced accounting/reporting
- Large-scale notification automation beyond core operational notifications

These features may be added after the core product is stable.

---

## 4. MVP Scope

The MVP is divided into four product areas.

### User Application

- Registration and login
- Student / Professional type selection
- Profile photo
- Profile management
- Mess discovery
- Mess details
- Menu viewing
- Monthly subscription
- Payment
- Approval status
- Meal booking
- Meal skipping
- Extra meal request
- Personal QR code
- Payment history
- Booking/history
- Attendance history
- Account active/disabled state
- WhatsApp invoice

### Mess Owner Application

- Owner registration/login
- Owner dashboard
- Mess profile
- Menu management
- Customer management
- Subscription approval
- Manual attendance
- QR attendance scanning
- Attendance history
- Basic payment/customer summary

### Admin Panel

- Admin authentication
- User list
- Owner list
- Enable/disable accounts
- Basic owner approval
- Basic platform overview
- Basic audit/history access

### Platform Foundation

- REST API
- Authentication and authorization
- PostgreSQL
- Drizzle ORM
- API validation
- File/image storage
- Payment integration
- WhatsApp integration
- QR generation/scanning
- Logging
- Error handling
- CI/CD
- Production deployment

---

## 5. Roles and Permissions

### 5.1 Student / Professional

Can:

- Register and log in
- Manage own profile
- Browse active messes
- View mess details
- View menus
- Subscribe to one mess
- Make payment
- View payment status/history
- View approval status
- Book meals
- Skip eligible meals
- Request extra meals
- Display personal QR
- View attendance history
- View booking history
- View invoice
- Receive operational notifications

Cannot:

- Manage another user
- Create/edit a mess
- Approve subscriptions
- Mark another user's attendance
- Access owner/admin data

### 5.2 Mess Owner

Can:

- Register and log in as owner
- Create/manage own mess profile
- Create/edit menus
- View own customers
- Approve/reject pending subscription requests
- Enable/disable customers
- Record attendance manually
- Scan customer QR
- View attendance history
- View basic revenue/payment information

Cannot:

- Access another owner's customers or data
- Manage platform-wide users
- Modify platform configuration
- Access admin-only operations

### 5.3 Admin

Can:

- View users
- View mess owners
- Approve/disable owners
- Enable/disable users
- View basic platform activity
- Inspect important operational records

Admin operations must always be checked on the backend.

---

## 6. High-Level User Journey

### New User

**Open app**

↓

**Register**

↓

**Select Student / Professional**

↓

**Verify phone**

↓

**Complete profile**

↓

**Browse messes**

↓

**Open mess details**

↓

**Select monthly plan**

↓

**Complete payment**

↓

**Payment confirmed**

↓

**Invoice generated**

↓

**Invoice sent to WhatsApp**

↓

**Subscription request sent to owner**

↓

**Owner approves**

↓

**User becomes Active Subscriber**

↓

**User can book/skip meals**

↓

**User uses QR or owner records manual attendance**

↓

**User can view history**

---

## 7. Core Product Workflows

## 7.1 Authentication and Onboarding

### Flow

1. User opens the application.
2. User chooses Register or Login.
3. Registration requires:
   - Name
   - Phone
   - Email (optional for initial release)
   - Profile photo (optional at first, editable later)
   - User type: Student / Professional
4. Phone verification is completed.
5. Account is created as `ACTIVE`.
6. User is sent to the user dashboard.

### Required States

```text
PENDING_VERIFICATION
ACTIVE
DISABLED
```

---

## 7.2 Mess Discovery

The user sees a list of available messes.

Each mess card should show:

- Mess name
- Cover image
- Rating
- Distance (when location is available)
- Monthly price
- Meal count
- Veg/non-veg or relevant food tag
- Active/inactive availability

The first MVP may use simple search/filtering. Complex discovery ranking is not required.

---

## 7.3 Mess Details

The mess detail screen contains:

### Overview

- Mess name
- Images
- Rating
- Monthly price
- Meals per day
- Address
- Contact details

### Menu

- Breakfast
- Lunch
- Dinner
- Extra meal information where applicable

### Actions

**Subscribe Now**

The user must not be able to subscribe to an unavailable/disabled mess.

---

## 7.4 Monthly Subscription

The subscription workflow is:

```text
User selects mess
      ↓
Select monthly plan
      ↓
Create pending subscription
      ↓
Start payment
      ↓
Payment result verified by backend
      ↓
Successful payment
      ↓
Generate invoice
      ↓
Send invoice to WhatsApp
      ↓
Subscription = PENDING_APPROVAL
      ↓
Owner reviews request
      ↓
Approve
      ↓
Subscription = ACTIVE
```

### Important Rule

**Payment success and subscription activation are separate states.**

Payment success must not automatically grant active meal-booking access when owner approval is required.

---

## 7.5 Subscription Approval

Owner dashboard contains:

```text
Pending Requests
----------------
Rahul More
Plan: Monthly
Amount: ₹2,400
Paid: Yes

[Approve] [Reject]
```

### Approve

- Subscription becomes `ACTIVE`.
- User receives approval notification.
- User can book meals.

### Reject

- Subscription becomes `REJECTED`.
- User sees rejection status.
- Refund handling is outside the initial business workflow unless separately required.

### Subscription States

```text
PENDING_PAYMENT
PENDING_APPROVAL
ACTIVE
REJECTED
EXPIRED
CANCELLED
```

---

## 7.6 Menu Management

Owner selects a date and manages:

```text
Breakfast
  + Add Item

Lunch
  + Add Item

Dinner
  + Add Item
```

A menu item contains:

- Name
- Optional description
- Optional image
- Meal type
- Display order

Owner can:

- Create
- Edit
- Remove
- Publish

### Menu States

```text
DRAFT
PUBLISHED
ARCHIVED
```

Only published menus are visible to users.

---

## 7.7 Meal Booking

An active subscriber opens the booking screen.

Example:

```text
28 August

Breakfast
[Booked] [Skip]

Lunch
[Book] [Skip]

Dinner
[Book] [Skip]

Extra Meal
[+ Add]
```

### Rules

- Only active subscribers can create meal bookings.
- Booking is tied to a date and meal type.
- A skip is allowed only before the configured cutoff.
- Once the cutoff passes, skipping is locked.
- Extra meals are separately recorded.

### Booking States

```text
BOOKED
SKIPPED
EXTRA
LOCKED
CANCELLED
```

---

## 7.8 Attendance

Attendance has two supported methods.

### Method A — QR

1. User opens their personal QR.
2. Owner opens Scan QR.
3. Owner scans the code.
4. Backend validates:
   - User exists.
   - User belongs to the mess.
   - Subscription is active.
   - Attendance is valid for the selected date/meal.
5. Attendance is recorded.

### Method B — Manual

Owner sees a customer list and marks:

```text
PRESENT
ABSENT
EXTRA
```

### Attendance Requirements

Attendance must record:

- User
- Mess/owner
- Date
- Meal type
- Status
- Method
- Created timestamp
- Updated timestamp

### Attendance Methods

```text
QR
MANUAL
```

---

## 7.9 Payment and Invoice

The initial payment flow should support the selected payment gateway for:

- Monthly plan payment
- Extra meal payment where required

### Payment states

```text
PENDING
SUCCESS
FAILED
CANCELLED
REFUNDED
```

The backend must verify payment status through the payment provider rather than trusting a frontend success response.

### Invoice

After verified payment success:

1. Persist payment.
2. Generate invoice.
3. Store invoice metadata.
4. Make invoice retrievable from the user's payment history.
5. Send invoice through WhatsApp.
6. Record WhatsApp delivery attempt/status.

---

## 7.10 WhatsApp Invoice

MVP requires a provider-backed WhatsApp integration.

The invoice message should contain:

- Customer name
- Mess name
- Plan
- Amount
- Payment date
- Invoice number
- Invoice/document link or supported document attachment

### Failure behavior

If WhatsApp delivery fails:

- Payment remains successful.
- Invoice remains available in the application.
- Delivery failure is logged.
- The system must not duplicate the payment.

WhatsApp delivery is a notification channel, not the source of payment truth.

---

## 7.11 History

### User History

Minimum MVP history:

- Payments
- Bookings
- Attendance
- Subscription status

### Owner History

Minimum MVP history:

- Attendance records
- Customers
- Subscription approvals
- Payments/basic revenue history

### Admin History

Minimum MVP history:

- Important user/owner account changes
- Important subscription/payment events
- Audit events

---

## 7.12 Active / Disabled Status

Accounts should use status rather than destructive deletion for normal operational disablement.

### User/Owner account states

```text
ACTIVE
DISABLED
```

Rules:

- Disabled users cannot create new bookings.
- Disabled owners cannot operate owner workflows.
- Historical data must remain accessible to authorized administrators.
- Disabling an account must be auditable.

---

## 8. Dashboards

## 8.1 User Dashboard

The home screen should prioritize today's information.

### Required sections

- Greeting
- Today's menu
- Current subscription
- Approval status
- Quick action: Book Meal
- Quick action: Payment History
- Quick action: QR
- Recent activity

The interface should remain simple and mobile-first.

---

## 8.2 Owner Dashboard

The owner dashboard should answer:

**“What do I need to operate my mess today?”**

### Required information

- Total customers
- Active customers
- Pending subscription approvals
- Today's expected meals
- Today's present count
- Today's absent count
- Today's extra meals
- Recent payments/basic revenue

### Primary actions

- Manage Menu
- Approve Subscribers
- Attendance
- Customers

---

## 8.3 Admin Dashboard

The admin dashboard is intentionally basic in MVP.

### Required information

- Total users
- Total owners
- Active users
- Active messes
- Pending owner approvals
- Recent important activity

---

## 9. Core Business Rules

### Subscription

- An account can only operate as an active subscriber when subscription status is `ACTIVE`.
- Payment must be successfully verified before a paid subscription request reaches owner approval.
- Subscription activation requires owner approval.

### Booking

- Only active subscribers can book.
- A user cannot create duplicate bookings for the same user/date/meal unless explicitly supported as an update.
- Skip is rejected after the configured cutoff.

### Attendance

- Attendance can only be recorded for valid users associated with the mess.
- Duplicate attendance for the same user/date/meal must be prevented or converted to an idempotent update.
- QR and manual attendance must write to the same attendance model.

### Payment

- Frontend payment callbacks are not authoritative.
- Verified provider events are authoritative.
- Payment records must be idempotent.

### Authorization

- Every protected API operation must check the authenticated user role and resource ownership.
- Frontend route protection is not sufficient.

---

## 10. Domain Model

The initial backend should center on these entities.

### User

```text
id
name
phone
email
password/credential metadata
userType
role
profilePhotoUrl
status
createdAt
updatedAt
```

### Mess

```text
id
ownerId
name
description
coverImageUrl
address
phone
monthlyPrice
mealsPerDay
status
createdAt
updatedAt
```

### Subscription

```text
id
userId
messId
planId/plan metadata
amount
paymentId
status
requestedAt
approvedAt
rejectedAt
expiresAt
```

### Menu

```text
id
messId
date
status
publishedAt
createdAt
updatedAt
```

### MenuItem

```text
id
menuId
mealType
name
description
imageUrl
displayOrder
```

### MealBooking

```text
id
userId
messId
date
mealType
status
createdAt
updatedAt
```

### Attendance

```text
id
userId
messId
date
mealType
status
method
createdAt
updatedAt
```

### Payment

```text
id
userId
messId
subscriptionId
provider
providerPaymentId
amount
currency
status
paidAt
metadata
createdAt
updatedAt
```

### Invoice

```text
id
paymentId
invoiceNumber
fileUrl
whatsappStatus
createdAt
```

### AuditEvent

```text
id
actorId
actorRole
action
entityType
entityId
metadata
createdAt
```

---

## 11. API Requirements

The backend exposes a REST API under a versioned prefix.

Example:

```text
/api/v1
```

### Authentication

```text
POST /auth/register
POST /auth/login
POST /auth/verify-phone
POST /auth/logout
GET  /auth/me
```

### Users

```text
GET   /users/me
PATCH /users/me
POST  /users/me/profile-photo
```

### Mess Discovery

```text
GET /messes
GET /messes/:messId
GET /messes/:messId/menu
```

### Subscriptions

```text
POST /messes/:messId/subscriptions
GET  /subscriptions/me
GET  /subscriptions/:subscriptionId
```

### Payments

```text
POST /payments
GET  /payments
GET  /payments/:paymentId
```

### Bookings

```text
POST /bookings
GET  /bookings
PATCH /bookings/:bookingId
```

### Attendance

```text
GET /attendance/me
```

### Owner APIs

```text
GET   /owner/dashboard
GET   /owner/customers
POST  /owner/customers
PATCH /owner/customers/:userId/status

GET   /owner/subscriptions/pending
POST  /owner/subscriptions/:subscriptionId/approve
POST  /owner/subscriptions/:subscriptionId/reject

POST  /owner/menus
PATCH /owner/menus/:menuId
POST  /owner/menus/:menuId/publish

POST  /owner/attendance/manual
POST  /owner/attendance/qr
GET  /owner/attendance
```

### Admin APIs

```text
GET   /admin/users
PATCH /admin/users/:userId/status

GET   /admin/owners
PATCH /admin/owners/:ownerId/status
POST  /admin/owners/:ownerId/approve

GET /admin/audit-events
GET /admin/dashboard
```

### Webhooks

Provider webhooks must use dedicated endpoints.

```text
POST /webhooks/payment
POST /webhooks/whatsapp
```

Webhook processing must be idempotent.

---

## 12. API Design Standards

Every endpoint must:

- Validate input.
- Authenticate when required.
- Authorize resource access.
- Return predictable JSON.
- Use appropriate HTTP status codes.
- Return structured error responses.
- Avoid exposing internal implementation details.
- Log important failures with a request/correlation ID.

### Example success shape

```json
{
  "data": {},
  "meta": {}
}
```

### Example error shape

```json
{
  "error": {
    "code": "SUBSCRIPTION_NOT_ACTIVE",
    "message": "The subscription is not active."
  }
}
```

---

## 13. Technical Architecture

### Monorepo

Use **Turborepo** to keep the applications and shared packages in one repository.

Recommended structure:

```text
apps/
  web/
  api/

packages/
  db/
  types/
  validation/
  config/
  ui/
  eslint-config/
  tsconfig/
```

### Frontend

**Next.js + TypeScript**

Responsibilities:

- User application
- Owner application
- Admin panel
- Authenticated layouts
- Form handling
- API client
- Role-aware navigation
- Responsive/mobile-first UI

### Backend

**Node.js + Express + TypeScript**

Responsibilities:

- REST API
- Authentication
- Authorization
- Business rules
- Payment integration
- WhatsApp integration
- QR attendance
- Subscription lifecycle
- Menu/booking/attendance logic
- Audit logging

### Database

**PostgreSQL + Drizzle ORM**

Responsibilities:

- Source of truth for application data
- Transactions for business-critical state changes
- Strong relational constraints
- Typed queries and migrations

### Background Jobs

The MVP may use **Redis + BullMQ** for operations that should not block an HTTP request, such as:

- Invoice generation
- WhatsApp invoice delivery
- Retryable provider operations
- Notification delivery

Simple synchronous operations should remain synchronous until a background job is actually necessary.

---

## 14. QR Architecture

Each user should have a stable application-level QR identity.

The QR should encode an opaque identifier/token rather than sensitive user information.

### Flow

```text
User QR
   ↓
Owner scans
   ↓
Frontend sends token to API
   ↓
Backend resolves user
   ↓
Backend validates subscription + mess ownership
   ↓
Backend creates/updates attendance
```

The backend is authoritative for all attendance rules.

---

## 15. Payment Architecture

The application should use a payment provider through server-controlled APIs.

### Payment lifecycle

```text
Create payment request
        ↓
Provider checkout
        ↓
Provider result
        ↓
Backend verification/webhook
        ↓
Payment = SUCCESS
        ↓
Invoice
        ↓
Subscription = PENDING_APPROVAL
```

### Required safeguards

- Provider webhook verification
- Idempotent webhook processing
- Unique provider transaction identifiers
- No duplicate payment records
- No client-side-only payment confirmation
- Payment history must remain immutable except for controlled status transitions

---

## 16. WhatsApp Integration Architecture

WhatsApp integration is isolated behind a service interface.

Conceptually:

```text
Invoice Service
      ↓
WhatsApp Service
      ↓
Provider
```

This prevents the application domain from depending directly on a single provider implementation.

The interface should support:

- Send invoice document
- Send approval notification
- Send payment-related notification
- Record delivery result

Provider-specific credentials must only exist in environment/secret configuration.

---

## 17. Frontend UX Requirements

### Visual Direction

The UI should be:

- Simple
- Sober
- Clean
- Mobile-first
- Fast to navigate
- Card-oriented where useful
- Clear in its primary actions
- Consistent across User and Owner experiences

### User navigation

Recommended MVP navigation:

```text
Home
Menu
Book Meal
Payments
Profile
```

### Owner navigation

```text
Dashboard
Menu
Customers
Attendance
Payments
Profile
```

### Admin navigation

```text
Dashboard
Users
Owners
Activity
Settings
```

The first release should avoid unnecessary navigation layers.

---

## 18. Notifications

MVP notifications should focus on operational events.

### User

- Payment successful
- Subscription approval/rejection
- Meal booking confirmation
- Important menu update
- Invoice available

### Owner

- New subscription request
- Payment received
- Attendance-related operational alert where necessary

Notifications should not block the underlying business operation if a notification provider fails.

---

## 19. Security Requirements

### Authentication

- Secure credential handling.
- Session/token expiration.
- Protected routes.
- Secure logout/invalidation strategy.

### Authorization

Backend must enforce:

```text
USER
OWNER
ADMIN
```

and resource-level ownership.

### Sensitive data

- Secrets only through environment/secret management.
- Do not store provider credentials in the database unless encrypted and explicitly required.
- Do not place secrets in frontend code.
- Do not place secrets in QR payloads.
- Validate all external webhook requests.

### Audit

Record important operations:

- Registration
- Login/security events where appropriate
- Subscription approval/rejection
- Payment status changes
- Attendance changes
- Account enable/disable
- Owner approval
- Admin actions

---

## 20. Reliability Requirements

The application must safely handle:

- Duplicate payment webhooks
- Duplicate attendance scans
- Duplicate booking requests
- Network retries
- Payment-provider timeouts
- WhatsApp provider failures
- Worker restarts

### Idempotency

Critical operations must have idempotency protection.

Examples:

```text
payment provider event
subscription approval
attendance creation
invoice generation
```

A repeated external event must not create duplicate business records.

---

## 21. Logging and Observability

### Backend logging

Use structured logs containing:

- Timestamp
- Level
- Request ID
- Route
- Actor/user ID where safe
- Event/action
- Error details

Do not log passwords, access tokens, payment secrets, or sensitive credentials.

### Error monitoring

The production application should have centralized error tracking.

### Operational visibility

At minimum, operators should be able to determine:

- API health
- Database availability
- Background job failures
- Payment webhook failures
- WhatsApp delivery failures

---

## 22. CI/CD

The MVP must be developed so every merged change can be tested and deployed safely.

### Source Control

Use Git with:

```text
main
develop
feature/*
fix/*
```

The exact branching strategy may be simplified for a small team, but `main` must always represent a deployable state.

### Pull Request Checks

Every pull request should automatically run:

1. Install dependencies
2. TypeScript type checking
3. ESLint
4. Unit/integration tests
5. Build frontend
6. Build backend
7. Validate database/migration state where applicable

### CI

Recommended pipeline:

```text
Push / Pull Request
        ↓
Install
        ↓
Lint
        ↓
Typecheck
        ↓
Test
        ↓
Build
        ↓
Security/dependency checks
```

A pull request cannot merge when required checks fail.

### CD

After merge to `main`:

```text
main
 ↓
Build artifacts / container images
 ↓
Deploy API
 ↓
Deploy Next.js application
 ↓
Run approved database migrations
 ↓
Health check
 ↓
Release complete
```

Production deployment should support rollback.

### Environments

Use at least:

```text
development
staging
production
```

Production secrets must never be committed to Git.

---

## 23. Deployment

The application should be container-friendly.

### Services

```text
Next.js Web
Express API
PostgreSQL
Redis
Worker
```

Redis/Worker may be enabled only for jobs that require asynchronous execution.

### Local Development

Provide a reproducible local setup using Docker Compose for infrastructure dependencies.

Developers should be able to start:

- PostgreSQL
- Redis
- API
- Web

with documented commands.

---

## 24. Database and Migration Rules

All schema changes must be represented through versioned migrations.

Rules:

- Never manually modify production schema.
- Every migration must be reviewable.
- Destructive migrations require explicit review.
- Seed data should be separate from schema migrations.
- Production migration execution must be part of the deployment process.

Important database constraints should enforce business invariants where possible.

Examples:

- Unique provider payment ID
- Unique booking per user/date/meal
- Valid foreign keys
- Required ownership relations

---

## 25. Testing Strategy

### Unit Tests

Focus on:

- Subscription state transitions
- Booking rules
- Skip cutoff rule
- Attendance validation
- Role permissions
- Payment state transitions

### Integration Tests

Focus on:

- Registration/login
- Subscription purchase flow
- Payment webhook processing
- Owner approval
- Booking creation
- Attendance creation
- QR validation

### End-to-End Tests

The most important E2E journey is:

```text
Register
→ Login
→ Discover Mess
→ Subscribe
→ Pay/Test Payment
→ Owner Approval
→ Book Meal
→ Attendance
→ View History
```

This journey should remain passing before every production release.

---

## 26. MVP Release Plan

## Release 0 — Foundation

Build:

- Turborepo
- Next.js app
- Express API
- Shared TypeScript packages
- PostgreSQL
- Drizzle
- Authentication
- CI
- Local Docker setup
- Environment configuration
- Base UI system

### Exit Criteria

All applications run locally and CI can build the monorepo.

---

## Release 1 — Core Mess Operations

Build:

- Mess profile
- User registration/login
- Student/Professional selection
- Owner registration/login
- Menu creation
- Menu publishing
- User menu viewing
- User subscription creation
- Owner subscription approval
- Basic customer management

### Exit Criteria

A real mess can onboard users and publish a menu.

---

## Release 2 — Payment and Daily Meal Flow

Build:

- Payment integration
- Payment verification
- Invoice creation
- Booking
- Skip cutoff
- Extra meals
- Manual attendance
- User history

### Exit Criteria

A paid active subscriber can manage meals and the owner can record attendance.

---

## Release 3 — QR + WhatsApp + Production Hardening

Build:

- User QR
- Owner QR scanner
- WhatsApp invoice
- Operational notifications
- Audit events
- Improved error handling
- Background jobs where needed
- Production deployment
- Monitoring

### Exit Criteria

The complete MVP business loop works in production.

---

## 27. Production MVP Definition of Done

The MVP is considered shippable when all of the following work:

### User

- Can register as Student or Professional.
- Can log in.
- Can view profile.
- Can browse a mess.
- Can see today's and future menu.
- Can request a monthly subscription.
- Can complete payment.
- Can see payment status.
- Receives invoice.
- Sees owner approval status.
- Becomes active after approval.
- Can book meals.
- Can skip before the configured cutoff.
- Can request extra meals.
- Can display QR.
- Can view history.

### Owner

- Can log in.
- Can manage mess information.
- Can create/publish menus.
- Can view customers.
- Can approve/reject subscriptions.
- Can enable/disable customers.
- Can record manual attendance.
- Can scan QR attendance.
- Can view attendance history.
- Can view basic payment/revenue information.

### Admin

- Can log in.
- Can view users.
- Can view owners.
- Can approve/disable owners.
- Can disable users.
- Can inspect important audit activity.

### Platform

- CI passes.
- Production deployment is repeatable.
- Database migrations are versioned.
- Payment webhooks are idempotent.
- Authorization is enforced server-side.
- Critical failures are logged.
- Health checks work.
- Rollback procedure exists.

---

## 28. Success Metrics

The first MVP should measure operational success rather than vanity metrics.

### Activation

- Registered users
- Users who complete onboarding
- Active subscribers

### Subscription

- Subscription requests
- Paid subscriptions
- Approval rate
- Average approval time

### Meal Operations

- Bookings created
- Meals skipped
- Extra meals
- Attendance recorded
- QR vs manual attendance

### Payments

- Successful payments
- Failed payments
- Total collected
- Invoice generation success
- WhatsApp delivery success

### Reliability

- API error rate
- Payment webhook failure rate
- Background job failure rate
- Duplicate-event prevention rate

---

## 29. Post-MVP Expansion

Once the MVP is being used by real customers, add features in this order:

### Phase 2

- Mess expense tracking
- Better notifications
- Complaint management
- More payment options
- Improved reports
- Better customer search/filtering

### Phase 3

- Coupons/offers
- Advanced analytics
- Multi-mess/branch support
- Rich exports
- Operational automation

### Phase 4

- Dedicated mobile client
- Offline-friendly attendance
- Push-notification improvements
- Deeper owner/admin tooling

The backend API should remain reusable across these clients.

---

## 30. Future Client Strategy

The initial client is a Next.js web application.

The architecture must keep the frontend replaceable:

```text
              Shared Backend API
                     │
        ┌────────────┼────────────┐
        │            │            │
     Next.js       Future        Admin
      Web          Client         Web
```

The MVP should not place core business logic inside React/Next.js.

All important rules belong in the backend/API layer so a future desktop or mobile client can reuse them.

### Packaging Note

Electron is suitable for packaging a web frontend as a **desktop application**. It should be treated as a future client target rather than part of the MVP. A true native mobile release can later use an appropriate mobile runtime while continuing to reuse the same API/backend.

---

## 31. Architecture Principles

1. **Backend owns business rules.**
2. **Database is the source of truth.**
3. **Payment provider events are verified server-side.**
4. **Frontend never decides authorization.**
5. **Critical operations are idempotent.**
6. **Features are shipped incrementally.**
7. **Shared packages are preferred over duplicated logic.**
8. **The MVP avoids unnecessary infrastructure until it provides real value.**
9. **Every production release must be reproducible.**
10. **The API must remain client-agnostic.**

---

## 32. Recommended Repository Shape

```text
mess-platform/
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── db/
│   ├── types/
│   ├── validation/
│   ├── config/
│   ├── ui/
│   └── shared/
│
├── infra/
│   └── docker/
│
├── docs/
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

The exact package breakdown may evolve, but domain/business logic must not become tightly coupled to a single UI.

---

## 33. Implementation Priority

The development order should maximize time-to-first-real-user.

### Priority 1 — Must Ship

```text
Auth
→ Mess
→ Menu
→ Subscription
→ Payment
→ Owner Approval
→ Booking
→ Manual Attendance
```

### Priority 2 — Ship Immediately After Core Flow

```text
QR Attendance
→ Invoice
→ WhatsApp
→ History
→ Active/Disable
→ Admin basics
```

### Priority 3 — Improve After Real Usage

```text
Expense tracking
→ Complaints
→ Reports
→ Coupons
→ Advanced analytics
```

Do not delay the first production release for Priority 3 features.

---

## 34. Final Product Definition

The MVP is a **simple, production-ready mess management platform** that enables a user to subscribe to a mess, pay for a monthly plan, receive an invoice, wait for owner approval, manage daily meals, and record attendance while giving the mess owner the operational tools required to run those workflows.

The platform succeeds when a real mess can use it every day without needing a separate spreadsheet or manual system for the core workflow.

### Core operational loop

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

### Release philosophy

**Build the smallest complete product, deploy it, let a real mess use it, and add the next feature without breaking the existing workflow.**
