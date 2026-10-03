'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PaymentSheet from '@/components/PaymentSheet';

export default function ResumePage() {
  return (
    <Suspense fallback={<main className="min-h-screen grid place-items-center text-white/60">Chargement…</main>}>
      <ResumeClient />
    </Suspense>
  );
}

function ResumeClient() {
  const params = useParams<{ bookingId: string }>();
  const search = useSearchParams();
  const paid = search.get('paid') === '1';
  const [message, setMessage] = useState(paid ? 'Confirmation du résumé…' : 'Résumé écrit de votre consultation');
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [summaryLabel, setSummaryLabel] = useState('…');

  useEffect(() => {
    fetch('/api/market')
      .then((response) => response.json())
      .then((payload) => {
        if (typeof payload.summaryLabel === 'string') setSummaryLabel(payload.summaryLabel);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!paid) return;
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) {
      setDone(true);
      setMessage('Paiement reçu. Le résumé part par e-mail.');
      return;
    }
    fetch('/api/summaries/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutSessionId: sessionId }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Confirmation impossible');
        setDone(true);
        setMessage(
          payload.delivery === 'wait'
            ? 'Paiement reçu. Le résumé part par e-mail dès la fin de la consultation.'
            : 'Le résumé est en route vers votre e-mail.'
        );
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Confirmation impossible');
      });
  }, [paid]);

  const start = async () => {
    setOpen(true);
    const response = await fetch('/api/summaries/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: params.bookingId }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.clientSecret) {
      setOpen(false);
      setMessage(payload?.error || 'Le paiement est indisponible.');
      return;
    }
    setClientSecret(payload.clientSecret);
    setCheckoutId(payload.checkoutSessionId);
    if (typeof payload.amountLabel === 'string') setSummaryLabel(payload.amountLabel);
  };

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-md mx-auto text-center space-y-5">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl">Résumé écrit</h1>
        <p className="text-white/75">{message}</p>
        {!paid && !done && (
          <button type="button" onClick={() => void start()} className="btn-primary w-full">
            Recevoir le résumé · {summaryLabel}
          </button>
        )}
        <Link href="/home" className="block text-sm text-white/45">Retour à l’accueil</Link>
      </div>
      <PaymentSheet
        open={open}
        title="Résumé écrit"
        amountLabel={summaryLabel}
        detail="Envoyé par e-mail après confirmation du paiement."
        payLabel={`Payer ${summaryLabel}`}
        clientSecret={clientSecret}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          if (!checkoutId) return;
          void fetch('/api/summaries/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkoutSessionId: checkoutId }),
          }).then(async (response) => {
            const payload = await response.json();
            setOpen(false);
            if (!response.ok) {
              setMessage(payload.error || 'Le paiement n’a pas été confirmé.');
              return;
            }
            setDone(true);
            setMessage(
              payload.delivery === 'wait'
                ? 'Paiement reçu. Le résumé part par e-mail dès la fin de la consultation.'
                : 'Le résumé est en route vers votre e-mail.'
            );
          });
        }}
      />
    </main>
  );
}
