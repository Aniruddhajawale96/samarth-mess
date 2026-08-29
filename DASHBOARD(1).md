# DASHBOARD.md — Mess Management Platform MVP

## 1. Purpose

This document is the frontend/dashboard specification for the Mess Management Platform MVP.

It defines:

- Application information architecture
- Navigation
- Role-specific dashboards
- Screens
- Screen responsibilities
- Primary actions
- States
- Reusable UI components
- Responsive behavior
- Frontend interaction rules
- Loading/error/empty states
- Frontend-to-API boundaries
- MVP visual direction

`PRD.md` remains the source of truth for product requirements and business rules.

This document translates those product requirements into a practical frontend experience.

---

# 2. Frontend Product Structure

The platform has three frontend experiences:

```text
                    WEB APPLICATION
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
           USER         OWNER         ADMIN
        Student /     Mess Owner    Platform Admin
       Professional
```

The same Next.js application may contain all three experiences, with role-aware routing and layouts.

Recommended route families:

```text
/user/*
/owner/*
/admin/*
```

The exact routing implementation may differ, but role boundaries must remain explicit.

---

# 3. Frontend Goals

The MVP frontend must:

1. Make the primary action obvious.
2. Minimize navigation depth.
3. Work well on mobile screens.
4. Keep the user informed about subscription/payment status.
5. Make the owner's daily work fast.
6. Keep admin operations simple.
7. Clearly distinguish actionable states from informational states.
8. Use the backend as the source of truth.
9. Avoid duplicating business rules in the frontend.
10. Provide consistent loading, error, success, and empty states.

---

# 4. Design Direction

The client requested a **simple and sober** UI.

The MVP should therefore use:

- Clean layouts
- White/light surfaces where appropriate
- Restrained green as the primary brand/accent direction
- Strong text hierarchy
- Rounded cards/components without excessive decoration
- Clear status badges
- Large, readable touch targets
- Short, direct labels
- Minimal visual clutter
- Consistent spacing
- Food/menu imagery where it improves understanding

The second provided UI reference suggests a visual direction with:

- Mobile-first layouts
- Rounded cards
- Category chips
- Large imagery
- Prominent CTA buttons
- Bottom navigation
- Simple hierarchy

The application should use these visual principles without copying the reference application's domain, content, or exact screens.

---

# 5. Responsive Strategy

## Mobile

Primary target for:

- Student/Professional
- Owner daily operations

Use:

- Bottom navigation where appropriate
- Stacked cards
- Full-width primary actions
- Compact headers
- Touch-friendly controls
- Bottom sheets/modals only where useful

## Tablet

Use:

- Two-column layouts where useful
- Wider cards
- Persistent navigation where screen width permits

## Desktop

Primary target for:

- Admin
- Owner reporting/management
- Larger operational views

Use:

- Sidebar navigation
- Wider tables
- Multi-column dashboards
- Persistent action areas

The frontend should adapt rather than create completely separate business flows for each viewport.

---

# 6. Global Frontend Architecture

Recommended frontend structure:

```text
apps/web/
├── app/
│   ├── (auth)/
│   ├── user/
│   ├── owner/
│   └── admin/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── feedback/
│   └── domain/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── validation/
│   └── utils/
│
└── features/
    ├── auth/
    ├── user/
    ├── owner/
    └── admin/
```

The exact structure can change, but feature code should remain organized by domain instead of placing the whole application in a single component hierarchy.

---

# 7. Global Layouts

## 7.1 Public Layout

Used for:

- Landing/entry
- Login
- Registration
- Public mess discovery if enabled

Contains:

- Brand/logo
- Minimal navigation
- Responsive content container

---

## 7.2 User Layout

Used for Student/Professional.

Recommended bottom navigation:

```text
Home
Menu
Book Meal
Payments
Profile
```

A compact top area can contain:

- Greeting
- Profile image
- Current mess/status

---

## 7.3 Owner Layout

Recommended navigation:

```text
Dashboard
Menu
Customers
Attendance
Payments
Profile
```

On narrow screens, navigation may collapse into bottom navigation or a drawer.

---

## 7.4 Admin Layout

Recommended desktop sidebar:

```text
Dashboard
Users
Owners
Activity
Settings
```

Admin navigation should prioritize operational management over visual decoration.

---

# 8. Global Components

Reusable components should be created before duplicating equivalent UI.

