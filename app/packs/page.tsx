'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PaymentSheet from '@/components/PaymentSheet';
import { FIXED_PACKS, formatCurrency, type MinutePack } from '@/lib/pricing';
import { DROP_CREDIT, FIXED_PRICE_LINE } from '@/lib/trust-copy';

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
  const [labels, setLabels] = useState<Record<string, { amountLabel: string; regularLabel: string; perMinLabel: string; savingsLabel: string }>>({});

  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const autoPicked = useRef(false);
  const [wanted, setWanted] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const l = params.get('lang') === 'en' ? 'en' : 'fr';
    setLang(l);
    setWanted(params.get('pack'));
    fetch(`/api/market?lang=${l}`)
      .then((response) => response.json())
      .then((payload) => {
        const next: typeof labels = {};
        if (Array.isArray(payload.packs)) {
          for (const pack of payload.packs) next[pack.id] = pack;
        }
        setLabels(next);
      })
      .catch(() => undefined);
  }, []);

  const amountOf = (pack: MinutePack) => labels[pack.id]?.amountLabel || formatCurrency(pack.amountCents);
  const perMinOf = (pack: MinutePack) => labels[pack.id]?.perMinLabel || `${formatCurrency(Math.round(pack.amountCents / pack.minutes))}/min`;

  const standardPacks = FIXED_PACKS;

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
        body: JSON.stringify({ packId: pack.id, lang }),
      });
      if (response.status === 401) {
        sessionStorage.setItem('afterAuth', `/packs?pack=${pack.id}&lang=${lang}`);
        router.push('/auth');
        return;
      }

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
      setSheetAmount(typeof data.amountLabel === 'string' && data.amountLabel ? data.amountLabel : formatCurrency(data.amount));
      setSheetDetail(
        pack.founding
          ? 'Dix minutes ajoutées à votre compte, une seule fois.'
          : lang === 'en'
            ? `${pack.minutes} minutes added to your account once confirmed. One-off payment, no subscription, no auto top-up.`
            : `${pack.minutes} minutes ajoutées à votre compte dès confirmation. Paiement unique : pas d’abonnement, pas de recharge automatique.`
      );
      setSheetOpen(true);
      setIsPurchasing(false);
    } catch {
      setError('Erreur de connexion');
      setIsPurchasing(false);
      setSelectedPack(null);
    }
  };

  // Pack choisi depuis l’accueil ou /offres : ouvre directement le paiement.
  useEffect(() => {
    if (autoPicked.current || !wanted) return;
    const pack = standardPacks.find((item) => item.id === wanted);
    if (!pack) return;
    autoPicked.current = true;
    void handlePurchase(pack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted]);

  const en = lang === 'en';
  return (
    <main className="min-h-screen px-4 py-12" lang={lang}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Link href={en ? '/en' : '/'} className="inline-block mb-6 text-white/60 hover:text-white text-sm">
            {en ? '← Back' : '← Retour'}
          </Link>
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl font-bold mb-4 text-glow">
            {en ? 'Fixed-price minute packs' : 'Packs de minutes à prix fixe'}
          </h1>
          <p className="text-xl text-celestial-gold font-semibold">{FIXED_PRICE_LINE[lang]}</p>
          <p className="text-white/70 mt-3 max-w-2xl mx-auto">
            {en
              ? 'You pay once. The call stops by itself when your minutes are used. No subscription, no auto top-up.'
              : 'Vous payez une fois. L’appel s’arrête tout seul quand vos minutes sont utilisées. Pas d’abonnement, pas de recharge automatique.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {standardPacks.map((pack) => (
            <div
              key={pack.id}
              data-pack={pack.id}
              className={`relative bg-white/5 backdrop-blur-sm rounded-3xl border-2 p-8 transition-all ${
                pack.popular ? 'border-celestial-gold shadow-lg shadow-celestial-gold/20' : 'border-white/10'
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-5xl font-bold mb-2">{pack.minutes}</div>
                <div className="text-white/60">minutes</div>
              </div>
              <div className="text-center mb-2 text-4xl font-bold text-celestial-gold">{amountOf(pack)}</div>
              <div className="text-center text-xs text-white/50 mb-6">{perMinOf(pack)}</div>
              <button
                onClick={() => handlePurchase(pack)}
                disabled={sheetOpen || (isPurchasing && selectedPack === pack.id)}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPurchasing && selectedPack === pack.id ? (en ? 'Preparing…' : 'Préparation…') : en ? 'Choose' : 'Choisir'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <ul className="space-y-2 text-sm text-white/70">
            {(en
              ? ['One-off payment on Callastral (Stripe), nothing recurring', 'Minutes are added to your account once confirmed and never expire', 'The call stops automatically when your minutes run out: never a cent more', DROP_CREDIT.en]
              : ['Paiement unique sur Callastral (Stripe), rien de récurrent', 'Les minutes sont ajoutées dès confirmation et n’expirent pas', 'L’appel s’arrête automatiquement quand vos minutes sont épuisées : jamais un centime de plus', DROP_CREDIT.fr]
            ).map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="text-celestial-gold mt-0.5">✓</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PaymentSheet
        funnelKind="pack"
        open={sheetOpen}
        title={sheetTitle}
        amountLabel={sheetAmount}
        detail={sheetDetail}
        payLabel={sheetAmount ? `${en ? 'Pay' : 'Payer'} ${sheetAmount}` : en ? 'Pay' : 'Payer'}
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
