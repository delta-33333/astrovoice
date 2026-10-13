import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { ascendantPath } from '@/lib/ascendant-tool';
import { getCopy } from '@/lib/ascendant-copy';
import {
  ALT_CHECKED_ISO,
  COMPETITORS,
  HUB_PATHS,
  alternativeJsonLd,
  checkedLabel,
  competitorById,
  competitorsFor,
  hubAlternates,
  hubCopy,
  hubJsonLd,
  type AltLocale,
  type CompetitorPage,
} from '@/lib/alternatives';
import { GEO_PATHS, callastralFacts } from '@/lib/geo-pages';
import { AI_ACT_LINE, AI_MODEL_SUMMARY } from '@/lib/legal';
import { appBaseUrl } from '@/lib/stripe';
import { homeLabel, localeHomePath } from '@/lib/seo';

function isAltLocale(value: string): value is AltLocale {
  return value === 'fr' || value === 'en';
}

function callastralCells(locale: AltLocale) {
  const facts = callastralFacts(locale);
  const intro = locale === 'fr'
    ? 'Les 3 premières minutes sont à un tarif réduit, environ deux tiers du tarif du conseiller.'
    : 'The first 3 minutes are at a reduced rate, about two thirds of the advisor’s rate.';
  const founding = facts.founding
    ? (locale === 'fr'
      ? ` Offre fondateur : ${facts.founding.minutes} min à ${facts.founding.price}, une fois par compte.`
      : ` Founder offer: ${facts.founding.minutes} min for ${facts.founding.price}, once per account.`)
    : '';
  if (locale === 'fr') {
    return {
      advisors: `${AI_MODEL_SUMMARY.fr}. ${AI_ACT_LINE.fr}. Ce ne sont pas des personnes humaines, et ils ne gardent pas la mémoire des appels précédents.`,
      price: `${facts.min} à ${facts.max}/min selon le conseiller, affiché avant l’appel.`,
      welcome: `${intro}${founding}`,
      availability: '24 h/24, 7 j/7.',
      format: 'Téléphone uniquement.',
      freeTools: 'Calcul d’ascendant gratuit, sans compte.',
    };
  }
  return {
    advisors: `${AI_MODEL_SUMMARY.en}. ${AI_ACT_LINE.en}. They are not human, and they do not remember previous calls.`,
    price: `${facts.min} to ${facts.max}/min depending on the advisor, shown before the call.`,
    welcome: `${intro}${founding}`,
    availability: '24/7.',
    format: 'Phone only.',
    freeTools: 'Free rising-sign calculator, no account.',
  };
}

const CRITERIA = {
  fr: ['Conseillers', 'Prix', 'Offre d’entrée', 'Disponibilité', 'Format', 'Outil gratuit'],
  en: ['Advisors', 'Price', 'Introductory offer', 'Availability', 'Format', 'Free tool'],
} as const;

function rows(locale: AltLocale, page: CompetitorPage): Array<[string, string, string]> {
  const ours = callastralCells(locale);
  const labels = CRITERIA[locale];
  return [
    [labels[0], ours.advisors, page.advisors],
    [labels[1], ours.price, page.price],
    [labels[2], ours.welcome, page.welcome],
    [labels[3], ours.availability, page.availability],
    [labels[4], ours.format, page.format],
    [labels[5], ours.freeTools, page.freeTools],
  ];
}

function ui(locale: AltLocale) {
  if (locale === 'fr') {
    return {
      ours: 'Callastral (notre service)',
      law: 'Comparaison au sens des articles L122-1 et suivants du code de la consommation : mêmes critères, faits vérifiables, sans dénigrement. Les noms identifient les services. Aucun logo n’est reproduit.',
      disclosure: 'Callastral est notre service. Les lectures sont un divertissement et une réflexion personnelle, pas des prédictions certaines.',
      table: 'Mêmes critères, Callastral en premier',
      when: (name: string) => `Quand choisir ${name}`,
      limitsTitle: 'Limites de Callastral',
      limits: [
        'Pas de voyant humain : un persona virtuel, avec une voix générée par IA.',
        'Pas d’audiotel, de tchat, de visio ni de SMS.',
        'Pas de mémoire des appels précédents.',
      ],
      sources: 'Sources',
      sourcesLead: 'Pages publiques consultées le 13 octobre 2026. Si un fait n’y figure pas, la case indique « non communiqué ».',
      faq: 'Questions fréquentes',
      cta: 'Voir les conseillers Callastral',
      related: 'Autres fiches',
      prices: 'Tableau des tarifs 2026',
      compare: 'Comparatif 2026',
      tool: getCopy('fr').h1,
    };
  }
  return {
    ours: 'Callastral (our service)',
    law: 'Comparison under the French Consumer Code, articles L122-1 and following: the same criteria, verifiable facts, no disparagement. Names identify the services. No logo is reproduced.',
    disclosure: 'Callastral is our service. Readings are entertainment and personal reflection, not certain predictions.',
    table: 'Same criteria, Callastral first',
    when: (name: string) => `When ${name} is the better fit`,
    limitsTitle: 'What Callastral does not offer',
    limits: [
      'No human psychic: a virtual persona, with an AI-generated voice.',
      'No premium-rate number, chat, video or SMS.',
      'No memory of previous calls.',
    ],
    sources: 'Sources',
    sourcesLead: 'Public pages checked on 13 October 2026. If a fact was not on those pages, the cell says “non communiqué”.',
    faq: 'Frequently asked questions',
    cta: 'See Callastral advisors',
    related: 'Other pages',
    prices: '2026 price table',
    compare: '2026 comparison',
    tool: getCopy('en').h1,
  };
}

