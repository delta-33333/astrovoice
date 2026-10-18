import FreeTrialForm from '@/components/FreeTrialForm';
import { trialPath } from '@/lib/free-call';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: '3-minute free call | Callastral',
  description: 'A six-digit email code unlocks a 3-minute call with an AI astrologer. The server ends it at 180 seconds.',
  alternates: { canonical: trialPath('en') },
};

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'en') notFound();
  return <main><FreeTrialForm locale="en" /></main>;
}
