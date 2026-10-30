'use client';

import { useState, type FormEvent } from 'react';
import HoneypotField from '@/components/HoneypotField';
import { HONEYPOT_FIELD } from '@/lib/form-checks';
import type { AffiliateCopy } from '@/lib/free-tools-copy';

const inputClass =
  'mt-1 w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-gold focus:ring-2 focus:ring-celestial-gold/40';

export default function AffiliateForm({ copy, locale }: { copy: AffiliateCopy['form'] & { payout: string; payoutHint: string; emailSent: string }; locale: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [social, setSocial] = useState('');
  const [payout, setPayout] = useState('');
  const [accept, setAccept] = useState(false);
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; link: string } | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, social, payout, accept, locale, [HONEYPOT_FIELD]: trap }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.code) setDone({ code: data.code, link: data.link });
      else setError(copy.errors[(data?.error as keyof typeof copy.errors) ?? 'FAIL'] ?? copy.errors.FAIL);
    } catch {
      setError(copy.errors.FAIL);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-celestial-gold/40 bg-celestial-purple/10 p-5 sm:p-6" aria-live="polite">
        <p className="font-[family-name:var(--font-cinzel)] text-xl text-celestial-gold">{copy.done}</p>
        <p className="mt-3 text-sm text-white/70">{copy.yourCode}</p>
        <p className="font-mono text-2xl">{done.code}</p>
        <p className="mt-3 text-sm text-white/70">{copy.yourLink}</p>
        <p className="break-all font-mono text-sm">{done.link}</p>
        <p className="mt-3 text-sm text-white/70">{copy.emailSent}</p>
        <button type="button" className="btn-secondary mt-4" onClick={() => navigator.clipboard?.writeText(done.link)}>{copy.copy}</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative grid gap-4 rounded-3xl border border-white/15 bg-white/5 p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-celestial-gold">{copy.title}</h2>
      <HoneypotField value={trap} onChange={setTrap} />
      <label className="text-sm text-white/80">{copy.name}
        <input required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoComplete="name" />
      </label>
      <label className="text-sm text-white/80">{copy.email}
        <input required type="email" maxLength={160} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
      </label>
      <label className="text-sm text-white/80">{copy.social}
        <input required minLength={2} maxLength={120} value={social} placeholder={copy.socialPlaceholder} onChange={(e) => setSocial(e.target.value)} className={inputClass} />
      </label>
      <label className="text-sm text-white/80">{copy.payout}
        <input maxLength={200} value={payout} onChange={(e) => setPayout(e.target.value)} className={inputClass} autoComplete="off" />
        <span className="mt-1 block text-xs text-white/50">{copy.payoutHint}</span>
      </label>
      <label className="flex items-start gap-2 text-sm text-white/80">
        <input type="checkbox" required checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-1" />
        <span>{copy.accept}</span>
      </label>
      <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? copy.submitting : copy.submit}</button>
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
