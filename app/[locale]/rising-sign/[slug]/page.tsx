import { organicMetadata, OrganicPage, organicStaticParams } from '@/components/OrganicArticle';
import type { Locale } from '@/lib/seo';

const LOCALES = ['en'] as const satisfies readonly Locale[];
const KIND = 'rising' as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return organicStaticParams(KIND, LOCALES);
}

export function generateMetadata(props: { params: Promise<{ locale: string; slug: string }> }) {
  return organicMetadata(KIND, LOCALES, props);
}

export default function Page(props: { params: Promise<{ locale: string; slug: string }> }) {
  return OrganicPage(KIND, LOCALES, props);
}
