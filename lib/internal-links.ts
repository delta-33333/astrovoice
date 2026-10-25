import { aboutPath } from './about.ts';
import { HUB_PATHS } from './alternatives.ts';
import { AVIS_PATH } from './avis-callastral.ts';
import { ascendantPath } from './ascendant-tool.ts';
import { getCopy } from './ascendant-copy.ts';
import { GEO_PATHS } from './geo-pages.ts';
import { factsPath } from './facts.ts';
import { legalNoticePath } from './legal-notice.ts';
import { privacyPath } from './privacy-copy.ts';
import { hubPath, localeHomePath, SPECIALTY_IDS, type Locale, type SpecialtyId } from './seo.ts';
import { VIDEOS_PATH } from './videos.ts';
import {
  SIGN_IDS,
  SIGNS,
  compatPath,
  risingPath,
  signName,
  signPath,
  signSlug,
  weekPath,
  type SignId,
} from './zodiac/signs.ts';

export interface InlinePart {
  text: string;
  href?: string;
}

export interface TextLink {
  href: string;
  label: string;
}

export type ClusterSpec =
  | { kind: 'sign' | 'rising'; locale: Locale; id: SignId }
  | { kind: 'compat'; locale: Locale; a: SignId; b: SignId };

function link(href: string, label: string): InlinePart {
  return { text: label, href };
}

function orderPair(a: SignId, b: SignId): [SignId, SignId] {
  return SIGNS[a].index <= SIGNS[b].index ? [a, b] : [b, a];
}

function nextSign(id: SignId): SignId {
  return SIGN_IDS[(SIGN_IDS.indexOf(id) + 1) % SIGN_IDS.length];
}

function signKeyword(locale: Locale, name: string): string {
  return {
    fr: `signe ${name}`,
    en: `${name} zodiac sign`,
    es: `signo ${name}`,
    de: `Sternzeichen ${name}`,
    it: `segno zodiacale ${name}`,
  }[locale];
}

function risingKeyword(locale: Locale, name: string): string {
  return {
    fr: `ascendant ${name}`,
    en: `${name} rising sign`,
    es: `ascendente ${name}`,
    de: `Aszendent ${name}`,
    it: `ascendente ${name}`,
  }[locale];
}

function weekExact(locale: Locale): string {
  return {
    fr: 'horoscope de la semaine',
    en: 'weekly horoscope',
    es: 'horóscopo semanal',
    de: 'Wochenhoroskop',
    it: 'oroscopo settimanale',
  }[locale];
}

function weekNear(locale: Locale, name: string): string {
  return {
    fr: `horoscope de la semaine pour ${name}`,
    en: `weekly horoscope for ${name}`,
    es: `horóscopo semanal de ${name}`,
    de: `Wochenhoroskop für ${name}`,
    it: `oroscopo settimanale di ${name}`,
  }[locale];
}

function weekOther(locale: Locale): string {
  return {
    fr: 'horoscope hebdomadaire',
    en: 'this week’s horoscope',
    es: 'horóscopo de la semana',
    de: 'Horoskop der Woche',
    it: 'oroscopo della settimana',
  }[locale];
}

function calcLabel(locale: Locale, slot: 'sign' | 'rising' | 'compat' | 'week'): string {
  const table: Record<Locale, Record<typeof slot, string>> = {
    fr: {
      sign: 'calcul d’ascendant gratuit',
      rising: 'calcul gratuit de l’ascendant',
      compat: 'outil d’ascendant gratuit',
      week: 'calcul d’ascendant gratuit',
    },
    en: {
      sign: 'free rising sign calculator',
      rising: 'rising sign calculator',
      compat: 'calculate your rising sign',
      week: 'free rising sign calculator',
    },
    es: {
      sign: 'calcular el ascendente gratis',
      rising: 'calculadora de ascendente',
      compat: 'ascendente gratis',
      week: 'calcular el ascendente gratis',
    },
    de: {
      sign: 'Aszendent kostenlos berechnen',
      rising: 'Aszendent berechnen',
      compat: 'kostenloser Aszendent',
      week: 'Aszendent kostenlos berechnen',
    },
    it: {
      sign: 'calcolo ascendente gratuito',
      rising: 'calcolare l’ascendente',
      compat: 'ascendente gratis',
      week: 'calcolo ascendente gratuito',
    },
  };
  return table[locale][slot];
}

