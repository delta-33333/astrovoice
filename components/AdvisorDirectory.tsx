'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import AdvisorAvatar from '@/components/AdvisorAvatar';
import { BADGE_LABELS, languageLabel, styleLabel } from '@/lib/advisor-badges';
import type { DirectoryAdvisor } from '@/lib/types';

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
  { value: 'es', label: 'Espagnol' },
  { value: 'de', label: 'Allemand' },
  { value: 'it', label: 'Italien' },
];

const SPECIALTIES = [
  'amour',
  'carrière',
  'spiritualité',
  'transition de vie',
  'compatibilité',
  'argent',
  'famille',
];

export default function AdvisorDirectory({
  advisors,
  unavailable,
}: {
  advisors: DirectoryAdvisor[];
  unavailable: boolean;
}) {
  const [language, setLanguage] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [availability, setAvailability] = useState('');

  const visible = useMemo(() => {
    return advisors.filter((advisor) => {
      if (language && !advisor.languages.includes(language)) return false;
      if (specialty && !advisor.specialties.includes(specialty)) return false;
      if (availability === 'today' && advisor.availability.slotsToday < 1) return false;
      if (availability === 'now' && !advisor.availability.hasImmediate) return false;
      return true;
    });
  }, [advisors, language, specialty, availability]);

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-10 sm:text-center">
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-5xl font-bold mb-3 text-glow">
            Choisissez votre astrologue
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl sm:mx-auto">
            {advisors.length > 0
              ? `${visible.length} conseiller${visible.length > 1 ? 's' : ''} affiché${visible.length > 1 ? 's' : ''}.`
              : 'Les fiches des conseillers apparaîtront ici.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <label className="text-sm text-white/70">
            Langue
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-1 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3 text-white"
            >
              <option value="">Toutes</option>
              {LANGUAGES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-white/70">
            Spécialité
            <select
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              className="mt-1 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3 text-white"
            >
              <option value="">Toutes</option>
              {SPECIALTIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-white/70">
            Disponibilité
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="mt-1 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3 text-white"
            >
              <option value="">Toutes</option>
              <option value="today">Aujourd’hui</option>
              <option value="now">Disponible maintenant</option>
            </select>
          </label>
        </div>

        {unavailable && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/70">
            L’annuaire est momentanément indisponible.
          </div>
        )}

        {!unavailable && visible.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/70">
            Aucun conseiller ne correspond à ces filtres.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {visible.map((advisor) => (
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
                    <Link href={`/advisors/${advisor.slug}`} className="hover:text-celestial-gold">
                      {advisor.name}
                    </Link>
                  </h2>
                  <p className="text-sm text-white/55 mt-1">
                    {advisor.age} ans · {advisor.languages.map(languageLabel).join(' · ')} ·{' '}
                    {styleLabel(advisor.readingStyle)}
                  </p>
                  {advisor.averageRating != null && advisor.reviewCount >= 5 && (
                    <p className="text-sm text-white/70 mt-1">
                      {advisor.averageRating.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      {' · '}
                      {advisor.reviewCount} avis
                    </p>
                  )}
                  {advisor.availability.scarcity && (
                    <p className="text-sm text-celestial-gold mt-2">{advisor.availability.scarcity}</p>
                  )}
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

              <p className="text-white/75 text-sm mt-4 leading-relaxed line-clamp-4">{advisor.bio}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {advisor.specialties.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-3 py-1 bg-celestial-purple/20 rounded-full text-celestial-gold border border-celestial-gold/30"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <Link
                href={`/advisors/${advisor.slug}`}
                className="mt-5 block text-center w-full px-6 py-3 bg-gradient-to-r from-celestial-purple to-celestial-blue text-white font-semibold rounded-full"
              >
                Voir les créneaux
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
