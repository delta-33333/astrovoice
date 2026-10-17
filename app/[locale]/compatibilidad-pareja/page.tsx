import CoupleToolScreen, { generateCoupleMetadata } from '@/components/CoupleToolScreen';

export const dynamic = 'force-dynamic';

export function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateCoupleMetadata(props, 'compatibilidad-pareja');
}

export default function Page(props: { params: Promise<{ locale: string }> }) {
  return <CoupleToolScreen {...props} slug="compatibilidad-pareja" />;
}
