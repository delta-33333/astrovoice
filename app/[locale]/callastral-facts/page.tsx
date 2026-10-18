import FactsView, { factsMetadata } from '@/components/FactsView';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = factsMetadata('en');

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'en') notFound();
  return <FactsView locale="en" />;
}
