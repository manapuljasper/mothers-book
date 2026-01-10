-- ============================================================================
-- COMBINED MIGRATIONS FOR MOTHER'S BOOK
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 00001_profiles.sql - Profiles and user types
-- ============================================================================

create type user_role as enum ('doctor', 'mother');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  contact_number text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Doctor-specific profile data
create table doctor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  prc_number text not null,
  clinic_name text not null,
  clinic_address text,
  specialization text,
  clinic_schedule text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint doctor_profiles_user_id_unique unique (user_id)
);

-- Mother-specific profile data
create table mother_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  birthdate date,
  address text,
  emergency_contact_name text,
  emergency_contact_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mother_profiles_user_id_unique unique (user_id)
);

-- Indexes
create index profiles_role_idx on profiles(role);
create index doctor_profiles_user_id_idx on doctor_profiles(user_id);
create index mother_profiles_user_id_idx on mother_profiles(user_id);

-- Updated at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger doctor_profiles_updated_at
  before update on doctor_profiles
  for each row execute function update_updated_at();

create trigger mother_profiles_updated_at
  before update on mother_profiles
  for each row execute function update_updated_at();

-- ============================================================================
-- 00002_booklets.sql - Booklets and access
-- ============================================================================

create type booklet_status as enum ('active', 'archived', 'completed');

