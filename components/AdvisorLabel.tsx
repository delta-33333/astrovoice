import { advisorLabel } from '@/lib/legal';
import type { Locale } from '@/lib/seo';

/** « Conseillère Callastral » / « Conseiller Callastral », localisé. */
export default function AdvisorLabel({
  locale = 'fr',
  gender,
  className = '',
}: {
  locale?: Locale;
  gender?: 'femme' | 'homme' | null;
  className?: string;
}) {
  return <p className={`text-xs leading-snug text-white/55 ${className}`}>{advisorLabel(locale, gender)}</p>;
}
