import Screen, { bigThreeMetadata } from '@/components/BigThreeScreen';

export const dynamic = 'force-dynamic';

export function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return bigThreeMetadata(props);
}

export default function Page(props: { params: Promise<{ locale: string }> }) {
  return <Screen {...props} slug="carta-astral-gratis" />;
}
