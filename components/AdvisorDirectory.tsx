'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AdvisorAvatar from '@/components/AdvisorAvatar';
import TrustNotes from '@/components/TrustNotes';
import { BADGE_LABELS, languageLabel, styleLabel } from '@/lib/advisor-badges';
import { bookPath } from '@/lib/book-path';
import { formatCurrency, INTRO_CENTS, PER_MINUTE_CENTS } from '@/lib/pricing';
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

function matches(advisor: DirectoryAdvisor, language: string, specialty: string, availability: string): boolean {
  if (language && !advisor.languages.includes(language)) return false;
  if (specialty && !advisor.specialties.includes(specialty)) return false;
  if (availability === 'today' && advisor.availability.slotsToday < 1) return false;
  if (availability === 'now' && !advisor.availability.hasImmediate) return false;
  return true;
}

export default function AdvisorDirectory({
  advisors,
  unavailable,
  initialAvailability = '',
}: {
  advisors: DirectoryAdvisor[];
  unavailable: boolean;
  initialAvailability?: string;
}) {
  const [language, setLanguage] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [availability, setAvailability] = useState(initialAvailability === 'now' ? 'now' : '');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dispo') === 'now') setAvailability('now');
  }, []);

  const strict = useMemo(
    () => advisors.filter((advisor) => matches(advisor, language, specialty, availability)),
    [advisors, language, specialty, availability]
  );

  const filtersOn = Boolean(language || specialty || availability);
  const showingFallback = !unavailable && filtersOn && strict.length === 0 && advisors.length > 0;

  const fallback = useMemo(() => {
    if (!showingFallback) return [];
    const sameLanguage = advisors.filter((advisor) => !language || advisor.languages.includes(language));
    const immediateOthers = sameLanguage.filter((advisor) => advisor.availability.hasImmediate);
    if (immediateOthers.length > 0) return immediateOthers;
    const anyImmediate = advisors.filter((advisor) => advisor.availability.hasImmediate);
    if (anyImmediate.length > 0) return anyImmediate;
    return [...sameLanguage].sort((a, b) => {
      const at = a.availability.nextSlotAt ? new Date(a.availability.nextSlotAt).getTime() : Number.POSITIVE_INFINITY;
      const bt = b.availability.nextSlotAt ? new Date(b.availability.nextSlotAt).getTime() : Number.POSITIVE_INFINITY;
      return at - bt;
    }).slice(0, 6);
  }, [advisors, language, showingFallback]);

  const visible = strict.length > 0 ? strict : fallback;
  const lead = visible.find((advisor) => advisor.availability.hasImmediate && advisor.availability.immediateSlotId);

  const reset = () => {
    setLanguage('');
    setSpecialty('');
    setAvailability('');
  };

  return (
    <main className="min-h-screen px-4 pt-8 pb-28 sm:pb-12 sm:py-12">
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
          <p className="text-sm text-celestial-gold mt-2">
            {formatCurrency(INTRO_CENTS)}/min les 3 premières minutes, puis {formatCurrency(PER_MINUTE_CENTS)}/min
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

        {showingFallback && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
            <p className="text-white/70">Aucun conseiller ne correspond exactement à ces filtres.</p>
            <h2 className="text-lg font-semibold mt-2">Disponibles maintenant dans d’autres spécialités</h2>
            <button type="button" onClick={reset} className="mt-3 text-sm text-celestial-gold underline">
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {!unavailable && !showingFallback && visible.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/70">
            Aucun conseiller ne correspond à ces filtres.
            {filtersOn && (
              <button type="button" onClick={reset} className="mt-3 block text-sm text-celestial-gold underline">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {visible.map((advisor, index) => {
            const callHref = advisor.availability.immediateSlotId && advisor.availability.immediateStartsAt
              ? bookPath(advisor.availability.immediateSlotId, advisor.availability.immediateStartsAt, advisor.id)
              : null;
            return (
              <motion.article
                key={advisor.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.32), ease: 'easeOut' }}
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

                <p className="text-sm text-white/70 mt-4">
                  {formatCurrency(INTRO_CENTS)}/min puis {formatCurrency(PER_MINUTE_CENTS)}/min
                </p>

                <div className="mt-4 grid gap-2">
                  {callHref && (
                    <Link href={callHref} className="btn-primary block text-center w-full">
                      Appeler maintenant
                    </Link>
                  )}
                  <Link
                    href={`/advisors/${advisor.slug}`}
                    className={`${callHref ? 'btn-secondary' : 'btn-primary'} block text-center w-full`}
                  >
                    Voir les créneaux
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {lead?.availability.immediateSlotId && lead.availability.immediateStartsAt && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0c1018]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Link
            href={bookPath(lead.availability.immediateSlotId, lead.availability.immediateStartsAt, lead.id)}
            className="btn-primary block text-center w-full"
          >
            Appeler maintenant
          </Link>
          <TrustNotes className="justify-center mt-2" />
        </div>
      )}
    </main>
  );
}
