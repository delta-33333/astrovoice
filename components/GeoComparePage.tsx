import Link from 'next/link';
import AiDisclosure from '@/components/AiDisclosure';
import JsonLd from '@/components/JsonLd';
import { GeoFooter, GeoHeader, SourceLinks, Updated } from '@/components/GeoShell';
import {
  GEO_PATHS,
  GEO_PUBLISHED_ISO,
  GEO_UPDATED_ISO,
  SOURCES,
  callastralFacts,
  type GeoLocale,
  type Source,
} from '@/lib/geo-pages';
import { aiActLine } from '@/lib/legal';
import { appBaseUrl } from '@/lib/stripe';

interface Entry {
  name: string;
  url: string;
  ours?: boolean;
  kind: string;
  price: string;
  welcome: string;
  language: string;
  bestFor: string;
  sources: Source[];
}

export function compareCopy(locale: GeoLocale) {
  const c = callastralFacts(locale);
  const origin = appBaseUrl();
  if (locale === 'fr') {
    const entries: Entry[] = [
      {
        name: 'Callastral (notre service)',
        url: origin,
        ours: true,
        kind: aiActLine('fr'),
        price: `${c.min} à ${c.max}/min selon le conseiller`,
        welcome: c.founding ? `${c.founding.minutes} min à ${c.founding.price} (offre fondateur)` : '—',
        language: 'Français, anglais, espagnol, allemand, italien',
        bestFor: 'Astrologie à partir du thème natal, à toute heure, à petit prix, en sachant que le conseiller est virtuel et ne garde pas la mémoire des appels précédents.',
        sources: [],
      },
      {
        name: 'Kasamba',
        url: 'https://www.kasamba.com/',
        kind: 'Conseillers humains',
        price: 'Selon le conseiller (non relevé)',
        welcome: '3 min offertes par nouveau conseiller + 50 à 70 % de remise sur la 1re séance (50 $ maximum), carte requise',
        language: 'Anglais (États-Unis)',
        bestFor: 'Un conseiller humain en anglais, avec plusieurs conseillers à essayer.',
        sources: [SOURCES.S20],
      },
      {
        name: 'Voyance.fr',
        url: 'https://www.voyance.fr/',
        kind: 'Voyants humains',
        price: '3,50 € à 9,50 €/min selon le voyant (par carte) ; audiotel 0,80 €/min + prix de l’appel',
        welcome: '15 € les 10 premières minutes',
        language: 'Français',
        bestFor: 'Une voyance avec un voyant humain, y compris sans carte bancaire via l’audiotel.',
        sources: [SOURCES.S18, SOURCES.S17],
      },
      {
        name: 'Wengo',
        url: 'https://www.wengo.fr/',
        kind: 'Experts humains',
        price: 'Environ 2,50 €/min en général (1,90 € à 3,55 €/min selon les experts)',
        welcome: '5 € les 10 min ; forfait 10 min à 30 €',
        language: 'Français',
        bestFor: 'Choisir un expert humain par prix parmi un large catalogue.',
        sources: [SOURCES.S19a, SOURCES.S19b],
      },
    ];
    return {
      title: 'Meilleurs sites de voyance et d’astrologie par téléphone en 2026 : comparatif honnête',
      description: 'Comparatif 2026 de Callastral (notre service), Kasamba, Voyance.fr et Wengo : prix relevés et sourcés, humain ou virtuel, et quand un autre service vaut mieux.',
      answer: 'Il n’y a pas un meilleur site pour tout le monde : pour un voyant humain, Voyance.fr, Wengo ou Kasamba (en anglais) sont plus adaptés ; pour de l’astrologie à partir du thème natal, à toute heure et de 0,50 € à 1,99 €/min, Callastral, notre service, avec des conseillers virtuels.',
      disclosure: 'Transparence : Callastral est notre service. Les services sont classés par ordre alphabétique, sans note ni lien affilié. Les prix ont été relevés le 3 octobre 2026 sur les pages officielles citées.',
      cols: ['Service', 'Humain ou virtuel', 'Prix relevé', 'Offre de bienvenue', 'Langue', 'Source'],
      caption: 'Mêmes critères pour chaque service (relevé du 3 octobre 2026)',
      whenOtherTitle: 'Quand choisir un autre service que Callastral',
      whenOther: [
        'Vous voulez parler à une personne humaine, voyant ou médium : Callastral ne propose que des conseillers virtuels.',
        'Vous cherchez de la voyance (tarot, médiumnité, flash) plutôt qu’une lecture du thème natal.',
        'Vous voulez que la personne se souvienne de vos appels précédents : nos conseillers virtuels ne gardent pas cette mémoire.',
        'Vous ne voulez pas utiliser de carte bancaire : l’audiotel (0,80 €/min + prix de l’appel) le permet.',
      ],
      whenOursTitle: 'Quand Callastral convient',
      whenOurs: [
        'Vous voulez une lecture d’astrologie fondée sur votre thème natal, calculé avec Swiss Ephemeris.',
        'Vous voulez appeler à toute heure, dans l’une de 5 langues.',
        `Vous voulez un prix bas et clair : ${c.min} à ${c.max}/min, à la seconde, sans surtaxe.`,
      ],
      bestForLabel: 'Pour qui : ',
      faqs: [
        {
          question: 'Quel est le meilleur site de voyance par téléphone en 2026 ?',
          answer: 'Cela dépend de ce que vous cherchez. Pour un voyant humain : Voyance.fr, Wengo ou, en anglais, Kasamba. Pour de l’astrologie fondée sur le thème natal, disponible à toute heure à bas prix avec des conseillers virtuels : Callastral, notre service.',
        },
        {
          question: 'Les conseillers Callastral sont-ils humains ?',
          answer: 'Non. Ce sont des conseillers virtuels créés par Callastral ; leur voix est générée par ordinateur, et c’est indiqué avant et au début de chaque appel.',
        },
        {
          question: 'Ce comparatif est-il impartial ?',
          answer: 'Callastral est notre service, ce qui est indiqué partout sur la page. Nous appliquons les mêmes critères à chaque service, citons les grilles officielles et indiquons quand un concurrent est plus adapté.',
        },
      ],
      breadcrumb: 'Accueil',
      prices: 'Voir le tableau détaillé des tarifs 2026',
      entries,
    };
  }
  const entries: Entry[] = [
    {
      name: 'Callastral (our service)',
      url: origin,
      ours: true,
      kind: aiActLine('en'),
      price: `${c.min} to ${c.max}/min depending on the advisor`,
      welcome: c.founding ? `${c.founding.minutes} min for ${c.founding.price} (founder offer)` : '—',
      language: 'French, English, Spanish, German, Italian',
      bestFor: 'Birth-chart astrology at any hour at a low price, knowing the advisor is virtual and does not remember previous calls.',
      sources: [],
    },
    {
      name: 'Kasamba',
      url: 'https://www.kasamba.com/',
      kind: 'Human advisors',
      price: 'Depends on the advisor (not collected)',
      welcome: '3 free minutes with each new advisor + 50 to 70% off the first session (up to $50), card required',
      language: 'English (US)',
      bestFor: 'A human advisor in English, with several advisors to try.',
      sources: [SOURCES.S20],
    },
    {
      name: 'Voyance.fr',
      url: 'https://www.voyance.fr/',
      kind: 'Human psychics',
      price: '€3.50 to €9.50/min depending on the psychic (card); audiotel €0.80/min + call price',
      welcome: '€15 for the first 10 minutes',
      language: 'French',
      bestFor: 'A reading with a human psychic in French, including without a card through audiotel.',
      sources: [SOURCES.S18, SOURCES.S17],
    },
    {
      name: 'Wengo',
      url: 'https://www.wengo.fr/',
      kind: 'Human experts',
      price: 'About €2.50/min in general (€1.90 to €3.55/min depending on the expert)',
      welcome: '€5 for 10 min; 10-minute package at €30',
      language: 'French',
      bestFor: 'Choosing a human expert by price from a large catalogue (French).',
      sources: [SOURCES.S19a, SOURCES.S19b],
    },
  ];
  return {
    title: 'Best phone psychic and astrology sites in 2026: an honest comparison',
    description: 'A 2026 comparison of Callastral (our service), Kasamba, Voyance.fr and Wengo: sourced prices, human or virtual, and when another service is the better choice.',
    answer: 'There is no single best site for everyone: for a human psychic, Kasamba (English) or, in French, Voyance.fr and Wengo are a better fit; for birth-chart astrology at any hour from €0.50 to €1.99/min, Callastral, our service, with virtual advisors.',
    disclosure: 'Disclosure: Callastral is our service. Services are listed alphabetically, with no ratings and no affiliate links. Prices were collected on 3 October 2026 from the official pages cited.',
    cols: ['Service', 'Human or virtual', 'Price collected', 'Welcome offer', 'Language', 'Source'],
    caption: 'Same criteria for every service (collected on 3 October 2026)',
    whenOtherTitle: 'When to choose another service',
    whenOther: [
      'You want to talk to a human psychic or medium: Callastral only offers virtual advisors.',
      'You want a psychic reading (tarot, mediumship) rather than a birth-chart reading.',
      'You want the person to remember your previous calls: our virtual advisors do not keep that memory.',
      'You do not want to use a card: French audiotel numbers (€0.80/min + call price) allow that.',
    ],
    whenOursTitle: 'When Callastral fits',
    whenOurs: [
      'You want an astrology reading based on your birth chart, computed with Swiss Ephemeris.',
      'You want to call at any hour, in one of 5 languages.',
      `You want a low, clear price: ${c.min} to ${c.max}/min, billed by the second, no premium-rate surcharge.`,
    ],
    bestForLabel: 'Best for: ',
    faqs: [
      {
        question: 'What is the best phone psychic site in 2026?',
        answer: 'It depends on what you want. For a human psychic: Kasamba in English, or Voyance.fr and Wengo in French. For birth-chart astrology available at any hour at a low price with virtual advisors: Callastral, our service.',
      },
      {
        question: 'Are Callastral advisors human?',
        answer: 'No. They are virtual advisors created by Callastral; their voice is computer-generated, and this is stated before and at the start of every call.',
      },
    ],
    breadcrumb: 'Home',
    prices: 'See the detailed 2026 price table',
    entries,
  };
}

