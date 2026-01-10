-- Fix infinite recursion from migration 00011
-- Drop the problematic policies that caused circular dependencies

DROP POLICY IF EXISTS "Doctors can update notes on accessible booklets" ON booklets;
DROP POLICY IF EXISTS "Doctors can view mother profiles for patients" ON mother_profiles;
DROP POLICY IF EXISTS "Doctors can view patient base profiles" ON profiles;

-- Recreate doctor update policy using existing SECURITY DEFINER functions
-- This avoids the recursion by using pre-defined helper functions
CREATE POLICY "Doctors can update accessible booklets"
  ON booklets FOR UPDATE
  USING (
    has_booklet_access(id)
    AND get_my_role() = 'doctor'
  );
