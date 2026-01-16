// ============================================
// Supabase Client - Centralized Configuration
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔍 [Supabase Client Debug]', {
    urlProvided: !!SUPABASE_URL,
    keyProvided: !!SUPABASE_ANON_KEY,
  });
}

// Validate configuration
const isConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Create singleton Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    console.log('🔧 Creating Supabase Browser Client (SSR-compatible)...');

    // createBrowserClient from @supabase/ssr automatically handles cookies
    supabaseInstance = createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    console.log('✅ Supabase Browser Client created successfully');
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
