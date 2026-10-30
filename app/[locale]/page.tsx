import type { Metadata } from 'next';
import Link from 'next/link';
import ChatCta from '@/components/ChatCta';
import AdvisorLabel from '@/components/AdvisorLabel';
import JsonLd from '@/components/JsonLd';
import PromoStrip from '@/components/PromoStrip';
import { ascendantPath } from '@/lib/ascendant-tool';
import { bigThreePath, moonPath } from '@/lib/free-tools';
import { COMMON } from '@/lib/free-tools-copy';
import { couplePath } from '@/lib/couple-compat';
import { getCopy } from '@/lib/ascendant-copy';
import { AVIS_PATH } from '@/lib/avis-callastral';
import { SIGN_IDS, signName, signPath } from '@/lib/zodiac/signs';
import { HUB_PATHS } from '@/lib/alternatives';
import { aboutPath } from '@/lib/about';
import { GEO_PATHS } from '@/lib/geo-pages';
import HoroscopeSignup from '@/components/HoroscopeSignup';
import HomePlans from '@/components/HomePlans';
import SeoChrome from '@/components/SeoChrome';
import { weeklyCurrency } from '@/lib/weekly';
import { listDirectoryAdvisorsCached } from '@/lib/slots';
import VoiceSample from '@/components/VoiceSample';
import {
  FEATURED_ADVISOR_LIMIT,
  HOME_DISCLOSURE,
  HOME_H1,
  HOME_SUB,
  HOME_TITLE,
  homeDescription,
  homePrimaryCta,
  homeSecondaryCta,
} from '@/lib/home-offer';
import { trialPath } from '@/lib/free-call';
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

export async function generateMetadata(
  props: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const path = localeHomePath(locale);
  const currency = weeklyCurrency(localeCurrency(locale));
  const description = homeDescription(locale, currency);
  return {
    title: HOME_TITLE[locale],
    description,
    alternates: {
      canonical: path,
      languages: hreflangAlternates(localeHomePath),
    },
    openGraph: { title: HOME_TITLE[locale], description, url: path },
  };
}

