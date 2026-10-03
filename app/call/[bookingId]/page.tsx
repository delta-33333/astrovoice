'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AiDisclosure from '@/components/AiDisclosure';

interface View {
  id: string;
  startsAt: string;
  durationMin: number;
  status: string;
  advisorId: string;
  advisorName: string;
  canJoin: boolean;
}

export default function JoinCallPage() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/bookings/${params.bookingId}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Introuvable');
        setBooking(body.booking);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Introuvable'));
  }, [params.bookingId]);

  const join = () => {
    if (!booking?.canJoin) return;
    if (!sessionStorage.getItem('birthData')) {
      sessionStorage.setItem('afterBirth', `/call/${booking.id}`);
      sessionStorage.setItem('astrologerId', booking.advisorId);
      router.push('/birth');
      return;
    }
    sessionStorage.setItem('bookingId', booking.id);
    sessionStorage.setItem('bookingDurationSec', String(booking.durationMin * 60));
    sessionStorage.setItem('astrologerId', booking.advisorId);
    sessionStorage.setItem('sessionId', booking.id);
    router.push('/call');
  };

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
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-md mx-auto text-center space-y-5">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl">{booking.advisorName}</h1>
        <AiDisclosure />
        <p className="text-white/70">{when}</p>
        <p className="text-white/70">{booking.durationMin} minutes</p>
        {booking.canJoin ? (
          <button type="button" onClick={join} className="btn-primary w-full">Rejoindre l’appel</button>
        ) : (
          <p className="text-white/60">L’appel s’ouvre 5 minutes avant le début.</p>
        )}
        <Link href={`/bookings/${booking.id}`} className="text-sm text-white/45">Détail de la réservation</Link>
      </div>
    </main>
  );
}
