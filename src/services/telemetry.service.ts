import type { ApiResponse } from '@/types';
import {
  upsertTelemetryConsent,
  createTelemetrySession,
  createTelemetryPageView,
  createTelemetryEvent,
  createTelemetryClientLog,
  createTelemetrySessionViaEdge,
} from '@/api/telemetry.api';

export const saveConsent = async (payload: Parameters<typeof upsertTelemetryConsent>[0]): Promise<ApiResponse<null>> => {
  return upsertTelemetryConsent(payload);
};

export const startSession = async (payload: Parameters<typeof createTelemetrySession>[0]): Promise<ApiResponse<null>> => {
  return createTelemetrySession(payload);
};

export const startSessionWithIp = async (
  payload: Parameters<typeof createTelemetrySessionViaEdge>[0]
): Promise<ApiResponse<null>> => {
  return createTelemetrySessionViaEdge(payload);
};

export const trackPageView = async (
  payload: Parameters<typeof createTelemetryPageView>[0]
): Promise<ApiResponse<null>> => {
  return createTelemetryPageView(payload);
};

export const trackEvent = async (payload: Parameters<typeof createTelemetryEvent>[0]): Promise<ApiResponse<null>> => {
  return createTelemetryEvent(payload);
};

export const trackClientLog = async (
  payload: Parameters<typeof createTelemetryClientLog>[0]
): Promise<ApiResponse<null>> => {
  return createTelemetryClientLog(payload);
};
