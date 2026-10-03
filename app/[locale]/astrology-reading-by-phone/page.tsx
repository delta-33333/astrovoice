import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GeoConsultationPage, { consultationCopy } from '@/components/GeoConsultationPage';
import { GEO_PATHS, geoAlternates } from '@/lib/geo-pages';

export const dynamic = 'force-dynamic';

const LOCALE = 'en' as const;

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (locale !== LOCALE) return {};
  const copy = consultationCopy(LOCALE);
  return {
    title: `${copy.title} | Callastral`,
    description: copy.description.slice(0, 160),
    alternates: { canonical: GEO_PATHS.consultation[LOCALE], languages: geoAlternates('consultation') },
    openGraph: { title: copy.title, description: copy.description, url: GEO_PATHS.consultation[LOCALE], type: 'article' },
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== LOCALE) notFound();
  return <GeoConsultationPage locale={LOCALE} />;
}
