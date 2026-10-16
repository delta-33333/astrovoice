import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AboutService from '@/components/AboutService';
import { aboutMeta } from '@/lib/about';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return aboutMeta('it');
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'it') notFound();
  return <AboutService locale="it" />;
}
