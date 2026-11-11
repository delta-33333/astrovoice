import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SkyEventPage from '@/components/SkyEventPage';
import { SKY_EVENTS_ORIGIN, skyEventAlternates, skyEventCopy } from '@/lib/sky-events';

const ID = 'marsRetrograde2027' as const;
const LOCALES = ['en', 'fr'] as const;
type L = (typeof LOCALES)[number];
const isLocale = (x: string): x is L => (LOCALES as readonly string[]).includes(x);

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const copy = skyEventCopy(ID, locale);
  const url = `${SKY_EVENTS_ORIGIN}${copy.path}`;
  return {
    title: { absolute: `${copy.title} | Callastral` },
    description: copy.description,
    alternates: { canonical: copy.path, languages: skyEventAlternates(ID) },
    robots: { index: true, follow: true },
    openGraph: { title: copy.title, description: copy.description, url, type: 'article', locale: locale === 'fr' ? 'fr_FR' : 'en_GB' },
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  return <SkyEventPage id={ID} locale={locale} />;
}
