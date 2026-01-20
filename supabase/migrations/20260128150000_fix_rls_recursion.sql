-- Fix RLS Recursion by using security definer functions

-- Ensure is_admin function exists and is security definer (re-declaring to be safe and ensure search_path is safe)
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Helper for merchant check to avoid recursion there too
CREATE OR REPLACE FUNCTION public.is_merchant(user_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid AND role = 'merchant'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;


-- 1. Fix profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ( public.is_admin(auth.uid()) );

-- 2. Fix merchants policies
DROP POLICY IF EXISTS "Admins can manage all merchants" ON public.merchants;
CREATE POLICY "Admins can manage all merchants"
  ON public.merchants FOR ALL
  TO authenticated
  USING ( public.is_admin(auth.uid()) );

DROP POLICY IF EXISTS "Merchants can manage own profile" ON public.merchants;
CREATE POLICY "Merchants can manage own profile"
  ON public.merchants FOR ALL
  TO authenticated
  USING (
    public.is_merchant(auth.uid()) AND user_id = auth.uid()
  );

-- 3. Fix admin_activities policies
DROP POLICY IF EXISTS "Admins can view activities" ON public.admin_activities;
DROP POLICY IF EXISTS "Admins can view admin activities" ON public.admin_activities;
CREATE POLICY "Admins can view admin activities"
  ON public.admin_activities FOR SELECT
  TO authenticated
  USING ( public.is_admin(auth.uid()) );

DROP POLICY IF EXISTS "Admins can insert activities" ON public.admin_activities;
DROP POLICY IF EXISTS "Admins can insert admin activities" ON public.admin_activities;
CREATE POLICY "Admins can insert admin activities"
  ON public.admin_activities FOR INSERT
  TO authenticated
  WITH CHECK ( public.is_admin(auth.uid()) );
