import type { Metadata } from 'next';
import GeoAboutPage, { aboutCopy } from '@/components/GeoAboutPage';
import { GEO_PATHS, geoAlternates } from '@/lib/geo-pages';

export const dynamic = 'force-dynamic';

const LOCALE = 'fr' as const;
const copy = aboutCopy(LOCALE);

export const metadata: Metadata = {
  title: `${copy.title} | Callastral`,
  description: copy.description,
  alternates: { canonical: GEO_PATHS.about[LOCALE], languages: geoAlternates('about') },
  openGraph: { title: copy.title, description: copy.description, url: GEO_PATHS.about[LOCALE] },
};

export default function Page() {
  return (
    <div lang={LOCALE}>
      <GeoAboutPage locale={LOCALE} />
    </div>
  );
}
