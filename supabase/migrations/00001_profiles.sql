-- Profiles: extends Supabase auth.users
-- Each authenticated user gets one profile with a role

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
