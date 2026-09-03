-- ============================================================================
-- VIEW ALL RLS POLICIES
-- Copy this entire script and paste into Supabase SQL Editor
-- ============================================================================

-- 1. Check which tables have RLS enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. View all policies grouped by table
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'YES'
    ELSE 'NO'
  END as has_using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'YES'
    ELSE 'NO'
  END as has_check_clause
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- 3. Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename 
ORDER BY tablename;

-- 4. View helper functions
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 5. Test RLS with a specific user (replace UUID with actual user ID)
-- Uncomment and modify the UUID below to test as a specific user:
/*
SET request.jwt.claims = '{"sub": "00000000-0000-4000-8000-000000000003", "role": "USER"}';

-- Test: Can this user see their own profile?
SELECT id, name, role FROM users;

-- Test: Can this user see other users' profiles?
SELECT id, name, role FROM users WHERE id != '00000000-0000-4000-8000-000000000003';

-- Reset to service role
RESET request.jwt.claims;
*/

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
