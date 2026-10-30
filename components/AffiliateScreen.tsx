import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import AffiliateForm from '@/components/AffiliateForm';
import FreeToolLinks from '@/components/FreeToolLinks';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import { affiliatePath } from '@/lib/affiliate';
import { AFFILIATE, COMMON } from '@/lib/free-tools-copy';
import type { ToolLang } from '@/lib/free-tools';
import { hreflangAlternates, isLocale, localeHomePath } from '@/lib/seo';
import { appBaseUrl } from '@/lib/stripe';

export async function affiliateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const copy = AFFILIATE[locale];
  const path = affiliatePath(locale);
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: path, languages: hreflangAlternates(affiliatePath) },
    openGraph: { title: copy.title, description: copy.description, url: path, type: 'website' },
  };
}

export default async function AffiliateScreen(props: { params: Promise<{ locale: string }>; slug: string }) {
  const { locale: raw } = await props.params;
  if (!isLocale(raw)) notFound();
  const locale: ToolLang = raw;
  const path = affiliatePath(locale);
  if (`/${locale}/${props.slug}` !== path) permanentRedirect(path);
  const copy = AFFILIATE[locale];
  const common = COMMON[locale];
  const origin = appBaseUrl();
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: copy.h1,
      url: `${origin}${path}`,
      description: copy.description,
      inLanguage: locale,
      publisher: { '@type': 'Organization', name: 'Callastral', url: origin },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: copy.faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
    },
  ];
  return (
    <main className="pb-16">
      <SeoChrome locale={locale} alternatePath={affiliatePath} />
      <JsonLd data={jsonLd} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <nav aria-label="breadcrumb" className="text-sm text-white/50 mb-4">
          <Link href={localeHomePath(locale)}>{common.home}</Link><span> / </span><span>{copy.h1}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{copy.h1}</h1>
        <p className="mt-4 text-white/85 leading-relaxed">{copy.answer}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {copy.points.map((point) => (
            <li key={point} className="card-glow rounded-2xl border border-celestial-gold/30 bg-celestial-purple/10 p-4 text-sm">{point}</li>
          ))}
        </ul>
        {copy.cta ? <a href="#join" className="btn-primary mt-6 inline-block w-full text-center sm:w-auto">{copy.cta}</a> : null}
        {copy.example ? (
          <section className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-cinzel)] text-xl text-celestial-gold">{copy.example.title}</h2>
            <ul className="mt-3 list-disc pl-5 space-y-1 text-white/85">{copy.example.lines.map((line) => <li key={line}>{line}</li>)}</ul>
            <p className="mt-3 text-xs text-white/55">{copy.example.note}</p>
          </section>
        ) : null}
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-celestial-gold">{copy.howTitle}</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-white/80">{copy.how.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
        <section className="mt-10" id="join">
          <AffiliateForm copy={copy.form} locale={locale} />
        </section>
        <section className="mt-10" id="terms">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-celestial-gold">{copy.termsTitle}</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-white/75">{copy.terms.map((term) => <li key={term}>{term}</li>)}</ul>
        </section>
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-celestial-gold">{copy.faqTitle}</h2>
          <dl className="mt-3 space-y-4">
            {copy.faq.map((item) => (
              <div key={item.q}><dt className="font-semibold">{item.q}</dt><dd className="mt-1 text-white/75">{item.a}</dd></div>
            ))}
          </dl>
        </section>
        <FreeToolLinks locale={locale} current="affiliate" />
      </article>
    </main>
  );
}
