'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import HeardFromField from '@/components/HeardFromField';
import HoneypotField from '@/components/HoneypotField';
import type { HeardFromId } from '@/lib/heard-from';
import { HONEYPOT_FIELD } from '@/lib/form-checks';
import { widgetCopy } from '@/lib/horoscope-widget';
import { privacyPath } from '@/lib/privacy-copy';
import type { Locale } from '@/lib/seo';
import { SIGN_IDS, signName, type SignId } from '@/lib/zodiac/signs';

const inputClass =
  'mt-1 w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50';

export default function HoroscopeSignup({
  locale,
  sign,
  placement,
}: {
  locale: Locale;
  sign?: SignId | null;
  placement: 'home' | 'calculator' | 'sign';
}) {
  const copy = widgetCopy(locale);
  const [email, setEmail] = useState('');
  const [chosen, setChosen] = useState<SignId>(sign || 'belier');
  const [birthDate, setBirthDate] = useState('');
  const [consent, setConsent] = useState(false);
  const [heardFrom, setHeardFrom] = useState<HeardFromId | ''>('');
  const [hp, setHp] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [utm, setUtm] = useState({ utmSource: '', utmMedium: '', utmCampaign: '' });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtm({
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || '',
    });
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!consent) {
      setError(copy.need);
      return;
    }
    setPending(true);
    const response = await fetch('/api/horoscope/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        locale,
        sign: chosen,
        birthDate: birthDate || null,
        consent,
        heardFrom: heardFrom || null,
        placement,
        ...utm,
        [HONEYPOT_FIELD]: hp,
      }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setError(payload?.error === 'CONSENT' ? copy.need : copy.fail);
      return;
    }
    setMessage(copy.ok);
  };

  return (
    <form onSubmit={submit} className="relative mt-8 rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
      <HoneypotField value={hp} onChange={setHp} />
      <h2 className="font-[family-name:var(--font-cinzel)] text-xl">{copy.title}</h2>
      <label className="block text-sm">
        {copy.email}
        <input className={inputClass} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
      </label>
      <label className="block text-sm">
        {copy.sign}
        <select className={inputClass} value={chosen} onChange={(event) => setChosen(event.target.value as SignId)}>
          {SIGN_IDS.map((id) => (
            <option key={id} value={id}>{signName(locale, id)}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        {copy.birth}
        <input className={inputClass} type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
      </label>
      <HeardFromField locale={locale} value={heardFrom} onChange={setHeardFrom} />
      <label className="flex items-start gap-2 text-sm text-white/80">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" />
        <span>
          {copy.consent}{' '}
          <Link href={privacyPath(locale)} className="text-celestial-gold underline">{privacyPath(locale)}</Link>
        </span>
      </label>
      {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
      {message && <p className="text-sm text-celestial-gold">{message}</p>}
      <button type="submit" className="btn-secondary w-full" disabled={pending}>
        {pending ? copy.pending : copy.submit}
      </button>
    </form>
  );
}
