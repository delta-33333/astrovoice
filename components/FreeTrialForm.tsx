'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeardFromField from '@/components/HeardFromField';
import HoneypotField from '@/components/HoneypotField';
import { HONEYPOT_FIELD } from '@/lib/form-checks';
import { HOME_DISCLOSURE } from '@/lib/home-offer';
import type { Locale } from '@/lib/seo';
import type { HeardFromId } from '@/lib/heard-from';

const COPY: Record<Locale, { title: string; email: string; name: string; send: string; code: string; confirm: string; consent: string }> = {
  fr: {
    title: '3 minutes offertes',
    email: 'E-mail',
    name: 'Prénom',
    send: 'Recevoir le code',
    code: 'Code à 6 chiffres',
    confirm: 'Commencer l’appel',
    consent: 'J’accepte que Callastral m’écrive ce code et un rappel de l’offre. Je peux me désinscrire.',
  },
  en: {
    title: '3 minutes free',
    email: 'Email',
    name: 'First name',
    send: 'Send the code',
    code: '6-digit code',
    confirm: 'Start the call',
    consent: 'I agree to receive this code and a reminder of the offer. I can unsubscribe.',
  },
  es: {
    title: '3 minutos gratis',
    email: 'Correo',
    name: 'Nombre',
    send: 'Recibir el código',
    code: 'Código de 6 cifras',
    confirm: 'Empezar la llamada',
    consent: 'Acepto recibir este código y un recordatorio de la oferta. Puedo darme de baja.',
  },
  de: {
    title: '3 Minuten kostenlos',
    email: 'E-Mail',
    name: 'Vorname',
    send: 'Code erhalten',
    code: '6-stelliger Code',
    confirm: 'Anruf starten',
    consent: 'Ich willige ein, diesen Code und eine Erinnerung an das Angebot zu erhalten. Ich kann mich abmelden.',
  },
  it: {
    title: '3 minuti gratis',
    email: 'E-mail',
    name: 'Nome',
    send: 'Ricevi il codice',
    code: 'Codice di 6 cifre',
    confirm: 'Inizia la chiamata',
    consent: 'Accetto di ricevere questo codice e un promemoria dell’offerta. Posso disiscrivermi.',
  },
};

export default function FreeTrialForm({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [heardFrom, setHeardFrom] = useState<HeardFromId | ''>('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const requestCode = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setPending(true);
    const response = await fetch('/api/trial/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        firstName,
        locale,
        consent,
        heardFrom: heardFrom || null,
        [HONEYPOT_FIELD]: hp,
      }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setError(payload?.error || 'Indisponible');
      return;
    }
    setSent(true);
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setPending(true);
    const response = await fetch('/api/trial/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, locale }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok || !payload?.trialId) {
      setError(payload?.error || 'Code refusé');
      return;
    }
    sessionStorage.setItem('trialId', payload.trialId);
    if (payload.advisorId) sessionStorage.setItem('astrologerId', payload.advisorId);
    sessionStorage.setItem('afterBirth', '/call');
    router.push('/birth');
  };

  return (
    <div className="relative max-w-lg mx-auto px-4 py-10">
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl">{copy.title}</h1>
      <p className="mt-3 text-sm text-white/70">{HOME_DISCLOSURE}</p>
      {!sent ? (
        <form onSubmit={requestCode} className="relative mt-6 space-y-3">
          <HoneypotField value={hp} onChange={setHp} />
          <label className="block text-sm">
            {copy.name}
            <input className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required />
          </label>
          <label className="block text-sm">
            {copy.email}
            <input className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>
          <HeardFromField locale={locale} value={heardFrom} onChange={setHeardFrom} />
          <label className="flex gap-2 text-sm text-white/80">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
            <span>{copy.consent}</span>
          </label>
          <button type="submit" className="btn-primary w-full" disabled={pending}>{copy.send}</button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-3">
          <label className="block text-sm">
            {copy.code}
            <input className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 tracking-[0.3em]" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} required />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={pending}>{copy.confirm}</button>
        </form>
      )}
      {error && <p className="mt-3 text-sm text-red-200" role="alert">{error}</p>}
    </div>
  );
}