export default async function LocaleHome(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ all?: string }>;
}) {
  const { locale } = await props.params;
  const query = await props.searchParams;
  if (!isLocale(locale)) notFound();

  const currency = localeCurrency(locale);
  let advisors: Awaited<ReturnType<typeof listDirectoryAdvisorsCached>>['advisors'] = [];
  try {
    advisors = (await listDirectoryAdvisorsCached()).advisors;
  } catch {
    advisors = [];
  }
  const orderedAll = advisors
    .filter((advisor) => advisorSpeaks(advisor.languages, locale))
    .sort((a, b) => Number(b.availability.hasImmediate) - Number(a.availability.hasImmediate));
  const ordered = query.all === '1' ? orderedAll : orderedAll.slice(0, FEATURED_ADVISOR_LIMIT);
  const faqs = homeFaqs(locale);
  const weekly = weeklyCurrency(currency);

  return (
    <main>
      <SeoChrome locale={locale} alternatePath={localeHomePath} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{HOME_H1[locale]}</h1>
        <p className="mt-4 text-white/80 leading-relaxed">{HOME_SUB[locale]}</p>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Link href={trialPath(locale)} data-primary-cta="trial" className="btn-primary text-center">{homePrimaryCta(locale)}</Link>
          <Link href="/book?offer=decouverte" className="btn-secondary text-center">{homeSecondaryCta(locale, weekly)}</Link>
        </div>
        <div className="mt-3"><ChatCta locale={locale} placement="home-hero" className="w-full sm:w-auto" /></div>
        <p className="mt-3 text-sm text-white/70">{HOME_DISCLOSURE}</p>
        <VoiceSample locale={locale} src={locale === 'en' ? '/samples/sample-en.mp3' : '/samples/sample-fr.mp3'} />
        <p className="mt-4">
          <Link href={couplePath(locale)} className="text-celestial-gold underline">
            {{
              fr: 'Compatibilité de couple',
              en: 'Couple compatibility',
              es: 'Compatibilidad de pareja',
              de: 'Partner-Kompatibilität',
              it: 'Compatibilità di coppia',
            }[locale]}
          </Link>
        </p>
        <HoroscopeSignup locale={locale} placement="home" />
      </div>
      <HomePlans locale={locale} currency={weeklyCurrency(currency)} />
      <div className="max-w-3xl mx-auto px-4 pb-8">
        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <h2 className="sm:col-span-3 font-[family-name:var(--font-cinzel)] text-2xl">
            {{ fr: 'Comment ça marche', en: 'How it works', es: 'Cómo funciona', de: 'So funktioniert es', it: 'Come funziona' }[locale]}
          </h2>
          <p className="text-sm text-white/75">1. {{ fr: 'Écoutez un extrait de 25 secondes, généré par IA.', en: 'Listen to a 25-second AI-generated excerpt.', es: 'Escucha un extracto de 25 segundos generado por IA.', de: 'Hören Sie einen 25-Sekunden-Auszug, erzeugt von KI.', it: 'Ascolta un estratto di 25 secondi generato dall’IA.' }[locale]}</p>
          <p className="text-sm text-white/75">2. {{ fr: 'Essayez 3 minutes avec un code reçu par e-mail.', en: 'Try 3 minutes with a code sent by email.', es: 'Prueba 3 minutos con un código enviado por correo.', de: 'Testen Sie 3 Minuten mit einem Code per E-Mail.', it: 'Prova 3 minuti con un codice inviato per e-mail.' }[locale]}</p>
          <p className="text-sm text-white/75">3. {{ fr: 'Choisissez votre formule hebdomadaire.', en: 'Choose your weekly plan.', es: 'Elige tu fórmula semanal.', de: 'Wählen Sie Ihren Wochentarif.', it: 'Scegli la formula settimanale.' }[locale]}</p>
        </section>
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
          {ordered.map((advisor) => (
              <li key={advisor.id} className="rounded-2xl border border-white/10 p-4">
                <h2 className="text-xl font-[family-name:var(--font-cinzel)]">
                  <Link href={advisorPath(locale, advisor.slug)} className="hover:text-celestial-gold">{advisor.name}</Link>
                </h2>
                <AdvisorLabel locale={locale} gender={advisor.gender} className="mt-1" />
                <p className="text-sm text-white/70 mt-1">
                  {advisor.specialties.map((item) => specialtyLabel(locale, item)).join(' · ')}
                  {' · '}
                  {locale === 'en' ? 'Included in the weekly plans' : 'Inclus dans les formules hebdomadaires'}
                </p>
                <p className="text-sm text-white/55 mt-1">
                  {availabilitySentence(locale, advisor.availability)}
                </p>
                <Link href={`/book?offer=decouverte&advisor=${encodeURIComponent(advisor.id)}`} className="mt-3 inline-block text-sm text-celestial-gold underline">
                  {homeSecondaryCta(locale, weekly)}
                </Link>
              </li>
          ))}
          {query.all !== '1' && orderedAll.length > ordered.length && (
            <li>
              <Link href="?all=1" className="text-celestial-gold underline">
                {locale === 'en' ? 'See all advisors' : locale === 'es' ? 'Ver todos' : locale === 'de' ? 'Alle ansehen' : locale === 'it' ? 'Vedi tutti' : 'Voir tous'}
              </Link>
            </li>
          )}
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
            <Link href={aboutPath(locale)} className="underline">
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
            {' · '}
            <Link href={locale === 'fr' ? HUB_PATHS.fr : HUB_PATHS.en} className="underline">Alternatives</Link>
            {' · '}
            <Link href={ascendantPath(locale)} className="underline">{getCopy(locale).h1}</Link>
            {' · '}
            <Link href={bigThreePath(locale)} className="underline">{COMMON[locale].bigThreeTool}</Link>
            {' · '}
            <Link href={moonPath(locale)} className="underline">{COMMON[locale].moonTool}</Link>
            {locale === 'fr' && (
              <>
                {' · '}
                <Link href={AVIS_PATH} className="underline">Avis Callastral</Link>
                {' · '}
                <Link href="/fr/horoscope-2027" className="underline">Horoscope 2027</Link>
              </>
            )}
          </p>
          <nav className="text-sm text-white/60" aria-label={locale === 'fr' ? 'Signes' : 'Signs'}>
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {SIGN_IDS.map((id) => (
                <li key={id}>
                  <Link href={signPath(locale, id)} className="underline hover:text-white">{signName(locale, id)}</Link>
                </li>
              ))}
            </ul>
          </nav>
          {locale === 'fr' && <PromoStrip ids={['10']} />}
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
