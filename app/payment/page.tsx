'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BirthData } from '@/lib/types';
import { getAstrologerById } from '@/lib/astrologers';
import {
  CALL_HOLD_CENTS,
  formatCurrency,
  INTRO_CENTS,
  PER_MINUTE_CENTS,
} from '@/lib/pricing';
import PaymentSheet from '@/components/PaymentSheet';

export default function PaymentPage() {
  const router = useRouter();
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [astrologerId, setAstrologerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [collectContact, setCollectContact] = useState(false);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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
  const holdLabel = formatCurrency(CALL_HOLD_CENTS);

  const continueToCall = useCallback(
    (nextSessionId: string, nextCheckoutId: string) => {
      sessionStorage.setItem('sessionId', nextSessionId);
      sessionStorage.setItem('checkoutSessionId', nextCheckoutId);
      router.push('/call');
    },
    [router]
  );

  const handlePayment = async () => {
    if (!birthData || !astrologerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          astrologerId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur de paiement');
      }

      if (data.mock) {
        continueToCall(data.sessionId, data.checkoutSessionId);
        return;
      }

      setClientSecret(data.clientSecret);
      setCheckoutSessionId(data.checkoutSessionId);
      setSessionId(data.sessionId);
      setCollectContact(!!data.collectContact);
      setSheetOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

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
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl font-bold mb-4 text-glow">
            Commencer la consultation
          </h1>
          <p className="text-white/70 text-lg">
            Dernier pas avant de parler à votre astrologue
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 space-y-6 mb-8">
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <div className="text-5xl">{astrologer.avatar}</div>
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-cinzel)] font-semibold">
                {astrologer.name}
              </h2>
              <p className="text-white/60 text-sm">{astrologer.specialties.join(' • ')}</p>
            </div>
          </div>

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

          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">Tarif</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-celestial-gold">
                  {formatCurrency(PER_MINUTE_CENTS)}/min
                </div>
              </div>
            </div>
            <p className="text-xs text-white/50 mb-2">
              Facturation à la seconde. Vous réglez uniquement la durée réelle.
            </p>
            <div className="bg-celestial-gold/10 border border-celestial-gold/30 rounded-lg p-3 mt-3">
              <p className="text-sm text-celestial-gold font-semibold">
                Offre découverte : 2 premières minutes à {formatCurrency(INTRO_CENTS)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-celestial-purple/10 border border-celestial-purple/30 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-3">Paiement dans l’application</h3>
          <p className="text-sm text-white/70 leading-relaxed">
            Une empreinte de {holdLabel} couvre environ dix minutes. Carte, Apple Pay ou Google Pay,
            selon votre appareil. À la fin, seul le montant exact est encaissé. Le reste est libéré.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Préparation...' : 'Régler et commencer'}
        </button>

        <div className="mt-6 text-center text-xs text-white/40">
          <p>Paiement sécurisé par Stripe · Vos données restent protégées</p>
        </div>
      </div>

      <PaymentSheet
        open={sheetOpen}
        title="Empreinte de consultation"
        amountLabel={holdLabel}
        detail="Aucun débit immédiat. Le montant réel de la consultation sera prélevé à la fin, dans la limite de cette empreinte."
        payLabel={`Autoriser ${holdLabel}`}
        clientSecret={clientSecret}
        collectContact={collectContact}
        onClose={closeSheet}
        onSuccess={() => {
          if (sessionId && checkoutSessionId) {
            continueToCall(sessionId, checkoutSessionId);
          }
        }}
      />
    </main>
  );
}
