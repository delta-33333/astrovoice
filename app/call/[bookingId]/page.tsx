'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AiDisclosure from '@/components/AiDisclosure';
import { loadBirthData } from '@/lib/birth-client';

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

  const [now, setNow] = useState(() => Date.now());
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch(`/api/bookings/${params.bookingId}`, { cache: 'no-store' })
        .then(async (response) => {
          const body = await response.json();
          if (!response.ok) throw new Error(body.error || 'Introuvable');
          if (!cancelled) setBooking(body.booking);
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Introuvable');
        });
    void load();
    // Rafraîchit tant que l'appel n'est pas ouvert : le bouton apparaît sans recharger la page.
    const poll = window.setInterval(() => {
      setNow(Date.now());
      void load();
    }, 15000);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [params.bookingId]);

  const join = async () => {
    if (!booking?.canJoin || joining) return;
    setJoining(true);
    const birth = await loadBirthData();
    if (!birth) {
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

  const opensIn = Math.max(0, Math.ceil((new Date(booking.startsAt).getTime() - 15 * 60 * 1000 - now) / 1000));

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-md mx-auto text-center space-y-5">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl">{booking.advisorName}</h1>
        <AiDisclosure />
        <p className="text-white/70">{when}</p>
        <p className="text-white/70">{booking.durationMin} minutes</p>
        {booking.canJoin ? (
          <button type="button" onClick={() => void join()} disabled={joining} className="btn-primary w-full disabled:opacity-60">Rejoindre l’appel</button>
        ) : (
          <p className="text-white/60">
            {opensIn > 0
              ? `L’appel s’ouvre dans ${Math.floor(opensIn / 60)} min ${String(opensIn % 60).padStart(2, '0')} s, 15 minutes avant le début. Cette page s’actualise seule.`
              : 'Ouverture de l’appel…'}
          </p>
        )}
        <Link href={`/bookings/${booking.id}`} className="text-sm text-white/45">Détail de la réservation</Link>
      </div>
    </main>
  );
}
