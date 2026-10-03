import { AI_ACT_LINE } from '@/lib/legal';
import type { Locale } from '@/lib/seo';

/** Mention courte exigée avant l’interaction. Réservée à ces lignes. */
export default function AiDisclosure({
  locale = 'fr',
  className = '',
}: {
  locale?: Locale;
  className?: string;
}) {
  return (
    <p className={`text-xs leading-snug text-white/55 ${className}`}>{AI_ACT_LINE[locale]}</p>
  );
}
