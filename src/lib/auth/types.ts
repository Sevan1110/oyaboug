// ==========================================
// Auth Types - Type Definitions for Auth V2
// ==========================================

import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

/**
 * Auth Session with multi-device support
 */
export interface AuthSession {
    id: string;
    user_id: string;
    token_hash: string;
    device_info: DeviceInfo;
    ip_address: string | null;
    user_agent: string | null;
    is_active: boolean;
    last_activity: string;
    expires_at: string;
    created_at: string;
    updated_at: string;
}

export interface DeviceInfo {
    browser?: string;
    os?: string;
    device_type?: 'desktop' | 'mobile' | 'tablet';
    device_name?: string;
}

/**
 * Auth Audit Log Entry
 */
export interface AuthAuditLog {
    id: string;
    user_id: string | null;
    event_type: AuthEventType;
    event_data: Record<string, unknown>;
    ip_address: string | null;
    user_agent: string | null;
    status: 'success' | 'failure' | 'warning';
    error_message: string | null;
    created_at: string;
}

export type AuthEventType =
    | 'login_success'
    | 'login_failure'
    | 'logout'
    | 'signup'
    | 'password_change'
    | 'password_reset_request'
    | 'password_reset_complete'
    | 'mfa_enabled'
    | 'mfa_disabled'
    | 'mfa_verified'
    | 'mfa_failed'
    | 'session_created'
    | 'session_revoked'
    | 'email_verification'
    | 'account_locked'
    | 'account_unlocked';

/**
 * MFA Factor
 */
export interface MFAFactor {
    id: string;
    user_id: string;
    factor_type: 'totp' | 'sms' | 'email';
    secret?: string;
    phone_number?: string;
    email?: string;
    is_verified: boolean;
    is_active: boolean;
    backup_codes?: string[];
    last_used_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Password Reset Token
 */
export interface PasswordResetToken {
    id: string;
    user_id: string;
    token_hash: string;
    is_used: boolean;
    expires_at: string;
    used_at: string | null;
    created_at: string;
}

/**
 * Failed Login Attempts (Rate Limiting)
 */
export interface FailedLoginAttempt {
    id: string;
    email: string;
    ip_address: string;
    attempt_count: number;
    locked_until: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Password Strength Result
 */
export interface PasswordStrength {
    score: number; // 0-100
    is_valid: boolean;
    feedback: string[];
    strength_label: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
    estimated_crack_time: string;
}

/**
 * Auth Credentials
 */
export interface SignInCredentials {
    email: string;
    password: string;
    mfa_token?: string;
    remember_me?: boolean;
}

export interface SignUpCredentials {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
    role?: 'user' | 'merchant' | 'admin';
    business_name?: string;
}

/**
 * Password Change
 */
export interface PasswordChangeRequest {
    current_password: string;
    new_password: string;
}

/**
 * MFA Setup Request
 */
export interface MFASetupRequest {
    factor_type: 'totp' | 'sms' | 'email';
    phone_number?: string;
    email?: string;
}

export interface MFASetupResponse {
    factor_id: string;
    secret?: string; // For TOTP
    qr_code_url?: string; // For TOTP
    backup_codes: string[];
}

/**
 * Session Info for display
 */
export interface SessionInfo {
    id: string;
    device: string;
    location: string;
    ip_address: string;
    is_current: boolean;
    last_activity: Date;
    created_at: Date;
}

/**
 * User with extended auth info
 */
export interface UserWithAuth extends SupabaseUser {
    mfa_enabled: boolean;
    active_sessions_count: number;
    last_login_at: string | null;
    account_locked: boolean;
}

/**
 * Auth State
 */
export interface AuthState {
    user: UserWithAuth | null;
    session: SupabaseSession | null;
    loading: boolean;
    mfa_required: boolean;
    mfa_verified: boolean;
}

/**
 * Rate Limit Status
 */
export interface RateLimitStatus {
    is_limited: boolean;
    attempts_remaining: number;
    retry_after: Date | null;
    message: string;
}

export { SupabaseUser, SupabaseSession };
