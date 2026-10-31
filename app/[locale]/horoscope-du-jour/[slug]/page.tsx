import DailyHoroscopePage, { dailyMetadata, dailyStaticParams, resolveDailyRoute } from '@/components/DailyHoroscopePage';

const LOCALE = 'fr' as const;
type Params = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return dailyStaticParams(LOCALE, 1);
}

export async function generateMetadata(props: Params) {
  const { locale, slug } = await props.params;
  return dailyMetadata(locale === LOCALE ? resolveDailyRoute(LOCALE, slug) : null);
}

export default async function Page(props: Params) {
  const { locale, slug } = await props.params;
  return <DailyHoroscopePage route={locale === LOCALE ? resolveDailyRoute(LOCALE, slug) : null} />;
}