/** Ancre exacte ou proche, variée selon la paire. */
export function compatAnchor(locale: Locale, a: SignId, b: SignId): string {
  const [left, right] = orderPair(a, b);
  const A = signName(locale, left);
  const B = signName(locale, right);
  const variant = (SIGNS[left].index + SIGNS[right].index) % 3;
  const table: Record<Locale, [string, string, string]> = {
    fr: [`compatibilité ${A} et ${B}`, `${A} et ${B} en compatibilité`, `entente entre ${A} et ${B}`],
    en: [`${A} and ${B} compatibility`, `${A} and ${B} compatibility match`, `how ${A} and ${B} fit`],
    es: [`compatibilidad ${A} y ${B}`, `${A} y ${B} en compatibilidad`, `afinidad entre ${A} y ${B}`],
    de: [`Kompatibilität ${A} und ${B}`, `${A} und ${B} in der Kompatibilität`, `Passung von ${A} und ${B}`],
    it: [`compatibilità ${A} e ${B}`, `${A} e ${B} in compatibilità`, `intesa tra ${A} e ${B}`],
  };
  return table[locale][variant];
}

function compatLinks(locale: Locale, id: SignId, includeSelf: boolean): InlinePart[] {
  const others = SIGN_IDS.filter((item) => item !== id);
  const ids = includeSelf ? [...others, id] : others;
  return ids.map((other) => link(compatPath(locale, id, other), compatAnchor(locale, id, other)));
}

function andWord(locale: Locale): string {
  return { fr: ' et ', en: ' and ', es: ' y ', de: ' und ', it: ' e ' }[locale];
}

function interleave(locale: Locale, items: InlinePart[]): InlinePart[] {
  const parts: InlinePart[] = [];
  items.forEach((item, index) => {
    if (index > 0) parts.push({ text: index === items.length - 1 ? andWord(locale) : ', ' });
    parts.push(item);
  });
  return parts;
}

function avisPart(): InlinePart {
  return link(AVIS_PATH, 'avis Callastral');
}

