import CoupleShareScreen, { coupleShareMetadata } from '@/components/CoupleShareScreen';

export const dynamic = 'force-dynamic';

export function generateMetadata(props: { params: Promise<{ locale: string; id: string }> }) {
  return coupleShareMetadata(props);
}

export default function Page(props: { params: Promise<{ locale: string; id: string }> }) {
  return <CoupleShareScreen {...props} />;
}
