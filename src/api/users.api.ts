// ============================================
// Users API - User Management Operations
// SaveFood Platform - Anti-gaspillage alimentaire
// ============================================

import { supabaseClient, requireSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { DB_TABLES } from './routes';
import type { ApiResponse, UserProfile, UserPreferences, UserImpact } from '@/types';

/**
 * Get user profile by ID
 */
export const getUserProfile = async (
  userId: string
): Promise<ApiResponse<UserProfile>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { data, error } = await client
    .from(DB_TABLES.PROFILES)
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: { code: error.code, message: error.message },
      success: false,
    };
  }

  return {
    data: data as UserProfile,
    error: null,
    success: true,
  };
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<ApiResponse<UserProfile>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { data, error } = await client
    .from(DB_TABLES.PROFILES)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: { code: error.code, message: error.message },
      success: false,
    };
  }

  return {
    data: data as UserProfile,
    error: null,
    success: true,
  };
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (
  userId: string
): Promise<ApiResponse<UserPreferences>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { data, error } = await client
    .from(DB_TABLES.PROFILES)
    .select('preferences')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: { code: error.code, message: error.message },
      success: false,
    };
  }

  return {
    data: data?.preferences as UserPreferences,
    error: null,
    success: true,
  };
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<ApiResponse<UserPreferences>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  
  // First get current preferences
  const { data: current } = await client
    .from(DB_TABLES.PROFILES)
    .select('preferences')
    .eq('id', userId)
    .maybeSingle();

  const updatedPreferences = {
    ...current?.preferences,
    ...preferences,
  };

  const { data, error } = await client
    .from(DB_TABLES.PROFILES)
    .update({ preferences: updatedPreferences })
    .eq('id', userId)
    .select('preferences')
    .single();

  if (error) {
    return {
      data: null,
      error: { code: error.code, message: error.message },
      success: false,
    };
  }

  return {
    data: data.preferences as UserPreferences,
    error: null,
    success: true,
  };
};

/**
 * Get user's favorite merchants
 */
export const getUserFavorites = async (
  userId: string
): Promise<ApiResponse<string[]>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { data, error } = await client
    .from(DB_TABLES.FAVORITES)
    .select('merchant_id')
    .eq('user_id', userId);

  if (error) {
    return {
      data: null,
      error: { code: error.code, message: error.message },
      success: false,
    };
  }

  return {
    data: data?.map((f) => f.merchant_id) || [],
    error: null,
    success: true,
  };
};

/**
 * Add merchant to favorites
 */
export const addToFavorites = async (
  userId: string,
  merchantId: string
): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { error } = await client
    .from(DB_TABLES.FAVORITES)
    .insert({ user_id: userId, merchant_id: merchantId });

  if (error) {
    return {
      data: null,
      error: { code: error.code, message: error.message },
      success: false,
    };
  }

  return { data: null, error: null, success: true };
};

/**
 * Remove merchant from favorites
 */
export const removeFromFavorites = async (
  userId: string,
  merchantId: string
): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { error } = await client
    .from(DB_TABLES.FAVORITES)
    .delete()
    .eq('user_id', userId)
    .eq('merchant_id', merchantId);

  if (error) {
    return {
      data: null,
      error: { code: error.code, message: error.message },
      success: false,
    };
  }

  return { data: null, error: null, success: true };
};

/**
 * Get user impact statistics
 */
export const getUserImpact = async (
  userId: string
): Promise<ApiResponse<UserImpact>> => {
  if (!isSupabaseConfigured()) {
    return {
      data: null,
      error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' },
      success: false,
    };
  }

  const client = requireSupabaseClient();
  const { data, error } = await client
    .from(DB_TABLES.IMPACT_LOGS)
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return {
      data: null,
      error: { code: error.code, message: error.message },
      success: false,
    };
  }

  // Aggregate impact data
  const impact: UserImpact = {
    user_id: userId,
    food_saved_kg: data?.reduce((sum, log) => sum + (log.food_saved_kg || 0), 0) || 0,
    money_saved_xaf: data?.reduce((sum, log) => sum + (log.money_saved_xaf || 0), 0) || 0,
    co2_avoided_kg: data?.reduce((sum, log) => sum + (log.co2_avoided_kg || 0), 0) || 0,
    orders_count: data?.length || 0,
    favorite_merchants: [],
  };

  return {
    data: impact,
    error: null,
    success: true,
  };
};
