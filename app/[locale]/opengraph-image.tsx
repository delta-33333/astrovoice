import { ogCard, ogContentType, ogSize } from '@/lib/og-card';
import { isLocale, type Locale } from '@/lib/seo';

export const runtime = 'nodejs';
export const alt = 'Callastral';
export const size = ogSize;
export const contentType = ogContentType;

const TITLE: Record<Locale, string> = {
  fr: 'Consultation par téléphone',
  en: 'Phone consultation',
  es: 'Consulta por teléfono',
  de: 'Beratung am Telefon',
  it: 'Consulto telefonico',
};

export default async function Image(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const title = isLocale(locale) ? TITLE[locale] : 'Callastral';
  return ogCard(title, 'Callastral');
}
