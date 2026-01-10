-- Row Level Security policies
-- Ensures users can only access data they're authorized to see

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table doctor_profiles enable row level security;
alter table mother_profiles enable row level security;
alter table booklets enable row level security;
alter table booklet_access enable row level security;
alter table medical_entries enable row level security;
alter table lab_requests enable row level security;
alter table medications enable row level security;
alter table medication_intake_logs enable row level security;

-- ============================================================================
-- Helper functions
-- ============================================================================

-- Get the current user's profile role
create or replace function get_my_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

-- Get the current user's doctor_profile id (null if not a doctor)
create or replace function get_my_doctor_profile_id()
returns uuid as $$
  select id from doctor_profiles where user_id = auth.uid()
$$ language sql security definer stable;

-- Get the current user's mother_profile id (null if not a mother)
create or replace function get_my_mother_profile_id()
returns uuid as $$
  select id from mother_profiles where user_id = auth.uid()
$$ language sql security definer stable;

-- Check if user has access to a booklet (either owns it or has active access)
create or replace function has_booklet_access(booklet_uuid uuid)
returns boolean as $$
  select exists (
    -- Mother owns the booklet
    select 1 from booklets b
    join mother_profiles mp on mp.id = b.mother_id
    where b.id = booklet_uuid and mp.user_id = auth.uid()
  )
  or exists (
    -- Doctor has active access
    select 1 from booklet_access ba
    join doctor_profiles dp on dp.id = ba.doctor_id
    where ba.booklet_id = booklet_uuid
      and dp.user_id = auth.uid()
      and ba.revoked_at is null
  )
$$ language sql security definer stable;

-- ============================================================================
-- Profiles policies
-- ============================================================================

-- Users can view their own profile
create policy "Users can view own profile"
  on profiles for select
  using (id = auth.uid());

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

-- Profiles are created via trigger/function during signup (service role)
-- No insert policy needed for regular users

-- ============================================================================
-- Doctor profiles policies
-- ============================================================================

-- Doctors can view their own profile
create policy "Doctors can view own profile"
  on doctor_profiles for select
  using (user_id = auth.uid());

-- Doctors can update their own profile
create policy "Doctors can update own profile"
  on doctor_profiles for update
  using (user_id = auth.uid());

-- Mothers can view doctors who have access to their booklets
create policy "Mothers can view authorized doctors"
  on doctor_profiles for select
  using (
    exists (
      select 1 from booklet_access ba
      join booklets b on b.id = ba.booklet_id
      join mother_profiles mp on mp.id = b.mother_id
      where ba.doctor_id = doctor_profiles.id
        and mp.user_id = auth.uid()
        and ba.revoked_at is null
    )
  );

-- ============================================================================
-- Mother profiles policies
-- ============================================================================

-- Mothers can view their own profile
create policy "Mothers can view own profile"
  on mother_profiles for select
  using (user_id = auth.uid());

-- Mothers can update their own profile
create policy "Mothers can update own profile"
  on mother_profiles for update
  using (user_id = auth.uid());

-- Doctors can view mothers whose booklets they have access to
create policy "Doctors can view authorized mothers"
  on mother_profiles for select
  using (
    exists (
      select 1 from booklet_access ba
      join booklets b on b.id = ba.booklet_id
      join doctor_profiles dp on dp.id = ba.doctor_id
      where b.mother_id = mother_profiles.id
        and dp.user_id = auth.uid()
        and ba.revoked_at is null
    )
  );

-- ============================================================================
-- Booklets policies
-- ============================================================================

-- Mothers can view their own booklets
create policy "Mothers can view own booklets"
  on booklets for select
  using (
    exists (
      select 1 from mother_profiles mp
      where mp.id = booklets.mother_id and mp.user_id = auth.uid()
    )
  );

-- Mothers can create booklets for themselves
create policy "Mothers can create own booklets"
  on booklets for insert
  with check (
    exists (
      select 1 from mother_profiles mp
      where mp.id = booklets.mother_id and mp.user_id = auth.uid()
    )
  );

-- Mothers can update their own booklets
create policy "Mothers can update own booklets"
  on booklets for update
  using (
    exists (
      select 1 from mother_profiles mp
      where mp.id = booklets.mother_id and mp.user_id = auth.uid()
    )
  );

-- Doctors can view booklets they have access to
create policy "Doctors can view authorized booklets"
  on booklets for select
  using (
    exists (
      select 1 from booklet_access ba
      join doctor_profiles dp on dp.id = ba.doctor_id
      where ba.booklet_id = booklets.id
        and dp.user_id = auth.uid()
        and ba.revoked_at is null
    )
  );

