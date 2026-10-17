import CoupleToolScreen, { generateCoupleMetadata } from '@/components/CoupleToolScreen';

export const dynamic = 'force-dynamic';

export function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateCoupleMetadata(props, 'partner-kompatibilitaet');
}

export default function Page(props: { params: Promise<{ locale: string }> }) {
  return <CoupleToolScreen {...props} slug="partner-kompatibilitaet" />;
}
