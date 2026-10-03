'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdvisorAvatar from '@/components/AdvisorAvatar';
import { BADGE_LABELS, languageLabel, styleLabel } from '@/lib/advisor-badges';
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
}: {
  advisor: DirectoryAdvisor;
  slots: AdvisorSlot[];
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

  const confirm = () => {
    const slot = slots.find((item) => item.id === selected);
    if (!slot) return;
    sessionStorage.setItem('astrologerId', advisor.id);
    sessionStorage.setItem('slotId', slot.id);
    sessionStorage.setItem('slotStartsAt', slot.startsAt);
    router.push('/book');
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Link href="/astrologers" className="text-sm text-white/50 hover:text-white">
          ← Annuaire
        </Link>

        <div className="mt-6 flex gap-4 items-center">
          <AdvisorAvatar advisor={advisor} size="lg" />
          <div>
            <h1 className="font-[family-name:var(--font-cinzel)] text-3xl">{advisor.name}</h1>
            <p className="text-sm text-white/55 mt-1">
              {advisor.age} ans · {advisor.languages.map(languageLabel).join(' · ')} · {styleLabel(advisor.readingStyle)}
            </p>
            {advisor.averageRating != null && advisor.reviewCount >= 5 && (
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

        <p className="mt-4 text-white/75 leading-relaxed">{advisor.bio}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {advisor.specialties.map((item) => (
            <span key={item} className="text-xs px-3 py-1 rounded-full border border-celestial-gold/30 text-celestial-gold">
              {item}
            </span>
          ))}
        </div>

        <section className="mt-8">
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
          className="btn-primary w-full mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuer avec ce créneau
        </button>
      </div>
    </main>
  );
}
