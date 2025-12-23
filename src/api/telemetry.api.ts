import { requireSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import type { ApiResponse } from '@/types';

type ConsentPayload = {
  user_id?: string | null;
  device_id: string;
  consent_analytics: boolean;
  consent_marketing: boolean;
  consent_necessary: boolean;
  consent_version: string;
  source?: string;
};

type SessionPayload = {
  user_id?: string | null;
  device_id: string;
  session_id: string;
  user_agent?: string;
  browser_name?: string;
  os_name?: string;
  device_type?: string;
};

type PageViewPayload = {
  user_id?: string | null;
  device_id: string;
  session_id: string;
  path: string;
  title?: string;
  referrer?: string;
  query?: string;
  navigation_type?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

type EventPayload = {
  user_id?: string | null;
  device_id: string;
  session_id: string;
  event_name: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  properties?: Record<string, unknown>;
};

type ClientLogPayload = {
  user_id?: string | null;
  device_id: string;
  session_id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
};

export const upsertTelemetryConsent = async (payload: ConsentPayload): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' }, success: false };
  }

  const client = requireSupabaseClient();
  const { error } = await client.from('telemetry_consents').insert(payload);

  if (error) {
    return { data: null, error: { code: error.code, message: error.message }, success: false };
  }

  return { data: null, error: null, success: true };
};

export const createTelemetrySession = async (payload: SessionPayload): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' }, success: false };
  }

  const client = requireSupabaseClient();
  const { error } = await client.from('telemetry_sessions').insert(payload);

  if (error) {
    return { data: null, error: { code: error.code, message: error.message }, success: false };
  }

  return { data: null, error: null, success: true };
};

export const createTelemetryPageView = async (payload: PageViewPayload): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' }, success: false };
  }

  const client = requireSupabaseClient();
  const { error } = await client.from('telemetry_page_views').insert(payload);

  if (error) {
    return { data: null, error: { code: error.code, message: error.message }, success: false };
  }

  return { data: null, error: null, success: true };
};

export const createTelemetryEvent = async (payload: EventPayload): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' }, success: false };
  }

  const client = requireSupabaseClient();
  const { error } = await client.from('telemetry_events').insert(payload);

  if (error) {
    return { data: null, error: { code: error.code, message: error.message }, success: false };
  }

  return { data: null, error: null, success: true };
};

export const createTelemetryClientLog = async (payload: ClientLogPayload): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' }, success: false };
  }

  const client = requireSupabaseClient();
  const { error } = await client.from('telemetry_client_logs').insert(payload);

  if (error) {
    return { data: null, error: { code: error.code, message: error.message }, success: false };
  }

  return { data: null, error: null, success: true };
};

export const createTelemetrySessionViaEdge = async (payload: SessionPayload): Promise<ApiResponse<null>> => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { code: 'NOT_CONFIGURED', message: 'Supabase is not configured' }, success: false };
  }

  const client = requireSupabaseClient();

  try {
    const { error } = await client.functions.invoke('telemetry', {
      body: { action: 'session_start', payload },
    });

    if (error) {
      return { data: null, error: { code: 'FUNCTION_ERROR', message: error.message }, success: false };
    }

    return { data: null, error: null, success: true };
  } catch (e: any) {
    return { data: null, error: { code: 'FUNCTION_ERROR', message: e?.message || 'Unknown error' }, success: false };
  }
};
