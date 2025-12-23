import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { requireSupabaseClient, isSupabaseConfigured } from '@/api';
import { saveConsent, startSession, startSessionWithIp, trackClientLog, trackPageView } from '@/services/telemetry.service';
import { readConsent } from '@/components/telemetry/CookieConsentBanner';

function safeRandomId(): string {
  const g: any = globalThis as any;
  if (g?.crypto?.randomUUID) return g.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getOrCreateLocalId(key: string): string {
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = safeRandomId();
  localStorage.setItem(key, created);
  return created;
}

function parseUa(ua: string): { browser: string; os: string; device: string } {
  const lower = ua.toLowerCase();
  const browser = lower.includes('edg/')
    ? 'Edge'
    : lower.includes('chrome/')
      ? 'Chrome'
      : lower.includes('safari/')
        ? 'Safari'
        : lower.includes('firefox/')
          ? 'Firefox'
          : 'Other';

  const os = lower.includes('windows')
    ? 'Windows'
    : lower.includes('android')
      ? 'Android'
      : lower.includes('iphone') || lower.includes('ipad')
        ? 'iOS'
        : lower.includes('mac os')
          ? 'macOS'
          : 'Other';

  const device = lower.includes('mobile') ? 'mobile' : 'desktop';
  return { browser, os, device };
}

export default function TelemetryProvider(props: { children: React.ReactNode }) {
  const location = useLocation();
  const deviceId = useMemo(() => getOrCreateLocalId('sf_device_id'), []);
  const sessionId = useMemo(() => safeRandomId(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const client = requireSupabaseClient();

    client.auth.getUser().then(({ data }) => {
      setUserId((data?.user?.id as string) || null);
    });

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUserId((session?.user?.id as string) || null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const c = readConsent();
    if (!c) return;

    void saveConsent({
      user_id: userId,
      device_id: deviceId,
      consent_analytics: c.analytics,
      consent_marketing: c.marketing,
      consent_necessary: c.necessary,
      consent_version: c.version,
      source: 'banner',
    });
  }, [deviceId, userId]);

  useEffect(() => {
    const c = readConsent();
    if (!c?.analytics) return;
    if (hasStarted.current) return;

    hasStarted.current = true;

    const ua = navigator.userAgent || '';
    const parsed = parseUa(ua);

    const payload = {
      user_id: userId,
      device_id: deviceId,
      session_id: sessionId,
      user_agent: ua,
      browser_name: parsed.browser,
      os_name: parsed.os,
      device_type: parsed.device,
    };

    void startSession(payload);
    void startSessionWithIp(payload);
  }, [deviceId, sessionId, userId]);

  useEffect(() => {
    const c = readConsent();
    if (!c?.analytics) return;

    const search = location.search || '';
    const params = new URLSearchParams(search);

    const utm_source = params.get('utm_source') || undefined;
    const utm_medium = params.get('utm_medium') || undefined;
    const utm_campaign = params.get('utm_campaign') || undefined;

    void trackPageView({
      user_id: userId,
      device_id: deviceId,
      session_id: sessionId,
      path: location.pathname,
      title: document.title,
      referrer: document.referrer || undefined,
      query: search || undefined,
      navigation_type: 'spa',
      utm_source,
      utm_medium,
      utm_campaign,
    });
  }, [location.pathname, location.search, deviceId, sessionId, userId]);

  useEffect(() => {
    const c = readConsent();
    if (!c?.analytics) return;

    const onError = (event: ErrorEvent) => {
      void trackClientLog({
        user_id: userId,
        device_id: deviceId,
        session_id: sessionId,
        level: 'error',
        message: event.message || 'Unhandled error',
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason: any = event.reason;
      void trackClientLog({
        user_id: userId,
        device_id: deviceId,
        session_id: sessionId,
        level: 'error',
        message: reason?.message || 'Unhandled rejection',
        stack: reason?.stack,
        context: { reason },
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [deviceId, sessionId, userId]);

  return <>{props.children}</>;
}
