'use client';

import { useEffect, useState } from 'react';
import { GUARANTEE_TEXT } from '@/lib/guarantee-text';

interface Candidate {
  booking_id: string;
  starts_at: string;
  billed_seconds: number;
  amount_cents: number;
  credit_cents: number;
  currency: string;
}

interface Claim {
  status: 'pending' | 'refunded' | 'credited';
  amount_cents: number;
  credit_cents: number;
  currency: string;
}

function money(minor: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency.toUpperCase() }).format(minor / 100);
}

export function GuaranteeSection() {
  const [state, setState] = useState<{ claim: Claim | null; candidates: Candidate[] } | null>(null);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/guarantee')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setState(data))
      .catch(() => setState(null));
  }, []);

  const claim = async (bookingId: string) => {
    if (!window.confirm('Demander le remboursement de cet appel ? La garantie ne peut être utilisée qu’une fois par compte.')) return;
    setBusy(bookingId);
    setError('');
    const response = await fetch('/api/guarantee', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    const payload = await response.json().catch(() => null);
    setBusy('');
    if (!response.ok) {
      setError(payload?.error || 'Remboursement impossible pour le moment.');
      return;
    }
    const parts: string[] = [];
    if (payload.amountCents > 0) parts.push(`${money(payload.amountCents, payload.currency)} remboursé sur ton moyen de paiement (quelques jours selon ta banque)`);
    if (payload.creditCents > 0) parts.push(`${money(payload.creditCents, payload.currency)} recrédité en avoir`);
    setMessage(parts.join(' et ') + '.');
    setState({ claim: { status: payload.mode === 'refund' ? 'refunded' : 'credited', amount_cents: payload.amountCents, credit_cents: payload.creditCents, currency: payload.currency }, candidates: [] });
  };

  return (
    <section id="garantie" className="rounded-2xl border border-celestial-gold/40 bg-celestial-gold/10 p-4 space-y-3">
      <h2 className="font-semibold">{GUARANTEE_TEXT.title}</h2>
      <p className="text-sm text-white/70">{GUARANTEE_TEXT.body}</p>
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {state?.claim && !message ? (
        <p className="text-sm text-white/70">
          Garantie déjà utilisée sur ce compte
          {state.claim.status === 'pending' ? ' (remboursement en cours de traitement).' : '.'}
        </p>
      ) : null}
      {state && !state.claim && state.candidates.length === 0 ? (
        <p className="text-sm text-white/50">Aucun appel éligible pour le moment.</p>
      ) : null}
      {state?.candidates.map((c) => (
        <div key={c.booking_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-sm text-white/80">
            Appel du {new Date(c.starts_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} ·{' '}
            {Math.max(1, Math.round(c.billed_seconds / 60))} min · {money(c.amount_cents + c.credit_cents, c.currency)}
          </p>
          <button
            type="button"
            disabled={busy === c.booking_id}
            onClick={() => claim(c.booking_id)}
            className="rounded-full bg-celestial-gold px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {busy === c.booking_id ? 'Envoi…' : 'Demander le remboursement'}
          </button>
        </div>
      ))}
    </section>
  );
}
