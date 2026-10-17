import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import CoupleTool from '@/components/CoupleTool';
import SeoChrome from '@/components/SeoChrome';
import {
  coupleAlternates,
  coupleMeta,
  couplePath,
  coupleSignLinks,
} from '@/lib/couple-compat';
import { aiActLine } from '@/lib/legal';
import { isLocale } from '@/lib/seo';

export function generateCoupleMetadata(
  props: { params: Promise<{ locale: string }> },
  slug: string,
): Promise<Metadata> {
  return props.params.then(({ locale }) => {
    if (!isLocale(locale)) return {};
    const canonical = couplePath(locale);
    const indexing = `/${locale}/${slug}` === canonical;
    const meta = coupleMeta(locale);
    return {
      title: meta.title,
      description: meta.description,
      alternates: { canonical, languages: indexing ? coupleAlternates() : undefined },
      robots: indexing ? { index: true, follow: true } : { index: false, follow: true },
      openGraph: { title: meta.title, description: meta.description, url: canonical, type: 'website' },
    };
  });
}

export default async function CoupleToolScreen(props: { params: Promise<{ locale: string }>; slug: string }) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const canonical = couplePath(locale);
  if (`/${locale}/${props.slug}` !== canonical) permanentRedirect(canonical);
  const meta = coupleMeta(locale);
  const links = coupleSignLinks(locale);
  return (
    <main>
      <SeoChrome locale={locale} alternatePath={couplePath} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{meta.h1}</h1>
        <p className="mt-4 text-white/80 leading-relaxed">{meta.description}</p>
        <p className="mt-3 text-sm text-white/60">{aiActLine(locale)}</p>
        <CoupleTool locale={locale} />
        <nav className="mt-10" aria-label={meta.h1}>
          <ul className="flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm px-3 py-1 rounded-full border border-celestial-gold/40 text-celestial-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </main>
  );
}
