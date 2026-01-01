// ============================================
// Supabase Client - Centralized Configuration
// oyaboug Platform - Anti-gaspillage alimentaire
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate configuration
const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY;

if (!isConfigured && import.meta.env.DEV) {
  console.warn(
    '[oyaboug] Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

// Create singleton Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: localStorage,
      },
    });
  }

  return supabaseInstance;
};

// Export default client instance
export const supabaseClient = getSupabaseClient();

// Check if Supabase is configured and available
export const isSupabaseConfigured = (): boolean => isConfigured;

// Helper to ensure client is available before operations
export const requireSupabaseClient = (): SupabaseClient => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase client is not configured. Please set environment variables.'
    );
  }
  return client;
};
