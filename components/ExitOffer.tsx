'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import HoroscopeSignup from '@/components/HoroscopeSignup';
import type { Locale } from '@/lib/seo';

const KEY = 'ca_exit_seen';
const WEEK = 7 * 24 * 60 * 60 * 1000;

function blocked(path: string): boolean {
  return /^\/(book|call|account|auth|admin)(\/|$)/.test(path)
    || path.includes('/essai')
    || path.includes('/free-trial')
    || path.includes('/prueba')
    || path.includes('/probe')
    || path.includes('/prova');
}

function localeFromPath(path: string): Locale {
  const segment = path.split('/')[1];
  if (segment === 'en' || segment === 'es' || segment === 'de' || segment === 'it') return segment;
  return 'fr';
}

export default function ExitOffer({ trialEnabled }: { trialEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>('fr');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (blocked(path)) return;
    setLocale(localeFromPath(path));
    const seen = Number(localStorage.getItem(KEY) || '0');
    if (seen && Date.now() - seen < WEEK) return;
    let cancelled = false;
    const started = Date.now();
    let maxScroll = 0;
    const mark = () => {
      if (cancelled) return;
      localStorage.setItem(KEY, String(Date.now()));
      setOpen(true);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
    const onLeave = (event: MouseEvent) => {
      if (event.clientY > 0) return;
      mark();
    };
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = height > 0 ? window.scrollY / height : 0;
      if (ratio > maxScroll) maxScroll = ratio;
      if (Date.now() - started > 30_000 && maxScroll >= 0.5 && ratio < maxScroll - 0.2) mark();
    };
    const arm = () => {
      if (cancelled) return;
      document.addEventListener('mouseleave', onLeave);
      window.addEventListener('scroll', onScroll, { passive: true });
    };
    void fetch('/api/auth/me')
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.user?.subscription?.entitled) {
          cancelled = true;
          return;
        }
        arm();
      })
      .catch(() => arm());
    return () => {
      cancelled = true;
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const node = panelRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-offer-title"
        tabIndex={-1}
        className="max-w-md rounded-3xl border border-white/15 bg-[#0c1018] p-6 outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="exit-offer-title" className="font-[family-name:var(--font-cinzel)] text-2xl">
            {trialEnabled
              ? 'Avant de partir : 3 minutes offertes avec une astrologue IA'
              : 'Recevez votre horoscope du matin, gratuit'}
          </h2>
          <button type="button" className="text-white/60" aria-label="Fermer" onClick={() => setOpen(false)}>×</button>
        </div>
        {trialEnabled ? (
          <div className="mt-4 flex gap-3">
            <Link href="/fr/essai" className="btn-primary">Essayer</Link>
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Plus tard</button>
          </div>
        ) : (
          <div className="mt-4">
            <HoroscopeSignup locale={locale} placement="home" />
          </div>
        )}
      </div>
    </div>
  );
}