-- ============================================================================
-- Booklet access policies
-- ============================================================================

-- Mothers can view access records for their booklets
create policy "Mothers can view booklet access"
  on booklet_access for select
  using (
    exists (
      select 1 from booklets b
      join mother_profiles mp on mp.id = b.mother_id
      where b.id = booklet_access.booklet_id and mp.user_id = auth.uid()
    )
  );

-- Mothers can grant access (insert) to their booklets
create policy "Mothers can grant booklet access"
  on booklet_access for insert
  with check (
    exists (
      select 1 from booklets b
      join mother_profiles mp on mp.id = b.mother_id
      where b.id = booklet_access.booklet_id and mp.user_id = auth.uid()
    )
  );

-- Mothers can revoke access (update revoked_at) on their booklets
create policy "Mothers can revoke booklet access"
  on booklet_access for update
  using (
    exists (
      select 1 from booklets b
      join mother_profiles mp on mp.id = b.mother_id
      where b.id = booklet_access.booklet_id and mp.user_id = auth.uid()
    )
  );

-- Doctors can view their own access records
create policy "Doctors can view own access"
  on booklet_access for select
  using (
    exists (
      select 1 from doctor_profiles dp
      where dp.id = booklet_access.doctor_id and dp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Medical entries policies
-- ============================================================================

-- Users with booklet access can view entries
create policy "Users can view authorized entries"
  on medical_entries for select
  using (has_booklet_access(booklet_id));

-- Doctors with booklet access can create entries
create policy "Doctors can create entries"
  on medical_entries for insert
  with check (
    get_my_role() = 'doctor'
    and has_booklet_access(booklet_id)
    and doctor_id = get_my_doctor_profile_id()
  );

-- Doctors can update their own entries
create policy "Doctors can update own entries"
  on medical_entries for update
  using (
    doctor_id = get_my_doctor_profile_id()
    and has_booklet_access(booklet_id)
  );

-- ============================================================================
-- Lab requests policies
-- ============================================================================

-- Users with booklet access can view lab requests
create policy "Users can view authorized lab requests"
  on lab_requests for select
  using (
    exists (
      select 1 from medical_entries me
      where me.id = lab_requests.medical_entry_id
        and has_booklet_access(me.booklet_id)
    )
  );

-- Doctors can create lab requests for their entries
create policy "Doctors can create lab requests"
  on lab_requests for insert
  with check (
    exists (
      select 1 from medical_entries me
      where me.id = lab_requests.medical_entry_id
        and me.doctor_id = get_my_doctor_profile_id()
    )
  );

-- Doctors can update lab requests on entries they have access to
create policy "Doctors can update lab requests"
  on lab_requests for update
  using (
    exists (
      select 1 from medical_entries me
      where me.id = lab_requests.medical_entry_id
        and has_booklet_access(me.booklet_id)
        and get_my_role() = 'doctor'
    )
  );

-- ============================================================================
-- Medications policies
-- ============================================================================

-- Users with booklet access can view medications
create policy "Users can view authorized medications"
  on medications for select
  using (
    exists (
      select 1 from medical_entries me
      where me.id = medications.medical_entry_id
        and has_booklet_access(me.booklet_id)
    )
  );

-- Doctors can create medications for their entries
create policy "Doctors can create medications"
  on medications for insert
  with check (
    exists (
      select 1 from medical_entries me
      where me.id = medications.medical_entry_id
        and me.doctor_id = get_my_doctor_profile_id()
    )
  );

-- Doctors can update medications they created
create policy "Doctors can update medications"
  on medications for update
  using (
    exists (
      select 1 from medical_entries me
      where me.id = medications.medical_entry_id
        and me.doctor_id = get_my_doctor_profile_id()
    )
  );

-- ============================================================================
-- Medication intake logs policies
-- ============================================================================

-- Users with booklet access can view intake logs
create policy "Users can view authorized intake logs"
  on medication_intake_logs for select
  using (
    exists (
      select 1 from medications m
      join medical_entries me on me.id = m.medical_entry_id
      where m.id = medication_intake_logs.medication_id
        and has_booklet_access(me.booklet_id)
    )
  );

-- Users (mothers primarily) can log their medication intake
create policy "Users can create intake logs"
  on medication_intake_logs for insert
  with check (
    recorded_by_user_id = auth.uid()
    and exists (
      select 1 from medications m
      join medical_entries me on me.id = m.medical_entry_id
      where m.id = medication_intake_logs.medication_id
        and has_booklet_access(me.booklet_id)
    )
  );

-- Users can update their own intake logs
create policy "Users can update own intake logs"
  on medication_intake_logs for update
  using (
    recorded_by_user_id = auth.uid()
  );