## Required primitives

```text
Button
Input
Select
Textarea
Checkbox
Radio
Switch
Tabs
Dialog
Drawer
Dropdown
Avatar
Badge
Card
Table
Pagination
Calendar
DatePicker
Toast
Alert
Skeleton
Spinner
EmptyState
ErrorState
ConfirmDialog
```

---

# 9. Shared Domain Components

## StatusBadge

Used for:

```text
ACTIVE
DISABLED
PENDING
PENDING_APPROVAL
SUCCESS
FAILED
BOOKED
SKIPPED
PRESENT
ABSENT
EXTRA
REJECTED
EXPIRED
CANCELLED
```

Status colors must be consistent throughout the application.

---

## MoneyDisplay

All amounts should be formatted consistently.

Examples:

```text
₹2,400
₹1,25,000
```

The frontend receives backend-safe numeric/string representations according to the API contract and must not perform financial business calculations that belong to the backend.

---

## MealTypeBadge

```text
Breakfast
Lunch
Dinner
Extra
```

---

## MenuItemCard

Displays:

- Item image when available
- Item name
- Description where available
- Meal category

---

## UserAvatar

Used for:

- Profile
- Customer lists
- Owner information
- Approval requests

---

## LoadingState

Use skeletons for dashboard/card content and spinners only for small action-specific operations.

---

# 10. Authentication Screens

## 10.1 Login

### Content

```text
Logo

Welcome back

Phone / Email
Password

[ Login ]

Forgot password?
```

Where phone OTP is the selected authentication method, the flow should adapt accordingly.

### States

```text
Idle
Submitting
Success
Invalid Credentials
Account Disabled
Network Error
```

---

## 10.2 Registration

### Step 1 — User Type

```text
Who are you?

[ College Student ]
[ Professional ]
```

Owner registration uses a separate owner pathway.

### Step 2 — Profile

```text
Profile Photo
Name
Phone
Email
Password / verification
```

### Step 3 — Verification

```text
Enter OTP
[ Verify ]
```

### Success

Route to the correct role dashboard.

---

# 11. User Dashboard

## Route

```text
/user
```

## Goal

Answer the user's most important daily questions immediately:

- What is today's menu?
- Is my subscription active?
- What meals can I book?
- What is my current status?
- Where is my QR?

## Layout

```text
Good Morning, Rahul

[ Current Mess Card ]

Today's Menu
------------------
Breakfast
Poha • Tea

Lunch
Dal • Rice • Roti

Dinner
Paneer • Roti

Your Plan
₹2,400 / month
ACTIVE

[ Book Meal ]

Quick Actions
[ QR ]
[ Payments ]
[ History ]
[ Profile ]
```

## Required states

### Active subscription

Show:

- Mess
- Plan
- Validity
- Active badge

### Pending approval

Show:

```text
Payment received
Waiting for mess owner approval
```

Primary CTA should not incorrectly suggest that meal booking is available.

### No subscription

Show:

```text
You don't have an active mess plan.

[ Find a Mess ]
```

### Disabled account

Show an account-status message and block protected operational actions.

---

# 12. User Mess Discovery

## Route

```text
/user/messes
```

## Layout

```text
Find a Mess

[ Search ]

Filters

Mess Card
------------------
Image
ABC Mess
4.5 ★
₹2,400/month
3 meals/day
500m away

[ View Details ]
```

## Mess Card

Required:

- Image
- Name
- Price
- Meal count
- Rating if available
- Distance if available
- Relevant tags
- CTA

## Empty state

```text
No messes found.
Try changing your search or filters.
```

---

# 13. User Mess Details

## Route

```text
/user/messes/:messId
```

## Sections

### Header

- Cover image
- Mess name
- Rating
- Location/distance
- Price
- Meals per day

### Tabs

```text
Overview
Menu
Reviews
```

Reviews may remain informational/basic in MVP.

### CTA

Persistent primary CTA:

```text
[ Subscribe Now ]
```

If the user already has a relevant subscription state, replace the CTA with the correct status/action.

---

# 14. User Subscription Screen

## Route

```text
/user/messes/:messId/subscribe
```

## Layout

```text
ABC Mess

Monthly Plan

₹2,400
3 Meals / Day

Subscription period
[ Start date ]

[ Continue to Payment ]
```

The frontend must clearly explain that payment does not necessarily mean immediate activation.

