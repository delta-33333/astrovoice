'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CallScreen from '@/components/CallScreen';
import { useAdvisor } from '@/components/use-advisor';
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
    const sessId = sessionStorage.getItem('sessionId');
    if (!data || !astrId || !sessId) {
      router.push('/birth');
      return;
    }
    setBirthData(JSON.parse(data) as BirthData);
    setAstrologerId(astrId);
    sessionRef.current = sessId;
    checkoutRef.current = sessionStorage.getItem('checkoutSessionId');

    const bookingId = sessionStorage.getItem('bookingId');
    const load = async () => {
      if (bookingId) {
        const response = await fetch(`/api/bookings/${bookingId}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.booking?.canJoin) {
          router.replace(bookingId ? `/call/${bookingId}` : '/home');
          return;
        }
        setBooking({
          id: payload.booking.id,
          durationSec: payload.booking.durationMin * 60,
        });
      }
      const me = await fetch('/api/auth/me').then((response) => response.json()).catch(() => null);
      setPrepaidSeconds(me?.user?.prepaidSeconds ?? 0);
      setReady(true);
    };
    void load();
  }, [router]);

  const finish = async (seconds: number) => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    const activeBookingId = booking?.id ?? sessionStorage.getItem('bookingId');

    if (activeBookingId) {
      try {
        await fetch(`/api/bookings/${activeBookingId}/complete`, { method: 'POST' });
      } catch (error) {
        console.error('Clôture réservation:', error);
      }
      sessionStorage.setItem('callComplete', JSON.stringify({
        durationSeconds: seconds,
        amountCharged: 0,
        astrologerName: advisor?.name,
        astrologerId: advisor?.id ?? astrologerId,
        bookingId: activeBookingId,
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
      });
      const result = response.ok ? await response.json() : null;
      sessionStorage.setItem('callComplete', JSON.stringify({
        durationSeconds: seconds,
        amountCharged: result?.amountCharged ?? 0,
        prepaidSecondsUsed: result?.prepaidSecondsUsed,
        astrologerName: advisor?.name,
        astrologerId: advisor?.id ?? astrologerId,
      }));
    } catch {
      sessionStorage.setItem('callComplete', JSON.stringify({
        durationSeconds: seconds,
        amountCharged: 0,
        astrologerName: advisor?.name,
        astrologerId: advisor?.id ?? astrologerId,
        error: 'Le règlement sera confirmé sous peu',
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
      onFinished={(seconds) => {
        void finish(seconds);
      }}
    />
  );
}
