export const ASCENDANT_PATHS = {
  fr: '/fr/calcul-ascendant-gratuit',
  en: '/en/rising-sign-calculator',
  es: '/es/calcular-ascendente',
  de: '/de/aszendent-berechnen',
  it: '/it/calcolo-ascendente',
} as const;

export type ToolLocale = keyof typeof ASCENDANT_PATHS;

export const ASCENDANT_PATH = ASCENDANT_PATHS.fr;

export const ASCENDANT_SIGNS = [
  'Bélier',
  'Taureau',
  'Gémeaux',
  'Cancer',
  'Lion',
  'Vierge',
  'Balance',
  'Scorpion',
  'Sagittaire',
  'Capricorne',
  'Verseau',
  'Poissons',
] as const;

export type FrenchSign = (typeof ASCENDANT_SIGNS)[number];

export function ascendantPath(locale: ToolLocale): string {
  return ASCENDANT_PATHS[locale];
}

export function isToolLocale(value: string): value is ToolLocale {
  return value in ASCENDANT_PATHS;
}

const PROFESSION_SLUG: Record<ToolLocale, string> = {
  fr: 'astrologue',
  en: 'astrologer',
  es: 'astrologo',
  de: 'astrologe',
  it: 'astrologo',
};

const SCHEMA_LANG: Record<ToolLocale, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  it: 'it-IT',
};

export function schemaLanguage(locale: ToolLocale): string {
  return SCHEMA_LANG[locale];
}

export function schemaCurrency(locale: ToolLocale): 'EUR' | 'USD' {
  return locale === 'en' ? 'USD' : 'EUR';
}

export interface AscendantResult {
  /** Clé stable, le nom français du signe renvoyé par l’éphéméride. */
  sign: string;
  arc: string;
  sunSign: string;
  moonSign: string;
  placeLabel: string;
  timeZone: string;
  localMeanTime: boolean;
}

export function presentAscendant(input: {
  sign: string;
  position: string;
  sunSign: string;
  moonSign: string;
  placeLabel: string;
  timeZone: string;
  localMeanTime: boolean;
}): AscendantResult {
  const prefix = `${input.sign} `;
  const arc = input.position.startsWith(prefix) ? input.position.slice(prefix.length) : input.position;
  return {
    sign: input.sign,
    arc,
    sunSign: input.sunSign,
    moonSign: input.moonSign,
    placeLabel: input.placeLabel,
    timeZone: input.timeZone,
    localMeanTime: input.localMeanTime,
  };
}

export interface ConsultCandidate {
  id: string;
  slug: string;
  gender: 'femme' | 'homme';
  languages: readonly string[];
  immediateSlotId: string | null;
  immediateStartsAt: string | null;
}

export interface ConsultChoice {
  href: string;
  gender: 'femme' | 'homme';
}

/** Une seule destination produit : réservation immédiate, sinon la fiche, sinon l’accueil de la langue. */
export function consultChoice(locale: ToolLocale, advisors: readonly ConsultCandidate[]): ConsultChoice {
  const speakers = advisors.filter((advisor) => advisor.languages.includes(locale));
  const women = speakers.filter((advisor) => advisor.gender === 'femme');
  const pool = women.length > 0 ? women : speakers;
  const immediate = pool.find((advisor) => advisor.immediateSlotId && advisor.immediateStartsAt);
  if (immediate?.immediateSlotId && immediate.immediateStartsAt) {
    const params = new URLSearchParams({
      slot: immediate.immediateSlotId,
      at: immediate.immediateStartsAt,
      advisor: immediate.id,
    });
    return { href: `/book?${params.toString()}`, gender: immediate.gender };
  }
  if (pool[0]) {
    return { href: `/${locale}/${PROFESSION_SLUG[locale]}/${pool[0].slug}`, gender: pool[0].gender };
  }
  return { href: locale === 'fr' ? '/fr#annuaire' : `/${locale}`, gender: 'femme' };
}

export interface JsonLdFaq {
  question: string;
  answer: string;
}

export function ascendantJsonLd(input: {
  origin: string;
  locale: ToolLocale;
  path: string;
  h1: string;
  description: string;
  homeLabel: string;
  faqs: readonly JsonLdFaq[];
}): Record<string, unknown> {
  const url = `${input.origin}${input.path}`;
  const language = schemaLanguage(input.locale);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: input.homeLabel, item: `${input.origin}/${input.locale}` },
          { '@type': 'ListItem', position: 2, name: input.h1, item: url },
        ],
      },
      {
        '@type': 'WebApplication',
        name: input.h1,
        url,
        description: input.description,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        inLanguage: language,
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: schemaCurrency(input.locale),
        },
        provider: { '@id': `${input.origin}/#organization` },
      },
      {
        '@type': 'FAQPage',
        url,
        inLanguage: language,
        mainEntity: input.faqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}
