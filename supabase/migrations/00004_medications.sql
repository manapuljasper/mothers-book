-- Medications: prescriptions created by doctors
-- Intake logs track mother's medication adherence

create type intake_status as enum ('taken', 'missed', 'skipped');

create table medications (
  id uuid primary key default gen_random_uuid(),
  medical_entry_id uuid not null references medical_entries(id) on delete cascade,
  name text not null,
  dosage text not null, -- e.g., "500mg", "1 tablet"
  instructions text,
  frequency_per_day smallint not null check (frequency_per_day between 1 and 4),
  times_of_day text[], -- e.g., ['08:00', '20:00']
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
  dose_index smallint not null, -- 0-indexed (0 = first dose of day)
  status intake_status not null,
  taken_at timestamptz, -- actual time taken (null if missed/skipped)
  recorded_by_user_id uuid not null references profiles(id) on delete restrict,
  notes text,
  created_at timestamptz not null default now(),

  -- One log per medication per day per dose
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
