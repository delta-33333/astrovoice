import { REVIEWS_DISPLAY_MIN } from '@/lib/review-rules';
import type { AdvisorReviews } from '@/lib/reviews';

const COPY: Record<string, { title: string; count: (n: number) => string; verified: string }> = {
  fr: { title: 'Avis de clients', count: (n) => `${n} avis réels après un appel`, verified: 'Après un appel payé' },
  en: { title: 'Client reviews', count: (n) => `${n} real reviews after a call`, verified: 'After a paid call' },
  es: { title: 'Opiniones de clientes', count: (n) => `${n} opiniones reales tras una llamada`, verified: 'Tras una llamada pagada' },
  de: { title: 'Kundenbewertungen', count: (n) => `${n} echte Bewertungen nach einem Gespräch`, verified: 'Nach einem bezahlten Gespräch' },
  it: { title: 'Recensioni dei clienti', count: (n) => `${n} recensioni reali dopo una chiamata`, verified: 'Dopo una chiamata pagata' },
};

const DATE_LOCALE: Record<string, string> = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', de: 'de-DE', it: 'it-IT' };

/** Affiché seulement à partir de 3 avis réels ; sinon rien (pas de faux avis, pas de placeholder). */
export default function ReviewsBlock({ reviews, locale = 'fr' }: { reviews: AdvisorReviews; locale?: string }) {
  if (reviews.count < REVIEWS_DISPLAY_MIN || reviews.average == null) return null;
  const copy = COPY[locale] ?? COPY.fr;
  const dateLocale = DATE_LOCALE[locale] ?? 'fr-FR';
  return (
    <section className="mt-10" aria-labelledby="avis">
      <h2 id="avis" className="text-xl font-semibold">{copy.title}</h2>
      <p className="mt-1 text-sm text-white/70">
        <span className="text-celestial-gold">{'★'.repeat(Math.round(reviews.average))}</span>{' '}
        {reviews.average.toLocaleString(dateLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5 · {copy.count(reviews.count)}
      </p>
      <ul className="mt-4 space-y-3">
        {reviews.items.map((item, index) => (
          <li key={`${item.createdAt}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-celestial-gold">{'★'.repeat(item.stars)}<span className="text-white/20">{'★'.repeat(5 - item.stars)}</span></p>
            <p className="mt-1 text-sm text-white/80">{item.comment}</p>
            <p className="mt-1 text-xs text-white/40">
              {copy.verified} · {new Date(item.createdAt).toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
