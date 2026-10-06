import type { Metadata } from 'next';
import Link from 'next/link';
import AdvisorLabel from '@/components/AdvisorLabel';
import JsonLd from '@/components/JsonLd';
import { GEO_PATHS } from '@/lib/geo-pages';
import SeoChrome from '@/components/SeoChrome';
import { readRates } from '@/lib/market';
import { perMinuteRange, quoteAdvisor } from '@/lib/money';
import { listDirectoryAdvisors } from '@/lib/slots';
import {
  SPECIALTY_IDS,
  advisorPath,
  advisorSpeaks,
  availabilitySentence,
  homeFaqs,
  homeLabel,
  hreflangAlternates,
  hubPath,
  isLocale,
  localeCurrency,
  localeHomePath,
  specialtyLabel,
} from '@/lib/seo';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const TITLE: Record<string, string> = {
  fr: 'Consultation par téléphone avec un astrologue | Callastral',
  en: 'Phone consultation with an astrologer | Callastral',
  es: 'Consulta por teléfono con un astrólogo | Callastral',
  de: 'Beratung am Telefon mit einem Astrologen | Callastral',
  it: 'Consulto telefonico con un astrologo | Callastral',
};

const INTRO: Record<string, string> = {
  fr: 'Callastral met en relation avec un astrologue pour une consultation par téléphone, à partir de votre thème natal. Le tarif de chaque conseiller est affiché avant le paiement, entre un plancher et un plafond clairs. Les trois premières minutes sont à tarif réduit.',
  en: 'Callastral connects you with an astrologer for a phone consultation based on your birth chart. Each advisor’s rate is shown before payment, between a clear floor and ceiling. The first three minutes use a reduced rate.',
  es: 'Callastral le pone en contacto con un astrólogo para una consulta por teléfono a partir de su carta natal. La tarifa de cada consejero se muestra antes del pago. Los tres primeros minutos tienen una tarifa reducida.',
  de: 'Callastral verbindet Sie mit einem Astrologen für eine telefonische Beratung anhand Ihres Geburtshoroskops. Der Tarif jedes Beraters steht vor der Zahlung. Die ersten drei Minuten sind ermäßigt.',
  it: 'Callastral ti mette in contatto con un astrologo per un consulto telefonico a partire dal tema natale. La tariffa di ogni consulente è indicata prima del pagamento. I primi tre minuti hanno una tariffa ridotta.',
};

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const path = localeHomePath(locale);
  return {
    title: TITLE[locale],
    description: INTRO[locale].slice(0, 160),
    alternates: {
      canonical: path,
      languages: hreflangAlternates(localeHomePath),
    },
    openGraph: { title: TITLE[locale], description: INTRO[locale].slice(0, 160), url: path },
  };
}

export default async function LocaleHome(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();

  const currency = localeCurrency(locale);
  const rates = readRates();
  const { floor, ceiling } = perMinuteRange(currency, rates, locale);
  let advisors: Awaited<ReturnType<typeof listDirectoryAdvisors>>['advisors'] = [];
  try {
    advisors = (await listDirectoryAdvisors()).advisors;
  } catch {
    advisors = [];
  }
  const ordered = advisors
    .filter((advisor) => advisorSpeaks(advisor.languages, locale))
    .sort((a, b) => Number(b.availability.hasImmediate) - Number(a.availability.hasImmediate));
  const faqs = homeFaqs(locale, floor, ceiling);

  return (
    <main>
      <SeoChrome locale={locale} alternatePath={localeHomePath} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{TITLE[locale].replace(' | Callastral', '')}</h1>
        <p className="mt-4 text-white/80 leading-relaxed">{INTRO[locale]} {floor}–{ceiling}/min.</p>

        <nav className="mt-8" aria-label={homeLabel(locale)}>
          <ul className="flex flex-wrap gap-2">
            {SPECIALTY_IDS.map((specialty) => (
              <li key={specialty}>
                <Link href={hubPath(locale, specialty)} className="text-sm px-3 py-1 rounded-full border border-celestial-gold/40 text-celestial-gold">
                  {specialtyLabel(locale, specialty)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="mt-8 space-y-4">
          {ordered.map((advisor) => {
            const quote = quoteAdvisor(advisor.pricePerMinCents, currency, rates, undefined, locale);
            return (
              <li key={advisor.id} className="rounded-2xl border border-white/10 p-4">
                <h2 className="text-xl font-[family-name:var(--font-cinzel)]">
                  <Link href={advisorPath(locale, advisor.slug)} className="hover:text-celestial-gold">{advisor.name}</Link>
                </h2>
                <AdvisorLabel locale={locale} gender={advisor.gender} className="mt-1" />
                <p className="text-sm text-white/70 mt-1">
                  {advisor.specialties.map((item) => specialtyLabel(locale, item)).join(' · ')}
                  {' · '}
                  {quote.introLabel}
                </p>
                <p className="text-sm text-white/55 mt-1">
                  {availabilitySentence(locale, advisor.availability)}
                </p>
              </li>
            );
          })}
        </ul>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-[family-name:var(--font-cinzel)]">FAQ</h2>
          {faqs.map((item) => (
            <details key={item.question} className="rounded-xl border border-white/10 p-4" open>
              <summary className="font-semibold cursor-pointer">{item.question}</summary>
              <p className="mt-2 text-sm text-white/75 leading-relaxed">{item.answer}</p>
            </details>
          ))}
          <p className="text-sm text-white/50">
            <Link href="/faq" className="underline">FAQ</Link>
            {' · '}
            <Link href="/cgu" className="underline">CGU</Link>
            {' · '}
            <Link href="/terms" className="underline">CGV</Link>
            {' · '}
            <Link href={locale === 'fr' ? GEO_PATHS.about.fr : GEO_PATHS.about.en} className="underline">
              {locale === 'fr' ? 'À propos' : 'About'}
            </Link>
            {' · '}
            <Link href={locale === 'fr' ? GEO_PATHS.prices.fr : GEO_PATHS.prices.en} className="underline">
              {locale === 'fr' ? 'Tarifs 2026' : 'Prices 2026'}
            </Link>
            {' · '}
            <Link href={locale === 'fr' ? GEO_PATHS.compare.fr : GEO_PATHS.compare.en} className="underline">
              {locale === 'fr' ? 'Comparatif 2026' : 'Comparison 2026'}
            </Link>
          </p>
        </section>
      </div>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'FAQPage',
            mainEntity: faqs.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          },
        ],
      }} />
    </main>
  );
}
