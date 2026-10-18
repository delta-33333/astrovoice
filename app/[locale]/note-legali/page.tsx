import LegalNoticeView, { legalNoticeMetadata } from '@/components/LegalNoticeView';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = legalNoticeMetadata('it');

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'it') notFound();
  return <LegalNoticeView locale="it" />;
}
