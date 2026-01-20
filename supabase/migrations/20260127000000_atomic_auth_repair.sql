-- ==========================================
-- ATOMIC AUTH REPAIR - Consolidation Migration
-- Date: 2026-01-27
-- Purpose: Fix all critical authentication issues in one atomic transaction
-- ==========================================

BEGIN;

-- ==========================================
-- STEP 1: Add Missing Columns to profiles
-- ==========================================

-- Add first_name, last_name, birth_date if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
    ALTER TABLE public.profiles ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
    ALTER TABLE public.profiles ADD COLUMN last_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'birth_date') THEN
    ALTER TABLE public.profiles ADD COLUMN birth_date date;
  END IF;
END $$;

-- ==========================================
-- STEP 2: Grant Necessary Permissions
-- ==========================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, authenticator;

-- Set search path for authenticator role
ALTER ROLE authenticator SET search_path = public, extensions;

-- ==========================================
-- STEP 3: Clean Up Conflicting Triggers & Functions
-- ==========================================

-- Drop existing triggers (may exist from different migrations)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- Drop old function versions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ==========================================
-- STEP 4: Create Unified handle_new_user Function
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, extensions
AS $$
DECLARE
  v_role text;
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_birth_date date;
  v_error_message text;
BEGIN
  -- Determine role
  IF new.email = 'pendysevan11@gmail.com' THEN
    v_role := 'admin';
  ELSE
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'user');
  END IF;

  -- Extract names
  v_first_name := new.raw_user_meta_data->>'first_name';
  v_last_name := new.raw_user_meta_data->>'last_name';
  
  -- Construct full_name
  IF v_first_name IS NOT NULL AND v_last_name IS NOT NULL THEN
    v_full_name := TRIM(v_first_name || ' ' || v_last_name);
  ELSIF new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    v_full_name := new.raw_user_meta_data->>'full_name';
  ELSE
    v_full_name := SPLIT_PART(new.email, '@', 1);
  END IF;

  -- Parse birth_date safely
  BEGIN
    IF new.raw_user_meta_data->>'birth_date' IS NOT NULL 
       AND new.raw_user_meta_data->>'birth_date' != '' THEN
      v_birth_date := (new.raw_user_meta_data->>'birth_date')::date;
    ELSE
      v_birth_date := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_birth_date := NULL;
    -- Log but don't fail on birth_date parsing error
    RAISE WARNING 'Failed to parse birth_date for user %: %', new.email, SQLERRM;
  END;

  -- Insert or update profile
  BEGIN
    INSERT INTO public.profiles (
      user_id, 
      email, 
      role, 
      full_name, 
      first_name, 
      last_name, 
      birth_date,
      phone
    )
    VALUES (
      new.id,
      new.email,
      v_role,
      v_full_name,
      v_first_name,
      v_last_name,
      v_birth_date,
      new.phone
    )
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role,
      first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
      last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      birth_date = COALESCE(EXCLUDED.birth_date, public.profiles.birth_date),
      phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
      updated_at = now();

    RAISE LOG 'Profile created/updated successfully for user: % (role: %)', new.email, v_role;

  EXCEPTION WHEN OTHERS THEN
    -- Log the error with details
    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
    RAISE WARNING 'Failed to create profile for user %: %', new.email, v_error_message;
    
    -- Critical: Don't silently fail - this will cause login issues
    -- Re-raise the exception so we know something went wrong
    RAISE EXCEPTION 'Profile creation failed for %: %', new.email, v_error_message;
  END;

  RETURN new;
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates or updates user profile when a new user signs up. Includes error logging and proper exception handling.';

-- ==========================================
-- STEP 5: Create Trigger
-- ==========================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- STEP 6: Fix Circular RLS Policies
-- ==========================================

-- Drop potentially circular policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all merchants" ON public.merchants;
DROP POLICY IF EXISTS "Admins can view all food items" ON public.food_items;

-- Create helper function for admin check (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Recreate admin policies using the helper function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles 
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles 
  FOR UPDATE
  USING (public.is_admin());

-- Recreate merchant admin policy
CREATE POLICY "Admins can manage all merchants"
  ON public.merchants 
  FOR ALL
  USING (public.is_admin());

-- Recreate food_items admin policy
CREATE POLICY "Admins can view all food items"
  ON public.food_items 
  FOR SELECT
  USING (public.is_admin());

-- ==========================================
-- STEP 7: Ensure Admin User Exists
-- ==========================================

-- This will be handled by the trigger when the user signs up
-- But we can also manually ensure the profile exists if user already exists in auth.users

DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Check if admin user exists in auth.users
  SELECT id INTO v_admin_id 
  FROM auth.users 
  WHERE email = 'pendysevan11@gmail.com';

  IF v_admin_id IS NOT NULL THEN
    -- Ensure profile exists and has admin role
    INSERT INTO public.profiles (user_id, email, role, full_name)
    VALUES (
      v_admin_id,
      'pendysevan11@gmail.com',
      'admin',
      'Sevan Kedesh IKISSA PENDY'
    )
    ON CONFLICT (user_id) DO UPDATE 
    SET role = 'admin',
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = now();
    
    RAISE NOTICE 'Admin profile ensured for pendysevan11@gmail.com';
  END IF;
END $$;

-- ==========================================
-- STEP 8: Add Helpful Indexes for Performance
-- ==========================================

-- Index on role for faster admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_role ON public.profiles(user_id, role);

COMMIT;

-- ==========================================
-- Migration Complete
-- ==========================================

-- Verification queries (run manually if needed):
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position;
-- SELECT * FROM public.profiles WHERE email = 'pendysevan11@gmail.com';
-- SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';
