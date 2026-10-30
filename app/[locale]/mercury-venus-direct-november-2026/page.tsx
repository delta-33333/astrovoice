import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SkyEventPage from '@/components/SkyEventPage';
import { SKY_EVENTS_ORIGIN, skyEventAlternates, skyEventCopy } from '@/lib/sky-events';

const LOCALE = 'en' as const;
const ID = 'mercuryVenusDirect' as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: LOCALE }];
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (locale !== LOCALE) return {};
  const copy = skyEventCopy(ID, LOCALE);
  const url = `${SKY_EVENTS_ORIGIN}${copy.path}`;
  return {
    title: { absolute: `${copy.title} | Callastral` },
    description: copy.description,
    alternates: { canonical: copy.path, languages: skyEventAlternates(ID) },
    robots: { index: true, follow: true },
    openGraph: { title: copy.title, description: copy.description, url, type: 'article', locale: 'en_GB' },
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== LOCALE) notFound();
  return <SkyEventPage id={ID} locale={LOCALE} />;
}