export function contextualParagraphs(spec: ClusterSpec): InlinePart[][] {
  if (spec.kind === 'compat') {
    const { locale } = spec;
    const [left, right] = orderPair(spec.a, spec.b);
    const nameA = signName(locale, left);
    const nameB = signName(locale, right);
    const same = left === right;
    const intro = {
      fr: same
        ? `La compatibilité ${nameA} et ${nameA} renvoie au `
        : `La compatibilité ${nameA} et ${nameB} renvoie au `,
      en: same
        ? `The ${nameA} and ${nameA} compatibility page points to the `
        : `The ${nameA} and ${nameB} compatibility page points to the `,
      es: same
        ? `La compatibilidad ${nameA} y ${nameA} lleva al `
        : `La compatibilidad ${nameA} y ${nameB} lleva al `,
      de: same
        ? `Die Kompatibilität ${nameA} und ${nameA} verweist auf `
        : `Die Kompatibilität ${nameA} und ${nameB} verweist auf `,
      it: same
        ? `La compatibilità ${nameA} e ${nameA} rimanda al `
        : `La compatibilità ${nameA} e ${nameB} rimanda al `,
    }[locale];
    const items: InlinePart[] = [
      link(signPath(locale, left), signKeyword(locale, nameA)),
      link(risingPath(locale, left), risingKeyword(locale, nameA)),
    ];
    if (!same) {
      items.push(
        link(signPath(locale, right), signKeyword(locale, nameB)),
        link(risingPath(locale, right), risingKeyword(locale, nameB)),
      );
    }
    items.push(link(weekPath(locale), weekOther(locale)));
    items.push(link(ascendantPath(locale), calcLabel(locale, 'compat')));
    if (same) {
      const next = nextSign(left);
      items.push(link(compatPath(locale, left, next), compatAnchor(locale, left, next)));
    }
    return [[{ text: intro }, ...interleave(locale, items), { text: '.' }]];
  }

  const { locale, id, kind } = spec;
  const name = signName(locale, id);
  const pairs = compatLinks(locale, id, true);
  if (kind === 'sign') {
    const head: InlinePart[] = [
      { text: { fr: `Depuis le signe ${name}, la lecture continue sur l’`, en: `From the ${name} zodiac sign, the reading continues on the `, es: `Desde el signo ${name}, la lectura sigue con el `, de: `Vom Sternzeichen ${name} geht die Lesart weiter zum `, it: `Dal segno zodiacale ${name} la lettura prosegue con l’` }[locale] },
      link(risingPath(locale, id), risingKeyword(locale, name)),
      { text: { fr: ', l’', en: ', the ', es: ', el ', de: ', das ', it: ', l’' }[locale] },
      link(`${weekPath(locale)}#${signSlug(locale, id)}`, weekExact(locale)),
      { text: { fr: ' et le ', en: ' and the ', es: ' y ', de: ' und ', it: ' e il ' }[locale] },
      link(ascendantPath(locale), calcLabel(locale, 'sign')),
    ];
    if (locale === 'fr') head.push({ text: ' et la page ' }, avisPart());
    const listIntro = {
      fr: `Les combinaisons du ${name} avec les autres signes, et avec lui-même, sont sur `,
      en: `${name} with the other signs, and with itself, is covered on `,
      es: `Las combinaciones de ${name} con los otros signos, y consigo mismo, están en `,
      de: `Die Kombinationen von ${name} mit den anderen Zeichen, und mit sich selbst, stehen auf `,
      it: `Le combinazioni di ${name} con gli altri segni, e con se stesso, sono su `,
    }[locale];
    return [[...head, { text: '.' }], [{ text: listIntro }, ...interleave(locale, pairs), { text: '.' }]];
  }

  const head: InlinePart[] = [
    { text: { fr: `Pour l’ascendant ${name}, la page relie le `, en: `For ${name} rising, the page links the `, es: `Para el ascendente ${name}, la página enlaza el `, de: `Für Aszendent ${name} verbindet die Seite das `, it: `Per l’ascendente ${name}, la pagina collega il ` }[locale] },
    link(signPath(locale, id), signKeyword(locale, name)),
    { text: { fr: ', l’', en: ', the ', es: ', el ', de: ', das ', it: ', l’' }[locale] },
    link(`${weekPath(locale)}#${signSlug(locale, id)}`, weekNear(locale, name)),
    { text: { fr: ' et le ', en: ' and the ', es: ' y ', de: ' und ', it: ' e il ' }[locale] },
    link(ascendantPath(locale), calcLabel(locale, 'rising')),
  ];
  if (locale === 'fr') head.push({ text: ', ainsi que la page ' }, avisPart());
  const listIntro = {
    fr: `Les onze autres signes et le duo ${name}-${name} ont leur page : `,
    en: `The other eleven signs and the ${name}-${name} pair each have a page: `,
    es: `Los otros once signos y el dúo ${name}-${name} tienen su página: `,
    de: `Die anderen elf Zeichen und das Paar ${name}-${name} haben eine Seite: `,
    it: `Gli altri undici segni e il duo ${name}-${name} hanno una pagina: `,
  }[locale];
  return [[...head, { text: '.' }], [{ text: listIntro }, ...interleave(locale, pairs), { text: '.' }]];
}

