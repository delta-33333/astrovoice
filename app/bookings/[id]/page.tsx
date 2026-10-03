'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TrustNotes from '@/components/TrustNotes';
import { formatMoney, normalizeCurrency, type Currency } from '@/lib/money';

interface View {
  id: string;
  startsAt: string;
  durationMin: number;
  amountCents: number;
  creditCents: number;
  currency?: Currency;
  amountLabel?: string;
  creditLabel?: string;
  status: string;
  advisorName: string;
  canJoin: boolean;
}

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/bookings/${params.id}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Introuvable');
        setBooking(body.booking);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Introuvable'));
  }, [params.id]);

  if (error) {
    return <main className="min-h-screen grid place-items-center px-4 text-white/70">{error}</main>;
  }
  if (!booking) {
    return <main className="min-h-screen grid place-items-center text-white/60">Chargement…</main>;
  }

  const when = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(booking.startsAt));

  return (
    <main className="min-h-screen px-4 py-10">
      <article className="max-w-lg mx-auto space-y-4">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl">Consultation confirmée</h1>
        <p className="text-white/80">{booking.advisorName}</p>
        <p>{when} · heure de Paris</p>
        <p>{booking.durationMin} minutes · {booking.amountLabel || formatMoney(booking.amountCents, normalizeCurrency(booking.currency))}
          {booking.creditCents > 0 ? ` · avoir ${booking.creditLabel || formatMoney(booking.creditCents, normalizeCurrency(booking.currency))}` : ''}
        </p>
        {booking.canJoin ? (
          <Link href={`/call/${booking.id}`} className="btn-primary inline-block">Rejoindre l’appel</Link>
        ) : (
          <p className="text-sm text-white/60">Le bouton « Rejoindre l’appel » s’ouvre 5 minutes avant le début.</p>
        )}
        {booking.status === 'confirmed' && (
          <p>
            <a href={`/api/bookings/${booking.id}/calendar`} className="btn-secondary inline-block">
              Ajouter au calendrier
            </a>
          </p>
        )}
        <TrustNotes />
        {booking.status === 'confirmed' && (
          <p>
            <Link href={`/bookings/${booking.id}/cancel`} className="text-sm text-white/50 underline">
              Annuler cette consultation
            </Link>
          </p>
        )}
      </article>
    </main>
  );
}
