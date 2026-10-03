'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdvisorAvatar from '@/components/AdvisorAvatar';
import { BADGE_LABELS, languageLabel, styleLabel } from '@/lib/advisor-badges';
import type { PublicAdvisor } from '@/lib/types';

export default function AdvisorDirectory({
  advisors,
  unavailable,
}: {
  advisors: PublicAdvisor[];
  unavailable: boolean;
}) {
  const router = useRouter();
  const [hasBirthData, setHasBirthData] = useState(false);

  useEffect(() => {
    setHasBirthData(Boolean(sessionStorage.getItem('birthData')));
  }, []);

  const choose = (advisorId: string) => {
    sessionStorage.setItem('astrologerId', advisorId);
    router.push(hasBirthData ? '/preview' : '/birth');
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 sm:mb-12 sm:text-center">
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-5xl font-bold mb-3 text-glow">
            Choisissez votre astrologue
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl sm:mx-auto">
            {advisors.length > 0
              ? `${advisors.length} conseillers. Chacun lit le thème à sa manière.`
              : 'Les fiches des conseillers apparaîtront ici.'}
          </p>
        </div>

        {unavailable && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/70">
            L’annuaire est momentanément indisponible.
          </div>
        )}

        {!unavailable && advisors.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/70">
            Aucun conseiller n’est disponible pour le moment.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {advisors.map((advisor) => (
            <article
              key={advisor.id}
              className={`p-5 sm:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border text-left ${
                advisor.featured ? 'border-celestial-gold/40' : 'border-white/10'
              }`}
            >
              <div className="flex gap-4">
                <AdvisorAvatar advisor={advisor} size="md" />
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-[family-name:var(--font-cinzel)] font-semibold">
                    {advisor.name}
                  </h2>
                  <p className="text-sm text-white/55 mt-1">
                    {advisor.age} ans · {advisor.languages.map(languageLabel).join(' · ')} ·{' '}
                    {styleLabel(advisor.readingStyle)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {advisor.badges.map((badge) => (
                      <span
                        key={badge}
                        className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full border border-white/15 text-white/80"
                      >
                        {BADGE_LABELS[badge]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-white/75 text-sm mt-4 leading-relaxed">{advisor.bio}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {advisor.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="text-xs px-3 py-1 bg-celestial-purple/20 rounded-full text-celestial-gold border border-celestial-gold/30"
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => choose(advisor.id)}
                className="mt-5 w-full px-6 py-3 bg-gradient-to-r from-celestial-purple to-celestial-blue text-white font-semibold rounded-full"
              >
                Consulter {advisor.firstName}
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
