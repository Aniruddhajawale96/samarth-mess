-- ============================================================================
-- Supabase Row Level Security (RLS) Policies
-- Run this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new
-- ============================================================================

-- ============================================================================
-- 0. PORTABILITY SHIM
--
-- These policies reference auth.uid(), which only exists on Supabase. Local and
-- CI databases (plain PostgreSQL, e.g. docker-compose) therefore failed at this
-- migration. When the Supabase `auth` schema is absent we create a compatible
-- no-op auth.uid() (always NULL) so the migration is portable. On Supabase the
-- schema already exists and this block is a no-op — auth.uid() is never touched.
-- ============================================================================
DO $shim$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
    CREATE OR REPLACE FUNCTION auth.uid()
    RETURNS uuid AS $func$
      SELECT NULL::uuid;
    $func$ LANGUAGE sql STABLE;
  END IF;
END $shim$;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    auth.uid()::text = id
  );

-- Owners and admins can view users in their messes (for customer lists)
DROP POLICY IF EXISTS "owners_view_customers" ON users;
CREATE POLICY "owners_view_customers" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = users.id
      AND s.mess_id IN (
        SELECT m.id FROM messes m WHERE m.owner_id = auth.uid()::text
      )
    )
    OR auth.uid()::text = id
  );

-- Users can update their own profile
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (
    auth.uid()::text = id
  );

-- Service role can insert (for registration)
DROP POLICY IF EXISTS "service_insert_users" ON users;
CREATE POLICY "service_insert_users" ON users
  FOR INSERT WITH CHECK (true);

-- Admins can update any user
DROP POLICY IF EXISTS "admins_update_users" ON users;
CREATE POLICY "admins_update_users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()::text
      AND admin_user.role = 'ADMIN'
    )
  );

-- ============================================================================
-- 2. MESSES TABLE
-- ============================================================================
ALTER TABLE messes ENABLE ROW LEVEL SECURITY;

-- Anyone can view active messes (public listing)
DROP POLICY IF EXISTS "public_view_active_messes" ON messes;
CREATE POLICY "public_view_active_messes" ON messes
  FOR SELECT USING (status = 'ACTIVE');

-- Owners can view their own messes
DROP POLICY IF EXISTS "owners_view_own_messes" ON messes;
CREATE POLICY "owners_view_own_messes" ON messes
  FOR SELECT USING (
    owner_id = auth.uid()::text
  );

-- Owners can create messes
DROP POLICY IF EXISTS "owners_insert_messes" ON messes;
CREATE POLICY "owners_insert_messes" ON messes
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'OWNER'
    )
  );

-- Owners can update their own messes
DROP POLICY IF EXISTS "owners_update_messes" ON messes;
CREATE POLICY "owners_update_messes" ON messes
  FOR UPDATE USING (
    owner_id = auth.uid()::text
  );

-- Owners can delete their own messes
DROP POLICY IF EXISTS "owners_delete_messes" ON messes;
CREATE POLICY "owners_delete_messes" ON messes
  FOR DELETE USING (
    owner_id = auth.uid()::text
  );

-- Admins can manage all messes
DROP POLICY IF EXISTS "admins_manage_messes" ON messes;
CREATE POLICY "admins_manage_messes" ON messes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
DROP POLICY IF EXISTS "users_view_own_subscriptions" ON subscriptions;
CREATE POLICY "users_view_own_subscriptions" ON subscriptions
  FOR SELECT USING (
    user_id = auth.uid()::text
  );

-- Owners can view subscriptions for their messes
DROP POLICY IF EXISTS "owners_view_mess_subscriptions" ON subscriptions;
CREATE POLICY "owners_view_mess_subscriptions" ON subscriptions
  FOR SELECT USING (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

-- Users can create subscriptions for themselves
DROP POLICY IF EXISTS "users_create_subscriptions" ON subscriptions;
CREATE POLICY "users_create_subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::text
  );