After successful payment:

```text
Payment Successful

Your subscription is waiting for
mess owner approval.

[ View Subscription ]
```

---

# 15. User Payment Screens

## Payment Summary

Show:

- Mess
- Plan
- Amount
- Applicable charges
- Payment method
- Final amount

Primary CTA:

```text
[ Pay ₹2,400 ]
```

## Payment Processing

Show a clear non-dismissable processing state while the payment handoff is active.

Do not claim success until backend verification confirms it.

## Payment Result

### Success

```text
Payment successful
Invoice generated
Waiting for owner approval
```

### Failure

```text
Payment failed

[ Try Again ]
```

The frontend should show the backend/provider-safe error message without exposing internal errors.

---

# 16. User Payments History

## Route

```text
/user/payments
```

## List

```text
Payments

28 Aug
₹2,400
SUCCESS
[ View ]

04 Jul
₹2,400
SUCCESS
[ View ]
```

## Payment detail

Show:

- Amount
- Date
- Status
- Mess
- Payment reference
- Subscription
- Invoice

CTA:

```text
[ View Invoice ]
```

---

# 17. User Menu Screen

## Route

```text
/user/menu
```

## Layout

```text
August 28
<        >

Breakfast
8:00 - 10:00

[ Item Card ]
Poha
Tea

Lunch
12:30 - 2:30

[ Item Card ]
Dal
Rice
Roti

Dinner
8:00 - 9:30

[ Item Card ]
Paneer
Roti
Salad
```

Date navigation should allow past/future dates for which menus exist.

Only published menus should appear.

---

# 18. User Meal Booking Screen

## Route

```text
/user/book-meal
```

## Layout

```text
Select Date
[ August 28 ]

Breakfast
[ Book ] [ Skip ]

Lunch
[ Book ] [ Skip ]

Dinner
[ Book ] [ Skip ]

Extra Meal
[ + Add ]

[ Save Changes ]
```

## Booking states

```text
Available
Booked
Skipped
Locked
Extra
```

## Cutoff behavior

Before cutoff:

```text
[ Book ]
[ Skip ]
```

After cutoff:

```text
Booked

Skip unavailable after cutoff.
```

The backend remains authoritative. The frontend should only reflect the current server state.

---

# 19. User Booking History

## Route

```text
/user/history/bookings
```

## List

```text
28 Aug
Lunch
BOOKED

28 Aug
Dinner
SKIPPED

27 Aug
Breakfast
EXTRA
```

Use date and status filters only when useful.

---

# 20. User QR Screen

## Route

```text
/user/qr
```

## Layout

```text
My Attendance QR

        ┌───────────────┐
        │               │
        │      QR       │
        │               │
        └───────────────┘

Show this QR to the mess owner
for attendance.
```

The screen must not display sensitive information encoded inside the QR.

QR data should be generated/validated according to backend rules.

---

# 21. User Attendance History

## Route

```text
/user/history/attendance
```

## List

```text
28 Aug
Lunch
PRESENT
QR

28 Aug
Dinner
ABSENT
MANUAL
```

Show:

- Date
- Meal
- Status
- Method

---

# 22. User Profile

## Route

```text
/user/profile
```

## Sections

```text
Profile Photo
Name
Phone
Email
Student / Professional

[ Edit Profile ]

Account Status
ACTIVE

History
Payments
Bookings
Attendance
Subscription
```

Account disabling should be shown according to actual backend state.

---

# 23. Owner Dashboard

## Route

```text
/owner
```

## Goal

Answer:

**“What do I need to operate my mess today?”**

## Layout

```text
Good Morning

Today's Overview

Total Customers      120
Active Customers     110
Pending Approvals      6

Today's Meals
Expected             120
Present               98
Absent                15
Extra                  7

Today's Revenue
₹4,320

[ Attendance ]
[ Manage Menu ]
[ Approvals ]
```

Primary actions should be visually stronger than secondary analytics.

---

# 24. Owner Subscription Approval

## Route

```text
/owner/approvals
```

## List

```text
Pending Approvals

Rahul More
Student
₹2,400
Paid

[ View ]
```

## Detail

Show:

- User name
- Profile image
- User type
- Phone/contact information needed by owner
- Plan
- Amount
- Payment status
- Request date

Actions:

```text
[ Approve ]
[ Reject ]
```

