'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ReturnClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState('Confirmation du paiement…');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const sessionId = params.get('session_id');
    const flow = params.get('flow');
    if (!sessionId) {
      setFailed(true);
      setMessage('Nous n’avons pas retrouvé ce paiement.');
      return;
    }

    let cancelled = false;

    const confirm = async () => {
      const response = await fetch(`/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`);
      const data = await response.json();
      if (cancelled) return;

      if (!response.ok) {
        setFailed(true);
        setMessage(data.error || 'La confirmation n’a pas abouti.');
        return;
      }

      if (data.purpose === 'prepaid' && data.paymentStatus === 'paid' && data.status === 'complete') {
        await fetch('/api/stripe/confirm-prepaid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutSessionId: sessionId }),
        });
        router.replace('/home?pack_success=1');
        return;
      }

      if (data.purpose === 'call_meter' && data.status === 'complete' && data.sessionId) {
        sessionStorage.setItem('sessionId', data.sessionId);
        sessionStorage.setItem('checkoutSessionId', sessionId);
        router.replace('/call');
        return;
      }

      setFailed(true);
      setMessage(
        flow === 'pack'
          ? 'Le règlement n’a pas été confirmé. Vous pouvez réessayer.'
          : 'L’empreinte n’a pas été confirmée. Vous pouvez réessayer.'
      );
    };

    confirm().catch(() => {
      if (!cancelled) {
        setFailed(true);
        setMessage('La confirmation n’a pas abouti.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <p className="text-white/80">{message}</p>
        {failed && (
          <div className="flex flex-col gap-3">
            <Link href="/payment" className="btn-primary">
              Revenir au paiement
            </Link>
            <Link href="/packs" className="btn-secondary">
              Voir les minutes
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
