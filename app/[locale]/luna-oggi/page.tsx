import Screen, { moonMetadata } from '@/components/MoonTodayScreen';

export const dynamic = 'force-dynamic';

export function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return moonMetadata(props);
}

export default function Page(props: { params: Promise<{ locale: string }> }) {
  return <Screen {...props} slug="luna-oggi" />;
}
