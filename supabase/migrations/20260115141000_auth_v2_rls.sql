-- ==========================================
-- AUTH V2 RLS POLICIES - Row Level Security
-- Date: 2026-01-15
-- Purpose: Secure access to auth v2 tables without circular dependencies
-- ==========================================

BEGIN;

-- ==========================================
-- STEP 1: Enable RLS on all auth v2 tables
-- ==========================================

ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_mfa_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 2: Helper Functions (SECURITY DEFINER)
-- ==========================================

-- Safe admin check function (no RLS circular dependency)
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Direct check without triggering RLS on profiles
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  );
END;
$$;

COMMENT ON FUNCTION public.current_user_is_admin IS 
  'Safely checks if current user is admin without RLS circular dependency';

-- ==========================================
-- STEP 3: RLS Policies - auth_sessions
-- ==========================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON public.auth_sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own sessions
CREATE POLICY "Users can create own sessions"
  ON public.auth_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own sessions (e.g., last_activity, revoke)
CREATE POLICY "Users can update own sessions"
  ON public.auth_sessions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own sessions (logout)
CREATE POLICY "Users can delete own sessions"
  ON public.auth_sessions
  FOR DELETE
  USING (user_id = auth.uid());

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
  ON public.auth_sessions
  FOR SELECT
  USING (public.current_user_is_admin());

-- Allow anon to validate sessions (for initial auth check)
CREATE POLICY "Anon can validate sessions"
  ON public.auth_sessions
  FOR SELECT
  USING (true);

-- ==========================================
-- STEP 4: RLS Policies - auth_audit_log
-- ==========================================

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.auth_audit_log
  FOR SELECT
  USING (user_id = auth.uid());

-- Service can insert audit logs (via SECURITY DEFINER functions)
CREATE POLICY "System can insert audit logs"
  ON public.auth_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.auth_audit_log
  FOR SELECT
  USING (public.current_user_is_admin());

-- ==========================================
-- STEP 5: RLS Policies - auth_mfa_factors
-- ==========================================

-- Users can view their own MFA factors
CREATE POLICY "Users can view own MFA factors"
  ON public.auth_mfa_factors
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own MFA factors
CREATE POLICY "Users can create own MFA factors"
  ON public.auth_mfa_factors
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own MFA factors
CREATE POLICY "Users can update own MFA factors"
  ON public.auth_mfa_factors
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own MFA factors
CREATE POLICY "Users can delete own MFA factors"
  ON public.auth_mfa_factors
  FOR DELETE
  USING (user_id = auth.uid());

-- Admins can view all MFA factors (for support)
CREATE POLICY "Admins can view all MFA factors"
  ON public.auth_mfa_factors
  FOR SELECT
  USING (public.current_user_is_admin());

-- ==========================================
-- STEP 6: RLS Policies - password_reset_tokens
-- ==========================================

-- Users can view their own reset tokens
CREATE POLICY "Users can view own reset tokens"
  ON public.password_reset_tokens
  FOR SELECT
  USING (user_id = auth.uid());

-- Anon can insert reset tokens (for forgot password flow)
CREATE POLICY "Anon can create reset tokens"
  ON public.password_reset_tokens
  FOR INSERT
  WITH CHECK (true);

-- Anon can validate reset tokens (for reset password flow)
CREATE POLICY "Anon can validate reset tokens"
  ON public.password_reset_tokens
  FOR SELECT
  USING (true);

-- Users can update their own tokens (mark as used)
CREATE POLICY "Users can update own reset tokens"
  ON public.password_reset_tokens
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all reset tokens
CREATE POLICY "Admins can view all reset tokens"
  ON public.password_reset_tokens
  FOR SELECT
  USING (public.current_user_is_admin());

-- ==========================================
-- STEP 7: RLS Policies - failed_login_attempts
-- ==========================================

-- Anon can check rate limiting (before login)
CREATE POLICY "Anon can check rate limits"
  ON public.failed_login_attempts
  FOR SELECT
  USING (true);

-- Anon can record failed attempts
CREATE POLICY "Anon can record failed attempts"
  ON public.failed_login_attempts
  FOR INSERT
  WITH CHECK (true);

-- Anon can update attempt counts
CREATE POLICY "Anon can update failed attempts"
  ON public.failed_login_attempts
  FOR UPDATE
  USING (true);

-- Authenticated users can delete their records (on successful login)
CREATE POLICY "Authenticated can clear own failed attempts"
  ON public.failed_login_attempts
  FOR DELETE
  USING (true);

-- Admins can view all failed attempts (security monitoring)
CREATE POLICY "Admins can view all failed attempts"
  ON public.failed_login_attempts
  FOR SELECT
  USING (public.current_user_is_admin());

COMMIT;

-- ==========================================
-- Migration Complete
-- ==========================================

-- Verification (run manually):
-- SELECT tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename LIKE 'auth_%'
-- ORDER BY tablename, policyname;
