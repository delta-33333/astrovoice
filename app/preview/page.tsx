'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAstrologerById } from '@/lib/astrologers';
import type { BirthData, NatalChart } from '@/lib/types';

export default function PreviewPage() {
  const router = useRouter();
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [astrologerId, setAstrologerId] = useState<string | null>(null);
  const [natalChart, setNatalChart] = useState<NatalChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const astrologer = astrologerId ? getAstrologerById(astrologerId) : null;

  useEffect(() => {
    const data = sessionStorage.getItem('birthData');
    const astrId = sessionStorage.getItem('astrologerId');

    if (!data || !astrId) {
      router.push('/astrologers');
      return;
    }

    setBirthData(JSON.parse(data));
    setAstrologerId(astrId);
    
    // Calculate natal chart
    calculateNatalChart(JSON.parse(data));
  }, [router]);

  const calculateNatalChart = async (bd: BirthData) => {
    try {
      const response = await fetch('/api/natal-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bd),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du calcul du thème natal');
      }

      const chart = await response.json();
      setNatalChart(chart);
      
      // Store for later use
      sessionStorage.setItem('natalChart', JSON.stringify(chart));
    } catch (err) {
      console.error('Natal chart error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de calcul');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/consent');
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
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{astrologer.avatar}</div>
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold mb-2 text-glow">
            Votre Thème Natal
          </h1>
          <p className="text-white/70">
            {astrologer.name} a préparé votre consultation
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="bg-white/5 backdrop-blur-sm p-12 rounded-3xl border border-white/10 text-center">
            <div className="inline-block w-12 h-12 border-4 border-celestial-purple border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/70">Calcul de votre thème natal en cours...</p>
            <p className="text-sm text-white/50 mt-2">
              Positions planétaires, maisons et aspects
            </p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 mb-6">
            <p className="text-red-200">{error}</p>
            <button
              onClick={() => calculateNatalChart(birthData)}
              className="mt-4 text-sm underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Natal Chart Preview */}
        {natalChart && !isLoading && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
              {/* Birth Info */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <h2 className="text-xl font-semibold mb-3">Vos coordonnées de naissance</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/60">Nom :</span>
                    <span className="ml-2 font-medium">{birthData.name}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Date :</span>
                    <span className="ml-2 font-medium">
                      {new Date(birthData.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {birthData.time && (
                    <div>
                      <span className="text-white/60">Heure :</span>
                      <span className="ml-2 font-medium">{birthData.time}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/60">Lieu :</span>
                    <span className="ml-2 font-medium">{birthData.place}</span>
                  </div>
                </div>
              </div>

              {/* Key Planets */}
              {natalChart.planets && natalChart.planets.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Positions planétaires principales</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {natalChart.planets.slice(0, 6).map((planet, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className="font-medium">{planet.name}</span>
                        <span className="text-celestial-gold">{planet.sign}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Message */}
              <div className="bg-celestial-purple/10 border border-celestial-purple/30 rounded-xl p-4">
                <p className="text-sm text-white/80 leading-relaxed">
                  ✨ Votre thème a été établi avec précision. 
                  {astrologer.name} utilisera ces données pour une consultation personnalisée.
                </p>
              </div>
            </div>

            {/* Continue */}
            <button
              onClick={handleContinue}
              className="btn-primary w-full text-lg"
            >
              Continuer vers le paiement
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
