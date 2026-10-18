import FreeTrialForm from '@/components/FreeTrialForm';
import { trialPath } from '@/lib/free-call';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Prova gratuita di 3 minuti | Callastral',
  description: 'Un codice di sei cifre apre una chiamata di 3 minuti con un astrologo IA.',
  alternates: { canonical: trialPath('it') },
};

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'it') notFound();
  return <main><FreeTrialForm locale="it" /></main>;
}
