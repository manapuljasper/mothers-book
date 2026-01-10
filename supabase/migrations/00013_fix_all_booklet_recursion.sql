-- Comprehensive fix for booklet RLS recursion
-- The issue: policies query tables that have policies querying back

-- First, drop ALL booklet policies to start fresh
DROP POLICY IF EXISTS "Mothers can view own booklets" ON booklets;
DROP POLICY IF EXISTS "Mothers can create own booklets" ON booklets;
DROP POLICY IF EXISTS "Mothers can update own booklets" ON booklets;
DROP POLICY IF EXISTS "Doctors can view authorized booklets" ON booklets;
DROP POLICY IF EXISTS "Doctors can update accessible booklets" ON booklets;
DROP POLICY IF EXISTS "Doctors can update notes on accessible booklets" ON booklets;

-- Create SECURITY DEFINER helper functions to break recursion
-- These run as the function owner, bypassing RLS

-- Check if current user is the mother who owns this booklet
CREATE OR REPLACE FUNCTION is_booklet_owner(booklet_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM booklets b
    JOIN mother_profiles mp ON mp.id = b.mother_id
    WHERE b.id = booklet_id AND mp.user_id = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user (as mother) owns the mother_profile_id
CREATE OR REPLACE FUNCTION is_my_mother_profile(mother_profile_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM mother_profiles mp
    WHERE mp.id = mother_profile_id AND mp.user_id = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user (as doctor) has access to this booklet
CREATE OR REPLACE FUNCTION doctor_has_booklet_access(booklet_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM booklet_access ba
    JOIN doctor_profiles dp ON dp.id = ba.doctor_id
    WHERE ba.booklet_id = booklet_id
      AND dp.user_id = auth.uid()
      AND ba.revoked_at IS NULL
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Recreate booklet policies using ONLY the helper functions (no inline queries)

-- Mothers can view their own booklets
CREATE POLICY "Mothers can view own booklets"
  ON booklets FOR SELECT
  USING (is_my_mother_profile(mother_id));

-- Mothers can create booklets for themselves
CREATE POLICY "Mothers can create own booklets"
  ON booklets FOR INSERT
  WITH CHECK (is_my_mother_profile(mother_id));

-- Mothers can update their own booklets
CREATE POLICY "Mothers can update own booklets"
  ON booklets FOR UPDATE
  USING (is_my_mother_profile(mother_id));

-- Doctors can view booklets they have access to
CREATE POLICY "Doctors can view authorized booklets"
  ON booklets FOR SELECT
  USING (doctor_has_booklet_access(id));

-- Doctors can update booklets they have access to (for notes)
CREATE POLICY "Doctors can update authorized booklets"
  ON booklets FOR UPDATE
  USING (doctor_has_booklet_access(id));
