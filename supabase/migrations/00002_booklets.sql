-- Booklets: pregnancy/child health records
-- Each mother can have multiple booklets (one per pregnancy/child)

create type booklet_status as enum ('active', 'archived', 'completed');

create table booklets (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references mother_profiles(id) on delete cascade,
  label text not null, -- e.g., "First Pregnancy", "Baby Juan"
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

  -- A doctor can only have one active access record per booklet
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
