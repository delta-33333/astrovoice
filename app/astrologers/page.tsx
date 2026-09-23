'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { astrologers } from '@/lib/astrologers';
import type { BirthData } from '@/lib/types';

export default function AstrologersPage() {
  const router = useRouter();
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [selectedAstrologer, setSelectedAstrologer] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('birthData');
    if (!data) {
      router.push('/birth');
      return;
    }
    setBirthData(JSON.parse(data));
  }, [router]);

  const handleSelect = (astrologerId: string) => {
    sessionStorage.setItem('astrologerId', astrologerId);
    router.push('/birth');
  };

  if (!birthData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl font-bold mb-4 text-glow">
            Choisissez votre astrologue
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Chaque astrologue apporte son expertise unique. Sélectionnez celui qui résonne avec vos besoins.
          </p>
        </div>

        {/* Astrologers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {astrologers.map((astrologer) => (
            <button
              key={astrologer.id}
              onClick={() => handleSelect(astrologer.id)}
              className={`text-left p-6 bg-white/5 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:bg-white/10 ${
                selectedAstrologer === astrologer.id
                  ? 'border-celestial-purple shadow-lg shadow-celestial-purple/30'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              {/* Avatar */}
              <div className="text-6xl mb-4">{astrologer.avatar}</div>

              {/* Name */}
              <h2 className="text-2xl font-[family-name:var(--font-cinzel)] font-semibold mb-2">
                {astrologer.name}
              </h2>

              {/* Bio */}
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                {astrologer.bio}
              </p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-2">
                {astrologer.specialties.map((specialty, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 bg-celestial-purple/20 rounded-full text-celestial-gold border border-celestial-gold/30"
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-6 text-center">
                <span className="inline-block px-6 py-2 bg-gradient-to-r from-celestial-purple to-celestial-blue text-white font-semibold rounded-full">
                  Consulter {astrologer.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="text-center text-white/50 text-sm">
          <p>Tous nos astrologues sont disponibles immédiatement • 1,49 €/minute</p>
        </div>
      </div>
    </main>
  );
}
