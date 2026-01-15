-- ==========================================
-- AUTH V2 SCHEMA - Modern Authentication System
-- Date: 2026-01-15
-- Purpose: Implement secure, scalable authentication with MFA, audit logging, and session management
-- ==========================================

BEGIN;

-- ==========================================
-- STEP 1: Create auth_sessions table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  device_info jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_auth_sessions_user_id ON public.auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_token_hash ON public.auth_sessions(token_hash);
CREATE INDEX idx_auth_sessions_active ON public.auth_sessions(is_active, expires_at);

COMMENT ON TABLE public.auth_sessions IS 'Manages user sessions with multi-device support and IP tracking';

-- ==========================================
-- STEP 2: Create auth_audit_log table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.auth_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  status text NOT NULL, -- 'success', 'failure', 'warning'
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_auth_audit_log_user_id ON public.auth_audit_log(user_id);
CREATE INDEX idx_auth_audit_log_event_type ON public.auth_audit_log(event_type);
CREATE INDEX idx_auth_audit_log_created_at ON public.auth_audit_log(created_at DESC);
CREATE INDEX idx_auth_audit_log_status ON public.auth_audit_log(status);

COMMENT ON TABLE public.auth_audit_log IS 'Comprehensive audit trail for all authentication events';

-- ==========================================
-- STEP 3: Create auth_mfa_factors table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.auth_mfa_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  factor_type text NOT NULL, -- 'totp', 'sms', 'email'
  secret text, -- Encrypted TOTP secret
  phone_number text,
  email text,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  backup_codes text[], -- Encrypted backup codes
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_factor_type CHECK (factor_type IN ('totp', 'sms', 'email'))
);

-- Indexes
CREATE INDEX idx_auth_mfa_factors_user_id ON public.auth_mfa_factors(user_id);
CREATE INDEX idx_auth_mfa_factors_active ON public.auth_mfa_factors(user_id, is_active);

COMMENT ON TABLE public.auth_mfa_factors IS 'Multi-factor authentication configuration per user';

-- ==========================================
-- STEP 4: Create password_reset_tokens table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  is_used boolean DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour'),
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_valid ON public.password_reset_tokens(is_used, expires_at);

COMMENT ON TABLE public.password_reset_tokens IS 'Secure one-time password reset tokens';

-- ==========================================
-- STEP 5: Create failed_login_attempts table (Rate Limiting)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet NOT NULL,
  attempt_count integer DEFAULT 1,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_email_ip UNIQUE(email, ip_address)
);

-- Indexes
CREATE INDEX idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX idx_failed_login_attempts_ip ON public.failed_login_attempts(ip_address);
CREATE INDEX idx_failed_login_attempts_locked ON public.failed_login_attempts(locked_until);

COMMENT ON TABLE public.failed_login_attempts IS 'Tracks failed login attempts for rate limiting and security';

-- ==========================================
-- STEP 6: Security Functions
-- ==========================================

-- Function: Check password strength
CREATE OR REPLACE FUNCTION public.check_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  score integer := 0;
  feedback text[] := ARRAY[]::text[];
BEGIN
  -- Length check
  IF length(password) >= 12 THEN
    score := score + 25;
  ELSE
    feedback := array_append(feedback, 'Minimum 12 caractères requis');
  END IF;
  
  -- Uppercase check
  IF password ~ '[A-Z]' THEN
    score := score + 20;
  ELSE
    feedback := array_append(feedback, 'Au moins une majuscule requise');
  END IF;
  
  -- Lowercase check
  IF password ~ '[a-z]' THEN
    score := score + 20;
  ELSE
    feedback := array_append(feedback, 'Au moins une minuscule requise');
  END IF;
  
  -- Number check
  IF password ~ '[0-9]' THEN
    score := score + 20;
  ELSE
    feedback := array_append(feedback, 'Au moins un chiffre requis');
  END IF;
  
  -- Special char check
  IF password ~ '[^a-zA-Z0-9]' THEN
    score := score + 15;
  ELSE
    feedback := array_append(feedback, 'Au moins un caractère spécial requis');
  END IF;
  
  result := jsonb_build_object(
    'score', score,
    'is_valid', score = 100,
    'feedback', feedback
  );
  
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.check_password_strength(text) IS 
  'Validates password strength according to security policy';

-- ==========================================

