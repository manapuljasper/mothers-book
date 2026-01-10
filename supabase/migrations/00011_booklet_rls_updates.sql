-- RLS updates for booklet functionality
-- 1. Allow doctors with access to update booklet notes
-- 2. Allow viewing mother profiles for doctor's patient list

-- Drop the problematic policies if they exist (from previous migration attempt)
DROP POLICY IF EXISTS "Doctors can update notes on accessible booklets" ON booklets;
DROP POLICY IF EXISTS "Doctors can view mother profiles for patients" ON mother_profiles;
DROP POLICY IF EXISTS "Doctors can view patient base profiles" ON profiles;

-- Allow doctors with active access to update booklets (for notes editing)
-- Uses the existing has_booklet_access() SECURITY DEFINER function to avoid recursion
CREATE POLICY "Doctors can update accessible booklets"
  ON booklets FOR UPDATE
  USING (
    has_booklet_access(id)
    AND get_my_role() = 'doctor'
  );