## Approve confirmation

Use a lightweight confirmation when appropriate.

Success:

```text
Subscription approved.
```

The UI must refresh the approval status immediately after server success.

---

# 25. Owner Menu Management

## Route

```text
/owner/menu
```

## Date selector

```text
Menu for
[ August 28 ]
```

## Sections

```text
Breakfast
--------------------------------
Poha
Tea
[ + Add Item ]

Lunch
--------------------------------
Dal
Rice
Roti
[ + Add Item ]

Dinner
--------------------------------
Paneer
Roti
Salad
[ + Add Item ]
```

## Item editor

Fields:

```text
Item name
Description
Photo
Meal type
Display order
```

## Actions

```text
[ Save Draft ]
[ Publish Menu ]
```

Published state must be visually obvious.

---

# 26. Owner Menu History

## Route

```text
/owner/menu/history
```

Show:

- Date
- Menu status
- Published time
- Quick view/edit action where allowed

Archived menus should be viewable without being accidentally republished.

---

# 27. Owner Customers

## Route

```text
/owner/customers
```

## Layout

```text
Customers

[ Search ]

[ Active ▼ ]

Name        Status
Rahul       ACTIVE
Amit        ACTIVE
Sneha       DISABLED
```

## Customer detail

Show:

- Name
- Profile
- Contact
- Subscription
- Attendance summary
- Recent payments
- Account status

## Actions

```text
[ Disable ]
[ Enable ]
```

Owner can only manage customers belonging to its own mess.

---

# 28. Owner Attendance

## Route

```text
/owner/attendance
```

## Header

```text
Attendance
August 28
```

## Summary

```text
Present    98
Absent     15
Extra       7
```

## Meal selector

```text
Breakfast
Lunch
Dinner
```

## Customer list

```text
Rahul      [ Present ]
Amit       [ Absent ]
Sneha      [ Extra ]
```

Provide efficient bulk interaction.

## Save

```text
[ Save Attendance ]
```

Success:

```text
Attendance saved.
```

---

# 29. Owner QR Scanner

## Route

```text
/owner/attendance/scan
```

## Layout

```text
Scan Attendance QR

[ Camera / Scanner Area ]

Place the user's QR inside the frame.
```

After successful scan:

```text
Rahul More
Lunch
Subscription: ACTIVE

[ Mark Present ]
```

Where business rules allow automatic marking, the scan can complete the attendance action directly.

### Scanner failure states

```text
Invalid QR
User not found
Wrong mess
Inactive subscription
Attendance already recorded
Camera unavailable
```

---

# 30. Owner Attendance History

## Route

```text
/owner/attendance/history
```

Support:

- Date
- Meal
- User
- Status
- Method

Basic filtering is sufficient for MVP.

---

# 31. Owner Payments

## Route

```text
/owner/payments
```

Show:

- Payment date
- User
- Amount
- Payment status
- Subscription
- Reference

Basic totals:

```text
Today's collected
This month's collected
Pending
```

Advanced financial analytics are outside MVP.

---

# 32. Owner Profile and Mess Settings

## Route

```text
/owner/profile
```

### Owner profile

- Name
- Phone
- Email
- Profile image

### Mess profile

- Name
- Description
- Cover image
- Address
- Contact
- Monthly price
- Meals per day
- Status

---

# 33. Admin Dashboard

## Route

```text
/admin
```

## Goal

Provide basic platform oversight.

## Layout

```text
Platform Overview

Total Users
1,250

Total Owners
42

Active Users
1,120

Active Messes
38

Pending Owner Approvals
7

Recent Activity
------------------------
...
```

MVP should prefer operational counters and recent activity over complex analytics.

---

# 34. Admin Users

## Route

```text
/admin/users
```

## Table

```text
Name
Type
Role
Status
Created
Actions
```

Filters:

- User type
- Status
- Role

Actions:

```text
[ View ]
[ Disable ]
[ Enable ]
```

Admin must never be able to perform an action that the backend does not authorize.

---

# 35. Admin Owners

## Route

```text
/admin/owners
```

## Table

```text
Owner
Mess
Status
Users
Created
Actions
```

### Pending registration

Show:

```text
Owner information
Mess information

[ Approve ]
[ Reject ]
```

---

# 36. Admin Activity / Audit

## Route

```text
/admin/activity
```

## List

