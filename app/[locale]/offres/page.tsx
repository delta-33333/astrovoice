import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OffersPageBody from '@/components/OffersPageBody';
import { OFFERS_COPY } from '@/lib/offers-copy';
import { isLocale, LOCALES } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `/${l}/offres`]));
  return {
    title: `${OFFERS_COPY[locale].title} — Callastral`,
    description: OFFERS_COPY[locale].metaDescription,
    alternates: { canonical: `/${locale}/offres`, languages: { ...languages, 'x-default': '/fr/offres' } },
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  return <OffersPageBody locale={locale} />;
}
