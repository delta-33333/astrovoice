import { notFound } from 'next/navigation';
import { HoroscopePage, horoscopeMetadata } from '@/components/OrganicArticle';
import { horoscopeModel } from '@/lib/weekly-sky';

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'de' }];
}

export function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return horoscopeMetadata('de', props);
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'de') notFound();
  return <HoroscopePage model={horoscopeModel('de', new Date())} />;
}
