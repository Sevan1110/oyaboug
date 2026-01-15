// ============================================
// Supabase Client - Centralized Configuration
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
// Environment variables for Supabase connection
const getEnv = (key: string) => {
  let value = '';
  // Try Vite env vars
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (key === 'SUPABASE_URL') value = import.meta.env.VITE_SUPABASE_URL;
    if (key === 'SUPABASE_ANON_KEY') value = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  // Try Next.js/Node env vars safely
  if (!value && typeof process !== 'undefined' && process.env) {
    if (key === 'SUPABASE_URL') value = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (key === 'SUPABASE_ANON_KEY') value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  }

  return value;
};

const SUPABASE_URL = getEnv('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') || '';

console.log('🔍 [Supabase Client Debug]');
console.log('  URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 40)}...` : '❌ MISSING');
console.log('  Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 30)}...` : '❌ MISSING');

// Validate configuration
const isConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Check if we are in development mode safely
const isDev = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV);

if (!isConfigured && isDev) {
  console.warn(
    '[ouyaboung] Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
}

// Create singleton Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    console.log('🔧 Creating Supabase client instance...');
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
    console.log('✅ Supabase client created successfully');
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
