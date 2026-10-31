import DailyHoroscopePage, { dailyMetadata, dailyStaticParams, resolveDailyRoute } from '@/components/DailyHoroscopePage';

const LOCALE = 'fr' as const;
type Params = { params: Promise<{ locale: string; slug: string; sign: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return dailyStaticParams(LOCALE, 2);
}

export async function generateMetadata(props: Params) {
  const { locale, slug, sign } = await props.params;
  return dailyMetadata(locale === LOCALE ? resolveDailyRoute(LOCALE, slug, sign) : null);
}

export default async function Page(props: Params) {
  const { locale, slug, sign } = await props.params;
  return <DailyHoroscopePage route={locale === LOCALE ? resolveDailyRoute(LOCALE, slug, sign) : null} />;
}
