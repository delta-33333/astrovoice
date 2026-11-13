'use client';

import { FormEvent, useEffect, useState } from 'react';

/** Après un essai lancé sans e-mail : garder le compte et recevoir le résumé (code à 6 chiffres). */
export default function TrialEmailCapture() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('trialQuick') === '1') setShow(true);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  if (!show) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setPending(true);
    const response = await fetch('/api/trial/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(step === 'email' ? { email, locale: 'fr' } : { code, locale: 'fr' }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setError(payload?.error || 'Indisponible');
      return;
    }
    if (step === 'email') {
      setStep('code');
      return;
    }
    try {
      sessionStorage.removeItem('trialQuick');
    } catch {
      /* rien */
    }
    setStep('done');
  };

  if (step === 'done') {
    return <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-white/85">C’est noté : votre compte est enregistré et le résumé de l’appel arrive par e-mail.</p>;
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
      <p className="text-sm font-semibold">Recevoir le résumé et garder votre compte</p>
      {step === 'email' ? (
        <label className="block text-sm text-white/75">
          E-mail
          <input className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
      ) : (
        <label className="block text-sm text-white/75">
          Code à 6 chiffres envoyé à {email}
          <input className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 tracking-[0.3em]" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} required />
        </label>
      )}
      <button type="submit" className="btn-secondary w-full" disabled={pending}>{step === 'email' ? 'Recevoir mon code' : 'Valider'}</button>
      {error && <p className="text-sm text-red-200" role="alert">{error}</p>}
    </form>
  );
}
