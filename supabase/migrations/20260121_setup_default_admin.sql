-- ==========================================
-- Setup Default Admin Profile
-- ==========================================

-- Insert or update the profile for the default admin
-- Note: The auth.users record must be created separately via Supabase dashboard or API
insert into public.profiles (
  user_id, 
  email, 
  full_name, 
  phone, 
  role, 
  created_at, 
  updated_at
)
values (
  -- We don't have the UUID yet, so we assume it will be linked later or created manually.
  -- For now, we can only prepare the data if the user_id is known, 
  -- but we can use a placeholder or wait for the user to provide it.
  -- Alternatively, we can use a specific UUID if we want to hardcode it for development.
  '00000000-0000-0000-0000-000000000001', -- Placeholder UUID
  'sevankedesh11@gmail.com',
  'Sevan Kedesh IKISSA PENDY',
  '077157904',
  'admin',
  now(),
  now()
)
on conflict (email) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  role = excluded.role,
  updated_at = now();

-- Update existing profile if user already signed up
update public.profiles
set 
  full_name = 'Sevan Kedesh IKISSA PENDY',
  phone = '077157904',
  role = 'admin'
where email = 'sevankedesh11@gmail.com';
