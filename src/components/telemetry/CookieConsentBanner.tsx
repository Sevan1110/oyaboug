import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ConsentState = {
  analytics: boolean;
  marketing: boolean;
  necessary: boolean;
  version: string;
};

const CONSENT_COOKIE = 'sf_consent_v1';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function readConsent(): ConsentState | null {
  const raw = getCookie(CONSENT_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as ConsentState;
  } catch {
    return null;
  }
}

export function writeConsent(consent: ConsentState) {
  setCookie(CONSENT_COOKIE, JSON.stringify(consent), 180);
}

export default function CookieConsentBanner(props: {
  onConsentChange: (consent: ConsentState) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!readConsent());
  }, []);

  if (!open) return null;

  const acceptAll = () => {
    const consent: ConsentState = { analytics: true, marketing: true, necessary: true, version: 'v1' };
    writeConsent(consent);
    props.onConsentChange(consent);
    setOpen(false);
  };

  const rejectAll = () => {
    const consent: ConsentState = { analytics: false, marketing: false, necessary: true, version: 'v1' };
    writeConsent(consent);
    props.onConsentChange(consent);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="mx-auto max-w-3xl">
        <Card className="border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-foreground">
              Nous utilisons des cookies et traceurs pour améliorer votre expérience et mesurer l'audience.
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={rejectAll}>
                Refuser
              </Button>
              <Button onClick={acceptAll}>Accepter</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
