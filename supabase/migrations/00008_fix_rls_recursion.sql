-- Fix infinite recursion in RLS policies
-- The doctor_profiles and booklet_access policies were creating circular dependencies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Mothers can view authorized doctors" ON doctor_profiles;
DROP POLICY IF EXISTS "Doctors can view own access" ON booklet_access;

-- Create security definer functions to break the recursion
CREATE OR REPLACE FUNCTION check_mother_can_view_doctor(doctor_profile_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM booklet_access ba
    JOIN booklets b ON b.id = ba.booklet_id
    JOIN mother_profiles mp ON mp.id = b.mother_id
    WHERE ba.doctor_id = doctor_profile_id
      AND mp.user_id = auth.uid()
      AND ba.revoked_at IS NULL
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION check_doctor_owns_access(doctor_id_param uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM doctor_profiles dp
    WHERE dp.id = doctor_id_param AND dp.user_id = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Recreate policies using the security definer functions
CREATE POLICY "Mothers can view authorized doctors"
  ON doctor_profiles FOR SELECT
  USING (check_mother_can_view_doctor(id));

CREATE POLICY "Doctors can view own access"
  ON booklet_access FOR SELECT
  USING (check_doctor_owns_access(doctor_id));
