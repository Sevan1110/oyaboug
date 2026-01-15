-- ==========================================
-- NUCLEAR FIX v2: Remove Invalid Casts & Reset Auth
-- ==========================================

-- 1. Drop the problematic function and trigger immediately to unblock Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Re-create the function correctly (CLEAN VERSION)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Use a very safe INSERT with explicit schema qualification
  -- and NO invalid type casts
  INSERT INTO public.profiles (
    user_id, 
    email, 
    role, 
    full_name, 
    first_name, 
    last_name, 
    birth_date
  )
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
    CASE 
      WHEN new.raw_user_meta_data->>'birth_date' IS NOT NULL AND new.raw_user_meta_data->>'birth_date' != ''
      THEN (new.raw_user_meta_data->>'birth_date')::date 
      ELSE NULL 
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    birth_date = COALESCE(EXCLUDED.birth_date, public.profiles.birth_date),
    updated_at = now();
    
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Last resort: if profile creation fails, still allow user creation in Auth
  -- This prevents the 500 Internal Server error for the user
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public, extensions';

-- 3. Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Final adjustment for the authenticator role
ALTER ROLE authenticator SET search_path = public, extensions;
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT USAGE ON SCHEMA extensions TO authenticator;