```text
Time
Actor
Action
Entity
Result
```

Example:

```text
10:42
Owner: Rahul
SUBSCRIPTION_APPROVED
Subscription #123

10:40
User: Amit
PAYMENT_SUCCESS
Payment #789
```

Support basic filters where practical.

---

# 37. Admin Settings

## Route

```text
/admin/settings
```

MVP should keep this intentionally small.

Possible settings:

- Platform operational settings
- Notification status
- Configured providers/status
- Default operational values

Sensitive provider credentials must never be rendered back into the UI.

---

# 38. Notifications UI

The application should expose important operational feedback through:

- Toasts
- Inline alerts
- Status banners
- Notification list where needed

### User

Examples:

```text
Payment successful.
Subscription approved.
Meal booking saved.
Invoice is ready.
```

### Owner

Examples:

```text
New subscription request.
Attendance saved.
Menu published.
```

Notifications must be informational and should not replace the actual source-of-truth screen.

---

# 39. Global Error States

Every data-driven screen must handle:

## Loading

Use skeleton placeholders for:

- Cards
- Tables
- Dashboard metrics
- Menus

## Empty

Example:

```text
No customers yet.
```

or:

```text
No menu published for this date.
```

## Permission

```text
You don't have permission to access this page.
```

## Not Found

```text
This mess/subscription/payment could not be found.
```

## Network/API failure

```text
Something went wrong.

[ Try Again ]
```

Do not show raw stack traces, database errors, or provider internals.

---

# 40. Form Behavior

All forms should:

- Validate immediately where useful.
- Validate again on submit.
- Disable duplicate submission while processing.
- Preserve entered values when safe.
- Display field-level errors.
- Display server-level errors.
- Clearly show success.

Example:

```text
[ Save ]
```

changes to:

```text
[ Saving... ]
```

during submission.

---

# 41. Confirmation Patterns

Use confirmation for destructive or high-impact actions:

```text
Disable customer
Reject subscription
Cancel action where applicable
Publish menu when it overwrites an existing published state
```

Avoid unnecessary confirmations for routine actions such as:

- Navigating
- Viewing
- Saving ordinary profile changes

---

# 42. Frontend State Rules

The frontend must treat backend data as authoritative for:

- Authentication
- Role
- Subscription status
- Payment status
- Booking status
- Skip eligibility
- Attendance
- Account status

Do not rely on local state to determine whether an action is actually allowed.

Example:

The frontend may hide the Skip button after the cutoff, but the backend must still reject an invalid skip request.

---

# 43. API Integration

Create a centralized typed API client.

Recommended conceptual structure:

```text
lib/api/
├── client.ts
├── auth.ts
├── users.ts
├── messes.ts
├── subscriptions.ts
├── payments.ts
├── menus.ts
├── bookings.ts
├── attendance.ts
├── owner.ts
└── admin.ts
```

API responses should map cleanly to frontend domain types.

Do not scatter raw `fetch()` calls throughout UI components.

---

# 44. Frontend Authentication Guarding

Route access should follow:

```text
Not authenticated
        ↓
       Login

Authenticated USER
        ↓
    /user/*

Authenticated OWNER
        ↓
    /owner/*

Authenticated ADMIN
        ↓
    /admin/*
```

A user trying to open another role's page should be redirected or shown an authorization state.

Frontend protection improves UX, but backend authorization remains authoritative.

---

# 45. Optimistic Updates

Use optimistic UI only where the operation is low-risk and rollback is straightforward.

Good candidates:

- Local visual toggles
- Non-critical UI preferences

Avoid optimistic state for:

- Payments
- Subscription activation
- Attendance
- Booking finalization when cutoff rules apply
- Account status changes

For these, wait for server confirmation.

---

# 46. Date and Time Handling

The frontend must:

- Display dates in a consistent user-friendly format.
- Display meal times clearly.
- Avoid using the browser clock as the authoritative cutoff decision.
- Clearly communicate the currently selected date.

Example:

```text
28 Aug 2026
```

rather than ambiguous date formats.

---

# 47. Accessibility Basics

MVP must include:

- Keyboard-accessible controls
- Visible focus states
- Sufficient text contrast
- Labels for form inputs
- Alt text for meaningful images
- Accessible status/error messages
- Buttons that describe their action

Do not use color alone to communicate an important state.

---

# 48. Performance Guidelines

Prioritize:

