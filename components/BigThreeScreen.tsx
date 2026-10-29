import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import BigThreeCalculator, { type SignInfo } from '@/components/BigThreeCalculator';
import FreeToolCta from '@/components/FreeToolCta';
import FreeToolLinks from '@/components/FreeToolLinks';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import { getCopy } from '@/lib/ascendant-copy';
import { ASCENDANT_SIGNS } from '@/lib/ascendant-tool';
import { BIG_THREE, COMMON } from '@/lib/free-tools-copy';
import { bigThreePath, type ToolLang } from '@/lib/free-tools';
import { hreflangAlternates, isLocale, localeHomePath } from '@/lib/seo';
import { appBaseUrl } from '@/lib/stripe';
import { risingPath, signByFrench, signPath } from '@/lib/zodiac/signs';

export async function bigThreeMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const copy = BIG_THREE[locale];
  const path = bigThreePath(locale);
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: path, languages: hreflangAlternates(bigThreePath) },
    openGraph: { title: copy.title, description: copy.description, url: path, type: 'website' },
  };
}

export default async function BigThreeScreen(props: { params: Promise<{ locale: string }>; slug: string }) {
  const { locale: raw } = await props.params;
  if (!isLocale(raw)) notFound();
  const locale: ToolLang = raw;
  const path = bigThreePath(locale);
  if (`/${locale}/${props.slug}` !== path) permanentRedirect(path);
  const copy = BIG_THREE[locale];
  const common = COMMON[locale];
  const signCopy = getCopy(locale).signs;
  const signs: Record<string, SignInfo> = {};
  for (const french of ASCENDANT_SIGNS) {
    const id = signByFrench(french);
    const item = signCopy[french];
    signs[french] = {
      name: item.name,
      element: item.element,
      modality: item.modality,
      href: id ? signPath(locale, id) : null,
      risingHref: id ? risingPath(locale, id) : null,
    };
  }
  const origin = appBaseUrl();
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: copy.h1,
      url: `${origin}${path}`,
      description: copy.description,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Any',
      inLanguage: locale,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: locale === 'en' ? 'USD' : 'EUR' },
      publisher: { '@type': 'Organization', name: 'Callastral', url: origin },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: copy.faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: common.home, item: `${origin}${localeHomePath(locale)}` },
        { '@type': 'ListItem', position: 2, name: copy.h1, item: `${origin}${path}` },
      ],
    },
  ];

  return (
    <main className="pb-28 sm:pb-0">
      <SeoChrome locale={locale} alternatePath={bigThreePath} />
      <JsonLd data={jsonLd} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <nav aria-label="breadcrumb" className="text-sm text-white/50 mb-4">
          <Link href={localeHomePath(locale)}>{common.home}</Link><span> / </span><span>{copy.h1}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{copy.h1}</h1>
        <p className="mt-4 text-white/85 leading-relaxed">{copy.answer}</p>
        <div className="mt-8"><BigThreeCalculator copy={copy} signs={signs} /></div>
        <FreeToolCta locale={locale} placement="big-three" lead={copy.resultNext} />
        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-celestial-gold">{copy.howTitle}</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-white/80">{copy.how.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-celestial-gold">{copy.faqTitle}</h2>
          <dl className="mt-3 space-y-4">
            {copy.faq.map((item) => (
              <div key={item.q}><dt className="font-semibold">{item.q}</dt><dd className="mt-1 text-white/75">{item.a}</dd></div>
            ))}
          </dl>
        </section>
        <FreeToolLinks locale={locale} current="big-three" />
      </article>
    </main>
  );
}
