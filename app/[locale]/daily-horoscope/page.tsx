import DailyHoroscopePage, { dailyMetadata, resolveDailyRoute } from '@/components/DailyHoroscopePage';

const LOCALE = 'en' as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: LOCALE }];
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  return dailyMetadata(locale === LOCALE ? resolveDailyRoute(LOCALE) : null);
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  return <DailyHoroscopePage route={locale === LOCALE ? resolveDailyRoute(LOCALE) : null} />;
}
