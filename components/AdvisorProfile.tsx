'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdvisorAvatar from '@/components/AdvisorAvatar';
import AiDisclosure from '@/components/AiDisclosure';
import { localizedBio } from '@/lib/advisor-bio';
import TrustNotes from '@/components/TrustNotes';
import { BADGE_LABELS, languageLabel, styleLabel } from '@/lib/advisor-badges';
import { bookPath } from '@/lib/book-path';
import { DEFAULT_RATES, quoteAdvisor, type Currency, type PriceRates } from '@/lib/money';
import { exampleQuestions, methodParagraph, readingStyleText } from '@/lib/profile-content';
import { REVIEWS_DISPLAY_MIN } from '@/lib/review-rules';
import { GUARANTEE_TEXT } from '@/lib/guarantee-text';
import { INTRO_MINUTES } from '@/lib/price-bands';
import type { AdvisorSlot, DirectoryAdvisor } from '@/lib/types';

function parisDayLabel(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso));
}

function parisTime(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function parisDayKey(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

export default function AdvisorProfile({
  advisor,
  slots,
  currency = 'eur',
  rates = DEFAULT_RATES,
  reviews,
}: {
  advisor: DirectoryAdvisor;
  slots: AdvisorSlot[];
  currency?: Currency;
  rates?: PriceRates;
  /** Bloc d’avis réels rendu côté serveur (rien sous 3 avis). */
  reviews?: ReactNode;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, AdvisorSlot[]>();
    for (const slot of slots) {
      const key = parisDayKey(slot.startsAt);
      const list = map.get(key) ?? [];
      list.push(slot);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [slots]);

  const immediate = advisor.availability.immediateSlotId
    ? slots.find((slot) => slot.id === advisor.availability.immediateSlotId) ?? null
    : null;

  const go = (slot: AdvisorSlot) => {
    sessionStorage.setItem('astrologerId', advisor.id);
    sessionStorage.setItem('slotId', slot.id);
    sessionStorage.setItem('slotStartsAt', slot.startsAt);
    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'select_slot',
        advisorId: advisor.id,
        metadata: { slotId: slot.id },
      }),
    });
    router.push(bookPath(slot.id, slot.startsAt, advisor.id));
  };

  const confirm = () => {
    const slot = slots.find((item) => item.id === selected);
    if (!slot) return;
    go(slot);
  };

  const quote = quoteAdvisor(advisor.pricePerMinCents, currency, rates);

  return (
    <main className="min-h-screen px-4 pt-8 pb-28">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="text-sm text-white/50 hover:text-white">
          ← Annuaire
        </Link>

        <div className="mt-6 flex gap-4 items-center">
          <AdvisorAvatar advisor={advisor} size="lg" />
          <div>
            <h1 className="font-[family-name:var(--font-cinzel)] text-3xl">{advisor.name}</h1>
            <AiDisclosure gender={advisor.gender} className="mt-2" />
            <p className="text-sm text-white/55 mt-1">
              Style : {styleLabel(advisor.readingStyle)} · {advisor.languages.map(languageLabel).join(' · ')}
            </p>
            {advisor.averageRating != null && advisor.reviewCount >= REVIEWS_DISPLAY_MIN && (
              <p className="text-sm text-white/70 mt-1">
                {advisor.averageRating.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                {' · '}
                {advisor.reviewCount} avis
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {advisor.badges.map((badge) => (
            <span key={badge} className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full border border-white/15 text-white/80">
              {BADGE_LABELS[badge]}
            </span>
          ))}
        </div>

        {advisor.availability.scarcity && (
          <p className="mt-4 text-celestial-gold">{advisor.availability.scarcity}</p>
        )}

        <p className="mt-4 text-white/75 leading-relaxed">{localizedBio(advisor, 'fr')}</p>
        <p className="mt-3 text-white/75 leading-relaxed">{methodParagraph('fr', advisor)}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {advisor.specialties.map((item) => (
            <span key={item} className="text-xs px-3 py-1 rounded-full border border-celestial-gold/30 text-celestial-gold">
              {item}
            </span>
          ))}
        </div>

        <p className="mt-6 text-celestial-gold">
          {quote.introLabel} les 5 premières minutes, puis {quote.perMinLabel}
        </p>
        <TrustNotes className="mt-3" />

        <div className={`mt-6 grid gap-3 ${immediate ? 'sm:grid-cols-2' : ''}`}>
          {immediate && (
            <button type="button" onClick={() => go(immediate)} className="btn-primary w-full">
              Appeler maintenant
            </button>
          )}
          <a href="#creneaux" className={`${immediate ? 'btn-secondary' : 'btn-primary'} w-full text-center`}>
            Réserver un créneau
          </a>
        </div>

        {readingStyleText('fr', advisor.readingStyle) && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Style de lecture</h2>
            <p className="mt-2 text-white/75 leading-relaxed">{readingStyleText('fr', advisor.readingStyle)}</p>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Exemples de questions à poser</h2>
          <div className="mt-3 space-y-3">
            {advisor.specialties.map((specialty) => {
              const questions = exampleQuestions('fr', specialty);
              if (!questions.length) return null;
              return (
                <details key={specialty} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <summary className="cursor-pointer font-semibold capitalize">{specialty}</summary>
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-white/75">
                    {questions.map((question) => <li key={question}>{question}</li>)}
                  </ul>
                </details>
              );
            })}
          </div>
        </section>

        {reviews}

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm text-white/75">
          <h2 className="text-lg font-semibold text-white">Comment ça marche</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>« Appeler maintenant » si {advisor.firstName} est disponible, ou « Réserver un créneau » ci-dessous.</li>
            <li>Vous payez d’avance la durée choisie : {quote.introLabel} les {INTRO_MINUTES} premières minutes, puis {quote.perMinLabel}.</li>
            <li>Vous rejoignez l’appel depuis le navigateur ; votre thème natal est transmis au début.</li>
          </ol>
          <p>Annulation plus de 24 h avant : remboursement intégral ; ensuite, avoir valable 30 jours.</p>
          <p className="text-celestial-gold">{GUARANTEE_TEXT.title}. <Link href="/terms#garantie" className="underline">Conditions</Link></p>
        </section>

        <section id="creneaux" className="mt-8 scroll-mt-24">
          <h2 className="text-lg font-semibold mb-1">Choisir un créneau</h2>
          <p className="text-xs text-white/45 mb-4">Heure de Paris. Le créneau est confirmé au paiement.</p>

          {groups.length === 0 && (
            <p className="text-white/70">Aucun créneau libre sur les sept prochains jours.</p>
          )}

          <div className="space-y-6">
            {groups.map(([day, daySlots]) => (
              <div key={day}>
                <h3 className="text-sm uppercase tracking-wide text-white/50 mb-2 capitalize">
                  {parisDayLabel(daySlots[0].startsAt)}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelected(slot.id)}
                      className={`rounded-xl py-3 text-sm border ${
                        selected === slot.id
                          ? 'border-celestial-gold bg-celestial-gold/15 text-white'
                          : 'border-white/10 bg-white/5 text-white/80'
                      }`}
                    >
                      {parisTime(slot.startsAt)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <button
          type="button"
          disabled={!selected}
          onClick={confirm}
          className="btn-primary w-full mt-8 hidden sm:block disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuer avec ce créneau
        </button>
      </div>

      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0c1018]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {selected ? (
          <button type="button" onClick={confirm} className="btn-primary w-full">
            Continuer avec ce créneau
          </button>
        ) : immediate ? (
          <button type="button" onClick={() => go(immediate)} className="btn-primary w-full">
            Appeler maintenant
          </button>
        ) : (
          <p className="text-center text-sm text-white/60 py-3">Choisissez un horaire</p>
        )}
      </div>
    </main>
  );
}