export default function GeoComparePage({ locale }: { locale: GeoLocale }) {
  const copy = compareCopy(locale);
  const origin = appBaseUrl();
  const url = `${origin}${GEO_PATHS.compare[locale]}`;
  return (
    <main>
      <GeoHeader locale={locale} page="compare" />
      <article className="max-w-3xl mx-auto px-4 py-8 text-white/85 leading-relaxed">
        <nav aria-label="Breadcrumb" className="text-sm text-white/50 mb-4">
          <Link href={locale === 'fr' ? '/fr' : '/en'}>{copy.breadcrumb}</Link>
          <span> / </span>
          <span>{copy.title}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">{copy.title}</h1>
        <Updated locale={locale} />
        <p className="mt-5 text-lg text-white">{copy.answer}</p>
        <p className="mt-3 text-sm text-white/70 border-l-2 border-celestial-gold/60 pl-3">{copy.disclosure}</p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="text-left text-white/60 mb-2">{copy.caption}</caption>
            <thead>
              <tr className="text-left text-white">
                {copy.cols.map((col) => (
                  <th key={col} scope="col" className="border-b border-white/20 py-2 pr-3 align-bottom">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {copy.entries.map((entry) => (
                <tr key={entry.name} className={entry.ours ? 'bg-celestial-gold/10' : ''}>
                  <th scope="row" className="border-b border-white/10 py-3 pr-3 text-left align-top font-semibold text-white">{entry.name}</th>
                  <td className="border-b border-white/10 py-3 pr-3 align-top">{entry.kind}</td>
                  <td className="border-b border-white/10 py-3 pr-3 align-top">{entry.price}</td>
                  <td className="border-b border-white/10 py-3 pr-3 align-top">{entry.welcome}</td>
                  <td className="border-b border-white/10 py-3 pr-3 align-top">{entry.language}</td>
                  <td className="border-b border-white/10 py-3 align-top"><SourceLinks sources={entry.sources} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ol className="mt-8 space-y-5">
          {copy.entries.map((entry, index) => (
            <li key={entry.name}>
              <h2 className="text-lg text-white font-semibold">
                {index + 1}.{' '}
                {entry.ours ? (
                  <Link href={locale === 'fr' ? '/fr' : '/en'} className="hover:underline">{entry.name}</Link>
                ) : (
                  <a href={entry.url} rel="noopener noreferrer nofollow" target="_blank" className="hover:underline">{entry.name}</a>
                )}
              </h2>
              <p className="mt-1"><span className="text-white/60">{copy.bestForLabel}</span>{entry.bestFor}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-10 text-xl text-white font-semibold">{copy.whenOtherTitle}</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          {copy.whenOther.map((line) => <li key={line}>{line}</li>)}
        </ul>

        <h2 className="mt-8 text-xl text-white font-semibold">{copy.whenOursTitle}</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          {copy.whenOurs.map((line) => <li key={line}>{line}</li>)}
        </ul>

        <h2 className="mt-10 text-xl text-white font-semibold">{locale === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions'}</h2>
        <dl className="mt-3 space-y-5">
          {copy.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-white">{faq.question}</dt>
              <dd className="mt-1">{faq.answer}</dd>
            </div>
          ))}
        </dl>

        <AiDisclosure locale={locale} className="mt-10" />
        <p className="mt-6">
          <Link href={GEO_PATHS.prices[locale]} className="underline text-celestial-gold">{copy.prices}</Link>
        </p>
      </article>
      <GeoFooter locale={locale} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            '@id': `${url}#article`,
            headline: copy.title,
            description: copy.description,
            inLanguage: locale,
            datePublished: GEO_PUBLISHED_ISO,
            dateModified: GEO_UPDATED_ISO,
            mainEntityOfPage: url,
            author: { '@type': 'Organization', name: 'Callastral', url: origin },
            publisher: { '@type': 'Organization', name: 'Callastral', url: origin, logo: `${origin}/logo.png` },
          },
          {
            '@type': 'ItemList',
            name: copy.title,
            itemListOrder: 'https://schema.org/ItemListUnordered',
            numberOfItems: copy.entries.length,
            itemListElement: copy.entries.map((entry, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: entry.name,
              url: entry.url,
            })),
          },
          {
            '@type': 'FAQPage',
            mainEntity: copy.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: copy.breadcrumb, item: `${origin}/${locale}` },
              { '@type': 'ListItem', position: 2, name: copy.title, item: url },
            ],
          },
        ],
      }} />
    </main>
  );
}
