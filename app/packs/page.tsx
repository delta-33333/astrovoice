'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PaymentSheet from '@/components/PaymentSheet';
import { formatCurrency, MINUTE_PACKS, type MinutePack } from '@/lib/pricing';

export default function PacksPage() {
  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [collectContact, setCollectContact] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('Minutes');
  const [sheetAmount, setSheetAmount] = useState('');
  const [sheetDetail, setSheetDetail] = useState('');

  const standardPacks = MINUTE_PACKS.filter((pack) => !pack.founding);
  const founding = MINUTE_PACKS.find((pack) => pack.founding);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setIsPurchasing(false);
    setSelectedPack(null);
  }, []);

  const handlePurchase = async (pack: MinutePack) => {
    setSelectedPack(pack.id);
    setIsPurchasing(true);
    setError('');

    try {
      const response = await fetch('/api/purchase-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Le paiement n’a pas pu être préparé');
        setIsPurchasing(false);
        setSelectedPack(null);
        return;
      }

      setClientSecret(data.clientSecret);
      setCheckoutSessionId(data.checkoutSessionId);
      setCollectContact(!!data.collectContact);
      setSheetTitle(data.label || 'Minutes');
      setSheetAmount(formatCurrency(data.amount));
      setSheetDetail(
        pack.founding
          ? 'Dix minutes ajoutées à votre compte, une seule fois.'
          : `${pack.minutes} minutes ajoutées à votre compte dès confirmation. Elles n’expirent pas.`
      );
      setSheetOpen(true);
      setIsPurchasing(false);
    } catch {
      setError('Erreur de connexion');
      setIsPurchasing(false);
      setSelectedPack(null);
    }
  };

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/home" className="inline-block mb-6 text-white/60 hover:text-white text-sm">
            ← Retour
          </Link>
          <div className="text-4xl mb-4">💎</div>
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl font-bold mb-4 text-glow">
            Packs Minutes
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Des minutes d’avance, au calme, pour vos prochaines consultations Callastral.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {founding && (
          <div className="mb-8 bg-celestial-gold/10 border border-celestial-gold/40 rounded-3xl p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-celestial-gold mb-2">Cercle Fondateur</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <h2 className="font-[family-name:var(--font-cinzel)] text-3xl mb-2">
                  {founding.minutes} minutes
                </h2>
                <p className="text-white/70 text-sm max-w-md">
                  Une place fondateur : dix minutes pour {formatCurrency(founding.amountCents)}, une fois par compte.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-4xl font-bold text-celestial-gold">
                  {formatCurrency(founding.amountCents)}
                </div>
                <div className="text-sm text-white/40 line-through">
                  {formatCurrency(founding.regularCents)}
                </div>
                <button
                  onClick={() => handlePurchase(founding)}
                  disabled={sheetOpen || (isPurchasing && selectedPack === founding.id)}
                  className="btn-primary mt-4 disabled:opacity-50"
                >
                  {isPurchasing && selectedPack === founding.id ? 'Préparation…' : 'Rejoindre'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {standardPacks.map((pack) => (
            <div
              key={pack.id}
              className={`relative bg-white/5 backdrop-blur-sm rounded-3xl border-2 p-8 transition-all ${
                pack.popular
                  ? 'border-celestial-gold shadow-lg shadow-celestial-gold/20'
                  : 'border-white/10'
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-celestial-gold text-celestial-darker px-4 py-1 rounded-full text-xs font-semibold">
                  Plus demandé
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">{pack.minutes}</div>
                <div className="text-white/60">minutes</div>
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-celestial-gold mb-1">
                  {formatCurrency(pack.amountCents)}
                </div>
                <div className="text-sm text-white/50 line-through">
                  {formatCurrency(pack.regularCents)}
                </div>
                <div className="text-sm text-green-400 mt-2">
                  Économisez {formatCurrency(pack.regularCents - pack.amountCents)}
                </div>
              </div>

              <div className="text-center text-xs text-white/50 mb-6">
                {formatCurrency(Math.round(pack.amountCents / pack.minutes))}/min
              </div>

              <button
                onClick={() => handlePurchase(pack)}
                disabled={sheetOpen || (isPurchasing && selectedPack === pack.id)}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPurchasing && selectedPack === pack.id ? 'Préparation…' : 'Choisir'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-3">
          <h3 className="font-semibold text-center mb-4">Comment ça se passe</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-celestial-gold mt-0.5">✓</span>
              <span>Le règlement se fait ici, sans quitter Callastral</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-celestial-gold mt-0.5">✓</span>
              <span>Les minutes sont ajoutées à votre compte dès confirmation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-celestial-gold mt-0.5">✓</span>
              <span>Elles sont utilisées en premier lors de vos appels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-celestial-gold mt-0.5">✓</span>
              <span>Aucune date d’expiration. Au-delà, le tarif à la minute reprend</span>
            </li>
          </ul>
        </div>
      </div>

      <PaymentSheet
        open={sheetOpen}
        title={sheetTitle}
        amountLabel={sheetAmount}
        detail={sheetDetail}
        payLabel={sheetAmount ? `Payer ${sheetAmount}` : 'Payer'}
        clientSecret={clientSecret}
        collectContact={collectContact}
        onClose={closeSheet}
        onSuccess={() => {
          if (!checkoutSessionId) return;
          void fetch('/api/stripe/confirm-prepaid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkoutSessionId }),
          }).finally(() => {
            router.push('/home?pack_success=1');
          });
        }}
      />
    </main>
  );
}
