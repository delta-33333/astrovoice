import { MAX_EUR_CENTS, MIN_EUR_CENTS, formatMoney } from '@/lib/money';
import { SUBSCRIPTION_EUR_CENTS, SUBSCRIPTION_FAIR_USE_MINUTES } from '@/lib/offers';
import { MINUTE_PACKS } from '@/lib/pricing';

/** Pages « réponse d’abord » (FR + EN). Prix concurrents : relevé du 3/10/2026, plan GEO. */
export type GeoLocale = 'fr' | 'en';

export const GEO_UPDATED_ISO = '2026-10-03';
export const GEO_PUBLISHED_ISO = '2026-10-03';

export const GEO_PATHS = {
  prices: { fr: '/fr/tarifs-voyance-telephone-2026', en: '/en/phone-psychic-prices-2026' },
  compare: { fr: '/fr/meilleurs-sites-voyance-2026', en: '/en/best-psychic-sites-2026' },
  about: { fr: '/a-propos', en: '/about' },
} as const;

export type GeoPage = keyof typeof GEO_PATHS;

export function geoAlternates(page: GeoPage): Record<string, string> {
  return { fr: GEO_PATHS[page].fr, en: GEO_PATHS[page].en, 'x-default': GEO_PATHS[page].fr };
}

export function updatedLabel(locale: GeoLocale): string {
  return locale === 'fr' ? 'Mis à jour le 3 octobre 2026' : 'Updated on 3 October 2026';
}

export interface Source {
  id: string;
  label: string;
  url: string;
}

export const SOURCES: Record<string, Source> = {
  S16: {
    id: 'S16',
    label: 'ARCEP — numéros 08 et numéros courts',
    url: 'https://www.arcep.fr/mes-demarches-et-services/consommateurs/fiches-pratiques/les-numeros-08-et-les-numeros-courts.html',
  },
  S17: { id: 'S17', label: 'Voyance.fr — audiotel', url: 'https://www.voyance.fr/consultation/audiotel' },
  S18: { id: 'S18', label: 'Voyance.fr — voyance par téléphone', url: 'https://www.voyance.fr/voyance-par-telephone.html' },
  S19a: { id: 'S19', label: 'Wengo — voyance par téléphone', url: 'https://www.wengo.fr/voyance-astrologie-1270/thema/voyance-telephone' },
  S19b: { id: 'S19', label: 'Wengo — voyants par prix', url: 'https://www.wengo.fr/voyance-astrologie-1270/thema/all-voyants-by-price' },
  S20: { id: 'S20', label: 'Kasamba — online psychic readings', url: 'https://www.kasamba.com/lp/best-online-psychic-readings/' },
};

function eur(cents: number, locale: GeoLocale): string {
  return formatMoney(cents, 'eur', locale);
}

export function callastralFacts(locale: GeoLocale) {
  const founding = MINUTE_PACKS.find((pack) => pack.founding);
  const packs = MINUTE_PACKS.filter((pack) => !pack.founding);
  return {
    min: eur(MIN_EUR_CENTS, locale),
    max: eur(MAX_EUR_CENTS, locale),
    founding: founding ? { minutes: founding.minutes, price: eur(founding.amountCents, locale) } : null,
    packs: packs.map((pack) => ({ minutes: pack.minutes, price: eur(pack.amountCents, locale) })),
    subscription: eur(SUBSCRIPTION_EUR_CENTS, locale),
    fairUse: SUBSCRIPTION_FAIR_USE_MINUTES,
  };
}

export interface PriceRow {
  service: string;
  url: string | null;
  model: string;
  price: string;
  sources: Source[];
  ours?: boolean;
}

export function priceRows(locale: GeoLocale, ourModel: string): PriceRow[] {
  const c = callastralFacts(locale);
  const packs = c.packs.map((pack) => pack.price).join(' / ');
  if (locale === 'fr') {
    return [
      {
        service: 'Audiotel (numéros 0892…)',
        url: null,
        model: 'Sans carte bancaire, numéro surtaxé',
        price: '0,80 €/min + prix de l’appel ; tarif annoncé gratuitement au début de l’appel',
        sources: [SOURCES.S16, SOURCES.S17],
      },
      {
        service: 'Voyance.fr (carte bancaire, numéro privé)',
        url: 'https://www.voyance.fr/',
        model: 'Voyants humains',
        price: '15 € les 10 premières minutes, puis 3,50 € à 9,50 €/min selon le voyant',
        sources: [SOURCES.S18],
      },
      {
        service: 'Wengo',
        url: 'https://www.wengo.fr/',
        model: 'Experts humains',
        price: 'Offre de bienvenue 5 € les 10 min, puis environ 2,50 €/min en général (1,90 € à 3,55 €/min selon les experts) ; forfait 10 min à 30 €',
        sources: [SOURCES.S19a, SOURCES.S19b],
      },
      {
        service: 'Kasamba (États-Unis, en anglais)',
        url: 'https://www.kasamba.com/',
        model: 'Conseillers humains',
        price: '3 min offertes par nouveau conseiller + 50 à 70 % de remise sur la 1re séance (50 $ maximum), carte bancaire requise',
        sources: [SOURCES.S20],
      },
      {
        service: 'Callastral (notre service)',
        url: null,
        model: ourModel,
        price: `${c.min} à ${c.max}/min selon le conseiller${c.founding ? ` ; ${c.founding.minutes} min à ${c.founding.price} (offre fondateur, une fois par compte)` : ''} ; packs ${packs} (10, 30, 60 min) ; Callastral Illimité ${c.subscription}/mois (${c.fairUse} min)`,
        sources: [],
        ours: true,
      },
    ];
  }
  return [
    {
      service: 'Audiotel (French 0892… numbers)',
      url: null,
      model: 'No card, premium-rate number',
      price: '€0.80/min + the price of the call; the rate is announced free of charge at the start of the call',
      sources: [SOURCES.S16, SOURCES.S17],
    },
    {
      service: 'Voyance.fr (card payment, private number)',
      url: 'https://www.voyance.fr/',
      model: 'Human psychics',
      price: '€15 for the first 10 minutes, then €3.50 to €9.50/min depending on the psychic',
      sources: [SOURCES.S18],
    },
    {
      service: 'Wengo',
      url: 'https://www.wengo.fr/',
      model: 'Human experts',
      price: 'Welcome offer €5 for 10 min, then about €2.50/min in general (€1.90 to €3.55/min depending on the expert); 10-minute package at €30',
      sources: [SOURCES.S19a, SOURCES.S19b],
    },
    {
      service: 'Kasamba (US, English)',
      url: 'https://www.kasamba.com/',
      model: 'Human advisors',
      price: '3 free minutes with each new advisor + 50 to 70% off the first session (up to $50), card required',
      sources: [SOURCES.S20],
    },
    {
      service: 'Callastral (our service)',
      url: null,
      model: ourModel,
      price: `${c.min} to ${c.max}/min depending on the advisor${c.founding ? `; ${c.founding.minutes} min for ${c.founding.price} (founder offer, once per account)` : ''}; packs ${packs} (10, 30, 60 min); Callastral Unlimited ${c.subscription}/month (${c.fairUse} min)`,
      sources: [],
      ours: true,
    },
  ];
}
