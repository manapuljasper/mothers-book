-- Allow doctors to grant themselves access to booklets (via QR scan)
-- This simulates the QR code granting permission

-- Helper function to check if user is a doctor
CREATE OR REPLACE FUNCTION is_current_user_doctor()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM doctor_profiles dp
    WHERE dp.user_id = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Allow doctors to insert access for themselves
CREATE POLICY "Doctors can grant themselves access via scan"
  ON booklet_access FOR INSERT
  WITH CHECK (
    -- The doctor_id must match the current user's doctor profile
    doctor_id = get_my_doctor_profile_id()
    AND is_current_user_doctor()
  );
