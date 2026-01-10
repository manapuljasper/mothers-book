-- Fix infinite recursion in mother_profiles RLS policies

-- Drop the problematic policy
DROP POLICY IF EXISTS "Doctors can view authorized mothers" ON mother_profiles;

-- Create security definer function to break the recursion
CREATE OR REPLACE FUNCTION check_doctor_can_view_mother(mother_profile_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM booklet_access ba
    JOIN booklets b ON b.id = ba.booklet_id
    JOIN doctor_profiles dp ON dp.id = ba.doctor_id
    WHERE b.mother_id = mother_profile_id
      AND dp.user_id = auth.uid()
      AND ba.revoked_at IS NULL
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Recreate policy using the security definer function
CREATE POLICY "Doctors can view authorized mothers"
  ON mother_profiles FOR SELECT
  USING (check_doctor_can_view_mother(id));
