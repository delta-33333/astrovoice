'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PaymentSheet from '@/components/PaymentSheet';
import { funnel } from '@/lib/funnel-client';
import { AI_VOICE_SHORT } from '@/lib/legal';
import TrustNotes from '@/components/TrustNotes';
import Logo from '@/components/Logo';
import MarketSwitch from '@/components/MarketSwitch';
import { BOOKING_DURATIONS } from '@/lib/pricing';
import { bookPath } from '@/lib/book-path';
import type { AdvisorLang, Currency } from '@/lib/money';

export default function BookPage() {
  const router = useRouter();
  const [slotId, setSlotId] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [advisorName, setAdvisorName] = useState('');
  const [duration, setDuration] = useState<10 | 20 | 30>(20);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [accountMode, setAccountMode] = useState<'signup' | 'login'>('signup');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [amountLabel, setAmountLabel] = useState('');
  const [collectContact, setCollectContact] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [immediate, setImmediate] = useState(false);
  const [introLabel, setIntroLabel] = useState('');
  const [perMinLabel, setPerMinLabel] = useState('');
  const [durationLabels, setDurationLabels] = useState<Record<number, string>>({});
  const [market, setMarket] = useState<{ language: AdvisorLang; currency: Currency } | null>(null);
  const [includedSeconds, setIncludedSeconds] = useState(0);
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [nowMode, setNowMode] = useState(false);
  const [choices, setChoices] = useState<{
    nextSlot: { id: string; startsAt: string; advisorId: string } | null;
    alternative: { advisorId: string; name: string; slotId: string; startsAt: string } | null;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slot = params.get('slot') || sessionStorage.getItem('slotId');
    const when = params.get('at') || sessionStorage.getItem('slotStartsAt');
    const advisorId = params.get('advisor') || sessionStorage.getItem('astrologerId');
    if (!slot) {
      router.replace('/');
      return;
    }
    sessionStorage.setItem('slotId', slot);
    if (when) sessionStorage.setItem('slotStartsAt', when);
    if (advisorId) sessionStorage.setItem('astrologerId', advisorId);
    setSlotId(slot);
    setStartsAt(when);
    setAdvisorId(advisorId);
    // « Appeler maintenant » : créneau qui commence dans les 15 minutes (ou déjà commencé).
    setNowMode(!when || new Date(when).getTime() - Date.now() <= 15 * 60 * 1000);
    fetch('/api/market')
      .then((response) => response.json())
      .then((payload) => {
        if (payload.language && payload.currency) {
          setMarket({ language: payload.language, currency: payload.currency });
        }
      })
      .catch(() => undefined);
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((payload) => {
        setAuthed(Boolean(payload.authenticated));
        const seconds = payload.user?.subscription?.seconds;
        if (payload.user?.subscription?.entitled && typeof seconds === 'number') {
          setIncludedSeconds(seconds);
        }
      })
      .catch(() => setAuthed(false));
    if (advisorId) {
      fetch(`/api/advisors/${advisorId}`)
        .then((response) => response.json())
        .then((payload) => {
          if (payload.advisor?.name) setAdvisorName(payload.advisor.name);
          if (payload.quote?.introLabel) setIntroLabel(payload.quote.introLabel);
          if (payload.quote?.perMinLabel) setPerMinLabel(payload.quote.perMinLabel);
          if (Array.isArray(payload.quote?.durations)) {
            const labels: Record<number, string> = {};
            for (const item of payload.quote.durations) labels[item.minutes] = item.label;
            setDurationLabels(labels);
          }
        })
        .catch(() => undefined);
    }
  }, [router]);

  const whenLabel = nowMode
    ? 'Maintenant'
    : startsAt
    ? new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(startsAt))
    : '';

  useEffect(() => {
    if (authed === false && accountMode === 'signup') {
      funnel('signup_view', { from: 'book' }, { log: true, metadata: { source: 'book' } });
    }
  }, [authed, accountMode]);

  const ensureAccount = async () => {
    if (authed) return;
    const endpoint = accountMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        accountMode === 'signup'
          ? { email, password, displayName: firstName }
          : { email, password }
      ),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || 'Le compte n’a pas pu être ouvert.');
    if (accountMode === 'signup') funnel('signup_submit', { from: 'book' });
    setAuthed(true);
  };

  const pay = async () => {
    if (!slotId) return;
    setLoading(true);
    setError(null);
    setChoices(null);
    try {
      await ensureAccount();
      const immediate = nowMode || (startsAt ? new Date(startsAt).getTime() - Date.now() <= 15 * 60 * 1000 : true);
      const heldResponse = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, durationMin: duration, advisorId, immediate }),
      });
      const held = await heldResponse.json().catch(() => ({}));
      if (!heldResponse.ok) {
        if (held?.nextSlot || held?.alternative) {
          setChoices({ nextSlot: held.nextSlot ?? null, alternative: held.alternative ?? null });
        }
        throw new Error(held?.error || 'Créneau indisponible');
      }
      if (held.slotId && held.slotId !== slotId) {
        setSlotId(held.slotId);
        sessionStorage.setItem('slotId', held.slotId);
      }
      if (held.startsAt) {
        setStartsAt(held.startsAt);
        sessionStorage.setItem('slotStartsAt', held.startsAt);
      }

      const checkoutResponse = await fetch('/api/bookings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: held.bookingId }),
      });
      const checkout = await checkoutResponse.json();
      if (!checkoutResponse.ok) throw new Error(checkout.error || 'Paiement impossible');

      funnel('checkout_start', { kind: 'booking', duration, free: Boolean(checkout.free) });
      setBookingId(checkout.bookingId || held.bookingId);
      setImmediate(Boolean(checkout.immediate));
      if (checkout.free) {
        funnel('payment_success', { kind: 'booking', duration, free: true });
        router.push(checkout.immediate ? `/call/${held.bookingId}` : `/bookings/${held.bookingId}`);
        return;
      }
      setClientSecret(checkout.clientSecret);
      setCheckoutSessionId(checkout.checkoutSessionId);
      setAmountLabel(checkout.amountLabel || held.amountLabel || '');
      setCollectContact(Boolean(checkout.collectContact));
      setSheetOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La réservation n’a pas abouti.');
    } finally {
      setLoading(false);
    }
  };

  const afterPayment = async () => {
    if (!checkoutSessionId || !bookingId) return;
    const response = await fetch('/api/bookings/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutSessionId }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || 'La confirmation n’a pas abouti.');
      setSheetOpen(false);
      return;
    }
    funnel('payment_success', { kind: 'booking', duration });
    if (payload.rebook) funnel('rebook', { kind: 'booking' });
    router.push(payload.immediate || immediate ? `/call/${bookingId}` : `/bookings/${bookingId}`);
  };

  if (!slotId || authed === null) {
    return (
      <main className="min-h-screen grid place-items-center text-white/60">Chargement…</main>
    );
  }

  return (
    <main className="min-h-screen px-4 pt-8 pb-28">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          {market && <MarketSwitch language={market.language} currency={market.currency} />}
        </div>
        <Link href="/" className="text-sm text-white/50 mt-4 inline-block">← Annuaire</Link>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl mt-4 mb-2">
          {advisorName ? `Appeler ${advisorName}` : 'Réserver'}
        </h1>
        <p className="text-white/70 mb-2">{whenLabel} · heure de Paris</p>
        <p className="text-sm text-celestial-gold mb-4">
          {includedSeconds >= duration * 60
            ? `Inclus dans Callastral Illimité · ${Math.floor(includedSeconds / 60)} min restantes ce mois-ci`
            : introLabel && perMinLabel
              ? `${introLabel} les 3 premières minutes, puis ${perMinLabel}`
              : 'Le tarif du conseiller est confirmé au paiement.'}
        </p>
        <TrustNotes className="mb-6" />

        <div className="space-y-3">
          {BOOKING_DURATIONS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => setDuration(minutes)}
              className={`w-full text-left rounded-2xl border px-4 py-4 ${
                duration === minutes ? 'border-celestial-gold bg-white/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <span className="font-semibold">{minutes} minutes</span>
              <span className="float-right text-celestial-gold">
                {includedSeconds >= minutes * 60 ? 'inclus' : durationLabels[minutes] || '…'}
              </span>
            </button>
          ))}
        </div>

        {authed === false && (
          <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setAccountMode('signup')}
                className={accountMode === 'signup' ? 'text-celestial-gold' : 'text-white/50'}
              >
                Créer un compte
              </button>
              <span className="text-white/30">·</span>
              <button
                type="button"
                onClick={() => setAccountMode('login')}
                className={accountMode === 'login' ? 'text-celestial-gold' : 'text-white/50'}
              >
                Déjà un compte
              </button>
            </div>
            {accountMode === 'signup' && (
              <label className="block text-sm text-white/70">
                Prénom
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  required
                  className="mt-1 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3 text-white"
                />
              </label>
            )}
            <label className="block text-sm text-white/70">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="mt-1 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3 text-white"
              />
            </label>
            <label className="block text-sm text-white/70">
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={accountMode === 'login' ? 'current-password' : 'new-password'}
                minLength={8}
                required
                className="mt-1 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3 text-white"
              />
            </label>
            {accountMode === 'signup' && (
              <p className="text-xs text-white/45">Au moins 8 caractères. Le compte est créé au moment du paiement.</p>
            )}
            {accountMode === 'login' && (
              <Link href="/auth/forgot" className="text-sm text-celestial-gold underline">Mot de passe oublié</Link>
            )}
          </div>
        )}

        <p className="text-xs text-white/45 mt-4">
          {includedSeconds >= duration * 60
            ? 'Le créneau est confirmé sans paiement. La durée est décomptée de Callastral Illimité.'
            : 'Le créneau est bloqué 10 minutes, le temps du paiement. Apple Pay et Google Pay s’affichent si votre appareil les propose.'}
        </p>
        {error && <p className="text-sm text-red-200 mt-4">{error}</p>}
        {choices && (
          <div className="mt-3 grid gap-2">
            {choices.nextSlot && (
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => window.location.assign(bookPath(choices.nextSlot!.id, choices.nextSlot!.startsAt, choices.nextSlot!.advisorId))}
              >
                {`Prochain créneau : ${new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(choices.nextSlot.startsAt))}`}
              </button>
            )}
            {choices.alternative && (
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => window.location.assign(bookPath(choices.alternative!.slotId, choices.alternative!.startsAt, choices.alternative!.advisorId))}
              >
                {`Appeler ${choices.alternative.name} maintenant`}
              </button>
            )}
          </div>
        )}
        <button type="button" onClick={() => void pay()} disabled={loading} className="btn-primary w-full mt-6 hidden sm:block disabled:opacity-50">
          {loading
            ? 'Préparation…'
            : includedSeconds >= duration * 60
              ? 'Rejoindre · inclus'
              : `Continuer · ${durationLabels[duration] || ''}`}
        </button>
        <p className="mt-2 hidden sm:block text-center text-xs text-white/45">{AI_VOICE_SHORT.fr}</p>
      </div>

      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0c1018]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={() => void pay()} disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading
            ? 'Préparation…'
            : includedSeconds >= duration * 60
              ? 'Rejoindre · inclus'
              : `Continuer · ${durationLabels[duration] || ''}`}
        </button>
        <p className="mt-1.5 text-center text-[11px] text-white/45">{AI_VOICE_SHORT.fr}</p>
      </div>

      <PaymentSheet
        open={sheetOpen}
        title="Régler la consultation"
        amountLabel={amountLabel}
        detail="Le créneau est confirmé dès que le paiement est accepté."
        payLabel={`Payer ${amountLabel}`}
        note={AI_VOICE_SHORT.fr}
        clientSecret={clientSecret}
        collectContact={collectContact}
        onClose={() => setSheetOpen(false)}
        onSuccess={() => void afterPayment()}
      />
    </main>
  );
}
