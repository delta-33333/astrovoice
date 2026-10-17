import { hreflangAlternates, type Locale } from './seo.ts';
import { ascendantPath } from './ascendant-tool.ts';
import {
  SIGN_IDS,
  SIGNS,
  signByFrench,
  signName,
  signPath,
  type SignId,
} from './zodiac/signs.ts';

export const COUPLE_SLUG: Record<Locale, string> = {
  fr: 'compatibilite-couple',
  en: 'couple-compatibility',
  es: 'compatibilidad-pareja',
  de: 'partner-kompatibilitaet',
  it: 'compatibilita-coppia',
};

export function couplePath(locale: Locale): string {
  return `/${locale}/${COUPLE_SLUG[locale]}`;
}

export function coupleSharePath(locale: Locale, id: string): string {
  return `${couplePath(locale)}/r/${id}`;
}

export function coupleAlternates(): Record<string, string> {
  return hreflangAlternates(couplePath);
}

/** Lien du résultat partagé : offre Découverte, source identifiable. */
export function coupleShareBookPath(): string {
  const params = new URLSearchParams({
    offer: 'decouverte',
    utm_source: 'couple',
    utm_medium: 'share',
    utm_campaign: 'compatibilite',
  });
  return `/book?${params.toString()}`;
}

export function coupleToolBookPath(): string {
  const params = new URLSearchParams({
    offer: 'decouverte',
    utm_source: 'couple',
    utm_medium: 'tool',
    utm_campaign: 'compatibilite',
  });
  return `/book?${params.toString()}`;
}

const META: Record<Locale, { title: string; description: string; h1: string }> = {
  fr: {
    title: 'Compatibilité de couple gratuite | Callastral',
    description:
      'Score de compatibilité de couple gratuit : appuis et tensions entre deux thèmes. Les conseillers sont des voix virtuelles.',
    h1: 'Compatibilité de couple',
  },
  en: {
    title: 'Free couple compatibility | Callastral',
    description:
      'Free couple compatibility score: strengths and tensions between two charts. Advisors are virtual voices.',
    h1: 'Couple compatibility',
  },
  es: {
    title: 'Compatibilidad de pareja gratis | Callastral',
    description:
      'Puntuación gratis de compatibilidad de pareja: apoyos y tensiones entre dos cartas. Los consejeros son voces virtuales.',
    h1: 'Compatibilidad de pareja',
  },
  de: {
    title: 'Partner-Kompatibilität kostenlos | Callastral',
    description:
      'Kostenloser Partner-Score: Stärken und Spannungen zweier Horoskope. Die Berater sind virtuelle Stimmen.',
    h1: 'Partner-Kompatibilität',
  },
  it: {
    title: 'Compatibilità di coppia gratuita | Callastral',
    description:
      'Punteggio gratuito di compatibilità di coppia: appoggi e tensioni tra due temi. I consulenti sono voci virtuali.',
    h1: 'Compatibilità di coppia',
  },
};

export function coupleMeta(locale: Locale): { title: string; description: string; h1: string } {
  return META[locale];
}

export const COUPLE_CTA: Record<Locale, string> = {
  fr: 'Approfondir avec un conseiller',
  en: 'Go further with an advisor',
  es: 'Profundizar con un consejero',
  de: 'Mit einem Berater vertiefen',
  it: 'Approfondire con un consulente',
};

export type PairKey = 'sun' | 'moon' | 'venus-mars' | 'mars-venus' | 'sun-moon' | 'moon-sun' | 'rising';
export type AspectKey = 'conjunction' | 'semisextile' | 'sextile' | 'square' | 'trine' | 'quincunx' | 'opposition';

export interface SynastrySigns {
  sun: SignId;
  moon: SignId;
  venus: SignId;
  mars: SignId;
  rising: SignId | null;
}

export interface CoupleReading {
  score: number;
  strengths: string[];
  tensions: string[];
}

export interface PublicCoupleResult {
  id: string;
  locale: Locale;
  score: number;
  strengths: string[];
  tensions: string[];
  initialA: string;
  initialB: string;
  labelA: string | null;
  labelB: string | null;
  sharePath: string;
}

