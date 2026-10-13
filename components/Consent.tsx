'use client';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsAllowed, type ConsentValue } from '@/lib/consent';
import { isLocale, type Locale } from '@/lib/seo';
import { privacyPath } from '@/lib/privacy-copy';

type Choice = ConsentValue | null;

const ConsentContext = createContext<{ choice: Choice; ready: boolean }>({ choice: null, ready: false });

export function useConsent() {
  return useContext(ConsentContext);
}

function readCookie(): Choice {
  const match = document.cookie.match(/(?:^|; )cl_ck=([^;]*)/);
  const value = match ? decodeURIComponent(match[1]) : '';
  if (value === 'all' || value === 'essential' || value === 'custom-on' || value === 'custom-off') return value;
  return null;
}

async function saveChoice(choice: ConsentValue) {
  const response = await fetch('/api/privacy/choice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choice }),
  });
  if (!response.ok) throw new Error('consent');
}

const COPY: Record<Locale, {
  text: string;
  accept: string;
  refuse: string;
  customise: string;
  analytics: string;
  save: string;
  privacy: string;
}> = {
  fr: {
    text: 'Les cookies cl_vid et cl_ft sont posés à la première visite pour mesurer l’entonnoir (source, référent, page d’arrivée). Vercel Analytics ne se charge qu’avec votre accord. Le site, le paiement et l’appel fonctionnent aussi si vous le refusez.',
    accept: 'Accepter',
    refuse: 'Refuser',
    customise: 'Personnaliser',
    analytics: 'Mesure d’audience Vercel (Analytics et Speed Insights)',
    save: 'Enregistrer mon choix',
    privacy: 'Politique de confidentialité',
  },
  en: {
    text: 'The cl_vid and cl_ft cookies are set on the first visit to measure the funnel (source, referrer, landing page). Vercel Analytics loads only with your agreement. The site, payment and the call work if you refuse it.',
    accept: 'Accept',
    refuse: 'Refuse',
    customise: 'Customise',
    analytics: 'Vercel audience measurement (Analytics and Speed Insights)',
    save: 'Save my choice',
    privacy: 'Privacy policy',
  },
  es: {
    text: 'Las cookies cl_vid y cl_ft se colocan en la primera visita para medir el embudo (fuente, referente, página de llegada). Vercel Analytics solo se carga con su acuerdo. El sitio, el pago y la llamada funcionan si lo rechaza.',
    accept: 'Aceptar',
    refuse: 'Rechazar',
    customise: 'Personalizar',
    analytics: 'Medición de audiencia Vercel (Analytics y Speed Insights)',
    save: 'Guardar mi elección',
    privacy: 'Política de privacidad',
  },
  de: {
    text: 'Die Cookies cl_vid und cl_ft werden beim ersten Besuch gesetzt, um den Trichter zu messen (Quelle, Referrer, Einstiegsseite). Vercel Analytics startet nur mit Ihrer Zustimmung. Website, Zahlung und Anruf funktionieren auch ohne.',
    accept: 'Akzeptieren',
    refuse: 'Ablehnen',
    customise: 'Anpassen',
    analytics: 'Vercel-Reichweitenmessung (Analytics und Speed Insights)',
    save: 'Auswahl speichern',
    privacy: 'Datenschutz',
  },
  it: {
    text: 'I cookie cl_vid e cl_ft vengono impostati alla prima visita per misurare il percorso (fonte, referrer, pagina di arrivo). Vercel Analytics parte solo con il tuo consenso. Il sito, il pagamento e la chiamata funzionano anche se rifiuti.',
    accept: 'Accetta',
    refuse: 'Rifiuta',
    customise: 'Personalizza',
    analytics: 'Misurazione Vercel (Analytics e Speed Insights)',
    save: 'Salva la scelta',
    privacy: 'Informativa privacy',
  },
};

function localeFromPath(path: string): Locale {
  const segment = path.split('/')[1] || '';
  return isLocale(segment) ? segment : 'fr';
}

const buttonClass =
  'w-full rounded-full border border-white/40 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20';

export function ConsentRoot({ children }: { children: React.ReactNode }) {
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [pending, setPending] = useState(false);
  const pathname = usePathname() || '/';
  const locale = localeFromPath(pathname);
  const copy = COPY[locale];

  useEffect(() => {
    const current = readCookie();
    setChoice(current);
    setAnalytics(current === 'all' || current === 'custom-on');
    setReady(true);
    setOpen(current === null);
  }, []);

  useEffect(() => {
    const reopen = () => {
      setPanel(true);
      setOpen(true);
    };
    window.addEventListener('cl-consent-open', reopen);
    return () => window.removeEventListener('cl-consent-open', reopen);
  }, []);

  const apply = async (next: ConsentValue) => {
    setPending(true);
    try {
      await saveChoice(next);
      setChoice(next);
      setAnalytics(next === 'all' || next === 'custom-on');
      setOpen(false);
      setPanel(false);
    } catch {
      setOpen(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <ConsentContext.Provider value={{ choice, ready }}>
      {children}
      {ready && analyticsAllowed(choice) && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
      {ready && open && (
        <div className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4">
          <div
            role="dialog"
            aria-labelledby="cookie-title"
            className="mx-auto max-w-3xl rounded-2xl border border-white/20 bg-[#121826] p-4 shadow-2xl"
          >
            <p id="cookie-title" className="text-sm leading-relaxed text-white">
              {copy.text}{' '}
              <a href={privacyPath(locale)} className="underline text-celestial-gold">
                {copy.privacy}
              </a>
            </p>
            {panel && (
              <label className="mt-3 flex items-start gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                />
                <span>{copy.analytics}</span>
              </label>
            )}
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button type="button" className={buttonClass} disabled={pending} onClick={() => void apply('essential')}>
                {copy.refuse}
              </button>
              {panel ? (
                <button
                  type="button"
                  className={buttonClass}
                  disabled={pending}
                  onClick={() => void apply(analytics ? 'custom-on' : 'custom-off')}
                >
                  {copy.save}
                </button>
              ) : (
                <button type="button" className={buttonClass} disabled={pending} onClick={() => setPanel(true)}>
                  {copy.customise}
                </button>
              )}
              <button type="button" className={buttonClass} disabled={pending} onClick={() => void apply('all')}>
                {copy.accept}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConsentContext.Provider>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="underline hover:text-white"
      onClick={() => window.dispatchEvent(new Event('cl-consent-open'))}
    >
      {label}
    </button>
  );
}
