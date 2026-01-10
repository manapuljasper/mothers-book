-- Fix doctor grant access RLS issue
-- The problem: FK validation on INSERT checks booklets table, but doctor has no access yet
-- This creates a chicken-and-egg problem where doctors can't grant themselves access

-- Drop the existing policy that doesn't work
DROP POLICY IF EXISTS "Doctors can grant themselves access via scan" ON booklet_access;

-- Create a SECURITY DEFINER function to handle the grant
-- This bypasses RLS for the FK check while maintaining security
CREATE OR REPLACE FUNCTION grant_doctor_booklet_access(p_booklet_id uuid, p_doctor_id uuid)
RETURNS booklet_access AS $$
DECLARE
  v_result booklet_access;
  v_current_doctor_id uuid;
BEGIN
  -- Get current user's doctor profile id
  SELECT id INTO v_current_doctor_id
  FROM doctor_profiles
  WHERE user_id = auth.uid();

  -- Security check 1: User must be a doctor
  IF v_current_doctor_id IS NULL THEN
    RAISE EXCEPTION 'User is not a doctor';
  END IF;

  -- Security check 2: Doctor can only grant access to themselves
  IF p_doctor_id != v_current_doctor_id THEN
    RAISE EXCEPTION 'Doctors can only grant access to themselves';
  END IF;

  -- Security check 3: Booklet must exist
  IF NOT EXISTS (SELECT 1 FROM booklets WHERE id = p_booklet_id) THEN
    RAISE EXCEPTION 'Booklet not found';
  END IF;

  -- Check if active access already exists
  SELECT * INTO v_result
  FROM booklet_access
  WHERE booklet_id = p_booklet_id
    AND doctor_id = p_doctor_id
    AND revoked_at IS NULL;

  IF v_result.id IS NOT NULL THEN
    RETURN v_result;
  END IF;

  -- Insert new access record
  INSERT INTO booklet_access (booklet_id, doctor_id)
  VALUES (p_booklet_id, p_doctor_id)
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
