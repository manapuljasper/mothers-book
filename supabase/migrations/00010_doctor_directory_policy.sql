-- Allow all authenticated users to view doctor profiles (for directory)
-- This enables the doctor directory feature where mothers can browse doctors

create policy "Anyone can view doctor profiles"
  on doctor_profiles for select
  using (auth.uid() is not null);

-- Allow viewing profiles of doctors (for fullName in directory)
create policy "Anyone can view doctor user profiles"
  on profiles for select
  using (
    auth.uid() is not null
    and role = 'doctor'
  );
