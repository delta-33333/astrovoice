import LegalNoticeView, { legalNoticeMetadata } from '@/components/LegalNoticeView';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = legalNoticeMetadata('es');

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'es') notFound();
  return <LegalNoticeView locale="es" />;
}
