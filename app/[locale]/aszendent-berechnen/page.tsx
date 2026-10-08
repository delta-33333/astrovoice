import AscendantToolScreen, { generateAscendantMetadata } from '@/components/AscendantToolScreen';

export const dynamic = 'force-dynamic';

export function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateAscendantMetadata(props, 'aszendent-berechnen');
}

export default function Page(props: { params: Promise<{ locale: string }> }) {
  return <AscendantToolScreen {...props} slug="aszendent-berechnen" />;
}