- Fast initial rendering
- Small client-side bundles
- Image optimization
- Pagination for large lists
- Avoiding unnecessary client components
- Avoiding duplicate API requests
- Skeleton states instead of blank screens

Do not introduce complex frontend state libraries unless the application actually needs them.

---

# 49. Mobile Interaction Guidelines

For Student/Professional:

- Primary actions should be thumb-accessible.
- Avoid dense tables.
- Prefer cards/lists.
- Use bottom sheets only when they improve the workflow.
- Keep booking actions visible.
- Keep subscription/payment state obvious.

For Owner:

- Attendance must require minimal taps.
- QR scanning must be quick.
- Menu editing should avoid unnecessary navigation.
- Customer list should support fast search.

---

# 50. Important UI State Matrix

## Subscription

```text
PENDING_PAYMENT
    → Payment screen

PENDING_APPROVAL
    → Waiting state

ACTIVE
    → Full meal functionality

REJECTED
    → Rejection state

EXPIRED
    → Renewal/subscription CTA

CANCELLED
    → Inactive state
```

## Payment

```text
PENDING
    → Processing

SUCCESS
    → Receipt/invoice

FAILED
    → Retry

CANCELLED
    → Payment cancelled

REFUNDED
    → Refund status
```

## Booking

```text
BOOKED
    → Booked badge

SKIPPED
    → Skipped badge

EXTRA
    → Extra badge

LOCKED
    → Disabled action
```

## Account

```text
ACTIVE
    → Full access

DISABLED
    → Restricted access
```

---

# 51. Recommended User Navigation Flow

```text
Login
  ↓
Home
  ├── Messes
  │    └── Mess Details
  │          └── Subscribe
  │               └── Payment
  │                    └── Approval Status
  │
  ├── Menu
  │
  ├── Book Meal
  │    └── Booking
  │
  ├── Payments
  │    └── Invoice
  │
  └── Profile
       ├── QR
       ├── Booking History
       ├── Attendance History
       └── Subscription
```

---

# 52. Recommended Owner Navigation Flow

```text
Login
  ↓
Owner Dashboard
  ├── Approvals
  │    └── Approve / Reject
  │
  ├── Menu
  │    ├── Create
  │    ├── Edit
  │    └── Publish
  │
  ├── Customers
  │    └── Customer Detail
  │
  ├── Attendance
  │    ├── Manual
  │    ├── QR Scan
  │    └── History
  │
  ├── Payments
  │
  └── Profile / Mess
```

---

# 53. Recommended Admin Navigation Flow

```text
Login
  ↓
Admin Dashboard
  ├── Users
  │    └── User Detail
  │
  ├── Owners
  │    └── Owner/Mess Detail
  │
  ├── Activity
  │    └── Audit Detail
  │
  └── Settings
```

---

# 54. Frontend Security Rules

The frontend must:

- Never contain provider secret keys.
- Never contain database credentials.
- Never decide authorization.
- Never assume payment success without server verification.
- Never put sensitive personal information inside QR codes.
- Avoid exposing internal API errors.
- Sanitize/display user-generated values safely.
- Respect backend status and permission responses.

---

# 55. Frontend Testing

## Component tests

Prioritize reusable components with meaningful behavior:

- Forms
- Status badges
- Booking controls
- Payment states
- Approval actions
- Attendance controls

## Page/integration tests

Prioritize:

- Login
- Mess discovery
- Subscription
- Payment result
- Approval
- Booking
- Attendance

## End-to-end

The critical frontend journey is:

```text
Register/Login
→ Find Mess
→ View Mess
→ Subscribe
→ Payment
→ Approval
→ Book Meal
→ QR/Manual Attendance
→ History
```

---

# 56. Frontend CI Requirements

Every frontend change should pass:

```text
Lint
Typecheck
Unit/component tests
Build
E2E tests where applicable
```

CI should fail when the application cannot build.

---

# 57. Frontend Implementation Order

The dashboard should be built in this order to minimize rework.

```text
1. Global UI primitives
2. Auth layouts
3. User layout
4. Owner layout
5. Admin layout
6. User dashboard
7. Mess discovery/details
8. Subscription/payment UI
9. Menu UI
10. Booking UI
11. User QR/history
12. Owner dashboard
13. Owner approvals
14. Owner menu
15. Owner customers
16. Owner attendance
17. Admin dashboard
18. Admin users/owners
19. Admin activity
20. Shared loading/error/empty states
21. Responsive/accessibility polish
```

