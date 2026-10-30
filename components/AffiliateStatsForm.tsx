'use client';

import { useState, type FormEvent } from 'react';
import type { AffiliateExtraCopy } from '@/lib/affiliate-extra-copy';

const inputClass =
  'mt-1 w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-gold focus:ring-2 focus:ring-celestial-gold/40';

interface Stats { clicks: number; signups: number; sales: number; due: Record<string, number>; paid: Record<string, number> }

function money(map: Record<string, number>, locale: string): string {
  const entries = Object.entries(map);
  if (!entries.length) return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(0);
  return entries.map(([cur, cents]) => new Intl.NumberFormat(locale, { style: 'currency', currency: cur.toUpperCase() }).format(cents / 100)).join(' · ');
}

export default function AffiliateStatsForm({ copy, locale }: { copy: AffiliateExtraCopy['stats']; locale: string }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/affiliates/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
      const data = await response.json().catch(() => ({}));
      if (response.ok) setStats(data as Stats);
      else setError(data?.error === 'NOT_FOUND' ? copy.notFound : data?.error === 'RATE' ? copy.rate : copy.fail);
    } catch {
      setError(copy.fail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-white/15 bg-white/5 p-5 sm:p-6">
        <label className="text-sm text-white/80">{copy.email}
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
        </label>
        <label className="text-sm text-white/80">{copy.code}
          <input required minLength={4} maxLength={16} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={`${inputClass} font-mono`} autoCapitalize="characters" />
        </label>
        <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? copy.loading : copy.submit}</button>
        {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      </form>
      {stats ? (
        <dl className="grid gap-3 sm:grid-cols-2" aria-live="polite">
          {[[copy.clicks, String(stats.clicks)], [copy.signups, String(stats.signups)], [copy.sales, String(stats.sales)], [copy.due, money(stats.due, locale)], [copy.paid, money(stats.paid, locale)]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-celestial-gold/30 bg-celestial-purple/10 p-4">
              <dt className="text-sm text-white/60">{label}</dt><dd className="mt-1 text-2xl">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="text-xs text-white/55">{copy.note}</p>
    </div>
  );
}
