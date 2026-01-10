-- Auth trigger: automatically create profile when user signs up
-- The role and full_name should be passed in auth.signUp() options.data

create or replace function handle_new_user()
returns trigger as $$
declare
  user_role user_role;
  user_full_name text;
begin
  -- Get role and full_name from user metadata (passed during signup)
  user_role := (new.raw_user_meta_data->>'role')::user_role;
  user_full_name := coalesce(new.raw_user_meta_data->>'full_name', '');

  -- Create base profile
  insert into profiles (id, role, full_name)
  values (new.id, user_role, user_full_name);

  -- Create role-specific profile
  if user_role = 'doctor' then
    insert into doctor_profiles (user_id, prc_number, clinic_name)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'prc_number', ''),
      coalesce(new.raw_user_meta_data->>'clinic_name', '')
    );
  elsif user_role = 'mother' then
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
