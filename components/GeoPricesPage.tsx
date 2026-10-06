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
  priceRows,
  type GeoLocale,
} from '@/lib/geo-pages';
import { AI_MODEL_SUMMARY } from '@/lib/legal';
import { appBaseUrl } from '@/lib/stripe';

export function pricesCopy(locale: GeoLocale) {
  const c = callastralFacts(locale);
  if (locale === 'fr') {
    return {
      title: 'Tarifs de la voyance et de l’astrologie par téléphone en 2026',
      description: `En 2026, une consultation par téléphone coûte de 0,80 €/min (audiotel) à 9,50 €/min (voyant premium par carte) ; chez Callastral, ${c.min} à ${c.max}/min. Prix relevés et sourcés.`,
      answer: `En 2026, une consultation par téléphone coûte de 0,80 €/min (audiotel, plus le prix de l’appel) à 9,50 €/min (voyant premium payé par carte) ; chez Callastral, de ${c.min} à ${c.max}/min, avec des conseillers virtuels.`,
      notVoyance: 'Callastral fait de l’astrologie à partir du thème natal, pas de la voyance : si vous cherchez un voyant humain, les services listés ci-dessous sont plus adaptés.',
      ourModel: `${AI_MODEL_SUMMARY.fr} ; 24 h/24 ; 5 langues ; thème natal calculé`,
      tableCaption: 'Prix publics relevés le 3 octobre 2026 sur les grilles officielles',
      cols: ['Service', 'Modèle', 'Prix public relevé', 'Source'],
      methodTitle: 'Méthode',
      method: [
        'Chaque prix vient de la grille publique du service, consultée le 3 octobre 2026. Le lien de chaque source est indiqué dans le tableau.',
        'Les prix peuvent changer : vérifiez la grille officielle avant de payer. La date du relevé est indiquée en haut de la page.',
        'Callastral est notre service. Cette page ne contient aucun lien affilié.',
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        {
          question: 'Combien coûte une consultation de voyance par téléphone en 2026 ?',
          answer: `De 0,80 €/min plus le prix de l’appel (audiotel 0892) à 9,50 €/min pour les voyants les plus chers payés par carte (Voyance.fr). Wengo annonce environ 2,50 €/min en général. Chez Callastral, l’astrologie par téléphone coûte de ${c.min} à ${c.max}/min.`,
        },
        {
          question: 'Pourquoi l’audiotel coûte-t-il plus que 0,80 €/min ?',
          answer: 'Les numéros 08 surtaxés ajoutent un service facturé (ici 0,80 €/min) au prix de l’appel. Le tarif doit être annoncé gratuitement au début de l’appel (ARCEP).',
        },
        {
          question: 'Callastral est-il un service de voyance ?',
          answer: 'Non. Callastral propose des consultations d’astrologie fondées sur le thème natal (date, heure et lieu de naissance), menées par des conseillers virtuels dont la voix est générée par ordinateur. Pour un voyant humain, choisissez un autre service.',
        },
        {
          question: 'Les prix de cette page sont-ils à jour ?',
          answer: 'Ils ont été relevés le 3 octobre 2026 sur les pages officielles citées en source. Vérifiez la grille du service avant de payer.',
        },
      ],
      cta: 'Voir les conseillers Callastral',
      compare: 'Lire notre comparatif honnête des sites de voyance et d’astrologie',
      breadcrumb: 'Accueil',
    };
  }
  return {
    title: 'Phone psychic and astrology reading prices in 2026',
    description: `In 2026, a phone reading in France costs from €0.80/min (audiotel) to €9.50/min (premium psychic by card); at Callastral, ${c.min} to ${c.max}/min. Sourced, dated prices.`,
    answer: `In 2026, a phone psychic or astrology reading in France costs from €0.80/min (audiotel premium-rate line, plus the price of the call) to €9.50/min (premium psychic paid by card); at Callastral, ${c.min} to ${c.max}/min, with virtual advisors.`,
    notVoyance: 'Callastral offers astrology based on your birth chart, not psychic readings: if you want a human psychic, the services listed below are a better fit.',
    ourModel: `${AI_MODEL_SUMMARY.en}; 24/7; 5 languages; computed birth chart`,
    tableCaption: 'Public prices collected on 3 October 2026 from official price pages',
    cols: ['Service', 'Model', 'Public price collected', 'Source'],
    methodTitle: 'Method',
    method: [
      'Each price comes from the service’s public price page, checked on 3 October 2026. Each source is linked in the table.',
      'Prices can change: check the official page before paying. The collection date is shown at the top of the page.',
      'Callastral is our service. This page contains no affiliate links.',
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        question: 'How much does a phone psychic reading cost in 2026?',
        answer: `In France, from €0.80/min plus the call price (audiotel 0892 numbers) to €9.50/min for the most expensive card-paid psychics (Voyance.fr). Wengo states about €2.50/min in general. Kasamba (US) offers 3 free minutes per new advisor. At Callastral, phone astrology costs ${c.min} to ${c.max}/min.`,
      },
      {
        question: 'Is Callastral a psychic service?',
        answer: 'No. Callastral offers astrology consultations based on the birth chart (date, time and place of birth), led by virtual advisors with a computer-generated voice. If you want a human psychic, choose another service.',
      },
      {
        question: 'Are these prices up to date?',
        answer: 'They were collected on 3 October 2026 from the official pages linked as sources. Check the service’s price page before paying.',
      },
    ],
    cta: 'See Callastral advisors',
    compare: 'Read our honest comparison of psychic and astrology sites',
    breadcrumb: 'Home',
  };
}

