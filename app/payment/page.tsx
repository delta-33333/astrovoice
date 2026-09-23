'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import type { BirthData } from '@/lib/types';
import { getAstrologerById } from '@/lib/astrologers';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

export default function PaymentPage() {
  const router = useRouter();
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [astrologerId, setAstrologerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('birthData');
    const astrId = sessionStorage.getItem('astrologerId');
    
    if (!data || !astrId) {
      router.push('/birth');
      return;
    }
    
    setBirthData(JSON.parse(data));
    setAstrologerId(astrId);
  }, [router]);

  const astrologer = astrologerId ? getAstrologerById(astrologerId) : null;

  const handlePayment = async () => {
    if (!birthData || !astrologerId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          astrologerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de paiement');
      }

      const { clientSecret, sessionId } = await response.json();

      // Store session ID for the call
      sessionStorage.setItem('sessionId', sessionId);

      // For MVP, we'll use a simple card collection flow
      // In production, implement proper Stripe Elements
      router.push('/call');

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  if (!birthData || !astrologer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl font-bold mb-4 text-glow">
            Commencer la consultation
          </h1>
          <p className="text-white/70 text-lg">
            Dernier pas avant de parler à votre astrologue
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 space-y-6 mb-8">
          {/* Astrologer */}
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <div className="text-5xl">{astrologer.avatar}</div>
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-cinzel)] font-semibold">
                {astrologer.name}
              </h2>
              <p className="text-white/60 text-sm">{astrologer.specialties.join(' • ')}</p>
            </div>
          </div>

          {/* Client info */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Client</span>
              <span className="font-medium">{birthData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Né(e) le</span>
              <span className="font-medium">
                {new Date(birthData.date).toLocaleDateString('fr-FR')}
                {birthData.time && ` à ${birthData.time}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Lieu</span>
              <span className="font-medium">{birthData.place}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">Tarif</span>
              <span className="text-2xl font-bold text-celestial-gold">$1.99/min</span>
            </div>
            <p className="text-xs text-white/50">
              Facturation à la seconde • Vous payez uniquement pour la durée réelle de votre consultation
            </p>
          </div>
        </div>

        {/* Payment info */}
        <div className="bg-celestial-purple/10 border border-celestial-purple/30 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>💳</span>
            Paiement sécurisé
          </h3>
          <p className="text-sm text-white/70 leading-relaxed">
            Nous autorisons votre carte pour un montant maximum de $59.70 (30 minutes). 
            À la fin de votre consultation, seul le montant exact de la durée utilisée sera prélevé.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Préparation...' : 'Démarrer la consultation'}
        </button>

        {/* Security */}
        <div className="mt-6 text-center text-xs text-white/40">
          <p>🔒 Paiement sécurisé par Stripe • Vos données sont protégées</p>
        </div>
      </div>
    </main>
  );
}
