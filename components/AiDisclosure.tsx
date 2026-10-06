import { AI_VOICE_SHORT } from '@/lib/legal';
import type { Locale } from '@/lib/seo';

/** Mention discrète « Voix générée par IA » (sous le bouton de réservation, avant l'appel). */
export default function AiDisclosure({
  locale = 'fr',
  className = '',
}: {
  locale?: Locale;
  gender?: 'femme' | 'homme' | null;
  className?: string;
}) {
  return <p className={`text-xs leading-snug text-white/45 ${className}`}>{AI_VOICE_SHORT[locale]}</p>;
}