-- Owners can update subscriptions for their messes
DROP POLICY IF EXISTS "owners_update_subscriptions" ON subscriptions;
CREATE POLICY "owners_update_subscriptions" ON subscriptions
  FOR UPDATE USING (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

-- Admins can manage all subscriptions
DROP POLICY IF EXISTS "admins_manage_subscriptions" ON subscriptions;
CREATE POLICY "admins_manage_subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- 4. MENUS TABLE
-- ============================================================================
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Anyone can view published menus
DROP POLICY IF EXISTS "public_view_published_menus" ON menus;
CREATE POLICY "public_view_published_menus" ON menus
  FOR SELECT USING (status = 'PUBLISHED');

-- Owners can view all menus for their messes
DROP POLICY IF EXISTS "owners_view_own_menus" ON menus;
CREATE POLICY "owners_view_own_menus" ON menus
  FOR SELECT USING (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

-- Owners can manage menus for their messes
DROP POLICY IF EXISTS "owners_insert_menus" ON menus;
CREATE POLICY "owners_insert_menus" ON menus
  FOR INSERT WITH CHECK (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "owners_update_menus" ON menus;
CREATE POLICY "owners_update_menus" ON menus
  FOR UPDATE USING (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "owners_delete_menus" ON menus;
CREATE POLICY "owners_delete_menus" ON menus
  FOR DELETE USING (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

-- ============================================================================
-- 5. MENU ITEMS TABLE
-- ============================================================================
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view menu items (for published menus)
DROP POLICY IF EXISTS "public_view_menu_items" ON menu_items;
CREATE POLICY "public_view_menu_items" ON menu_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM menus WHERE menus.id = menu_items.menu_id AND menus.status = 'PUBLISHED'
    )
  );

-- Owners can manage menu items for their menus
DROP POLICY IF EXISTS "owners_manage_menu_items" ON menu_items;
CREATE POLICY "owners_manage_menu_items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM menus m
      INNER JOIN messes ms ON ms.id = m.mess_id
      WHERE m.id = menu_items.menu_id
      AND ms.owner_id = auth.uid()::text
    )
  );

-- ============================================================================
-- 6. ATTENDANCE TABLE
-- ============================================================================
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Users can view their own attendance
DROP POLICY IF EXISTS "users_view_own_attendance" ON attendance;
CREATE POLICY "users_view_own_attendance" ON attendance
  FOR SELECT USING (
    user_id = auth.uid()::text
  );

-- Owners can view attendance for their messes
DROP POLICY IF EXISTS "owners_view_mess_attendance" ON attendance;
CREATE POLICY "owners_view_mess_attendance" ON attendance
  FOR SELECT USING (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

-- Owners can mark attendance for their messes
DROP POLICY IF EXISTS "owners_insert_attendance" ON attendance;
CREATE POLICY "owners_insert_attendance" ON attendance
  FOR INSERT WITH CHECK (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

-- Owners can update attendance for their messes
DROP POLICY IF EXISTS "owners_update_attendance" ON attendance;
CREATE POLICY "owners_update_attendance" ON attendance
  FOR UPDATE USING (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

-- Admins can manage all attendance
DROP POLICY IF EXISTS "admins_manage_attendance" ON attendance;
CREATE POLICY "admins_manage_attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- 7. PAYMENTS TABLE
-- ============================================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
DROP POLICY IF EXISTS "users_view_own_payments" ON payments;
CREATE POLICY "users_view_own_payments" ON payments
  FOR SELECT USING (
    user_id = auth.uid()::text
  );

-- Owners can view payments for their messes
DROP POLICY IF EXISTS "owners_view_mess_payments" ON payments;
CREATE POLICY "owners_view_mess_payments" ON payments
  FOR SELECT USING (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

-- Service role can insert payments (via API)
DROP POLICY IF EXISTS "service_insert_payments" ON payments;
CREATE POLICY "service_insert_payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Admins can manage all payments
DROP POLICY IF EXISTS "admins_manage_payments" ON payments;
CREATE POLICY "admins_manage_payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- 8. PAYMENT WEBHOOK EVENTS TABLE
-- ============================================================================
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook events
DROP POLICY IF EXISTS "service_manage_webhook_events" ON payment_webhook_events;
CREATE POLICY "service_manage_webhook_events" ON payment_webhook_events
  FOR ALL USING (true);

-- ============================================================================
-- 9. INVOICES TABLE
-- ============================================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users can view invoices for their payments
DROP POLICY IF EXISTS "users_view_own_invoices" ON invoices;
CREATE POLICY "users_view_own_invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payments WHERE payments.id = invoices.payment_id AND payments.user_id = auth.uid()::text
    )
  );

-- Owners can view invoices for their messes
DROP POLICY IF EXISTS "owners_view_mess_invoices" ON invoices;
CREATE POLICY "owners_view_mess_invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = invoices.payment_id
      AND payments.mess_id IN (
        SELECT id FROM messes WHERE owner_id = auth.uid()::text
      )
    )
  );

-- Service role can manage invoices
DROP POLICY IF EXISTS "service_manage_invoices" ON invoices;
CREATE POLICY "service_manage_invoices" ON invoices
  FOR ALL USING (true);

-- ============================================================================
-- 10. AUDIT EVENTS TABLE
-- ============================================================================
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit events
DROP POLICY IF EXISTS "admins_view_audit_events" ON audit_events;
CREATE POLICY "admins_view_audit_events" ON audit_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Owners can view audit events for their messes
DROP POLICY IF EXISTS "owners_view_own_audit_events" ON audit_events;
CREATE POLICY "owners_view_own_audit_events" ON audit_events
  FOR SELECT USING (
    entity_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
    OR actor_id = auth.uid()::text
  );

-- Service role can insert audit events
DROP POLICY IF EXISTS "service_insert_audit_events" ON audit_events;
CREATE POLICY "service_insert_audit_events" ON audit_events
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 11. MEAL BOOKINGS TABLE
-- ============================================================================
ALTER TABLE meal_bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
DROP POLICY IF EXISTS "users_view_own_bookings" ON meal_bookings;
CREATE POLICY "users_view_own_bookings" ON meal_bookings
  FOR SELECT USING (
    user_id = auth.uid()::text
  );

-- Owners can view bookings for their messes
DROP POLICY IF EXISTS "owners_view_mess_bookings" ON meal_bookings;
CREATE POLICY "owners_view_mess_bookings" ON meal_bookings
  FOR SELECT USING (
    mess_id IN (
      SELECT id FROM messes WHERE owner_id = auth.uid()::text
    )
  );

-- Users can create bookings for themselves
DROP POLICY IF EXISTS "users_create_bookings" ON meal_bookings;
CREATE POLICY "users_create_bookings" ON meal_bookings
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::text
  );

