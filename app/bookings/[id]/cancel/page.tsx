'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function CancelBookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ mode: 'refund' | 'credit'; amountCents: number; amountLabel?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const cancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${params.id}/cancel`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Annulation impossible');
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Annulation impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl">Annuler la consultation</h1>
        <p className="text-white/75 leading-relaxed">
          Plus de 24 heures avant le début, le montant payé est remboursé. En dessous, il devient un avoir valable 30 jours sur une nouvelle réservation.
        </p>
        {result && (
          <p className="text-celestial-gold">
            {result.mode === 'refund'
              ? `${result.amountLabel || ''} sera remboursé.`
              : `Avoir de ${result.amountLabel || ''}, valable 30 jours.`}
          </p>
        )}
        {error && <p className="text-red-200 text-sm">{error}</p>}
        {!result && (
          <button type="button" onClick={() => void cancel()} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Annulation…' : 'Confirmer l’annulation'}
          </button>
        )}
        <p>
          <button type="button" onClick={() => router.push(`/bookings/${params.id}`)} className="text-sm text-white/50 underline">
            Retour
          </button>
        </p>
        <Link href="/astrologers" className="text-sm text-white/50">Annuaire</Link>
      </div>
    </main>
  );
}
