'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { postEvent } from '@/lib/funnel-client';
import type { SkyNowLocale, SkyNowReading } from '@/lib/sky-now';

export const SKY_NOW_DATE_KEY = 'cl_birth_date';

const COPY: Record<SkyNowLocale, {
  label: string; submit: string; loading: string; error: string; cusp: string; cta: string; ctaSub: string; computed: string; again: string;
}> = {
  fr: {
    label: 'Votre date de naissance',
    submit: 'Voir mon ciel maintenant',
    loading: 'Calcul du ciel…',
    error: 'Date invalide ou service momentanément indisponible. Réessayez.',
    cusp: 'Né·e à un changement de signe : l’heure de naissance peut faire basculer le signe solaire.',
    cta: 'Poser ma question — 3 min offertes',
    ctaSub: 'Sans carte bancaire · sans e-mail avant l’appel',
    computed: 'Positions calculées à l’instant (éphémérides), pas un texte générique.',
    again: 'Autre date',
  },
  en: {
    label: 'Your date of birth',
    submit: 'See my sky right now',
    loading: 'Computing the sky…',
    error: 'Invalid date or service briefly unavailable. Please try again.',
    cusp: 'Born on a sign change: your birth time can tip the Sun sign.',
    cta: 'Ask my question — 3 free minutes',
    ctaSub: 'No card · no email before the call',
    computed: 'Positions computed right now (ephemeris), not a generic text.',
    again: 'Another date',
  },
};

/** Premier pas sans friction : date de naissance → mini-lecture du ciel réel, avant tout compte. */
export default function SkyNowHero({ locale, trialHref, disclosure }: { locale: SkyNowLocale; trialHref: string; disclosure: string }) {
  const t = COPY[locale];
  const [date, setDate] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [reading, setReading] = useState<SkyNowReading | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reading) box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [reading]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!date) return;
    setPending(true);
    setError('');
    postEvent('cta_click', { metadata: { action: 'mini_reading_submit', source: window.location.pathname.slice(0, 80) } });
    try {
      const response = await fetch('/api/sky-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, locale }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.reading) throw new Error('fail');
      setReading(payload.reading as SkyNowReading);
      try {
        sessionStorage.setItem(SKY_NOW_DATE_KEY, date);
      } catch {
        /* stockage indisponible */
      }
      postEvent('cta_click', { metadata: { action: 'mini_reading_shown', sign: (payload.reading as SkyNowReading).sign } });
    } catch {
      setError(t.error);
    } finally {
      setPending(false);
    }
  };

  if (reading) {
    return (
      <div ref={box} className="mt-5 scroll-mt-20 rounded-2xl border border-celestial-gold/30 bg-white/5 p-4 sm:p-5" aria-live="polite" data-sky-reading>
        <h2 className="font-[family-name:var(--font-cinzel)] text-xl text-celestial-gold">{reading.headline}</h2>
        <p className="mt-3 text-sm text-white/85 leading-relaxed">{reading.lines[0]}</p>
        <p className="mt-3 text-sm italic text-white/75">« {reading.question} »</p>
        <Link href={trialHref} data-cta="mini-reading" className="btn-primary cta-pulse mt-4 block text-center w-full sm:w-auto sm:inline-block">
          {t.cta}
        </Link>
        <p className="mt-2 text-xs text-white/60">{t.ctaSub} · {disclosure}</p>
        {reading.lines.slice(1).map((line) => (
          <p key={line} className="mt-4 text-sm text-white/75 leading-relaxed">{line}</p>
        ))}
        {reading.cusp && <p className="mt-2 text-xs text-white/60">{t.cusp}</p>}
        <p className="mt-2 text-[11px] text-white/45">{t.computed}</p>
        <button type="button" onClick={() => setReading(null)} className="mt-2 text-xs text-white/55 underline">{t.again}</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4" data-sky-form>
      <label htmlFor="sky-now-date" className="block text-sm text-white/80">{t.label}</label>
      <input
        id="sky-now-date"
        type="date"
        required
        min="1900-01-01"
        max={new Date().toISOString().slice(0, 10)}
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-base text-white [color-scheme:dark]"
      />
      <button type="submit" disabled={pending} data-cta="mini-reading-submit" className="btn-primary cta-pulse mt-3 w-full">
        {pending ? t.loading : t.submit}
      </button>
      {error && <p className="mt-2 text-sm text-red-200" role="alert">{error}</p>}
    </form>
  );
}
