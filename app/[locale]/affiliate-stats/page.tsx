import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AffiliateStatsForm from '@/components/AffiliateStatsForm';
import SeoChrome from '@/components/SeoChrome';
import { affiliatePath } from '@/lib/affiliate';
import { AFFILIATE_EXTRA, affiliateStatsPath } from '@/lib/affiliate-extra-copy';
import { isLocale } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  return { title: AFFILIATE_EXTRA[locale].stats.title, robots: { index: false, follow: false } };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const extra = AFFILIATE_EXTRA[locale];
  return (
    <main className="pb-16">
      <SeoChrome locale={locale} alternatePath={affiliateStatsPath} />
      <article className="max-w-xl mx-auto px-4 py-8">
        <nav className="text-sm text-white/50 mb-4"><Link href={affiliatePath(locale)}>{extra.stats.back}</Link></nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl text-glow">{extra.stats.title}</h1>
        <p className="mt-3 text-white/80">{extra.stats.intro}</p>
        <div className="mt-6"><AffiliateStatsForm copy={extra.stats} locale={locale} /></div>
        <p className="mt-8 text-sm text-white/70">{extra.contact}</p>
      </article>
    </main>
  );
}
