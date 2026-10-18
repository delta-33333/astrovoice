import FreeTrialForm from '@/components/FreeTrialForm';
import { trialPath } from '@/lib/free-call';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: '3 Minuten kostenlos testen | Callastral',
  description: 'Ein sechsstelliger E-Mail-Code öffnet einen Anruf von 3 Minuten mit einem KI-Astrologen.',
  alternates: { canonical: trialPath('de') },
};

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'de') notFound();
  return <main><FreeTrialForm locale="de" /></main>;
}
