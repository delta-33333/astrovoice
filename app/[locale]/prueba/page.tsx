import FreeTrialForm from '@/components/FreeTrialForm';
import { trialPath } from '@/lib/free-call';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Prueba gratis de 3 minutos | Callastral',
  description: 'Un código de seis cifras abre una llamada de 3 minutos con un astrólogo IA.',
  alternates: { canonical: trialPath('es') },
};

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'es') notFound();
  return <main><FreeTrialForm locale="es" /></main>;
}
