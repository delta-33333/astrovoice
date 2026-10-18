import LegalNoticeView, { legalNoticeMetadata } from '@/components/LegalNoticeView';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = legalNoticeMetadata('de');

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'de') notFound();
  return <LegalNoticeView locale="de" />;
}
