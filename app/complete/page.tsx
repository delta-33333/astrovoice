'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDuration } from '@/lib/utils';

interface CallCompleteData {
  durationSeconds: number;
  amountCharged: number;
  astrologerName?: string;
  error?: string;
}

export default function CompletePage() {
  const router = useRouter();
  const [data, setData] = useState<CallCompleteData | null>(null);

  useEffect(() => {
    const completeData = sessionStorage.getItem('callComplete');
    if (!completeData) {
      router.push('/');
      return;
    }

    setData(JSON.parse(completeData));
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Chargement...</div>
      </div>
    );
  }

  const minutes = Math.ceil(data.durationSeconds / 60);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="text-7xl mb-6">✨</div>

        {/* Header */}
        <h1 className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl font-bold mb-4 text-glow">
          Consultation terminée
        </h1>
        <p className="text-white/70 text-lg mb-12">
          Merci d'avoir consulté {data.astrologerName || 'nos astrologues'}
        </p>

        {/* Receipt */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 space-y-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Récapitulatif</h2>

          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-white/60">Durée</span>
              <span className="text-xl font-semibold">
                {formatDuration(data.durationSeconds)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-white/60">Tarif</span>
              <span className="text-lg">$1.99/min</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-semibold">Total</span>
              <span className="text-3xl font-bold text-celestial-gold">
                {formatCurrency(data.amountCharged)}
              </span>
            </div>
          </div>

          {data.error && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 mt-4">
              <p className="text-sm text-yellow-200">{data.error}</p>
            </div>
          )}

          <p className="text-xs text-white/50 pt-4 border-t border-white/10">
            Un reçu a été envoyé par email • Paiement sécurisé par Stripe
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link href="/birth" className="btn-primary inline-block">
            Réserver une nouvelle consultation
          </Link>
          <br />
          <Link href="/" className="btn-secondary inline-block mt-4">
            Retour à l'accueil
          </Link>
        </div>

        {/* Testimonial */}
        <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-sm text-white/70 italic leading-relaxed">
            "Nos astrologues sont disponibles 24/7 pour vous guider sur votre chemin. Chaque consultation est unique et personnalisée."
          </p>
        </div>
      </div>
    </main>
  );
}
