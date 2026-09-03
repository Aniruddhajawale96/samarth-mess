# RLS Migration Fix - "Policy Already Exists" Error

## Problem

When running the Supabase Row Level Security (RLS) migration (`packages/db/drizzle/0007_supabase_rls_policies.sql`), the following error occurred:

```
ERROR: 42710: policy "users_select_own" for table "users" already exists
```

### Root Cause

The migration file used `CREATE POLICY` statements without first checking if the policy already existed. PostgreSQL's `CREATE POLICY` does not have an `IF NOT EXISTS` option, so attempting to create a policy with a name that already exists on the table causes an error.

This typically happens when:
- The migration was run partially before (some policies were created, others weren't)
- The migration needs to be re-run for any reason
- Multiple developers run the migration against the same database

## Solution

Added `DROP POLICY IF EXISTS` before every `CREATE POLICY` statement in the migration file. This makes the migration **idempotent** - it can be run multiple times safely without errors.

### What Changed

**File:** `packages/db/drizzle/0007_supabase_rls_policies.sql`

**Change:** Added `DROP POLICY IF EXISTS` before all 43 `CREATE POLICY` statements across all 12 tables:

| Table | Policies Fixed |
|-------|----------------|
| users | 5 policies |
| messes | 6 policies |
| subscriptions | 5 policies |
| menus | 5 policies |
| menu_items | 2 policies |
| attendance | 5 policies |
| payments | 4 policies |
| payment_webhook_events | 1 policy |
| invoices | 3 policies |
| audit_events | 3 policies |
| meal_bookings | 4 policies |
| notification_attempts | 4 policies |

**Total:** 47 policies (each now preceded by a `DROP POLICY IF EXISTS`)

### Example Before/After

**Before (fails if policy exists):**
```sql
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    auth.uid()::text = id
  );
```

**After (idempotent, safe to re-run):**
```sql
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    auth.uid()::text = id
  );
```

### Helper Functions (No Change Needed)

The helper functions (`is_admin()`, `owns_mess()`, `has_active_subscription()`) already used `CREATE OR REPLACE FUNCTION`, which is idempotent by design, so no changes were required.

## How to Apply

1. Open the Supabase SQL Editor: `https://supabase.com/dashboard/project/_/sql/new`
2. Copy the entire contents of `packages/db/drizzle/0007_supabase_rls_policies.sql`
3. Paste and run the SQL
4. The migration will now succeed even if some policies already exist

## Why This Matters

Idempotent migrations are important because:
- They can be re-run safely during development
- They work correctly in CI/CD pipelines that may run migrations multiple times
- They handle partial failures gracefully (if the migration was interrupted halfway)
- Multiple team members can run the same migration without conflicts

## Related Files

- `packages/db/drizzle/0007_supabase_rls_policies.sql` - The fixed migration file
- `packages/db/view_rls_policies.sql` - Helper script to view all RLS policies and test them