create table booklets (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references mother_profiles(id) on delete cascade,
  label text not null,
  status booklet_status not null default 'active',
  expected_due_date date,
  actual_delivery_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Booklet access: grants doctors access to specific booklets
create table booklet_access (
  id uuid primary key default gen_random_uuid(),
  booklet_id uuid not null references booklets(id) on delete cascade,
  doctor_id uuid not null references doctor_profiles(id) on delete cascade,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,

  constraint booklet_access_unique_active
    unique nulls not distinct (booklet_id, doctor_id, revoked_at)
);

-- Indexes
create index booklets_mother_id_idx on booklets(mother_id);
create index booklets_status_idx on booklets(status);
create index booklet_access_booklet_id_idx on booklet_access(booklet_id);
create index booklet_access_doctor_id_idx on booklet_access(doctor_id);
create index booklet_access_active_idx on booklet_access(booklet_id, doctor_id)
  where revoked_at is null;

-- Updated at trigger
create trigger booklets_updated_at
  before update on booklets
  for each row execute function update_updated_at();

-- ============================================================================
-- 00003_medical_entries.sql - Medical entries and lab requests
-- ============================================================================

create type entry_type as enum (
  'prenatal_checkup',
  'postnatal_checkup',
  'ultrasound',
  'lab_review',
  'consultation',
  'emergency',
  'delivery',
  'other'
);

create type lab_status as enum ('pending', 'completed', 'cancelled');

create table medical_entries (
  id uuid primary key default gen_random_uuid(),
  booklet_id uuid not null references booklets(id) on delete cascade,
  doctor_id uuid not null references doctor_profiles(id) on delete restrict,
  entry_type entry_type not null,
  visit_date timestamptz not null,
  notes text,
  diagnosis text,
  recommendations text,
  follow_up_date date,
  vitals jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lab requests: linked to medical entries
create table lab_requests (
  id uuid primary key default gen_random_uuid(),
  medical_entry_id uuid not null references medical_entries(id) on delete cascade,
  description text not null,
  status lab_status not null default 'pending',
  requested_date timestamptz not null default now(),
  completed_date timestamptz,
  results text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index medical_entries_booklet_id_idx on medical_entries(booklet_id);
create index medical_entries_doctor_id_idx on medical_entries(doctor_id);
create index medical_entries_visit_date_idx on medical_entries(visit_date desc);
create index medical_entries_entry_type_idx on medical_entries(entry_type);

create index lab_requests_medical_entry_id_idx on lab_requests(medical_entry_id);
create index lab_requests_status_idx on lab_requests(status);

-- Updated at triggers
create trigger medical_entries_updated_at
  before update on medical_entries
  for each row execute function update_updated_at();

create trigger lab_requests_updated_at
  before update on lab_requests
  for each row execute function update_updated_at();

-- ============================================================================
-- 00004_medications.sql - Medications and intake logs
-- ============================================================================

create type intake_status as enum ('taken', 'missed', 'skipped');

create table medications (
  id uuid primary key default gen_random_uuid(),
  medical_entry_id uuid not null references medical_entries(id) on delete cascade,
  name text not null,
  dosage text not null,
  instructions text,
  frequency_per_day smallint not null check (frequency_per_day between 1 and 4),
  times_of_day text[],
  start_date date not null,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Medication intake logs: tracks each dose taken/missed
create table medication_intake_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references medications(id) on delete cascade,
  scheduled_date date not null,
  dose_index smallint not null,
  status intake_status not null,
  taken_at timestamptz,
  recorded_by_user_id uuid not null references profiles(id) on delete restrict,
  notes text,
  created_at timestamptz not null default now(),

  constraint medication_intake_unique
    unique (medication_id, scheduled_date, dose_index)
);

-- Indexes
create index medications_medical_entry_id_idx on medications(medical_entry_id);
create index medications_is_active_idx on medications(is_active) where is_active = true;
create index medications_date_range_idx on medications(start_date, end_date);

create index medication_intake_logs_medication_id_idx on medication_intake_logs(medication_id);
create index medication_intake_logs_scheduled_date_idx on medication_intake_logs(scheduled_date);
create index medication_intake_logs_status_idx on medication_intake_logs(status);

-- Updated at trigger
create trigger medications_updated_at
  before update on medications
  for each row execute function update_updated_at();

-- ============================================================================
-- 00005_rls_policies.sql - Row Level Security
-- ============================================================================

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

-- Helper functions
create or replace function get_my_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer stable;

create or replace function get_my_doctor_profile_id()
returns uuid as $$
  select id from doctor_profiles where user_id = auth.uid()
$$ language sql security definer stable;

create or replace function get_my_mother_profile_id()
returns uuid as $$
  select id from mother_profiles where user_id = auth.uid()
$$ language sql security definer stable;

create or replace function has_booklet_access(booklet_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from booklets b
    join mother_profiles mp on mp.id = b.mother_id
    where b.id = booklet_uuid and mp.user_id = auth.uid()
  )
  or exists (
    select 1 from booklet_access ba
    join doctor_profiles dp on dp.id = ba.doctor_id
    where ba.booklet_id = booklet_uuid
      and dp.user_id = auth.uid()
      and ba.revoked_at is null
  )
$$ language sql security definer stable;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

-- Doctor profiles policies
create policy "Doctors can view own profile"
  on doctor_profiles for select
  using (user_id = auth.uid());

create policy "Doctors can update own profile"
  on doctor_profiles for update
  using (user_id = auth.uid());

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

-- Mother profiles policies
create policy "Mothers can view own profile"
  on mother_profiles for select
  using (user_id = auth.uid());

create policy "Mothers can update own profile"
  on mother_profiles for update
  using (user_id = auth.uid());

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

-- Booklets policies
create policy "Mothers can view own booklets"
  on booklets for select
  using (
    exists (
      select 1 from mother_profiles mp
      where mp.id = booklets.mother_id and mp.user_id = auth.uid()
    )
  );

create policy "Mothers can create own booklets"
  on booklets for insert
  with check (
    exists (
      select 1 from mother_profiles mp
      where mp.id = booklets.mother_id and mp.user_id = auth.uid()
    )
  );

create policy "Mothers can update own booklets"
  on booklets for update
  using (
    exists (
      select 1 from mother_profiles mp
      where mp.id = booklets.mother_id and mp.user_id = auth.uid()
    )
  );

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

-- Booklet access policies
create policy "Mothers can view booklet access"
  on booklet_access for select
  using (
    exists (
      select 1 from booklets b
      join mother_profiles mp on mp.id = b.mother_id
      where b.id = booklet_access.booklet_id and mp.user_id = auth.uid()
    )
  );

create policy "Mothers can grant booklet access"
  on booklet_access for insert
  with check (
    exists (
      select 1 from booklets b
      join mother_profiles mp on mp.id = b.mother_id
      where b.id = booklet_access.booklet_id and mp.user_id = auth.uid()
    )
  );

create policy "Mothers can revoke booklet access"
  on booklet_access for update
  using (
    exists (
      select 1 from booklets b
      join mother_profiles mp on mp.id = b.mother_id
      where b.id = booklet_access.booklet_id and mp.user_id = auth.uid()
    )
  );

create policy "Doctors can view own access"
  on booklet_access for select
  using (
    exists (
      select 1 from doctor_profiles dp
      where dp.id = booklet_access.doctor_id and dp.user_id = auth.uid()
    )
  );

-- Medical entries policies
create policy "Users can view authorized entries"
  on medical_entries for select
  using (has_booklet_access(booklet_id));

create policy "Doctors can create entries"
  on medical_entries for insert
  with check (
    get_my_role() = 'doctor'
    and has_booklet_access(booklet_id)
    and doctor_id = get_my_doctor_profile_id()
  );

create policy "Doctors can update own entries"
  on medical_entries for update
  using (
    doctor_id = get_my_doctor_profile_id()
    and has_booklet_access(booklet_id)
  );

-- Lab requests policies
create policy "Users can view authorized lab requests"
  on lab_requests for select
  using (
    exists (
      select 1 from medical_entries me
      where me.id = lab_requests.medical_entry_id
        and has_booklet_access(me.booklet_id)
    )
  );

create policy "Doctors can create lab requests"
  on lab_requests for insert
  with check (
    exists (
      select 1 from medical_entries me
      where me.id = lab_requests.medical_entry_id
        and me.doctor_id = get_my_doctor_profile_id()
    )
  );

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

-- Medications policies
create policy "Users can view authorized medications"
  on medications for select
  using (
    exists (
      select 1 from medical_entries me
      where me.id = medications.medical_entry_id
        and has_booklet_access(me.booklet_id)
    )
  );

create policy "Doctors can create medications"
  on medications for insert
  with check (
    exists (
      select 1 from medical_entries me
      where me.id = medications.medical_entry_id
        and me.doctor_id = get_my_doctor_profile_id()
    )
  );

create policy "Doctors can update medications"
  on medications for update
  using (
    exists (
      select 1 from medical_entries me
      where me.id = medications.medical_entry_id
        and me.doctor_id = get_my_doctor_profile_id()
    )
  );

-- Medication intake logs policies
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

create policy "Users can update own intake logs"
  on medication_intake_logs for update
  using (
    recorded_by_user_id = auth.uid()
  );

-- ============================================================================
-- 00006_auth_trigger.sql - Auto-create profile on signup
-- ============================================================================

create or replace function handle_new_user()
returns trigger as $$
declare
  v_user_role user_role;
  v_user_full_name text;
begin
  -- Get role and full_name from user metadata (passed during signup)
  v_user_role := (new.raw_user_meta_data->>'role')::user_role;
  v_user_full_name := coalesce(new.raw_user_meta_data->>'full_name', '');

  -- Create base profile
  insert into profiles (id, role, full_name)
  values (new.id, v_user_role, v_user_full_name);

  -- Create role-specific profile
  if v_user_role = 'doctor' then
    insert into doctor_profiles (user_id, prc_number, clinic_name)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'prc_number', ''),
      coalesce(new.raw_user_meta_data->>'clinic_name', '')
    );
  elsif v_user_role = 'mother' then
    insert into mother_profiles (user_id)
    values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- 00007_add_baby_name.sql - Add baby_name to mother_profiles
-- ============================================================================

alter table mother_profiles
  add column baby_name text;
