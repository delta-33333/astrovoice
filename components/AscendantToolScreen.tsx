import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import AscendantCalculator from '@/components/AscendantCalculator';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import { getCopy } from '@/lib/ascendant-copy';
import {
  ascendantJsonLd,
  ascendantPath,
  consultChoice,
  isToolLocale,
  type ConsultCandidate,
} from '@/lib/ascendant-tool';
import { aiActLine } from '@/lib/legal';
import { readRates } from '@/lib/market';
import { perMinuteRange } from '@/lib/money';
import {
  advisorPath,
  hreflangAlternates,
  hubPath,
  isLocale,
  localeCurrency,
  localeHomePath,
  specialtyLabel,
  type Locale,
} from '@/lib/seo';
import { listDirectoryAdvisors } from '@/lib/slots';
import { appBaseUrl } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const OPEN_GRAPH_LOCALE: Record<Locale, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  it: 'it_IT',
};

export async function generateAscendantMetadata(
  props: { params: Promise<{ locale: string }> },
  slug: string,
): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale) || !isToolLocale(locale)) return {};
  const path = ascendantPath(locale);
  const copy = getCopy(locale);
  const indexing = `/${locale}/${slug}` === path;
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: path,
      languages: hreflangAlternates(ascendantPath),
    },
    robots: indexing ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: path,
      type: 'website',
      locale: OPEN_GRAPH_LOCALE[locale],
    },
  };
}

export default async function AscendantToolScreen(
  props: { params: Promise<{ locale: string }>; slug: string },
) {
  const { locale } = await props.params;
  if (!isLocale(locale) || !isToolLocale(locale)) notFound();
  if (`/${locale}/${props.slug}` !== ascendantPath(locale)) permanentRedirect(ascendantPath(locale));

  const copy = getCopy(locale);
  let candidates: ConsultCandidate[] = [];
  let profiles: { slug: string; name: string; gender: 'femme' | 'homme'; specialties: string[] }[] = [];
  try {
    const directory = await listDirectoryAdvisors();
    const speakers = directory.advisors.filter((advisor) => advisor.languages.includes(locale));
    candidates = speakers.map((advisor) => ({
      id: advisor.id,
      slug: advisor.slug,
      gender: advisor.gender,
      languages: advisor.languages,
      immediateSlotId: advisor.availability.immediateSlotId,
      immediateStartsAt: advisor.availability.immediateStartsAt,
    }));
    profiles = [...speakers.filter((advisor) => advisor.gender === 'femme'), ...speakers.filter((advisor) => advisor.gender === 'homme')]
      .slice(0, 4)
      .map((advisor) => ({
        slug: advisor.slug,
        name: advisor.name,
        gender: advisor.gender,
        specialties: advisor.specialties.slice(0, 3),
      }));
  } catch {
    candidates = [];
    profiles = [];
  }

  const choice = consultChoice(locale, candidates);
  const cta = choice.gender === 'femme' ? copy.ctaFemme : copy.ctaHomme;
  const range = perMinuteRange(localeCurrency(locale), readRates(), locale);
  const origin = appBaseUrl();
  const path = ascendantPath(locale);

  return (
    <main>
      <SeoChrome locale={locale} alternatePath={ascendantPath} />

      <article className="max-w-3xl mx-auto px-4 py-8">
        <nav aria-label={copy.breadcrumb} className="text-sm text-white/50 mb-4">
          <Link href={localeHomePath(locale)}>{copy.home}</Link>
          <span> / </span>
          <span>{copy.h1}</span>
        </nav>

        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{copy.h1}</h1>
        <p className="mt-4 text-white/80 leading-relaxed">{copy.intro}</p>

        <div className="mt-8">
          <AscendantCalculator labels={copy.form} signs={copy.signs} />
        </div>

        <section className="mt-6 rounded-3xl border border-celestial-gold/30 bg-celestial-purple/10 p-5 sm:p-6">
          <p className="text-sm text-white/75 leading-relaxed">{copy.bridge(range.floor, range.ceiling)}</p>
          <Link href={choice.href} data-funnel="book" className="btn-primary mt-4 inline-block w-full text-center">
            {cta}
          </Link>
          <p className="mt-3 text-xs text-white/50">{aiActLine(locale, choice.gender)}</p>
        </section>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">{copy.methodTitle}</h2>
          <div className="mt-4 space-y-3 text-sm text-white/75 leading-relaxed">
            {copy.method.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">{copy.signsTitle}</h2>
          <ul className="mt-4 space-y-4">
            {Object.entries(copy.signs).map(([key, profile]) => (
              <li key={key}>
                <h3 className="text-lg text-celestial-gold">
                  {copy.signTitle(profile.name)}
                  <span className="text-sm font-normal text-white/50"> · {profile.element} · {profile.modality}</span>
                </h3>
                <p className="mt-1 text-sm text-white/75 leading-relaxed">{profile.reading}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">{copy.faqTitle}</h2>
          {copy.faqs.map((item) => (
            <details key={item.question} className="rounded-xl border border-white/10 p-4">
              <summary className="font-semibold cursor-pointer">{item.question}</summary>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">{copy.advisorsTitle}</h2>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">{copy.advisorsIntro}</p>
          <ul className="mt-4 space-y-3">
            {profiles.map((advisor) => (
              <li key={advisor.slug}>
                <Link href={advisorPath(locale, advisor.slug)} className="underline hover:text-celestial-gold">
                  {advisor.name}
                </Link>
                <p className="text-xs text-white/50">
                  {advisor.gender === 'femme' ? copy.advisorFemme : copy.advisorHomme}
                  {advisor.specialties.length > 0
                    ? ` · ${advisor.specialties.map((item) => specialtyLabel(locale, item)).join(', ')}`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-white/60 space-x-3">
            <Link href={hubPath(locale, 'amour')} className="underline hover:text-white">{copy.linkLove}</Link>
            <Link href={hubPath(locale, 'spiritualité')} className="underline hover:text-white">{copy.linkSpirit}</Link>
            <Link href={hubPath(locale, 'compatibilité')} className="underline hover:text-white">{copy.linkCompat}</Link>
            {copy.pricesHref && copy.linkPrices && (
              <Link href={copy.pricesHref} className="underline hover:text-white">{copy.linkPrices}</Link>
            )}
            <Link href="/offres" className="underline hover:text-white">{copy.linkOffers}</Link>
          </p>
        </section>
      </article>

      <footer className="max-w-3xl mx-auto px-4 py-8 text-xs text-white/50 border-t border-white/10 mt-4 space-x-4">
        <Link href={localeHomePath(locale)} className="hover:text-white">{copy.home}</Link>
        <Link href={copy.aboutHref} className="hover:text-white">{copy.footerAbout}</Link>
        <Link href="/faq" className="hover:text-white">{copy.footerFaq}</Link>
        <Link href="/cgu" className="hover:text-white">{copy.footerTerms}</Link>
        <Link href="/privacy" className="hover:text-white">{copy.footerPrivacy}</Link>
      </footer>

      <JsonLd data={ascendantJsonLd({
        origin,
        locale,
        path,
        h1: copy.h1,
        description: copy.description,
        homeLabel: copy.home,
        faqs: copy.faqs,
      })} />
    </main>
  );
}
