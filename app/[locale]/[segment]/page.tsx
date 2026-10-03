import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AiDisclosure from '@/components/AiDisclosure';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import { localeRates } from '@/lib/market';
import { perMinuteRange, quoteAdvisor } from '@/lib/money';
import { INTRO_MINUTES } from '@/lib/price-bands';
import { answerContent } from '@/lib/specialty-content';
import { appBaseUrl } from '@/lib/stripe';
import { listDirectoryAdvisors } from '@/lib/slots';
import {
  advisorPath,
  advisorSpeaks,
  availabilitySentence,
  homeLabel,
  hreflangAlternates,
  hubPath,
  isLocale,
  languageLabel,
  localeCurrency,
  localeHomePath,
  phonePhrase,
  specialtyFromHub,
  specialtyLabel,
  type Locale,
  type SpecialtyId,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

function hubTitle(locale: Locale, specialty: SpecialtyId): string {
  const topic = specialtyLabel(locale, specialty);
  const titles: Record<Locale, string> = {
    fr: `Astrologie ${topic} — ${phonePhrase(locale)} | Callastral`,
    en: `${topic[0].toUpperCase()}${topic.slice(1)} astrology — ${phonePhrase(locale)} | Callastral`,
    es: `Astrología ${topic} — ${phonePhrase(locale)} | Callastral`,
    de: `Astrologie ${topic} — ${phonePhrase(locale)} | Callastral`,
    it: `Astrologia ${topic} — ${phonePhrase(locale)} | Callastral`,
  };
  return titles[locale];
}

function hubIntro(locale: Locale, specialty: SpecialtyId): string {
  const topic = specialtyLabel(locale, specialty);
  const lines: Record<Locale, string> = {
    fr: `Ces astrologues proposent une ${phonePhrase(locale)} sur le thème « ${topic} ». Le tarif indiqué est le prix de départ, par minute, propre à chaque conseiller.`,
    en: `These astrologers offer a ${phonePhrase(locale)} on ${topic}. The price shown is each advisor’s starting per-minute rate.`,
    es: `Estos astrólogos ofrecen una ${phonePhrase(locale)} sobre ${topic}. El precio indicado es la tarifa de partida por minuto de cada consejero.`,
    de: `Diese Astrologen bieten eine ${phonePhrase(locale)} zum Thema ${topic}. Der angezeigte Preis ist der Einstiegstarif pro Minute jedes Beraters.`,
    it: `Questi astrologi offrono un ${phonePhrase(locale)} su ${topic}. Il prezzo indicato è la tariffa di partenza al minuto di ogni consulente.`,
  };
  return lines[locale];
}

export async function generateMetadata(
  props: { params: Promise<{ locale: string; segment: string }> }
): Promise<Metadata> {
  const { locale, segment } = await props.params;
  if (!isLocale(locale)) return {};
  const specialty = specialtyFromHub(locale, segment);
  if (!specialty) return {};
  const path = hubPath(locale, specialty);
  const title = hubTitle(locale, specialty);
  const range = perMinuteRange(localeCurrency(locale), localeRates(locale), locale);
  const content = answerContent(locale, specialty, { ...range, introMinutes: INTRO_MINUTES });
  const description = (content?.answer ?? hubIntro(locale, specialty)).slice(0, 158);
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: hreflangAlternates((item) => hubPath(item, specialty)),
    },
    openGraph: { title, description, url: path },
  };
}

