import Screen, { affiliateMetadata } from '@/components/AffiliateScreen';

export const dynamic = 'force-dynamic';

export function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return affiliateMetadata(props);
}

export default function Page(props: { params: Promise<{ locale: string }> }) {
  return <Screen {...props} slug="affiliation" />;
}
