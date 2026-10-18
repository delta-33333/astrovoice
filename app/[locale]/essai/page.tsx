import TrialPage from '@/components/TrialPage';
import { trialPath } from '@/lib/free-call';
import { isLocale } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Essai gratuit de 3 minutes | Callastral',
  description: 'Un code à six chiffres par e-mail ouvre un appel de 3 minutes avec une astrologue IA. Coupure à 180 secondes.',
  robots: { index: false, follow: false },
  alternates: { canonical: trialPath('fr') },
};

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'fr' || !isLocale(locale)) notFound();
  return <TrialPage locale="fr" />;
}
