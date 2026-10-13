import type { Metadata } from 'next';
import { AlternativeArticle, alternativeMetadata } from '@/components/AlternativePage';

const ID = 'california-psychics';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  return alternativeMetadata(locale, ID);
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  return <AlternativeArticle locale={locale} id={ID} />;
}
