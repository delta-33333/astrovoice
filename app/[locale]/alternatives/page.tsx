import type { Metadata } from 'next';
import { AlternativesHub, hubMetadata } from '@/components/AlternativePage';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  return hubMetadata(locale);
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  return <AlternativesHub locale={locale} />;
}