export function clusterChips(spec: ClusterSpec): TextLink[] {
  const paragraphs = contextualParagraphs(spec);
  const seen = new Set<string>();
  const links: TextLink[] = [];
  for (const paragraph of paragraphs) {
    for (const part of paragraph) {
      if (!part.href || seen.has(part.href)) continue;
      seen.add(part.href);
      links.push({ href: part.href, label: part.text });
    }
  }
  return links;
}

export function inlineHrefs(paragraphs: InlinePart[][]): TextLink[] {
  const links: TextLink[] = [];
  for (const paragraph of paragraphs) {
    for (const part of paragraph) {
      if (part.href) links.push({ href: part.href, label: part.text });
    }
  }
  return links;
}

export function horoscopeLeadParts(locale: Locale): InlinePart[] {
  const calc = link(ascendantPath(locale), calcLabel(locale, 'week'));
  if (locale === 'fr') {
    return [
      { text: 'Le ciel décrit ci-dessous se vérifie avec le ' },
      calc,
      { text: ', et le service est présenté sur la page ' },
      avisPart(),
      { text: '.' },
    ];
  }
  const before = {
    en: 'The sky described below can be checked with the ',
    es: 'El cielo descrito abajo se puede comprobar con ',
    de: 'Der Himmel unten lässt sich prüfen mit ',
    it: 'Il cielo descritto sotto si può verificare con il ',
  }[locale];
  return [{ text: before }, calc, { text: '.' }];
}

export function horoscopeSectionParts(locale: Locale, id: SignId): InlinePart[] {
  const name = signName(locale, id);
  const before = {
    fr: `Pour ${name} cette semaine, voir le `,
    en: `For ${name} this week, see the `,
    es: `Para ${name} esta semana, ver el `,
    de: `Für ${name} diese Woche, siehe `,
    it: `Per ${name} questa settimana, vedi il `,
  }[locale];
  const mid = { fr: ' et l’', en: ' and the ', es: ' y el ', de: ' und ', it: ' e l’' }[locale];
  return [
    { text: before },
    link(signPath(locale, id), signKeyword(locale, name)),
    { text: mid },
    link(risingPath(locale, id), risingKeyword(locale, name)),
    { text: '.' },
  ];
}

export function horoscopeTextLinks(locale: Locale): TextLink[] {
  return inlineHrefs([
    horoscopeLeadParts(locale),
    ...SIGN_IDS.map((id) => horoscopeSectionParts(locale, id)),
  ]);
}

export function risingResultLinks(locale: Locale): Record<string, TextLink> {
  const label = (name: string) => ({
    fr: `Lire l’ascendant ${name}`,
    en: `Read the ${name} rising sign`,
    es: `Leer el ascendente ${name}`,
    de: `Aszendent ${name} lesen`,
    it: `Leggere l’ascendente ${name}`,
  }[locale]);
  return Object.fromEntries(
    SIGN_IDS.map((id) => [SIGNS[id].french, { href: risingPath(locale, id), label: label(signName(locale, id)) }]),
  );
}

const HUB_LABEL: Record<Locale, Record<SpecialtyId, string>> = {
  fr: {
    amour: 'Astrologie amour',
    carrière: 'Astrologie carrière',
    spiritualité: 'Astrologie spiritualité',
    'transition de vie': 'Astrologie transition',
    compatibilité: 'Compatibilité',
    argent: 'Astrologie argent',
    famille: 'Astrologie famille',
  },
  en: {
    amour: 'Love astrology',
    carrière: 'Career astrology',
    spiritualité: 'Spirituality',
    'transition de vie': 'Life transition',
    compatibilité: 'Compatibility',
    argent: 'Money astrology',
    famille: 'Family astrology',
  },
  es: {
    amour: 'Astrología amor',
    carrière: 'Astrología carrera',
    spiritualité: 'Espiritualidad',
    'transition de vie': 'Transición de vida',
    compatibilité: 'Compatibilidad',
    argent: 'Astrología dinero',
    famille: 'Astrología familia',
  },
  de: {
    amour: 'Astrologie Liebe',
    carrière: 'Astrologie Karriere',
    spiritualité: 'Spiritualität',
    'transition de vie': 'Lebensübergang',
    compatibilité: 'Kompatibilität',
    argent: 'Astrologie Geld',
    famille: 'Astrologie Familie',
  },
  it: {
    amour: 'Astrologia amore',
    carrière: 'Astrologia carriera',
    spiritualité: 'Spiritualità',
    'transition de vie': 'Transizione di vita',
    compatibilité: 'Compatibilità',
    argent: 'Astrologia denaro',
    famille: 'Astrologia famiglia',
  },
};