const PAIR_LABEL: Record<Locale, Record<PairKey, string>> = {
  fr: {
    sun: 'les Soleils',
    moon: 'les Lunes',
    'venus-mars': 'Vénus et Mars',
    'mars-venus': 'Mars et Vénus',
    'sun-moon': 'le Soleil et la Lune',
    'moon-sun': 'la Lune et le Soleil',
    rising: 'les ascendants',
  },
  en: {
    sun: 'the Suns',
    moon: 'the Moons',
    'venus-mars': 'Venus and Mars',
    'mars-venus': 'Mars and Venus',
    'sun-moon': 'the Sun and the Moon',
    'moon-sun': 'the Moon and the Sun',
    rising: 'the rising signs',
  },
  es: {
    sun: 'los Soles',
    moon: 'las Lunas',
    'venus-mars': 'Venus y Marte',
    'mars-venus': 'Marte y Venus',
    'sun-moon': 'el Sol y la Luna',
    'moon-sun': 'la Luna y el Sol',
    rising: 'los ascendentes',
  },
  de: {
    sun: 'die Sonnen',
    moon: 'die Monde',
    'venus-mars': 'Venus und Mars',
    'mars-venus': 'Mars und Venus',
    'sun-moon': 'die Sonne und der Mond',
    'moon-sun': 'der Mond und die Sonne',
    rising: 'die Aszendenten',
  },
  it: {
    sun: 'i Soli',
    moon: 'le Lune',
    'venus-mars': 'Venere e Marte',
    'mars-venus': 'Marte e Venere',
    'sun-moon': 'il Sole e la Luna',
    'moon-sun': 'la Luna e il Sole',
    rising: 'gli ascendenti',
  },
};

const ASPECT_WORD: Record<Locale, Record<AspectKey, string>> = {
  fr: {
    conjunction: 'conjonction',
    semisextile: 'semi-sextile',
    sextile: 'sextile',
    square: 'carré',
    trine: 'trigone',
    quincunx: 'quinconce',
    opposition: 'opposition',
  },
  en: {
    conjunction: 'conjunction',
    semisextile: 'semi-sextile',
    sextile: 'sextile',
    square: 'square',
    trine: 'trine',
    quincunx: 'quincunx',
    opposition: 'opposition',
  },
  es: {
    conjunction: 'conjunción',
    semisextile: 'semisextil',
    sextile: 'sextil',
    square: 'cuadratura',
    trine: 'trígono',
    quincunx: 'quincuncio',
    opposition: 'oposición',
  },
  de: {
    conjunction: 'Konjunktion',
    semisextile: 'Halbsextil',
    sextile: 'Sextil',
    square: 'Quadrat',
    trine: 'Trigon',
    quincunx: 'Quinkunx',
    opposition: 'Opposition',
  },
  it: {
    conjunction: 'congiunzione',
    semisextile: 'semisestile',
    sextile: 'sestile',
    square: 'quadratura',
    trine: 'trigono',
    quincunx: 'quinconce',
    opposition: 'opposizione',
  },
};

const ASPECT_NOTE: Record<Locale, Record<AspectKey, string>> = {
  fr: {
    conjunction: 'L’intensité est forte, au point de se confondre.',
    semisextile: 'Le décalage est léger, mais il se répète.',
    sextile: 'Il y a une ouverture, à condition d’en faire quelque chose.',
    square: 'Les rythmes se heurtent et demandent un ajustement.',
    trine: 'Les deux fonctionnent dans le même sens.',
    quincunx: 'Les besoins ne se traduisent pas tout seuls.',
    opposition: 'Chacun voit ce que l’autre ne regarde pas.',
  },
  en: {
    conjunction: 'The intensity is high, to the point of blending.',
    semisextile: 'The gap is small, but it repeats.',
    sextile: 'There is an opening, if you actually use it.',
    square: 'The rhythms clash and need an adjustment.',
    trine: 'The two move in the same direction.',
    quincunx: 'The needs do not translate on their own.',
    opposition: 'Each one sees what the other does not look at.',
  },
  es: {
    conjunction: 'La intensidad es alta, hasta confundirse.',
    semisextile: 'El desfase es leve, pero se repite.',
    sextile: 'Hay una apertura, si se usa de verdad.',
    square: 'Los ritmos chocan y piden un ajuste.',
    trine: 'Los dos van en el mismo sentido.',
    quincunx: 'Las necesidades no se traducen solas.',
    opposition: 'Cada uno ve lo que el otro no mira.',
  },
  de: {
    conjunction: 'Die Intensität ist hoch, bis zur Vermischung.',
    semisextile: 'Der Versatz ist klein, wiederholt sich aber.',
    sextile: 'Es gibt eine Öffnung, wenn man sie nutzt.',
    square: 'Die Rhythmen stoßen aneinander und brauchen Ausgleich.',
    trine: 'Beide laufen in dieselbe Richtung.',
    quincunx: 'Die Bedürfnisse übersetzen sich nicht von selbst.',
    opposition: 'Jeder sieht, worauf der andere nicht schaut.',
  },
  it: {
    conjunction: 'L’intensità è alta, fino a confondersi.',
    semisextile: 'Lo scarto è lieve, ma si ripete.',
    sextile: 'C’è un’apertura, se la si usa davvero.',
    square: 'I ritmi si scontrano e chiedono un aggiustamento.',
    trine: 'I due vanno nella stessa direzione.',
    quincunx: 'I bisogni non si traducono da soli.',
    opposition: 'Ognuno vede ciò che l’altro non guarda.',
  },
};

