'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CallScreen from '@/components/CallScreen';
import { useAdvisor } from '@/components/use-advisor';
import { quoteCall } from '@/lib/pricing';
import type { BirthData } from '@/lib/types';

export default function CallPage() {
  const router = useRouter();
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [astrologerId, setAstrologerId] = useState<string | null>(null);
  const [booking, setBooking] = useState<{ id: string; durationSec: number } | null>(null);
  const [prepaidSeconds, setPrepaidSeconds] = useState(0);
  const [ready, setReady] = useState(false);
  const { advisor, status: advisorStatus } = useAdvisor(astrologerId);
  const stoppedRef = useRef(false);
  const checkoutRef = useRef<string | null>(null);
  const sessionRef = useRef<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('birthData');
    const astrId = sessionStorage.getItem('astrologerId');
    if (!data || !astrId) {
      router.push('/birth');
      return;
    }
    try {
      setBirthData(JSON.parse(data) as BirthData);
    } catch {
      router.push('/birth');
      return;
    }
    setAstrologerId(astrId);
    sessionRef.current = sessionStorage.getItem('sessionId');
    checkoutRef.current = sessionStorage.getItem('checkoutSessionId');

    const bookingId = sessionStorage.getItem('bookingId');
    const load = async () => {
      const me = await fetch('/api/auth/me').then((response) => response.json()).catch(() => null);
      if (!me?.authenticated) {
        router.push('/auth');
        return;
      }
      if (bookingId) {
        const response = await fetch(`/api/bookings/${bookingId}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.booking?.canJoin) {
          router.replace(`/call/${bookingId}`);
          return;
        }
        setBooking({
          id: payload.booking.id,
          durationSec: payload.booking.durationMin * 60,
        });
      }
      setPrepaidSeconds(me?.user?.prepaidSeconds ?? 0);
      setReady(true);
    };
    void load();
  }, [router]);

  // Appelé uniquement quand la facturation a réellement démarré (socket ouvert + premier audio).
  const finish = async (seconds: number, prepaid: number, note?: string) => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    const activeBookingId = booking?.id ?? null;

    void fetch('/api/billing/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seconds, bookingId: activeBookingId }),
      keepalive: true,
    });

    if (activeBookingId) {
      try {
        await fetch(`/api/bookings/${activeBookingId}/complete`, { method: 'POST', keepalive: true });
      } catch (error) {
        console.error('Clôture réservation:', error instanceof Error ? error.message : 'erreur');
      }
      sessionStorage.removeItem('bookingId');
      sessionStorage.removeItem('bookingDurationSec');
      sessionStorage.setItem('callComplete', JSON.stringify({
        durationSeconds: seconds,
        amountCharged: 0,
        astrologerName: advisor?.name,
        astrologerId: advisor?.id ?? astrologerId,
        bookingId: activeBookingId,
        error: note,
      }));
      router.push('/complete');
      return;
    }

    if (sessionStorage.getItem('callSubscription') === '1') {
      sessionStorage.removeItem('callSubscription');
      sessionStorage.setItem('callComplete', JSON.stringify({
        durationSeconds: seconds,
        amountCharged: 0,
        subscription: true,
        astrologerName: advisor?.name,
        astrologerId: advisor?.id ?? astrologerId,
        error: note,
      }));
      router.push('/complete');
      return;
    }

    try {
      const response = await fetch('/api/stripe/finalize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          checkoutSessionId: checkoutRef.current,
          durationSeconds: seconds,
        }),
        keepalive: true,
      });
      if (!response.ok) throw new Error('settlement');
      const result = await response.json();
      sessionStorage.setItem('callComplete', JSON.stringify({
        durationSeconds: seconds,
        amountCharged: result?.amountCharged ?? 0,
        currency: result?.currency,
        prepaidSecondsUsed: result?.prepaidSecondsUsed,
        astrologerName: advisor?.name,
        astrologerId: advisor?.id ?? astrologerId,
        error: note,
      }));
    } catch {
      sessionStorage.setItem('callComplete', JSON.stringify({
        durationSeconds: seconds,
        amountCharged: quoteCall(seconds, prepaid).amountCents,
        astrologerName: advisor?.name,
        astrologerId: advisor?.id ?? astrologerId,
        error: note || 'Le règlement sera confirmé sous peu',
      }));
    }
    router.push('/complete');
  };

  if (!ready || !birthData || !advisor || advisorStatus === 'loading' || advisorStatus === 'idle') {
    return (
      <main className="call-stage min-h-screen grid place-items-center text-white/70">
        {advisorStatus === 'missing' || advisorStatus === 'error' ? 'Conseiller introuvable' : 'Connexion…'}
      </main>
    );
  }

  return (
    <CallScreen
      advisor={advisor}
      birthData={birthData}
      booking={booking}
      prepaidSeconds={prepaidSeconds}
      checkoutSessionId={checkoutRef.current}
      onUnauthorized={() => router.push('/auth')}
      onFinished={(seconds, prepaid, note) => {
        void finish(seconds, prepaid, note);
      }}
    />
  );
}
