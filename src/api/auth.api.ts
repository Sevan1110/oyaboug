// ============================================
// Auth API - Authentication Operations
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { supabaseClient, requireSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { API_ROUTES } from './routes';
import type { AuthCredentials, SignUpData, ApiResponse, User, UserRole } from '@/types';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  credentials: AuthCredentials
): Promise<ApiResponse<{ user: User; session: unknown }>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return {
      data: null,
      error: { code: error.name, message: error.message },
      success: false,
    };
  }

  return {
    data: {
      user: data.user as unknown as User,
      session: data.session,
    },
    error: null,
    success: true,
  };
};

/**
 * Sign up with email, password, and additional data
 */
export const signUpWithEmail = async (
  signUpData: SignUpData
): Promise<ApiResponse<{ user: User; session: unknown }>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const redirectUrl = `${window.location.origin}/auth`;

  try {
    const { data, error } = await client.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: signUpData.full_name,
          phone: signUpData.phone,
          role: signUpData.role,
          business_name: signUpData.business_name,
        },
      },
    });

    if (error) {
      return {
        data: null,
        error: { code: error.name, message: error.message },
        success: false,
      };
    }

    // Si l'email nécessite une confirmation, data.session sera null
    // mais data.user existe quand même
    return {
      data: {
        user: data.user as unknown as User,
        session: data.session,
      },
      error: null,
      success: true,
    };
  } catch (err) {
    // Gestion des erreurs réseau ou autres erreurs inattendues
    const errorMessage = err instanceof Error ? err.message : 'Une erreur réseau est survenue';
    return {
      data: null,
      error: { code: 'NETWORK_ERROR', message: errorMessage },
      success: false,
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { error } = await client.auth.signOut();

  if (error) {
    return {
      data: null,
      error: { code: error.name, message: error.message },
      success: false,
    };
  }

  return { data: null, error: null, success: true };
};

/**
 * Get current session
 */
export const getSession = async () => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const client = requireSupabaseClient();
  return client.auth.getSession();
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const client = requireSupabaseClient();
  return client.auth.getUser();
};

/**
 * Reset password
 */
export const resetPassword = async (
  email: string
): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset`,
  });

  if (error) {
    return {
      data: null,
      error: { code: error.name, message: error.message },
      success: false,
    };
  }

  return { data: null, error: null, success: true };
};

/**
 * Update password
 */
export const updatePassword = async (
  newPassword: string
): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      data: null,
      error: { code: error.name, message: error.message },
      success: false,
    };
  }

  return { data: null, error: null, success: true };
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (
  callback: (event: string, session: unknown) => void
) => {
  if (!isSupabaseConfigured()) {
    return { data: { subscription: { unsubscribe: () => { } } } };
  }

  const client = requireSupabaseClient();
  return client.auth.onAuthStateChange(callback);
};

/**
 * Sign in with OTP (phone or email)
 */
export const signInWithOtp = async (
  identifier: string,
  type: 'email' | 'phone' = 'email'
): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const options = type === 'email'
    ? { email: identifier }
    : { phone: identifier };

  const { error } = await client.auth.signInWithOtp(options);

  if (error) {
    return {
      data: null,
      error: { code: error.name, message: error.message },
      success: false,
    };
  }

  return { data: null, error: null, success: true };
};

/**
 * Verify OTP
 */
export const verifyOtp = async (
  identifier: string,
  token: string,
  type: 'email' | 'phone' = 'email'
): Promise<ApiResponse<{ user: User; session: unknown }>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const options = type === 'email'
    ? { email: identifier, token, type: 'email' as const }
    : { phone: identifier, token, type: 'sms' as const };

  const { data, error } = await client.auth.verifyOtp(options);

  if (error) {
    return {
      data: null,
      error: { code: error.name, message: error.message },
      success: false,
    };
  }

  return {
    data: {
      user: data.user as unknown as User,
      session: data.session,
    },
    error: null,
    success: true,
  };
};

/**
 * Update user attributes (metadata, email, password, etc.)
 */
export const updateUser = async (
  attributes: {
    email?: string;
    password?: string;
    data?: object; // user_metadata
  }
): Promise<ApiResponse<{ user: User | null }>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { data, error } = await client.auth.updateUser(attributes);

  if (error) {
    return {
      data: null,
      error: { code: error.name, message: error.message },
      success: false,
    };
  }

  return {
    data: { user: data.user as unknown as User },
    error: null,
    success: true,
  };
};