export function calculatorHubLinks(locale: Locale): TextLink[] {
  return SPECIALTY_IDS.map((id) => ({ href: hubPath(locale, id), label: HUB_LABEL[locale][id] }));
}

const FOOTER: Record<Locale, { terms: string; sales: string; privacy: string; videos: string; about: string; prices: string; compare: string; alternatives: string }> = {
  fr: { terms: 'CGU', sales: 'Conditions générales', privacy: 'Confidentialité', videos: 'Vidéos', about: 'À propos', prices: 'Tarifs 2026', compare: 'Comparatif 2026', alternatives: 'Alternatives' },
  en: { terms: 'Terms of use', sales: 'Terms of sale', privacy: 'Privacy', videos: 'Videos (French)', about: 'About', prices: 'Prices 2026', compare: 'Comparison 2026', alternatives: 'Alternatives' },
  es: { terms: 'Condiciones de uso', sales: 'Condiciones de venta', privacy: 'Privacidad', videos: 'Vídeos (francés)', about: 'Acerca de', prices: 'Tarifas', compare: 'Comparativa', alternatives: 'Alternativas' },
  de: { terms: 'Nutzungsbedingungen', sales: 'Verkaufsbedingungen', privacy: 'Datenschutz', videos: 'Videos (Französisch)', about: 'Über uns', prices: 'Preise', compare: 'Vergleich', alternatives: 'Alternativen' },
  it: { terms: 'Condizioni d’uso', sales: 'Condizioni di vendita', privacy: 'Privacy', videos: 'Video (francese)', about: 'Chi siamo', prices: 'Tariffe', compare: 'Confronto', alternatives: 'Alternative' },
};

export function footerLinks(locale: Locale): TextLink[] {
  const copy = FOOTER[locale];
  const links: TextLink[] = [
    { href: localeHomePath(locale), label: locale === 'fr' ? 'Accueil' : 'Home' },
    { href: '/cgu', label: copy.terms },
    { href: '/terms', label: copy.sales },
    { href: privacyPath(locale), label: copy.privacy },
    { href: legalNoticePath(locale), label: locale === 'fr' ? 'Mentions légales' : locale === 'de' ? 'Impressum' : locale === 'es' ? 'Aviso legal' : locale === 'it' ? 'Note legali' : 'Legal notice' },
    { href: factsPath(locale), label: locale === 'fr' ? 'Faits et chiffres' : locale === 'de' ? 'Fakten' : locale === 'es' ? 'Datos' : locale === 'it' ? 'Fatti' : 'Facts' },
    { href: ascendantPath(locale), label: getCopy(locale).h1 },
    ...(locale === 'fr' ? [{ href: '/fr/horoscope-2027', label: 'Horoscope 2027' }] : []),
    { href: '/faq', label: 'FAQ' },
    { href: VIDEOS_PATH, label: copy.videos },
    { href: aboutPath(locale), label: copy.about },
  ];
  if (locale === 'fr' || locale === 'en') {
    links.push(
      { href: GEO_PATHS.prices[locale], label: copy.prices },
      { href: GEO_PATHS.compare[locale], label: copy.compare },
      { href: HUB_PATHS[locale], label: copy.alternatives },
    );
  }
  return links;
}

export function stripHash(href: string): string {
  return href.split('#')[0] || href;
}
