-- Add baby_name field to mother_profiles
-- This field stores the name of the mother's baby (from sample data)

alter table mother_profiles
  add column baby_name text;
