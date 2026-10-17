import CoupleToolScreen, { generateCoupleMetadata } from '@/components/CoupleToolScreen';

export const dynamic = 'force-dynamic';

export function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateCoupleMetadata(props, 'couple-compatibility');
}

export default function Page(props: { params: Promise<{ locale: string }> }) {
  return <CoupleToolScreen {...props} slug="couple-compatibility" />;
}
