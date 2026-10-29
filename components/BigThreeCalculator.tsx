'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import HoneypotField from '@/components/HoneypotField';
import { HONEYPOT_FIELD } from '@/lib/form-checks';
import type { BigThreeCopy } from '@/lib/free-tools-copy';

export interface SignInfo { name: string; element: string; modality: string; href: string | null; risingHref: string | null }

const inputClass =
  'mt-1 w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-gold focus:ring-2 focus:ring-celestial-gold/40';

type Result = { sign: string; sunSign: string; moonSign: string; placeLabel: string };

export default function BigThreeCalculator({ copy, signs }: { copy: BigThreeCopy; signs: Record<string, SignInfo> }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/ascendant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, place, [HONEYPOT_FIELD]: trap }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const code = (data?.error as keyof BigThreeCopy['errors']) || 'FAIL';
        setError(copy.errors[code] ?? copy.errors.FAIL);
        setResult(null);
      } else {
        setResult(data as Result);
      }
    } catch {
      setError(copy.errors.FAIL);
    } finally {
      setBusy(false);
    }
  }

  const rows: [string, string, string, 'sign' | 'rising'][] = result
    ? [
        [copy.sun, result.sunSign, copy.sunMeaning, 'sign'],
        [copy.moon, result.moonSign, copy.moonMeaning, 'sign'],
        [copy.rising, result.sign, copy.risingMeaning, 'rising'],
      ]
    : [];

  return (
    <div>
      <form onSubmit={submit} className="relative grid gap-4 rounded-3xl border border-white/15 bg-white/5 p-5 sm:p-6">
        <HoneypotField value={trap} onChange={setTrap} />
        <label className="text-sm text-white/80">{copy.form.date}
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </label>
        <label className="text-sm text-white/80">{copy.form.time}
          <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
          <span className="mt-1 block text-xs text-white/50">{copy.form.timeHint}</span>
        </label>
        <label className="text-sm text-white/80">{copy.form.place}
          <input type="text" required minLength={2} maxLength={80} value={place} placeholder={copy.form.placePlaceholder} onChange={(e) => setPlace(e.target.value)} className={inputClass} />
        </label>
        <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? copy.form.submitting : copy.form.submit}</button>
        <p className="text-xs text-white/50">{copy.privacy}</p>
        {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      </form>

      {result ? (
        <section aria-live="polite" className="mt-6 grid gap-3 sm:grid-cols-3" data-reveal>
          {rows.map(([label, french, meaning, kind]) => {
            const info = signs[french];
            const href = kind === 'rising' ? info?.risingHref : info?.href;
            return (
              <div key={label} className="card-glow rounded-2xl border border-celestial-gold/30 bg-celestial-purple/10 p-4">
                <p className="text-xs uppercase tracking-widest text-celestial-gold">{label}</p>
                <p className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl">{info?.name ?? french}</p>
                {info ? <p className="mt-1 text-xs text-white/60">{copy.element} : {info.element} · {copy.modality} : {info.modality}</p> : null}
                <p className="mt-2 text-sm text-white/75">{meaning}</p>
                {href ? <Link href={href} className="mt-2 inline-block text-xs underline text-white/70">{info?.name} →</Link> : null}
              </div>
            );
          })}
          <p className="sm:col-span-3 text-sm text-white/80">{result.placeLabel} — {copy.resultNext}</p>
        </section>
      ) : null}
    </div>
  );
}
