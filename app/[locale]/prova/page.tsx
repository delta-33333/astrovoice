import TrialPage from '@/components/TrialPage';
import { trialPath } from '@/lib/free-call';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Prova gratuita di 3 minuti | Callastral',
  description: 'Un codice di sei cifre apre una chiamata di 3 minuti con un astrologo IA.',
  robots: { index: false, follow: false },
  alternates: { canonical: trialPath('it') },
};

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'it') notFound();
  return <TrialPage locale="it" />;
}
