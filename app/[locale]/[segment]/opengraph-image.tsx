import { ogCard, ogContentType, ogSize } from '@/lib/og-card';
import { isLocale, phonePhrase, specialtyFromHub, specialtyLabel } from '@/lib/seo';

export const runtime = 'nodejs';
export const alt = 'Callastral';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image(props: { params: Promise<{ locale: string; segment: string }> }) {
  const { locale, segment } = await props.params;
  if (!isLocale(locale)) return ogCard('Callastral', 'Consultation astrologique');
  const specialty = specialtyFromHub(locale, segment);
  if (!specialty) return ogCard('Callastral', phonePhrase(locale));
  const topic = specialtyLabel(locale, specialty);
  return ogCard(topic, phonePhrase(locale));
}