export default async function SpecialtyHub(props: { params: Promise<{ locale: string; segment: string }> }) {
  const { locale, segment } = await props.params;
  if (!isLocale(locale)) notFound();
  const specialty = specialtyFromHub(locale, segment);
  if (!specialty) notFound();

  const currency = localeCurrency(locale);
  const rates = localeRates(locale);
  let advisors: Awaited<ReturnType<typeof listDirectoryAdvisors>>['advisors'] = [];
  try {
    advisors = (await listDirectoryAdvisors()).advisors;
  } catch {
    advisors = [];
  }
  const matching = advisors
    .filter((advisor) => advisor.specialties.includes(specialty) && advisorSpeaks(advisor.languages, locale))
    .sort((a, b) => Number(b.availability.hasImmediate) - Number(a.availability.hasImmediate));
  const title = hubTitle(locale, specialty).replace(' | Callastral', '');
  const origin = appBaseUrl();
  const pageUrl = `${origin}${hubPath(locale, specialty)}`;
  const range = perMinuteRange(currency, rates, locale);
  const content = answerContent(locale, specialty, { ...range, introMinutes: INTRO_MINUTES });
  const faqTitle: Record<Locale, string> = { fr: 'Questions fréquentes', en: 'Frequently asked questions', es: 'Preguntas frecuentes', de: 'Häufige Fragen', it: 'Domande frequenti' };
  const pointsTitle: Record<Locale, string> = { fr: 'Ce que la consultation peut apporter', en: 'What a reading can help with', es: 'En qué puede ayudar la consulta', de: 'Wobei die Beratung helfen kann', it: 'In cosa può aiutare il consulto' };
  const advisorsTitle: Record<Locale, string> = { fr: 'Conseillers sur ce thème', en: 'Advisors for this topic', es: 'Consejeros para este tema', de: 'Berater zu diesem Thema', it: 'Consulenti per questo tema' };

  return (
    <main>
      <SeoChrome locale={locale} alternatePath={(item) => hubPath(item, specialty)} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="text-sm text-white/50 mb-4">
          <Link href={localeHomePath(locale)}>{homeLabel(locale)}</Link>
          <span> / </span>
          <span>{specialtyLabel(locale, specialty)}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl">{title}</h1>
        {content && <p className="mt-4 text-lg text-white leading-relaxed">{content.answer}</p>}
        {content && (
          <section className="mt-6">
            <h2 className="text-xl font-semibold">{pointsTitle[locale]}</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-white/80">
              {content.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </section>
        )}
        {content && <h2 className="mt-8 text-xl font-semibold">{advisorsTitle[locale]}</h2>}
        <p className="mt-4 text-white/80 leading-relaxed">{hubIntro(locale, specialty)}</p>
        <ul className="mt-8 space-y-4">
          {matching.map((advisor) => {
            const quote = quoteAdvisor(advisor.pricePerMinCents, currency, rates, undefined, locale);
            return (
              <li key={advisor.id} className="rounded-2xl border border-white/10 p-4">
                <h2 className="text-xl">
                  <Link href={advisorPath(locale, advisor.slug)} className="hover:text-celestial-gold">{advisor.name}</Link>
                </h2>
                <AiDisclosure locale={locale} gender={advisor.gender} className="mt-1" />
                <p className="text-sm text-white/70 mt-1">
                  {quote.introLabel} · {advisor.languages.map((code) => languageLabel(locale, code)).join(', ')}
                </p>
                <p className="text-sm text-white/55 mt-1">{availabilitySentence(locale, advisor.availability)}</p>
              </li>
            );
          })}
        </ul>
        {matching.length === 0 && (
          <p className="mt-6 text-white/60">
            <Link href={localeHomePath(locale)} className="underline">{homeLabel(locale)}</Link>
          </p>
        )}
        {content && (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-[family-name:var(--font-cinzel)]">{faqTitle[locale]}</h2>
            {content.faqs.map((item) => (
              <div key={item.question} className="rounded-xl border border-white/10 p-4">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm text-white/75 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </section>
        )}
      </article>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: homeLabel(locale), item: `${origin}${localeHomePath(locale)}` },
              { '@type': 'ListItem', position: 2, name: specialtyLabel(locale, specialty), item: pageUrl },
            ],
          },
          {
            '@type': 'CollectionPage',
            name: title,
            url: pageUrl,
            isPartOf: { '@id': `${origin}/#website` },
          },
          ...(content
            ? [{
                '@type': 'FAQPage',
                mainEntity: content.faqs.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: { '@type': 'Answer', text: item.answer },
                })),
              }]
            : []),
        ],
      }} />
    </main>
  );
}
