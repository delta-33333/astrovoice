'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Pack {
  id: string;
  minutes: number;
  price: number;
  regularPrice: number;
  savings: number;
  popular?: boolean;
}

const packs: Pack[] = [
  {
    id: '10min',
    minutes: 10,
    price: 14.99,
    regularPrice: 19.90,
    savings: 4.91,
  },
  {
    id: '30min',
    minutes: 30,
    price: 39.99,
    regularPrice: 59.70,
    savings: 19.71,
    popular: true,
  },
  {
    id: '60min',
    minutes: 60,
    price: 69.99,
    regularPrice: 119.40,
    savings: 49.41,
  },
];

export default function PacksPage() {
  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async (pack: Pack) => {
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
        setError(data.error || 'Erreur lors de l\'achat');
        setIsPurchasing(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push('/home');
      }
    } catch (err) {
      setError('Erreur de connexion');
      setIsPurchasing(false);
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
            Économisez sur vos consultations avec nos packs prépayés
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {packs.map((pack) => (
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
                  Plus populaire
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">{pack.minutes}</div>
                <div className="text-white/60">minutes</div>
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-celestial-gold mb-1">
                  ${pack.price}
                </div>
                <div className="text-sm text-white/50 line-through">
                  ${pack.regularPrice}
                </div>
                <div className="text-sm text-green-400 mt-2">
                  Économisez ${pack.savings.toFixed(2)}
                </div>
              </div>

              <div className="text-center text-xs text-white/50 mb-6">
                ${(pack.price / pack.minutes).toFixed(2)}/min
              </div>

              <button
                onClick={() => handlePurchase(pack)}
                disabled={isPurchasing && selectedPack === pack.id}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPurchasing && selectedPack === pack.id ? 'Chargement...' : 'Acheter'}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-3">
          <h3 className="font-semibold text-center mb-4">Comment ça marche ?</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-celestial-gold mt-0.5">✓</span>
              <span>Vos minutes sont ajoutées à votre compte immédiatement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-celestial-gold mt-0.5">✓</span>
              <span>Utilisées automatiquement lors de vos appels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-celestial-gold mt-0.5">✓</span>
              <span>Aucune date d'expiration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-celestial-gold mt-0.5">✓</span>
              <span>Si vous dépassez, facturation normale automatique</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