---

# 58. MVP Screens Checklist

## Authentication

```text
[ ] Login
[ ] Register
[ ] User type selection
[ ] OTP/verification screen as required
```

## User

```text
[ ] User Home
[ ] Mess List
[ ] Mess Details
[ ] Subscription
[ ] Payment
[ ] Payment Result
[ ] Payment History
[ ] Invoice
[ ] Menu
[ ] Book Meal
[ ] Booking History
[ ] QR
[ ] Attendance History
[ ] Profile
```

## Owner

```text
[ ] Owner Dashboard
[ ] Pending Approvals
[ ] Approval Detail
[ ] Menu Management
[ ] Menu Editor
[ ] Menu History
[ ] Customers
[ ] Customer Detail
[ ] Attendance
[ ] QR Scanner
[ ] Attendance History
[ ] Payments
[ ] Owner/Mess Profile
```

## Admin

```text
[ ] Admin Dashboard
[ ] Users
[ ] User Detail
[ ] Owners
[ ] Owner Detail
[ ] Activity/Audit
[ ] Settings
```

---

# 59. MVP UI Priority

Not every screen has the same importance.

## Highest priority

```text
User:
Home
Mess Details
Subscription
Payment
Approval Status
Book Meal
QR

Owner:
Dashboard
Approvals
Menu
Attendance
Customers
QR Scanner
```

## Second priority

```text
User:
Payment History
Booking History
Attendance History
Profile

Owner:
Payment History
Menu History
Attendance History
Profile

Admin:
Users
Owners
Activity
```

## Lower priority

```text
Advanced filters
Advanced analytics
Complex settings
Rich reviews
Complex reporting
```

Do not delay the first production release for lower-priority visual features.

---

# 60. MVP Definition of Frontend Done

The frontend is ready for the MVP when:

### User

```text
[ ] Can register/login
[ ] Can select Student/Professional
[ ] Can view profile
[ ] Can discover a mess
[ ] Can view mess details
[ ] Can view published menu
[ ] Can start subscription
[ ] Can complete payment flow
[ ] Can see pending approval
[ ] Can see active subscription
[ ] Can book meals
[ ] Can skip before cutoff
[ ] Can request extra meals
[ ] Can display QR
[ ] Can view history
[ ] Can view invoice
```

### Owner

```text
[ ] Can login
[ ] Can view dashboard
[ ] Can manage mess
[ ] Can manage menu
[ ] Can approve/reject subscriptions
[ ] Can view customers
[ ] Can mark manual attendance
[ ] Can scan QR
[ ] Can view attendance
[ ] Can view payment summary
```

### Admin

```text
[ ] Can login
[ ] Can view dashboard
[ ] Can view users
[ ] Can view owners
[ ] Can manage account status
[ ] Can inspect activity
```

### Frontend quality

```text
[ ] Responsive
[ ] Loading states
[ ] Error states
[ ] Empty states
[ ] Accessible core controls
[ ] Consistent status system
[ ] No secrets in client bundle
[ ] Production build passes
```

---

# 61. Future Mobile/Desktop Client Compatibility

The Next.js web application is the MVP client.

The backend must remain client-agnostic.

The frontend should therefore avoid coupling core business rules to:

- Browser-only state
- Next.js-specific business logic
- UI-local payment decisions
- UI-local subscription state transitions

Future clients can reuse the same API:

```text
                  Express API
                      │
          ┌───────────┼───────────┐
          │           │           │
       Next.js      Future      Admin
         Web         Client       Web
```

Electron can later package the web experience as a desktop application where appropriate. The MVP does not require Electron-specific implementation.

---

# 62. Final Frontend Principle

The dashboard should make the platform feel simple even though the backend contains multiple business workflows.

For the user:

```text
Find Mess
→ Subscribe
→ Pay
→ Get Approved
→ Book Meal
→ Show QR
```

For the owner:

```text
Manage Menu
→ Approve Users
→ Track Customers
→ Mark Attendance
```

For the admin:

```text
Monitor
→ Manage Users/Owners
→ Inspect Activity
```

The frontend should always expose the next useful action without hiding important status information.

The core UX goal is:

**simple screens, clear states, fast actions, and no unnecessary complexity.**