export async function alternativeMetadata(locale: string, id: string): Promise<Metadata> {
  const page = competitorById(id);
  if (!page || locale !== page.market) return {};
  return {
    title: `${page.title} | Callastral`,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: { title: page.title, description: page.description, url: page.path, type: 'article' },
  };
}

export function AlternativeArticle({ locale, id }: { locale: string; id: string }) {
  const page = competitorById(id);
  if (!page || locale !== page.market) notFound();
  const copy = ui(page.market);
  const origin = appBaseUrl();
  const related = COMPETITORS.filter((item) => item.id !== page.id && item.market === page.market).slice(0, 3);
  return (
    <main>
      <article className="max-w-3xl mx-auto px-4 py-8 text-white/85 leading-relaxed">
        <nav aria-label="Breadcrumb" className="text-sm text-white/50 mb-4">
          <Link href={localeHomePath(page.market)}>{homeLabel(page.market)}</Link>
          <span> / </span>
          <Link href={HUB_PATHS[page.market]}>{hubCopy(page.market).h1}</Link>
          <span> / </span>
          <span>{page.name}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">{page.h1}</h1>
        <p className="text-xs text-white/50 mt-2">
          <time dateTime={ALT_CHECKED_ISO}>{checkedLabel(page.market)}</time>
        </p>
        <p className="mt-5 text-lg text-white">
          {page.market === 'fr'
            ? `Callastral, notre service, est l’alternative proposée : une consultation d’astrologie par téléphone, à partir du thème natal. ${AI_ACT_LINE.fr}. ${page.name} reste le service à choisir si vous voulez ce qui est décrit plus bas.`
            : `Callastral, our service, is the alternative offered here: a phone astrology reading from the birth chart. ${AI_ACT_LINE.en}. ${page.name} remains the better fit when you want what is described below.`}
        </p>
        <p className="mt-3 text-sm text-white/70 border-l-2 border-celestial-gold/60 pl-3">{copy.law}</p>
        <p className="mt-3 text-sm text-white/70">{copy.disclosure}</p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="text-left text-white/60 mb-2">{copy.table} — {checkedLabel(page.market)}</caption>
            <thead>
              <tr className="text-left text-white">
                <th scope="col" className="border-b border-white/20 py-2 pr-3">{page.market === 'fr' ? 'Critère' : 'Criterion'}</th>
                <th scope="col" className="border-b border-white/20 py-2 pr-3">{copy.ours}</th>
                <th scope="col" className="border-b border-white/20 py-2">{page.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows(page.market, page).map(([label, ours, theirs]) => (
                <tr key={label}>
                  <th scope="row" className="border-b border-white/10 py-3 pr-3 text-left align-top text-white">{label}</th>
                  <td className="border-b border-white/10 py-3 pr-3 align-top bg-celestial-gold/10">{ours}</td>
                  <td className="border-b border-white/10 py-3 align-top">{theirs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl text-white font-semibold">{copy.when(page.name)}</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          {page.whenChoose.map((line) => <li key={line}>{line}</li>)}
        </ul>

        <h2 className="mt-8 text-xl text-white font-semibold">{copy.limitsTitle}</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          {copy.limits.map((line) => <li key={line}>{line}</li>)}
        </ul>

        <h2 className="mt-10 text-xl text-white font-semibold">{copy.sources}</h2>
        <p className="mt-2 text-sm text-white/70">{copy.sourcesLead}</p>
        <ol className="mt-3 text-sm space-y-1">
          {page.sources.map((source) => (
            <li key={source.url}>
              [{source.id}]{' '}
              <a href={source.url} rel="noopener noreferrer nofollow" target="_blank" className="underline text-celestial-gold">{source.label}</a>
            </li>
          ))}
        </ol>

        <h2 className="mt-10 text-xl text-white font-semibold">{copy.faq}</h2>
        <dl className="mt-3 space-y-5">
          {page.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-white">{faq.question}</dt>
              <dd className="mt-1">{faq.answer}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8">
          <Link href={localeHomePath(page.market)} data-funnel="book" className="btn-primary inline-block text-center">
            {copy.cta}
          </Link>
        </p>
        <p className="mt-4 text-sm flex flex-col gap-2">
          <Link href={ascendantPath(page.market)} className="underline text-celestial-gold">{copy.tool}</Link>
          <Link href={GEO_PATHS.prices[page.market]} className="underline text-celestial-gold">{copy.prices}</Link>
          <Link href={GEO_PATHS.compare[page.market]} className="underline text-celestial-gold">{copy.compare}</Link>
        </p>
        <h2 className="mt-8 text-lg text-white font-semibold">{copy.related}</h2>
        <ul className="mt-2 text-sm space-y-1">
          {related.map((item) => (
            <li key={item.id}>
              <Link href={item.path} className="underline hover:text-white">{item.h1}</Link>
            </li>
          ))}
          <li>
            <Link href={HUB_PATHS[page.market]} className="underline hover:text-white">{hubCopy(page.market).h1}</Link>
          </li>
        </ul>
      </article>
      <JsonLd data={alternativeJsonLd(origin, page.market, page)} />
    </main>
  );
}

export function AlternativeDirectory({ locale }: { locale: AltLocale }) {
  const heading = locale === 'fr' ? 'Fiches détaillées par service' : 'A page for each service';
  const lead = locale === 'fr'
    ? 'Chaque fiche reprend les mêmes critères, avec la date et les pages sources. Callastral y est présenté en premier.'
    : 'Each page uses the same criteria, with the date and the source pages. Callastral is listed first.';
  const groups: AltLocale[] = locale === 'fr' ? ['fr', 'en'] : ['en', 'fr'];
  return (
    <section className="mt-10">
      <h2 className="text-xl text-white font-semibold">{heading}</h2>
      <p className="mt-2 text-sm text-white/70">{lead}</p>
      {groups.map((market) => (
        <div key={market} className="mt-4">
          <h3 className="text-white">{market === 'fr' ? 'France' : 'English'}</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {competitorsFor(market).map((item) => (
              <li key={item.id}>
                <Link href={item.path} className="underline text-celestial-gold">{item.h1}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export async function hubMetadata(locale: string): Promise<Metadata> {
  if (!isAltLocale(locale)) return {};
  const copy = hubCopy(locale);
  return {
    title: `${copy.title} | Callastral`,
    description: copy.description,
    alternates: { canonical: HUB_PATHS[locale], languages: hubAlternates() },
    openGraph: { title: copy.title, description: copy.description, url: HUB_PATHS[locale], type: 'article' },
  };
}

export function AlternativesHub({ locale }: { locale: string }) {
  if (!isAltLocale(locale)) notFound();
  const copy = hubCopy(locale);
  const text = ui(locale);
  const origin = appBaseUrl();
  return (
    <main>
      <article className="max-w-3xl mx-auto px-4 py-8 text-white/85 leading-relaxed">
        <nav aria-label="Breadcrumb" className="text-sm text-white/50 mb-4">
          <Link href={localeHomePath(locale)}>{homeLabel(locale)}</Link>
          <span> / </span>
          <span>{copy.h1}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">{copy.h1}</h1>
        <p className="text-xs text-white/50 mt-2">
          <time dateTime={ALT_CHECKED_ISO}>{checkedLabel(locale)}</time>
        </p>
        <p className="mt-5 text-lg text-white">
          {locale === 'fr'
            ? `Callastral est l’alternative proposée ici : astrologie par téléphone, thème natal, 24 h/24. ${AI_ACT_LINE.fr}. Les fiches ci-dessous décrivent d’autres services, sans les noter.`
            : `Callastral is the alternative offered here: phone astrology from the birth chart, 24/7. ${AI_ACT_LINE.en}. The pages below describe other services, without scoring them.`}
        </p>
        <p className="mt-3 text-sm text-white/70 border-l-2 border-celestial-gold/60 pl-3">{text.law}</p>
        <AlternativeDirectory locale={locale} />
        <h2 className="mt-10 text-xl text-white font-semibold">{text.faq}</h2>
        <dl className="mt-3 space-y-5">
          {copy.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-white">{faq.question}</dt>
              <dd className="mt-1">{faq.answer}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8">
          <Link href={localeHomePath(locale)} data-funnel="book" className="btn-primary inline-block text-center">{text.cta}</Link>
        </p>
        <p className="mt-4 text-sm flex flex-col gap-2">
          <Link href={ascendantPath(locale)} className="underline text-celestial-gold">{text.tool}</Link>
          <Link href={GEO_PATHS.prices[locale]} className="underline text-celestial-gold">{text.prices}</Link>
          <Link href={GEO_PATHS.compare[locale]} className="underline text-celestial-gold">{text.compare}</Link>
        </p>
      </article>
      <JsonLd data={hubJsonLd(origin, locale)} />
    </main>
  );
}
