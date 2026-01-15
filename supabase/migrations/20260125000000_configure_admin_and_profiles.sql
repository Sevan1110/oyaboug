-- ==========================================
-- Configure Profiles and Admin Account
-- ==========================================

-- 1. Add birth_date to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2. Update the handle_new_user trigger function
-- This version handles first/last name concatenation and birth_date from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role, full_name, phone, birth_date)
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
    new.phone,
    (new.raw_user_meta_data->>'birth_date')::date
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = CASE 
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    birth_date = COALESCE(public.profiles.birth_date, EXCLUDED.birth_date);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. Ensure the trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Update existing profile if it exists
UPDATE public.profiles
SET 
  role = 'admin',
  full_name = 'Sevan Kedesh IKISSA PENDY',
  birth_date = '1999-10-11'
WHERE email = 'pendysevan11@gmail.com';
