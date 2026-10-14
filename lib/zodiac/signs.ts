import { hreflangAlternates, type Locale } from '../seo.ts';

export const LOCALES = ['fr', 'en', 'es', 'de', 'it'] as const satisfies readonly Locale[];

export const SIGN_IDS = [
  'belier',
  'taureau',
  'gemeaux',
  'cancer',
  'lion',
  'vierge',
  'balance',
  'scorpion',
  'sagittaire',
  'capricorne',
  'verseau',
  'poissons',
] as const;

export type SignId = (typeof SIGN_IDS)[number];
export type ElementId = 'fire' | 'earth' | 'air' | 'water';
export type ModalityId = 'cardinal' | 'fixed' | 'mutable';
export type PlanetId = 'mars' | 'venus' | 'mercury' | 'moon' | 'sun' | 'jupiter' | 'saturn' | 'pluto' | 'uranus' | 'neptune';

export type ClusterKind = 'sign' | 'rising' | 'compat' | 'week';

const FRENCH_EPHEMERIS = [
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

interface SignFact {
  index: number;
  french: (typeof FRENCH_EPHEMERIS)[number];
  element: ElementId;
  modality: ModalityId;
  traditional: PlanetId;
  modern: PlanetId;
  slugs: Record<Locale, string>;
}

export const SIGNS: Record<SignId, SignFact> = {
  belier: { index: 0, french: 'Bélier', element: 'fire', modality: 'cardinal', traditional: 'mars', modern: 'mars', slugs: { fr: 'belier', en: 'aries', es: 'aries', de: 'widder', it: 'ariete' } },
  taureau: { index: 1, french: 'Taureau', element: 'earth', modality: 'fixed', traditional: 'venus', modern: 'venus', slugs: { fr: 'taureau', en: 'taurus', es: 'tauro', de: 'stier', it: 'toro' } },
  gemeaux: { index: 2, french: 'Gémeaux', element: 'air', modality: 'mutable', traditional: 'mercury', modern: 'mercury', slugs: { fr: 'gemeaux', en: 'gemini', es: 'geminis', de: 'zwillinge', it: 'gemelli' } },
  cancer: { index: 3, french: 'Cancer', element: 'water', modality: 'cardinal', traditional: 'moon', modern: 'moon', slugs: { fr: 'cancer', en: 'cancer', es: 'cancer', de: 'krebs', it: 'cancro' } },
  lion: { index: 4, french: 'Lion', element: 'fire', modality: 'fixed', traditional: 'sun', modern: 'sun', slugs: { fr: 'lion', en: 'leo', es: 'leo', de: 'loewe', it: 'leone' } },
  vierge: { index: 5, french: 'Vierge', element: 'earth', modality: 'mutable', traditional: 'mercury', modern: 'mercury', slugs: { fr: 'vierge', en: 'virgo', es: 'virgo', de: 'jungfrau', it: 'vergine' } },
  balance: { index: 6, french: 'Balance', element: 'air', modality: 'cardinal', traditional: 'venus', modern: 'venus', slugs: { fr: 'balance', en: 'libra', es: 'libra', de: 'waage', it: 'bilancia' } },
  scorpion: { index: 7, french: 'Scorpion', element: 'water', modality: 'fixed', traditional: 'mars', modern: 'pluto', slugs: { fr: 'scorpion', en: 'scorpio', es: 'escorpio', de: 'skorpion', it: 'scorpione' } },
  sagittaire: { index: 8, french: 'Sagittaire', element: 'fire', modality: 'mutable', traditional: 'jupiter', modern: 'jupiter', slugs: { fr: 'sagittaire', en: 'sagittarius', es: 'sagitario', de: 'schuetze', it: 'sagittario' } },
  capricorne: { index: 9, french: 'Capricorne', element: 'earth', modality: 'cardinal', traditional: 'saturn', modern: 'saturn', slugs: { fr: 'capricorne', en: 'capricorn', es: 'capricornio', de: 'steinbock', it: 'capricorno' } },
  verseau: { index: 10, french: 'Verseau', element: 'air', modality: 'fixed', traditional: 'saturn', modern: 'uranus', slugs: { fr: 'verseau', en: 'aquarius', es: 'acuario', de: 'wassermann', it: 'acquario' } },
  poissons: { index: 11, french: 'Poissons', element: 'water', modality: 'mutable', traditional: 'jupiter', modern: 'neptune', slugs: { fr: 'poissons', en: 'pisces', es: 'piscis', de: 'fische', it: 'pesci' } },
};

export const CLUSTER_SEGMENT: Record<ClusterKind, Record<Locale, string>> = {
  sign: { fr: 'signe', en: 'sign', es: 'signo', de: 'sternzeichen', it: 'segno' },
  rising: { fr: 'ascendant', en: 'rising-sign', es: 'ascendente', de: 'aszendent', it: 'ascendente' },
  compat: { fr: 'compatibilite', en: 'compatibility', es: 'compatibilidad', de: 'kompatibilitaet', it: 'compatibilita' },
  week: { fr: 'horoscope', en: 'weekly-horoscope', es: 'horoscopo-semanal', de: 'wochenhoroskop', it: 'oroscopo-settimanale' },
};

export const BOOK_DISCOVERY_PATH = '/book?offer=decouverte';

const ELEMENT_LABEL: Record<Locale, Record<ElementId, string>> = {
  fr: { fire: 'feu', earth: 'terre', air: 'air', water: 'eau' },
  en: { fire: 'fire', earth: 'earth', air: 'air', water: 'water' },
  es: { fire: 'fuego', earth: 'tierra', air: 'aire', water: 'agua' },
  de: { fire: 'Feuer', earth: 'Erde', air: 'Luft', water: 'Wasser' },
  it: { fire: 'fuoco', earth: 'terra', air: 'aria', water: 'acqua' },
};

const MODALITY_LABEL: Record<Locale, Record<ModalityId, string>> = {
  fr: { cardinal: 'cardinal', fixed: 'fixe', mutable: 'mutable' },
  en: { cardinal: 'cardinal', fixed: 'fixed', mutable: 'mutable' },
  es: { cardinal: 'cardinal', fixed: 'fijo', mutable: 'mutable' },
  de: { cardinal: 'kardinal', fixed: 'fix', mutable: 'veränderlich' },
  it: { cardinal: 'cardinale', fixed: 'fisso', mutable: 'mobile' },
};

const PLANET_LABEL: Record<Locale, Record<PlanetId, string>> = {
  fr: { mars: 'Mars', venus: 'Vénus', mercury: 'Mercure', moon: 'la Lune', sun: 'le Soleil', jupiter: 'Jupiter', saturn: 'Saturne', pluto: 'Pluton', uranus: 'Uranus', neptune: 'Neptune' },
  en: { mars: 'Mars', venus: 'Venus', mercury: 'Mercury', moon: 'the Moon', sun: 'the Sun', jupiter: 'Jupiter', saturn: 'Saturn', pluto: 'Pluto', uranus: 'Uranus', neptune: 'Neptune' },
  es: { mars: 'Marte', venus: 'Venus', mercury: 'Mercurio', moon: 'la Luna', sun: 'el Sol', jupiter: 'Júpiter', saturn: 'Saturno', pluto: 'Plutón', uranus: 'Urano', neptune: 'Neptuno' },
  de: { mars: 'Mars', venus: 'Venus', mercury: 'Merkur', moon: 'der Mond', sun: 'die Sonne', jupiter: 'Jupiter', saturn: 'Saturn', pluto: 'Pluto', uranus: 'Uranus', neptune: 'Neptun' },
  it: { mars: 'Marte', venus: 'Venere', mercury: 'Mercurio', moon: 'la Luna', sun: 'il Sole', jupiter: 'Giove', saturn: 'Saturno', pluto: 'Plutone', uranus: 'Urano', neptune: 'Nettuno' },
};

const ARTICLE: Record<Locale, Record<SignId, string>> = {
  fr: { belier: 'Le Bélier', taureau: 'Le Taureau', gemeaux: 'Les Gémeaux', cancer: 'Le Cancer', lion: 'Le Lion', vierge: 'La Vierge', balance: 'La Balance', scorpion: 'Le Scorpion', sagittaire: 'Le Sagittaire', capricorne: 'Le Capricorne', verseau: 'Le Verseau', poissons: 'Les Poissons' },
  en: { belier: 'Aries', taureau: 'Taurus', gemeaux: 'Gemini', cancer: 'Cancer', lion: 'Leo', vierge: 'Virgo', balance: 'Libra', scorpion: 'Scorpio', sagittaire: 'Sagittarius', capricorne: 'Capricorn', verseau: 'Aquarius', poissons: 'Pisces' },
  es: { belier: 'Aries', taureau: 'Tauro', gemeaux: 'Géminis', cancer: 'Cáncer', lion: 'Leo', vierge: 'Virgo', balance: 'Libra', scorpion: 'Escorpio', sagittaire: 'Sagitario', capricorne: 'Capricornio', verseau: 'Acuario', poissons: 'Piscis' },
  de: { belier: 'Widder', taureau: 'Stier', gemeaux: 'Zwillinge', cancer: 'Krebs', lion: 'Löwe', vierge: 'Jungfrau', balance: 'Waage', scorpion: 'Skorpion', sagittaire: 'Schütze', capricorne: 'Steinbock', verseau: 'Wassermann', poissons: 'Fische' },
  it: { belier: 'L’Ariete', taureau: 'Il Toro', gemeaux: 'I Gemelli', cancer: 'Il Cancro', lion: 'Il Leone', vierge: 'La Vergine', balance: 'La Bilancia', scorpion: 'Lo Scorpione', sagittaire: 'Il Sagittario', capricorne: 'Il Capricorno', verseau: 'L’Acquario', poissons: 'I Pesci' },
};

const NAME: Record<Locale, Record<SignId, string>> = {
  fr: { belier: 'Bélier', taureau: 'Taureau', gemeaux: 'Gémeaux', cancer: 'Cancer', lion: 'Lion', vierge: 'Vierge', balance: 'Balance', scorpion: 'Scorpion', sagittaire: 'Sagittaire', capricorne: 'Capricorne', verseau: 'Verseau', poissons: 'Poissons' },
  en: { belier: 'Aries', taureau: 'Taurus', gemeaux: 'Gemini', cancer: 'Cancer', lion: 'Leo', vierge: 'Virgo', balance: 'Libra', scorpion: 'Scorpio', sagittaire: 'Sagittarius', capricorne: 'Capricorn', verseau: 'Aquarius', poissons: 'Pisces' },
  es: { belier: 'Aries', taureau: 'Tauro', gemeaux: 'Géminis', cancer: 'Cáncer', lion: 'Leo', vierge: 'Virgo', balance: 'Libra', scorpion: 'Escorpio', sagittaire: 'Sagitario', capricorne: 'Capricornio', verseau: 'Acuario', poissons: 'Piscis' },
  de: { belier: 'Widder', taureau: 'Stier', gemeaux: 'Zwillinge', cancer: 'Krebs', lion: 'Löwe', vierge: 'Jungfrau', balance: 'Waage', scorpion: 'Skorpion', sagittaire: 'Schütze', capricorne: 'Steinbock', verseau: 'Wassermann', poissons: 'Fische' },
  it: { belier: 'Ariete', taureau: 'Toro', gemeaux: 'Gemelli', cancer: 'Cancro', lion: 'Leone', vierge: 'Vergine', balance: 'Bilancia', scorpion: 'Scorpione', sagittaire: 'Sagittario', capricorne: 'Capricorno', verseau: 'Acquario', poissons: 'Pesci' },
};

export function isSignId(value: string): value is SignId {
  return (SIGN_IDS as readonly string[]).includes(value);
}

export function signByFrench(name: string): SignId | null {
  const found = SIGN_IDS.find((id) => SIGNS[id].french === name);
  return found ?? null;
}

export function signBySlug(locale: Locale, slug: string): SignId | null {
  const found = SIGN_IDS.find((id) => SIGNS[id].slugs[locale] === slug);
  return found ?? null;
}

export function signSlug(locale: Locale, id: SignId): string {
  return SIGNS[id].slugs[locale];
}

export function signName(locale: Locale, id: SignId): string {
  return NAME[locale][id];
}

export function signArticle(locale: Locale, id: SignId): string {
  return ARTICLE[locale][id];
}

export function elementLabel(locale: Locale, element: ElementId): string {
  return ELEMENT_LABEL[locale][element];
}

export function modalityLabel(locale: Locale, modality: ModalityId): string {
  return MODALITY_LABEL[locale][modality];
}

export function planetLabel(locale: Locale, planet: PlanetId): string {
  return PLANET_LABEL[locale][planet];
}

export function signPath(locale: Locale, id: SignId): string {
  return `/${locale}/${CLUSTER_SEGMENT.sign[locale]}/${signSlug(locale, id)}`;
}

export function risingPath(locale: Locale, id: SignId): string {
  return `/${locale}/${CLUSTER_SEGMENT.rising[locale]}/${signSlug(locale, id)}`;
}

export function pairKey(a: SignId, b: SignId): string {
  const left = SIGNS[a].index <= SIGNS[b].index ? a : b;
  const right = left === a ? b : a;
  return `${left}-${right}`;
}

export function pairIds(key: string): [SignId, SignId] | null {
  const ids = SIGN_IDS.filter((id) => key === id || key.startsWith(`${id}-`));
  if (ids.length === 1 && key === `${ids[0]}-${ids[0]}`) return [ids[0], ids[0]];
  const match = SIGN_IDS.flatMap((left) =>
    SIGN_IDS.filter((right) => SIGNS[left].index <= SIGNS[right].index && `${left}-${right}` === key).map((right) => [left, right] as [SignId, SignId]),
  );
  return match[0] ?? null;
}

export function pairList(): Array<[SignId, SignId]> {
  const pairs: Array<[SignId, SignId]> = [];
  for (let i = 0; i < SIGN_IDS.length; i += 1) {
    for (let j = i; j < SIGN_IDS.length; j += 1) pairs.push([SIGN_IDS[i], SIGN_IDS[j]]);
  }
  return pairs;
}

export function compatSlug(locale: Locale, a: SignId, b: SignId): string {
  const [left, right] = pairIds(pairKey(a, b))!;
  return `${signSlug(locale, left)}-${signSlug(locale, right)}`;
}

export function compatPath(locale: Locale, a: SignId, b: SignId): string {
  return `/${locale}/${CLUSTER_SEGMENT.compat[locale]}/${compatSlug(locale, a, b)}`;
}

export function pairBySlug(locale: Locale, slug: string): [SignId, SignId] | null {
  for (const [a, b] of pairList()) {
    if (compatSlug(locale, a, b) === slug) return [a, b];
  }
  return null;
}

export function weekPath(locale: Locale): string {
  return `/${locale}/${CLUSTER_SEGMENT.week[locale]}`;
}

export function signAlternates(id: SignId): Record<string, string> {
  return hreflangAlternates((locale) => signPath(locale, id));
}

export function risingAlternates(id: SignId): Record<string, string> {
  return hreflangAlternates((locale) => risingPath(locale, id));
}

export function compatAlternates(a: SignId, b: SignId): Record<string, string> {
  return hreflangAlternates((locale) => compatPath(locale, a, b));
}

export function weekAlternates(): Record<string, string> {
  return hreflangAlternates(weekPath);
}

export function clusterLocales(kind: ClusterKind, segment: string): Locale[] {
  return LOCALES.filter((locale) => CLUSTER_SEGMENT[kind][locale] === segment);
}
