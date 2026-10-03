import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GeoPricesPage, { pricesCopy } from '@/components/GeoPricesPage';
import { GEO_PATHS, geoAlternates } from '@/lib/geo-pages';

const LOCALE = 'en' as const;

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (locale !== LOCALE) return {};
  const copy = pricesCopy(LOCALE);
  return {
    title: `${copy.title} | Callastral`,
    description: copy.description,
    alternates: { canonical: GEO_PATHS.prices[LOCALE], languages: geoAlternates('prices') },
    openGraph: { title: copy.title, description: copy.description, url: GEO_PATHS.prices[LOCALE], type: 'article' },
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== LOCALE) notFound();
  return <GeoPricesPage locale={LOCALE} />;
}
