'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AdvisorAvatar from '@/components/AdvisorAvatar';
import AiDisclosure from '@/components/AiDisclosure';
import TrustNotes from '@/components/TrustNotes';
import { BADGE_LABELS, languageLabel, styleLabel } from '@/lib/advisor-badges';
import { localizedBio } from '@/lib/advisor-bio';
import { bookPath } from '@/lib/book-path';
import {
  DEFAULT_RATES,
  perMinuteRange,
  quoteAdvisor,
  type AdvisorLang,
  type Currency,
  type FxRates,
} from '@/lib/money';
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
  preferredLanguage = 'fr',
  currency = 'eur',
  rates = DEFAULT_RATES,
  embedded = false,
  highlightId = '',
}: {
  advisors: DirectoryAdvisor[];
  unavailable: boolean;
  initialAvailability?: string;
  preferredLanguage?: AdvisorLang;
  currency?: Currency;
  rates?: FxRates;
  embedded?: boolean;
  highlightId?: string;
}) {
  const [language, setLanguage] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [availability, setAvailability] = useState(initialAvailability === 'now' ? 'now' : '');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dispo') === 'now') setAvailability('now');
  }, []);

  const ordered = useMemo(() => {
    const pool = highlightId ? advisors.filter((advisor) => advisor.id === highlightId) : advisors;
    return [...pool].sort((a, b) => {
      const immediate = Number(b.availability.hasImmediate) - Number(a.availability.hasImmediate);
      if (immediate !== 0) return immediate;
      const lang =
        Number(b.languages.includes(preferredLanguage)) - Number(a.languages.includes(preferredLanguage));
      if (lang !== 0) return lang;
      return Number(b.featured) - Number(a.featured);
    });
  }, [advisors, preferredLanguage, highlightId]);

  const strict = useMemo(
    () => ordered.filter((advisor) => matches(advisor, language, specialty, availability)),
    [ordered, language, specialty, availability]
  );

  const filtersOn = Boolean(language || specialty || availability);
  const showingFallback = !unavailable && filtersOn && strict.length === 0 && advisors.length > 0;

  const fallback = useMemo(() => {
    if (!showingFallback) return [];
    const sameLanguage = ordered.filter((advisor) => !language || advisor.languages.includes(language));
    const immediateOthers = sameLanguage.filter((advisor) => advisor.availability.hasImmediate);
    if (immediateOthers.length > 0) return immediateOthers;
    const anyImmediate = ordered.filter((advisor) => advisor.availability.hasImmediate);
    if (anyImmediate.length > 0) return anyImmediate;
    return [...sameLanguage].sort((a, b) => {
      const at = a.availability.nextSlotAt ? new Date(a.availability.nextSlotAt).getTime() : Number.POSITIVE_INFINITY;
      const bt = b.availability.nextSlotAt ? new Date(b.availability.nextSlotAt).getTime() : Number.POSITIVE_INFINITY;
      return at - bt;
    }).slice(0, 6);
  }, [ordered, language, showingFallback]);

  const visible = strict.length > 0 ? strict : fallback;
  const lead = visible.find((advisor) => advisor.availability.hasImmediate && advisor.availability.immediateSlotId);
  const floor = perMinuteRange(currency, rates).floor;

  const reset = () => {
    setLanguage('');
    setSpecialty('');
    setAvailability('');
  };

  const selectClass = 'mt-1 w-full rounded-lg bg-white/10 border border-white/15 px-2 py-2 text-xs sm:text-sm text-white';

  const body = (
    <div id="annuaire" className="max-w-6xl mx-auto">
      <div className={embedded ? 'mb-4' : 'mb-6 sm:mb-10 sm:text-center'}>
        <h2 className={`font-[family-name:var(--font-cinzel)] font-bold text-glow ${embedded ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-5xl mb-3'}`}>
          Disponible maintenant
        </h2>
        <p className="text-white/70 text-sm sm:text-base mt-1">
          {advisors.length > 0
            ? `${visible.length} conseiller${visible.length > 1 ? 's' : ''} affiché${visible.length > 1 ? 's' : ''}.`
            : 'Les fiches des conseillers apparaîtront ici.'}
        </p>
        <p className="text-sm text-celestial-gold mt-1">
          À partir de {floor}/min · tarif réduit les 3 premières minutes
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <label className="text-xs text-white/70">
          Langue
          <select value={language} onChange={(event) => setLanguage(event.target.value)} className={selectClass}>
            <option value="">Toutes</option>
            {LANGUAGES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-white/70">
          Spécialité
          <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} className={selectClass}>
            <option value="">Toutes</option>
            {SPECIALTIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-white/70">
          Dispo
          <select value={availability} onChange={(event) => setAvailability(event.target.value)} className={selectClass}>
            <option value="">Toutes</option>
            <option value="today">Aujourd’hui</option>
            <option value="now">Maintenant</option>
          </select>
        </label>
      </div>

      {highlightId && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <p className="text-white/75">Reprendre avec ce conseiller.</p>
          <Link href="/?dispo=now" className="mt-2 inline-block text-sm text-celestial-gold underline">
            Voir tout l’annuaire
          </Link>
        </div>
      )}

      {unavailable && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white/70">
          L’annuaire est momentanément indisponible.
        </div>
      )}

      {showingFallback && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <p className="text-white/70">Aucun conseiller ne correspond exactement à ces filtres.</p>
          <h3 className="text-lg font-semibold mt-2">Disponibles maintenant dans d’autres spécialités</h3>
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
          const quote = quoteAdvisor(advisor.pricePerMinCents, currency, rates);
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
                  <h3 className="text-xl sm:text-2xl font-[family-name:var(--font-cinzel)] font-semibold">
                    <Link href={`/advisors/${advisor.slug}`} className="hover:text-celestial-gold">
                      {advisor.name}
                    </Link>
                  </h3>
                  <AiDisclosure gender={advisor.gender} className="mt-1" />
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

              <p className="text-white/75 text-sm mt-4 leading-relaxed line-clamp-4">{localizedBio(advisor, 'fr')}</p>

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

              <p className="text-sm text-white/80 mt-4">
                <span className="text-celestial-gold font-semibold">{quote.perMinLabel}</span>
                {' · '}
                {quote.introLabel} les 3 premières minutes
              </p>

              <div className="mt-4">
                {callHref ? (
                  <Link href={callHref} className="btn-primary block text-center w-full">
                    Appeler maintenant
                  </Link>
                ) : (
                  <Link href={`/advisors/${advisor.slug}`} className="btn-primary block text-center w-full">
                    Prendre RDV
                  </Link>
                )}
              </div>
            </motion.article>
          );
        })}
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
    </div>
  );

  if (embedded) {
    return <section className="px-4 pt-6 pb-8">{body}</section>;
  }

  return <main className="min-h-screen px-4 pt-8 pb-28 sm:pb-12">{body}</main>;
}