-- Function: Log authentication event
CREATE OR REPLACE FUNCTION public.log_auth_event(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'::jsonb,
  p_status text DEFAULT 'success',
  p_error_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
  v_ip_address inet;
  v_user_agent text;
BEGIN
  -- Extract IP and User-Agent from current request (if available)
  -- This would be set by the application layer
  v_ip_address := current_setting('request.headers.x-forwarded-for', true)::inet;
  v_user_agent := current_setting('request.headers.user-agent', true);
  
  INSERT INTO public.auth_audit_log (
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent,
    status,
    error_message
  )
  VALUES (
    p_user_id,
    p_event_type,
    p_event_data,
    v_ip_address,
    v_user_agent,
    p_status,
    p_error_message
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
EXCEPTION WHEN OTHERS THEN
  -- Silent fail on logging (don't break auth flow)
  RAISE WARNING 'Failed to log auth event: %', SQLERRM;
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.log_auth_event IS 
  'Centralized function to log all authentication events';

-- ==========================================

-- Function: Revoke all user sessions
CREATE OR REPLACE FUNCTION public.revoke_all_sessions(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.auth_sessions
  SET is_active = false,
      updated_at = now()
  WHERE user_id = p_user_id
    AND is_active = true;
    
  -- Log the event
  PERFORM public.log_auth_event(
    p_user_id,
    'sessions_revoked_all',
    jsonb_build_object('revoked_at', now())
  );
END;
$$;

COMMENT ON FUNCTION public.revoke_all_sessions IS 
  'Revokes all active sessions for a user (e.g., on password change)';

-- ==========================================

-- Function: Cleanup expired tokens and sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_auth_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_sessions integer;
  v_deleted_tokens integer;
BEGIN
  -- Delete expired sessions
  DELETE FROM public.auth_sessions
  WHERE expires_at < now()
    OR (is_active = false AND updated_at < now() - interval '30 days');
  
  GET DIAGNOSTICS v_deleted_sessions = ROW_COUNT;
  
  -- Delete expired/used reset tokens
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < now()
    OR (is_used = true AND used_at < now() - interval '7 days');
  
  GET DIAGNOSTICS v_deleted_tokens = ROW_COUNT;
  
  -- Delete old audit logs (keep 1 year)
  DELETE FROM public.auth_audit_log
  WHERE created_at < now() - interval '1 year';
  
  RAISE NOTICE 'Cleanup: % sessions, % tokens deleted', 
    v_deleted_sessions, v_deleted_tokens;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_auth_data IS 
  'Periodic cleanup of expired sessions, tokens, and old audit logs';

-- ==========================================

-- Function: Check if user is rate limited
CREATE OR REPLACE FUNCTION public.is_rate_limited(
  p_email text,
  p_ip_address inet
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt record;
BEGIN
  SELECT * INTO v_attempt
  FROM public.failed_login_attempts
  WHERE email = p_email
    AND ip_address = p_ip_address;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if locked and lock period still active
  IF v_attempt.locked_until IS NOT NULL 
     AND v_attempt.locked_until > now() THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

COMMENT ON FUNCTION public.is_rate_limited IS 
  'Checks if email/IP combination is currently rate limited';

-- ==========================================

-- Function: Record failed login attempt
CREATE OR REPLACE FUNCTION public.record_failed_login(
  p_email text,
  p_ip_address inet
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_attempts integer := 5;
  v_lockout_duration interval := interval '15 minutes';
  v_current_attempts integer;
BEGIN
  INSERT INTO public.failed_login_attempts (email, ip_address, attempt_count)
  VALUES (p_email, p_ip_address, 1)
  ON CONFLICT (email, ip_address) 
  DO UPDATE SET
    attempt_count = failed_login_attempts.attempt_count + 1,
    updated_at = now();
  
  -- Get current attempt count
  SELECT attempt_count INTO v_current_attempts
  FROM public.failed_login_attempts
  WHERE email = p_email AND ip_address = p_ip_address;
  
  -- Lock account if max attempts reached
  IF v_current_attempts >= v_max_attempts THEN
    UPDATE public.failed_login_attempts
    SET locked_until = now() + v_lockout_duration
    WHERE email = p_email AND ip_address = p_ip_address;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.record_failed_login IS 
  'Records failed login attempt and applies rate limiting';

-- ==========================================

-- Function: Reset failed login attempts (on successful login)
CREATE OR REPLACE FUNCTION public.reset_failed_login_attempts(
  p_email text,
  p_ip_address inet
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.failed_login_attempts
  WHERE email = p_email
    AND ip_address = p_ip_address;
END;
$$;

COMMENT ON FUNCTION public.reset_failed_login_attempts IS 
  'Resets failed login counter on successful authentication';

-- ==========================================
-- STEP 7: Triggers
-- ==========================================

-- Trigger: Auto-update updated_at on auth_sessions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_auth_sessions_updated_at
  BEFORE UPDATE ON public.auth_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auth_mfa_factors_updated_at
  BEFORE UPDATE ON public.auth_mfa_factors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- STEP 8: Grant Permissions
-- ==========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- auth_sessions
GRANT SELECT, INSERT, UPDATE ON public.auth_sessions TO authenticated;
GRANT SELECT ON public.auth_sessions TO anon; -- For session validation

-- auth_audit_log
GRANT SELECT, INSERT ON public.auth_audit_log TO authenticated;

-- auth_mfa_factors
GRANT SELECT, INSERT, UPDATE ON public.auth_mfa_factors TO authenticated;

-- password_reset_tokens
GRANT SELECT, INSERT, UPDATE ON public.password_reset_tokens TO authenticated;
GRANT SELECT, INSERT ON public.password_reset_tokens TO anon; -- For password reset flow

-- failed_login_attempts
GRANT SELECT, INSERT, UPDATE ON public.failed_login_attempts TO anon, authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.check_password_strength(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_auth_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_all_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_rate_limited TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_failed_login TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_failed_login_attempts TO anon, authenticated;

COMMIT;

-- ==========================================
-- Migration Complete
-- ==========================================

-- Verification (run manually):
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'auth_%';
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%auth%';