export default function GeoPricesPage({ locale }: { locale: GeoLocale }) {
  const copy = pricesCopy(locale);
  const rows = priceRows(locale, copy.ourModel);
  const origin = appBaseUrl();
  const url = `${origin}${GEO_PATHS.prices[locale]}`;
  const allSources = [SOURCES.S16, SOURCES.S17, SOURCES.S18, SOURCES.S19a, SOURCES.S19b, SOURCES.S20];

  return (
    <main>
      <GeoHeader locale={locale} page="prices" />
      <article className="max-w-3xl mx-auto px-4 py-8 text-white/85 leading-relaxed">
        <nav aria-label="Breadcrumb" className="text-sm text-white/50 mb-4">
          <Link href={locale === 'fr' ? '/fr' : '/en'}>{copy.breadcrumb}</Link>
          <span> / </span>
          <span>{copy.title}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">{copy.title}</h1>
        <Updated locale={locale} />
        <p className="mt-5 text-lg text-white">{copy.answer}</p>
        <p className="mt-3">{copy.notVoyance}</p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <caption className="text-left text-white/60 mb-2">{copy.tableCaption}</caption>
            <thead>
              <tr className="text-left text-white">
                {copy.cols.map((col) => (
                  <th key={col} scope="col" className="border-b border-white/20 py-2 pr-3 align-bottom">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.service} className={row.ours ? 'bg-celestial-gold/10' : ''}>
                  <th scope="row" className="border-b border-white/10 py-3 pr-3 text-left align-top font-semibold text-white">
                    {row.url ? (
                      <a href={row.url} rel="noopener noreferrer nofollow" target="_blank" className="hover:underline">{row.service}</a>
                    ) : row.service}
                  </th>
                  <td className="border-b border-white/10 py-3 pr-3 align-top">{row.model}</td>
                  <td className="border-b border-white/10 py-3 pr-3 align-top">{row.price}</td>
                  <td className="border-b border-white/10 py-3 align-top"><SourceLinks sources={row.sources} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl text-white font-semibold">{copy.methodTitle}</h2>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          {copy.method.map((line) => <li key={line}>{line}</li>)}
        </ul>
        <ol className="mt-4 text-xs text-white/60 space-y-1">
          {allSources.map((source) => (
            <li key={source.url}>
              [{source.id}] <a href={source.url} rel="noopener noreferrer nofollow" target="_blank" className="underline">{source.label}</a>
            </li>
          ))}
        </ol>

        <h2 className="mt-10 text-xl text-white font-semibold">{copy.faqTitle}</h2>
        <dl className="mt-3 space-y-5">
          {copy.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-white">{faq.question}</dt>
              <dd className="mt-1">{faq.answer}</dd>
            </div>
          ))}
        </dl>

        <AiDisclosure locale={locale} className="mt-10" />
        <p className="mt-6 flex flex-col gap-3">
          <Link href={locale === 'fr' ? '/fr' : '/en'} className="btn-primary text-center">{copy.cta}</Link>
          <Link href={GEO_PATHS.compare[locale]} className="underline text-celestial-gold">{copy.compare}</Link>
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
            citation: allSources.map((source) => source.url),
          },
          {
            '@type': 'Dataset',
            name: copy.tableCaption,
            description: copy.description,
            url,
            inLanguage: locale,
            temporalCoverage: GEO_UPDATED_ISO,
            dateModified: GEO_UPDATED_ISO,
            isAccessibleForFree: true,
            creator: { '@type': 'Organization', name: 'Callastral', url: origin },
            variableMeasured: locale === 'fr' ? ['Prix par minute', 'Offre de bienvenue'] : ['Price per minute', 'Welcome offer'],
            citation: allSources.map((source) => source.url),
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
