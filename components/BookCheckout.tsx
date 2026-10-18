'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import MarketSwitch from '@/components/MarketSwitch';
import PaymentSheet from '@/components/PaymentSheet';
import HoneypotField from '@/components/HoneypotField';
import { bookCopy, type BookCopy } from '@/lib/book-copy';
import { readBirthParams } from '@/lib/book-funnel';
import { funnel } from '@/lib/funnel-client';
import HeardFromField from '@/components/HeardFromField';
import { HONEYPOT_FIELD, normalizeEmail } from '@/lib/form-checks';
import type { HeardFromId } from '@/lib/heard-from';
import type { AdvisorLang, Currency } from '@/lib/money';

export default function BookCheckout({
  language,
  currency,
  headline,
  renewal,
  trialLabel,
  fullLabel,
}: {
  language: AdvisorLang;
  currency: Currency;
  headline: string;
  renewal: string;
  trialLabel: string;
  fullLabel: string;
}) {
  const copy = bookCopy(language);
  const router = useRouter();
  const [slotId, setSlotId] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [birth, setBirth] = useState<{ date: string; time: string; place: string } | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [included, setIncluded] = useState(false);
  const [accountMode, setAccountMode] = useState<'signup' | 'login'>('signup');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [heardFrom, setHeardFrom] = useState<HeardFromId | ''>('');
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slot = params.get('slot');
    const when = params.get('at');
    const advisor = params.get('advisor');
    if (slot) setSlotId(slot);
    if (when) setStartsAt(when);
    if (advisor) setAdvisorId(advisor);
    setBirth(readBirthParams(params));
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((payload) => {
        setAuthed(Boolean(payload.authenticated));
        const seconds = payload.user?.subscription?.seconds;
        if (payload.user?.subscription?.entitled && typeof seconds === 'number' && seconds >= 10 * 60) {
          setIncluded(true);
        }
      })
      .catch(() => setAuthed(false));
  }, []);

  const ensureAccount = async () => {
    if (authed) return;
    if (!normalizeEmail(email)) throw new Error(copy.emailInvalid);
    if (accountMode === 'signup') {
      if (!firstName.trim()) throw new Error(copy.nameRequired);
    } else if (!password) {
      throw new Error(copy.passwordRequired);
    }
    const endpoint = accountMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        accountMode === 'signup'
          ? { email, displayName: firstName, passwordless: true, heardFrom: heardFrom || null, [HONEYPOT_FIELD]: honeypot }
          : { email, password, [HONEYPOT_FIELD]: honeypot }
      ),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || copy.emailInvalid);
    if (accountMode === 'signup') funnel('signup_submit', { from: 'book' });
    setAuthed(true);
  };

  const saveBirth = async (name: string) => {
    if (!birth) return;
    await fetch('/api/birth-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || firstName || 'Vous',
        date: birth.date,
        time: birth.time,
        timeUnknown: false,
        place: birth.place,
      }),
    }).catch(() => undefined);
  };

  const joinIncluded = async () => {
    if (!slotId) {
      router.push('/#annuaire');
      return;
    }
    const immediate = !startsAt || new Date(startsAt).getTime() - Date.now() <= 15 * 60 * 1000;
    const heldResponse = await fetch('/api/bookings/hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, durationMin: 10, advisorId, immediate }),
    });
    const held = await heldResponse.json().catch(() => ({}));
    if (!heldResponse.ok) throw new Error(held?.error || copy.preparing);
    const checkoutResponse = await fetch('/api/bookings/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: held.bookingId }),
    });
    const checkout = await checkoutResponse.json().catch(() => ({}));
    if (!checkoutResponse.ok) throw new Error(checkout?.error || copy.preparing);
    if (checkout.free) {
      funnel('payment_success', { kind: 'booking', duration: 10, free: true });
      router.push(checkout.immediate ? `/call/${held.bookingId}` : `/bookings/${held.bookingId}`);
      return;
    }
    router.push('/account');
  };

  const pay = async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureAccount();
      const me = await fetch('/api/auth/me').then((response) => response.json()).catch(() => null);
      await saveBirth(me?.user?.displayName || firstName);
      if (included && slotId) {
        await joinIncluded();
        return;
      }
      if (included && !slotId) {
        router.push('/#annuaire');
        return;
      }
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'decouverte' }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || copy.preparing);
      funnel('checkout_start', { kind: 'subscription', plan: 'decouverte' });
      setClientSecret(payload.clientSecret);
      setCheckoutSessionId(payload.checkoutSessionId);
      setSheetOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.preparing);
    } finally {
      setLoading(false);
    }
  };

  const afterPayment = async () => {
    if (!checkoutSessionId) return;
    await fetch('/api/billing/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutSessionId }),
    }).catch(() => undefined);
    funnel('payment_success', { kind: 'subscription', plan: 'decouverte' });
    const me = await fetch('/api/auth/me').then((response) => response.json()).catch(() => null);
    const seconds = me?.user?.subscription?.seconds;
    const covered = Boolean(me?.user?.subscription?.entitled) && typeof seconds === 'number' && seconds >= 10 * 60;
    if (slotId && covered) {
      try {
        await joinIncluded();
        return;
      } catch {
        router.push('/account');
        return;
      }
    }
    router.push(slotId ? '/#annuaire' : '/account');
  };

  const buttonLabel = loading
    ? copy.preparing
    : included && slotId
      ? copy.includedButton
      : included
        ? copy.pickAdvisor
        : copy.pay(trialLabel);

  return (
    <main className="min-h-screen px-4 pt-5 pb-36 sm:pb-16">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          <MarketSwitch language={language} currency={currency} />
        </div>
        <Link href="/" className="mt-4 inline-block text-sm text-white/50">{copy.back}</Link>

        <section data-funnel-step="offer" data-offer="decouverte" className="mt-4 rounded-3xl border border-celestial-gold/40 bg-celestial-gold/10 p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-celestial-gold">{copy.plan}</p>
          <h1 className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl">{copy.title}</h1>
          <p className="mt-3 text-3xl font-semibold leading-tight text-celestial-gold sm:text-4xl">{headline}</p>
          <p className="mt-1 text-sm text-white/70">{copy.thenWeek(fullLabel)}</p>
          <p className="mt-3 text-sm text-white/80">{copy.minutes}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/85">{renewal}</p>
          <p className="mt-3 text-xs text-white/55">{copy.aiNote}</p>
          <button type="button" data-wallets-first onClick={() => void pay()} disabled={loading} className="btn-primary mt-4 w-full text-base disabled:opacity-50">
            {buttonLabel}
          </button>
          <p className="mt-2 text-xs text-white/45">{copy.wallet}</p>
        </section>

        <PaymentSheet
          embedded
          open={sheetOpen}
          locale={language}
          title={copy.plan}
          amountLabel={trialLabel}
          detail={copy.minutes}
          payLabel={copy.pay(trialLabel)}
          renewal={renewal}
          note={copy.aiNote}
          clientSecret={clientSecret}
          funnelKind="subscription"
          onClose={() => setSheetOpen(false)}
          onSuccess={() => void afterPayment()}
        />

        <ul className="mt-4 flex flex-col gap-1 text-sm text-white/70">
          {copy.trust.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        {birth && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            <span className="block text-xs uppercase tracking-wide text-white/45">{copy.birthTitle}</span>
            {birth.date} · {birth.time} · {birth.place}
          </p>
        )}

        {included && <p className="mt-4 text-sm text-celestial-gold">{copy.included}</p>}

        {authed === false && !included && (
          <div className="relative mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <HoneypotField value={honeypot} onChange={setHoneypot} />
            <p className="text-sm text-white/70">{copy.accountTitle}</p>
            <div className="flex gap-3 text-sm">
              <button type="button" onClick={() => setAccountMode('signup')} className={accountMode === 'signup' ? 'text-celestial-gold' : 'text-white/50'}>
                {copy.signup}
              </button>
              <button type="button" onClick={() => setAccountMode('login')} className={accountMode === 'login' ? 'text-celestial-gold' : 'text-white/50'}>
                {copy.login}
              </button>
            </div>
            {accountMode === 'signup' && (
              <Field label={copy.firstName} value={firstName} autoComplete="given-name" onChange={setFirstName} />
            )}
            <Field label={copy.email} type="email" value={email} autoComplete="email" onChange={setEmail} />
            {accountMode === 'login' && (
              <Field
                label={copy.password}
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={setPassword}
              />
            )}
            {accountMode === 'signup' && (
              <HeardFromField locale={language} value={heardFrom} onChange={setHeardFrom} />
            )}
            {accountMode === 'login' && (
              <Link href="/auth/forgot" className="text-sm text-celestial-gold underline">{copy.forgot}</Link>
            )}
          </div>
        )}

        {slotId && <p className="mt-4 text-xs text-white/45">{copy.hold}</p>}
        {error && <p className="mt-3 text-sm text-red-200" role="alert">{error}</p>}
      </div>

      <div
        data-funnel-step="pay"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0c1018]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden"
      >
        <p className="mb-2 text-center text-sm font-semibold text-celestial-gold">{headline}</p>
        <button type="button" onClick={() => void pay()} disabled={loading} className="btn-primary w-full text-base disabled:opacity-50">
          {buttonLabel}
        </button>
        <p className="mt-1.5 text-center text-[11px] text-white/45">{copy.aiNote}</p>
      </div>

    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm text-white/70">
      {label}
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-base text-white"
      />
    </label>
  );
}
