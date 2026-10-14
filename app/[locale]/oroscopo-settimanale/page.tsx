import { notFound } from 'next/navigation';
import { HoroscopePage, horoscopeMetadata } from '@/components/OrganicArticle';
import { horoscopeModel } from '@/lib/weekly-sky';

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'it' }];
}

export function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return horoscopeMetadata('it', props);
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (locale !== 'it') notFound();
  return <HoroscopePage model={horoscopeModel('it', new Date())} />;
}