const ASPECT_BY_DISTANCE: AspectKey[] = [
  'conjunction',
  'semisextile',
  'sextile',
  'square',
  'trine',
  'quincunx',
  'opposition',
];

const BASE_SCORE = [72, 48, 86, 42, 94, 55, 64];

function signDistance(a: SignId, b: SignId): number {
  const raw = (SIGNS[b].index - SIGNS[a].index + 12) % 12;
  return Math.min(raw, 12 - raw);
}

export function aspectBetween(a: SignId, b: SignId): AspectKey {
  return ASPECT_BY_DISTANCE[signDistance(a, b)];
}

export function contactScore(a: SignId, b: SignId): number {
  let score = BASE_SCORE[signDistance(a, b)];
  const left = SIGNS[a].element;
  const right = SIGNS[b].element;
  if (left === right) score += 4;
  const complement =
    (left === 'fire' && right === 'air') ||
    (left === 'air' && right === 'fire') ||
    (left === 'earth' && right === 'water') ||
    (left === 'water' && right === 'earth');
  if (complement) score += 3;
  return Math.max(0, Math.min(100, score));
}

interface Weighted {
  key: PairKey;
  score: number;
}

function contacts(left: SynastrySigns, right: SynastrySigns): Weighted[] {
  const rows: Array<{ key: PairKey; a: SignId; b: SignId; weight: number }> = [
    { key: 'sun', a: left.sun, b: right.sun, weight: 18 },
    { key: 'moon', a: left.moon, b: right.moon, weight: 18 },
    { key: 'venus-mars', a: left.venus, b: right.mars, weight: 16 },
    { key: 'mars-venus', a: left.mars, b: right.venus, weight: 16 },
    { key: 'sun-moon', a: left.sun, b: right.moon, weight: 12 },
    { key: 'moon-sun', a: left.moon, b: right.sun, weight: 12 },
  ];
  if (left.rising && right.rising) {
    rows.push({ key: 'rising', a: left.rising, b: right.rising, weight: 8 });
  }
  return rows.map((row) => ({ key: row.key, score: contactScore(row.a, row.b), weight: row.weight })) as Array<
    Weighted & { weight: number }
  >;
}

function line(locale: Locale, tone: 'strength' | 'soft' | 'tension', key: PairKey, aspect: AspectKey): string {
  const pair = PAIR_LABEL[locale][key];
  const word = ASPECT_WORD[locale][aspect];
  const note = ASPECT_NOTE[locale][aspect];
  if (tone === 'strength') {
    return {
      fr: `Appui : ${pair} en ${word}. ${note}`,
      en: `Strength: ${pair} in ${word}. ${note}`,
      es: `Apoyo: ${pair} en ${word}. ${note}`,
      de: `Stärke: ${pair} im ${word}. ${note}`,
      it: `Appoggio: ${pair} in ${word}. ${note}`,
    }[locale];
  }
  if (tone === 'soft') {
    return {
      fr: `Le contact le moins fluide, ${pair} en ${word}, reste un appui plutôt qu’une tension. ${note}`,
      en: `The least smooth contact, ${pair} in ${word}, is still a support rather than a tension. ${note}`,
      es: `El contacto menos fluido, ${pair} en ${word}, sigue siendo un apoyo más que una tensión. ${note}`,
      de: `Der weniger flüssige Kontakt, ${pair} im ${word}, bleibt eine Stärke und keine Spannung. ${note}`,
      it: `Il contatto meno fluido, ${pair} in ${word}, resta un appoggio più che una tensione. ${note}`,
    }[locale];
  }
  return {
    fr: `Tension : ${pair} en ${word}. ${note}`,
    en: `Tension: ${pair} in ${word}. ${note}`,
    es: `Tensión: ${pair} en ${word}. ${note}`,
    de: `Spannung: ${pair} im ${word}. ${note}`,
    it: `Tensione: ${pair} in ${word}. ${note}`,
  }[locale];
}

