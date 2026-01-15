-- ==========================================
-- MASTER FIX: Permissions, Search Path & Trigger
-- ==========================================

-- 1. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, authenticator;

-- 2. Set search path for authenticator role
ALTER ROLE authenticator SET search_path = public, extensions;

-- 3. Trigger correctly handling names and birth_date
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
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
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public, extensions';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
