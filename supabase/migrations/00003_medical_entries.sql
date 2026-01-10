-- Medical entries: doctor visits, checkups, consultations
-- Each entry belongs to a booklet and is created by a doctor

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
  -- Vitals stored as JSONB for flexibility
  -- Schema: { bloodPressure?, weight?, temperature?, heartRate?, fetalHeartRate?, fundalHeight?, aog? }
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
