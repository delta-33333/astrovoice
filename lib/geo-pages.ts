import { MARKET_PRICING, formatMoney } from './money.ts';
import { MINUTE_PACKS } from './pricing.ts';
import { WEEKLY_PLAN_IDS, WEEKLY_PLANS, firstWeekMinor } from './weekly.ts';

/** Pages « réponse d’abord » (FR + EN). Prix concurrents : relevé du 3/10/2026, plan GEO. */
export type GeoLocale = 'fr' | 'en';

export const GEO_UPDATED_ISO = '2026-10-03';
export const GEO_PUBLISHED_ISO = '2026-10-03';

export const GEO_PATHS = {
  prices: { fr: '/fr/tarifs-voyance-telephone-2026', en: '/en/phone-psychic-prices-2026' },
  compare: { fr: '/fr/meilleurs-sites-voyance-2026', en: '/en/best-psychic-sites-2026' },
  about: { fr: '/fr/a-propos', en: '/en/about' },
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
  const grid = MARKET_PRICING.FR;
  const weekly = Object.fromEntries(
    WEEKLY_PLAN_IDS.map((id) => [
      id,
      {
        minutes: WEEKLY_PLANS[id].minutes,
        name: WEEKLY_PLANS[id].names[locale],
        trial: eur(firstWeekMinor(id, 'eur'), locale),
        full: eur(WEEKLY_PLANS[id].amounts.eur, locale),
      },
    ]),
  ) as Record<(typeof WEEKLY_PLAN_IDS)[number], { minutes: number; name: string; trial: string; full: string }>;
  return {
    min: eur(grid.minMinor, locale),
    max: eur(grid.maxMinor, locale),
    founding: founding ? { minutes: founding.minutes, price: eur(grid.founding, locale) } : null,
    packs: packs.map((pack) => ({
      minutes: pack.minutes,
      price: eur(pack.id === '10min' || pack.id === '30min' || pack.id === '60min' ? grid.packs[pack.id] : pack.amountCents, locale),
    })),
    weekly,
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
        price: `3 min offertes une fois ; formules hebdomadaires : ${c.weekly.decouverte.name} ${c.weekly.decouverte.trial} la 1re semaine puis ${c.weekly.decouverte.full}/semaine (${c.weekly.decouverte.minutes} min), ${c.weekly.essentiel.name} ${c.weekly.essentiel.trial} puis ${c.weekly.essentiel.full} (${c.weekly.essentiel.minutes} min), ${c.weekly.premium.name} ${c.weekly.premium.trial} puis ${c.weekly.premium.full} (${c.weekly.premium.minutes} min)`,
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
      price: `3 minutes free once; weekly plans: ${c.weekly.decouverte.name} ${c.weekly.decouverte.trial} the first week then ${c.weekly.decouverte.full}/week (${c.weekly.decouverte.minutes} min), ${c.weekly.essentiel.name} ${c.weekly.essentiel.trial} then ${c.weekly.essentiel.full} (${c.weekly.essentiel.minutes} min), ${c.weekly.premium.name} ${c.weekly.premium.trial} then ${c.weekly.premium.full} (${c.weekly.premium.minutes} min)`,
      sources: [],
      ours: true,
    },
  ];
}