export function readCouple(locale: Locale, left: SynastrySigns, right: SynastrySigns): CoupleReading {
  const rows = contacts(left, right) as Array<Weighted & { weight: number }>;
  const total = rows.reduce((sum, row) => sum + row.weight, 0);
  const score = Math.round(rows.reduce((sum, row) => sum + row.score * row.weight, 0) / total);
  const ranked = [...rows].sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
  const strengths = ranked.slice(0, 2).map((row) => {
    const aspect = aspectBetween(signOf(left, right, row.key).a, signOf(left, right, row.key).b);
    return line(locale, 'strength', row.key, aspect);
  });
  const low = [...rows].sort((a, b) => a.score - b.score || a.key.localeCompare(b.key)).slice(0, 2);
  const tensions = low.map((row) => {
    const aspect = aspectBetween(signOf(left, right, row.key).a, signOf(left, right, row.key).b);
    return line(locale, row.score >= 80 ? 'soft' : 'tension', row.key, aspect);
  });
  return { score, strengths, tensions };
}

function signOf(left: SynastrySigns, right: SynastrySigns, key: PairKey): { a: SignId; b: SignId } {
  switch (key) {
    case 'sun':
      return { a: left.sun, b: right.sun };
    case 'moon':
      return { a: left.moon, b: right.moon };
    case 'venus-mars':
      return { a: left.venus, b: right.mars };
    case 'mars-venus':
      return { a: left.mars, b: right.venus };
    case 'sun-moon':
      return { a: left.sun, b: right.moon };
    case 'moon-sun':
      return { a: left.moon, b: right.sun };
    case 'rising':
      return { a: left.rising || left.sun, b: right.rising || right.sun };
    default:
      return { a: left.sun, b: right.sun };
  }
}

export function displayLabel(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const token = value.trim().split(/\s+/)[0]?.replace(/[^\p{L}'’-]/gu, '') ?? '';
  const label = token.slice(0, 24);
  return label || null;
}

export function personInitial(value: unknown, fallback: string): string {
  const label = displayLabel(value);
  if (!label) return fallback;
  const letter = Array.from(label)[0];
  return letter ? letter.toLocaleUpperCase('fr') : fallback;
}

export function toPublicCoupleResult(input: {
  id: string;
  locale: Locale;
  score: number;
  strengths: string[];
  tensions: string[];
  initialA: string;
  initialB: string;
  labelA: string | null;
  labelB: string | null;
}): PublicCoupleResult {
  return {
    id: input.id,
    locale: input.locale,
    score: input.score,
    strengths: input.strengths,
    tensions: input.tensions,
    initialA: input.initialA,
    initialB: input.initialB,
    labelA: input.labelA,
    labelB: input.labelB,
    sharePath: coupleSharePath(input.locale, input.id),
  };
}

/** Champs autorisés sur une page partagée. Jamais de naissance. */
export const PUBLIC_COUPLE_KEYS = [
  'id',
  'locale',
  'score',
  'strengths',
  'tensions',
  'initialA',
  'initialB',
  'labelA',
  'labelB',
  'sharePath',
] as const;

export function signsFromPositions(input: {
  sunSign: string;
  moonSign: string;
  venusSign: string;
  marsSign: string;
  ascendant: string;
  timeKnown: boolean;
}): SynastrySigns | null {
  const sun = signByFrench(input.sunSign);
  const moon = signByFrench(input.moonSign);
  const venus = signByFrench(input.venusSign);
  const mars = signByFrench(input.marsSign);
  if (!sun || !moon || !venus || !mars) return null;
  const rising = input.timeKnown ? signByFrench(input.ascendant) : null;
  return { sun, moon, venus, mars, rising };
}

export function coupleSignLinks(locale: Locale): Array<{ href: string; label: string }> {
  return [
    { href: ascendantPath(locale), label: coupleLinkLabel(locale, 'calc') },
    ...SIGN_IDS.map((id) => ({ href: signPath(locale, id), label: signName(locale, id) })),
  ];
}

function coupleLinkLabel(locale: Locale, kind: 'calc'): string {
  if (kind === 'calc') {
    return {
      fr: 'Calculer l’ascendant',
      en: 'Calculate the rising sign',
      es: 'Calcular el ascendente',
      de: 'Aszendent berechnen',
      it: 'Calcolare l’ascendente',
    }[locale];
  }
  return '';
}

export function isCoupleId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
