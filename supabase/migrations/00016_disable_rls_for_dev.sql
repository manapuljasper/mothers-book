-- Disable RLS on all tables for development
-- This allows all authenticated users to access all data
-- TODO: Re-enable and fix RLS policies before production

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE mother_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE booklets DISABLE ROW LEVEL SECURITY;
ALTER TABLE booklet_access DISABLE ROW LEVEL SECURITY;
ALTER TABLE medical_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE lab_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE medication_intake_logs DISABLE ROW LEVEL SECURITY;
