-- ==========================================
-- Add Name Columns to Profiles and Update Trigger
-- ==========================================

-- 1. Add first_name and last_name to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. Update the handle_new_user trigger function
-- This version handles first_name, last_name, and full_name correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role, full_name, first_name, last_name, phone, birth_date)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email = 'pendysevan11@gmail.com' THEN 'admin'
      ELSE COALESCE(new.raw_user_meta_data->>'role', 'user')
    END,
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      TRIM(COALESCE(new.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(new.raw_user_meta_data->>'last_name', ''))
    ),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.phone,
    (new.raw_user_meta_data->>'birth_date')::date
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
    last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    birth_date = COALESCE(public.profiles.birth_date, EXCLUDED.birth_date);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
