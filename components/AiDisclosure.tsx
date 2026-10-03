import { aiActLine } from '@/lib/legal';
import type { Locale } from '@/lib/seo';

/** Mention courte exigée avant l’interaction. Réservée à ces lignes. */
export default function AiDisclosure({
  locale = 'fr',
  gender,
  className = '',
}: {
  locale?: Locale;
  gender?: 'femme' | 'homme' | null;
  className?: string;
}) {
  return (
    <p className={`text-xs leading-snug text-white/55 ${className}`}>{aiActLine(locale, gender)}</p>
  );
}