-- Users can update their own bookings
DROP POLICY IF EXISTS "users_update_bookings" ON meal_bookings;
CREATE POLICY "users_update_bookings" ON meal_bookings
  FOR UPDATE USING (
    user_id = auth.uid()::text
  );

-- ============================================================================
-- 12. NOTIFICATION ATTEMPTS TABLE
-- ============================================================================
ALTER TABLE notification_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "users_view_own_notifications" ON notification_attempts;
CREATE POLICY "users_view_own_notifications" ON notification_attempts
  FOR SELECT USING (
    recipient_user_id = auth.uid()::text
  );

-- Owners can view notifications sent for their messes
DROP POLICY IF EXISTS "owners_view_mess_notifications" ON notification_attempts;
CREATE POLICY "owners_view_mess_notifications" ON notification_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messes WHERE owner_id = auth.uid()::text
    )
  );

-- Service role can insert notifications
DROP POLICY IF EXISTS "service_insert_notifications" ON notification_attempts;
CREATE POLICY "service_insert_notifications" ON notification_attempts
  FOR INSERT WITH CHECK (true);

-- Admins can view all notifications
DROP POLICY IF EXISTS "admins_view_all_notifications" ON notification_attempts;
CREATE POLICY "admins_view_all_notifications" ON notification_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()::text AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if user owns a mess
-- ============================================================================
CREATE OR REPLACE FUNCTION owns_mess(mess_uuid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM messes
    WHERE id = mess_uuid AND owner_id = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if user has active subscription to a mess
-- ============================================================================
CREATE OR REPLACE FUNCTION has_active_subscription(mess_uuid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = auth.uid()::text
    AND mess_id = mess_uuid
    AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DONE! RLS policies are now active.
-- ============================================================================
