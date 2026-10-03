'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PaymentSheet from '@/components/PaymentSheet';
import { BOOKING_DURATIONS, bookingListPriceCents, formatCurrency } from '@/lib/pricing';

export default function BookPage() {
  const router = useRouter();
  const [slotId, setSlotId] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [duration, setDuration] = useState<10 | 20 | 30>(20);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [amountLabel, setAmountLabel] = useState('');
  const [collectContact, setCollectContact] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [immediate, setImmediate] = useState(false);

  useEffect(() => {
    const slot = sessionStorage.getItem('slotId');
    const when = sessionStorage.getItem('slotStartsAt');
    if (!slot) {
      router.replace('/astrologers');
      return;
    }
    setSlotId(slot);
    setStartsAt(when);
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((payload) => setAuthed(Boolean(payload.authenticated)))
      .catch(() => setAuthed(false));
  }, [router]);

  const whenLabel = startsAt
    ? new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(startsAt))
    : '';

  const pay = async () => {
    if (!slotId) return;
    setLoading(true);
    setError(null);
    try {
      const heldResponse = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, durationMin: duration }),
      });
      const held = await heldResponse.json();
      if (!heldResponse.ok) throw new Error(held.error || 'Créneau indisponible');

      const checkoutResponse = await fetch('/api/bookings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: held.bookingId }),
      });
      const checkout = await checkoutResponse.json();
      if (!checkoutResponse.ok) throw new Error(checkout.error || 'Paiement impossible');

      setBookingId(checkout.bookingId || held.bookingId);
      setImmediate(Boolean(checkout.immediate));
      if (checkout.free) {
        router.push(checkout.immediate ? `/call/${held.bookingId}` : `/bookings/${held.bookingId}`);
        return;
      }
      setClientSecret(checkout.clientSecret);
      setCheckoutSessionId(checkout.checkoutSessionId);
      setAmountLabel(checkout.amountLabel || formatCurrency(held.amountCents));
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
    router.push(payload.immediate || immediate ? `/call/${bookingId}` : `/bookings/${bookingId}`);
  };

  if (!slotId || authed === null) {
    return (
      <main className="min-h-screen grid place-items-center text-white/60">Chargement…</main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/astrologers" className="text-sm text-white/50">← Annuaire</Link>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl mt-4 mb-2">Réserver</h1>
        <p className="text-white/70 mb-6">{whenLabel} · heure de Paris</p>

        {authed === false && (
          <div className="space-y-4">
            <p className="text-white/80">Connectez-vous pour bloquer ce créneau pendant 10 minutes et le régler.</p>
            <Link href="/auth" className="btn-primary inline-block">Se connecter</Link>
          </div>
        )}

        {authed && (
          <>
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
                  <span className="float-right text-celestial-gold">{formatCurrency(bookingListPriceCents(minutes))}</span>
                  <p className="text-xs text-white/50 mt-1">0,99 €/min les 3 premières minutes, puis 1,49 €/min</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-white/45 mt-4">Le créneau est bloqué 10 minutes, le temps du paiement. Un avoir encore valable est déduit automatiquement.</p>
            {error && <p className="text-sm text-red-200 mt-4">{error}</p>}
            <button type="button" onClick={() => void pay()} disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-50">
              {loading ? 'Préparation…' : 'Bloquer et payer'}
            </button>
          </>
        )}
      </div>

      <PaymentSheet
        open={sheetOpen}
        title="Régler la consultation"
        amountLabel={amountLabel}
        detail="Le créneau est confirmé dès que le paiement est accepté."
        payLabel={`Payer ${amountLabel}`}
        clientSecret={clientSecret}
        collectContact={collectContact}
        onClose={() => setSheetOpen(false)}
        onSuccess={() => void afterPayment()}
      />
    </main>
  );
}
