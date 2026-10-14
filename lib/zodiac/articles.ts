import type { Locale } from '../seo.ts';
import { ascendantPath } from '../ascendant-tool.ts';
import { dossier } from './dossiers.ts';
import { pairLead } from './leads.ts';
import {
  BOOK_DISCOVERY_PATH,
  LOCALES,
  SIGN_IDS,
  SIGNS,
  compatAlternates,
  compatPath,
  elementLabel,
  modalityLabel,
  pairKey,
  pairList,
  planetLabel,
  risingAlternates,
  risingPath,
  signAlternates,
  signArticle,
  signName,
  signPath,
  weekAlternates,
  weekPath,
  type SignId,
} from './signs.ts';

export interface Fact {
  label: string;
  value: string;
}

export interface TextLink {
  href: string;
  label: string;
}

export interface Section {
  h2: string;
  paragraphs: string[];
  facts?: Fact[];
  links?: TextLink[];
}

export interface ArticleModel {
  kind: 'sign' | 'rising' | 'compat';
  locale: Locale;
  path: string;
  title: string;
  description: string;
  h1: string;
  keywords: string[];
  alternates: Record<string, string>;
  sections: Section[];
  prose: string;
}

const H2 = {
  signFacts: { fr: 'Élément, mode et planète', en: 'Element, modality and planet', es: 'Elemento, modalidad y planeta', de: 'Element, Modus und Planet', it: 'Elemento, modalità e pianeta' },
  signLife: { fr: 'Amour et travail', en: 'Love and work', es: 'Amor y trabajo', de: 'Liebe und Arbeit', it: 'Amore e lavoro' },
  signLinks: { fr: 'Compatibilités', en: 'Compatibility', es: 'Compatibilidad', de: 'Kompatibilität', it: 'Compatibilità' },
  risingDoor: { fr: 'Ce que l’ascendant décrit', en: 'What the rising sign describes', es: 'Lo que describe el ascendente', de: 'Was der Aszendent beschreibt', it: 'Cosa descrive l’ascendente' },
  risingFacts: { fr: 'Signe, élément et planète', en: 'Sign, element and planet', es: 'Signo, elemento y planeta', de: 'Zeichen, Element und Planet', it: 'Segno, elemento e pianeta' },
  risingLinks: { fr: 'Pages liées', en: 'Related pages', es: 'Páginas relacionadas', de: 'Verwandte Seiten', it: 'Pagine collegate' },
  pairTemper: { fr: 'Les deux tempéraments', en: 'The two temperaments', es: 'Los dos temperamentos', de: 'Die zwei Temperamente', it: 'I due temperamenti' },
  pairFacts: { fr: 'Élément, mode et planètes', en: 'Element, modality and planets', es: 'Elemento, modalidad y planetas', de: 'Element, Modus und Planeten', it: 'Elemento, modalità e pianeti' },
  pairLinks: { fr: 'Signes et ascendants', en: 'Signs and rising signs', es: 'Signos y ascendentes', de: 'Zeichen und Aszendenten', it: 'Segni e ascendenti' },
} as const;

const FACT_LABEL = {
  element: { fr: 'Élément', en: 'Element', es: 'Elemento', de: 'Element', it: 'Elemento' },
  modality: { fr: 'Mode', en: 'Modality', es: 'Modalidad', de: 'Modus', it: 'Modalità' },
  ruler: { fr: 'Planète', en: 'Planet', es: 'Planeta', de: 'Planet', it: 'Pianeta' },
  modern: { fr: 'Maîtrise moderne', en: 'Modern rulership', es: 'Regencia moderna', de: 'Moderne Würde', it: 'Dignità moderna' },
} as const;

const CTA = {
  calc: {
    fr: 'Calculer mon ascendant',
    en: 'Calculate my rising sign',
    es: 'Calcular mi ascendente',
    de: 'Meinen Aszendenten berechnen',
    it: 'Calcolare il mio ascendente',
  },
  book: {
    fr: 'Offre Découverte',
    en: 'Discovery offer',
    es: 'Oferta Descubrimiento',
    de: 'Angebot Entdeckung',
    it: 'Offerta Scoperta',
  },
} as const;

const KEYWORD = {
  sign: {
    fr: (name: string) => `signe ${name}`,
    en: (name: string) => `${name} zodiac sign`,
    es: (name: string) => `signo ${name}`,
    de: (name: string) => `Sternzeichen ${name}`,
    it: (name: string) => `segno zodiacale ${name}`,
  },
  rising: {
    fr: (name: string) => `ascendant ${name}`,
    en: (name: string) => `${name} rising sign`,
    es: (name: string) => `ascendente ${name}`,
    de: (name: string) => `Aszendent ${name}`,
    it: (name: string) => `ascendente ${name}`,
  },
  compat: {
    fr: (a: string, b: string) => `compatibilité ${a} et ${b}`,
    en: (a: string, b: string) => `${a} and ${b} compatibility`,
    es: (a: string, b: string) => `compatibilidad ${a} y ${b}`,
    de: (a: string, b: string) => `Kompatibilität ${a} und ${b}`,
    it: (a: string, b: string) => `compatibilità ${a} e ${b}`,
  },
} as const;

function fitMeta(locale: Locale, value: string): string {
  const extra = {
    fr: 'Lecture éditée par Callastral.',
    en: 'Page edited by Callastral.',
    es: 'Página editada por Callastral.',
    de: 'Seite von Callastral bearbeitet.',
    it: 'Pagina edita da Callastral.',
  }[locale];
  const text = value.length < 70 ? `${value} ${extra}` : value;
  if (text.length <= 160) return text;
  return `${text.slice(0, 159).trimEnd()}…`;
}

function factsOf(locale: Locale, id: SignId): Fact[] {
  const sign = SIGNS[id];
  const rows: Fact[] = [
    { label: FACT_LABEL.element[locale], value: elementLabel(locale, sign.element) },
    { label: FACT_LABEL.modality[locale], value: modalityLabel(locale, sign.modality) },
    { label: FACT_LABEL.ruler[locale], value: planetLabel(locale, sign.traditional) },
  ];
  if (sign.modern !== sign.traditional) {
    rows.push({ label: FACT_LABEL.modern[locale], value: planetLabel(locale, sign.modern) });
  }
  return rows;
}

function elementOf(id: SignId) {
  return SIGNS[id].element;
}
function modalityOf(id: SignId) {
  return SIGNS[id].modality;
}
function rulerOf(id: SignId) {
  return SIGNS[id].traditional;
}
function modernOf(id: SignId) {
  return SIGNS[id].modern;
}

export function calculatorHref(locale: Locale): string {
  return ascendantPath(locale);
}

export function discoveryHref(): string {
  return BOOK_DISCOVERY_PATH;
}

export function ctaLinks(locale: Locale): { calc: TextLink; book: TextLink } {
  return {
    calc: { href: calculatorHref(locale), label: CTA.calc[locale] },
    book: { href: discoveryHref(), label: CTA.book[locale] },
  };
}

function proseOf(sections: Section[]): string {
  return sections.flatMap((section) => section.paragraphs).join(' ');
}

export function signArticleModel(locale: Locale, id: SignId): ArticleModel {
  const copy = dossier(locale, id);
  const name = signName(locale, id);
  const keyword = KEYWORD.sign[locale](name);
  const element = elementLabel(locale, elementOf(id));
  const modality = modalityLabel(locale, modalityOf(id));
  const ruler = planetLabel(locale, rulerOf(id));
  const title = {
    fr: `Signe ${name} : ${element} ${modality} et ${ruler}`,
    en: `${name} zodiac sign: ${modality} ${element}, ${ruler}`,
    es: `Signo ${name}: ${element} ${modality} y ${ruler}`,
    de: `Sternzeichen ${name}: ${modality} ${element}, ${ruler}`,
    it: `Segno zodiacale ${name}: ${element} ${modality}, ${ruler}`,
  }[locale];
  const description = fitMeta(locale, {
    fr: `Signe ${name}, ${element} ${modality} gouverné par ${ruler}. Caractère, amour, travail et liens avec les autres signes.`,
    en: `${name} zodiac sign, ${modality} ${element} ruled by ${ruler}. Character, love, work and links with the other signs.`,
    es: `Signo ${name}, ${element} ${modality} regido por ${ruler}. Carácter, amor, trabajo y vínculos con los otros signos.`,
    de: `Sternzeichen ${name}, ${modality} ${element}, regiert von ${ruler}. Charakter, Liebe, Arbeit und Bezüge zu den anderen Zeichen.`,
    it: `Segno zodiacale ${name}, ${element} ${modality} retto da ${ruler}. Carattere, amore, lavoro e legami con gli altri segni.`,
  }[locale]);
  const others = SIGN_IDS.filter((item) => item !== id);
  const sections: Section[] = [
    { h2: H2.signFacts[locale], paragraphs: [...copy.sign], facts: factsOf(locale, id) },
    { h2: H2.signLife[locale], paragraphs: [copy.love, copy.work] },
    {
      h2: H2.signLinks[locale],
      paragraphs: [],
      links: [
        { href: risingPath(locale, id), label: KEYWORD.rising[locale](name) },
        { href: `${weekPath(locale)}#${signSlugOf(locale, id)}`, label: weekLink(locale) },
        ...others.map((other) => ({
          href: compatPath(locale, id, other),
          label: compatLink(locale, name, signName(locale, other)),
        })),
        { href: compatPath(locale, id, id), label: compatLink(locale, name, name) },
      ],
    },
  ];
  return {
    kind: 'sign',
    locale,
    path: signPath(locale, id),
    title,
    description,
    h1: keyword[0].toUpperCase() + keyword.slice(1),
    keywords: [keyword, name, 'Callastral'],
    alternates: signAlternates(id),
    sections,
    prose: proseOf(sections),
  };
}

function signSlugOf(locale: Locale, id: SignId): string {
  return SIGNS[id].slugs[locale];
}

function weekLink(locale: Locale): string {
  return {
    fr: 'Horoscope de la semaine',
    en: 'Weekly horoscope',
    es: 'Horóscopo semanal',
    de: 'Wochenhoroskop',
    it: 'Oroscopo settimanale',
  }[locale];
}

function compatLink(locale: Locale, a: string, b: string): string {
  return {
    fr: `Compatibilité ${a} et ${b}`,
    en: `${a} and ${b}`,
    es: `${a} y ${b}`,
    de: `${a} und ${b}`,
    it: `${a} e ${b}`,
  }[locale];
}

export function risingArticleModel(locale: Locale, id: SignId): ArticleModel {
  const copy = dossier(locale, id);
  const name = signName(locale, id);
  const keyword = KEYWORD.rising[locale](name);
  const element = elementLabel(locale, elementOf(id));
  const modality = modalityLabel(locale, modalityOf(id));
  const ruler = planetLabel(locale, rulerOf(id));
  const title = {
    fr: `Ascendant ${name} : lever ${element}, ${ruler}`,
    en: `${name} rising sign: ${element} on the ascendant`,
    es: `Ascendente ${name}: ${element} en el ascendente`,
    de: `Aszendent ${name}: ${element} am Aszendenten`,
    it: `Ascendente ${name}: ${element} all’ascendente`,
  }[locale];
  const description = fitMeta(locale, {
    fr: `Ascendant ${name} : ${element} ${modality}, planète ${ruler}. Ce que le lever change, et pourquoi l’heure exacte compte.`,
    en: `${name} rising sign: ${modality} ${element}, planet ${ruler}. What the ascendant changes, and why the exact time matters.`,
    es: `Ascendente ${name}: ${element} ${modality}, planeta ${ruler}. Qué cambia el ascendente y por qué importa la hora exacta.`,
    de: `Aszendent ${name}: ${modality} ${element}, Planet ${ruler}. Was der Aszendent ändert und warum die genaue Stunde zählt.`,
    it: `Ascendente ${name}: ${element} ${modality}, pianeta ${ruler}. Cosa cambia l’ascendente e perché conta l’ora esatta.`,
  }[locale]);
  const door = {
    fr: `Pour ${name}, l’ascendant place un ${element} ${modality} gouverné par ${ruler} sur la maison I : ce n’est pas une prédiction, seulement la porte du thème, lisible avec l’heure exacte.`,
    en: `For ${name}, rising places ${modality} ${element} ruled by ${ruler} on the first house: not a prediction, only the chart’s door, and it can be read only with the exact birth time.`,
    es: `Para ${name}, el ascendente coloca un ${element} ${modality} regido por ${ruler} en la casa I: no es una predicción, solo la puerta de la carta, legible con la hora exacta.`,
    de: `Für ${name} setzt der Aszendent ${modality} ${element} unter ${ruler} auf das erste Haus: keine Vorhersage, nur die Tür des Horoskops, lesbar nur mit der genauen Stunde.`,
    it: `Per ${name}, l’ascendente mette un ${element} ${modality} retto da ${ruler} sulla casa I: non è una previsione, solo la porta del tema, leggibile con l’ora esatta.`,
  }[locale];
  const sections: Section[] = [
    { h2: H2.risingDoor[locale], paragraphs: [...copy.rising, door] },
    { h2: H2.risingFacts[locale], paragraphs: [], facts: factsOf(locale, id) },
    {
      h2: H2.risingLinks[locale],
      paragraphs: [],
      links: [
        { href: signPath(locale, id), label: KEYWORD.sign[locale](name) },
        { href: compatPath(locale, id, id), label: compatLink(locale, name, name) },
        { href: `${weekPath(locale)}#${signSlugOf(locale, id)}`, label: weekLink(locale) },
      ],
    },
  ];
  return {
    kind: 'rising',
    locale,
    path: risingPath(locale, id),
    title,
    description,
    h1: keyword[0].toUpperCase() + keyword.slice(1),
    keywords: [keyword, name, 'Callastral'],
    alternates: risingAlternates(id),
    sections,
    prose: proseOf(sections),
  };
}

function factualLines(locale: Locale, a: SignId, b: SignId): string[] {
  const left = dossier(locale, a);
  const right = dossier(locale, b);
  const A = signArticle(locale, a);
  const B = signArticle(locale, b);
  const variant = (SIGNS[a].index * 5 + SIGNS[b].index) % 3;
  const modern = (id: SignId) =>
    modernOf(id) === rulerOf(id) ? '' : {
      fr: `, avec ${planetLabel(locale, modernOf(id))} en maîtrise moderne`,
      en: `, with ${planetLabel(locale, modernOf(id))} as modern ruler`,
      es: `, con ${planetLabel(locale, modernOf(id))} en regencia moderna`,
      de: `, mit ${planetLabel(locale, modernOf(id))} als moderner Würde`,
      it: `, con ${planetLabel(locale, modernOf(id))} in dignità moderna`,
    }[locale];
  const elementLine = a === b
    ? {
        fr: `${A}, pris deux fois, reste ${elementLabel(locale, elementOf(a))} ${modalityLabel(locale, modalityOf(a))} sous ${planetLabel(locale, rulerOf(a))}${modern(a)}, et le duo ne fait que redoubler ce rythme.`,
        en: `${A}, taken twice, stays ${modalityLabel(locale, modalityOf(a))} ${elementLabel(locale, elementOf(a))} under ${planetLabel(locale, rulerOf(a))}${modern(a)}, and the pair only doubles that pace.`,
        es: `${A}, tomado dos veces, sigue siendo ${elementLabel(locale, elementOf(a))} ${modalityLabel(locale, modalityOf(a))} bajo ${planetLabel(locale, rulerOf(a))}${modern(a)}, y el dúo solo redobla ese ritmo.`,
        de: `${A}, zweimal genommen, bleibt ${modalityLabel(locale, modalityOf(a))} ${elementLabel(locale, elementOf(a))} unter ${planetLabel(locale, rulerOf(a))}${modern(a)}, und das Paar verdoppelt nur dieses Tempo.`,
        it: `${A}, preso due volte, resta ${elementLabel(locale, elementOf(a))} ${modalityLabel(locale, modalityOf(a))} sotto ${planetLabel(locale, rulerOf(a))}${modern(a)}, e il duo non fa che raddoppiare quel ritmo.`,
      }[locale]
    : {
        fr: `${A}, ${elementLabel(locale, elementOf(a))} ${modalityLabel(locale, modalityOf(a))} sous ${planetLabel(locale, rulerOf(a))}${modern(a)}, rencontre ${B}, ${elementLabel(locale, elementOf(b))} ${modalityLabel(locale, modalityOf(b))} sous ${planetLabel(locale, rulerOf(b))}${modern(b)}.`,
        en: `${A}, ${modalityLabel(locale, modalityOf(a))} ${elementLabel(locale, elementOf(a))} under ${planetLabel(locale, rulerOf(a))}${modern(a)}, meets ${B}, ${modalityLabel(locale, modalityOf(b))} ${elementLabel(locale, elementOf(b))} under ${planetLabel(locale, rulerOf(b))}${modern(b)}.`,
        es: `${A}, ${elementLabel(locale, elementOf(a))} ${modalityLabel(locale, modalityOf(a))} bajo ${planetLabel(locale, rulerOf(a))}${modern(a)}, se encuentra con ${B}, ${elementLabel(locale, elementOf(b))} ${modalityLabel(locale, modalityOf(b))} bajo ${planetLabel(locale, rulerOf(b))}${modern(b)}.`,
        de: `${A}, ${modalityLabel(locale, modalityOf(a))} ${elementLabel(locale, elementOf(a))} unter ${planetLabel(locale, rulerOf(a))}${modern(a)}, trifft ${B}, ${modalityLabel(locale, modalityOf(b))} ${elementLabel(locale, elementOf(b))} unter ${planetLabel(locale, rulerOf(b))}${modern(b)}.`,
        it: `${A}, ${elementLabel(locale, elementOf(a))} ${modalityLabel(locale, modalityOf(a))} sotto ${planetLabel(locale, rulerOf(a))}${modern(a)}, incontra ${B}, ${elementLabel(locale, elementOf(b))} ${modalityLabel(locale, modalityOf(b))} sotto ${planetLabel(locale, rulerOf(b))}${modern(b)}.`,
      }[locale];
  const grainLine = {
    fr: variant === 0
      ? `${A} tend à ${left.grain}, là où ${B} demande ${right.tempo}.`
      : variant === 1
        ? `Le frottement vient du rythme : ${A} veut ${left.tempo}, ${B} préfère ${right.grain}.`
        : `En pratique, ${A} avance en cherchant à ${left.grain} ; ${B} ne suit que si l’on respecte ${right.tempo}.`,
    en: variant === 0
      ? `${A} tends to ${left.grain}, where ${B} asks for ${right.tempo}.`
      : variant === 1
        ? `The rub is the pace: ${A} wants ${left.tempo}, while ${B} would rather ${right.grain}.`
        : `In practice, ${A} moves by trying to ${left.grain}; ${B} follows only if ${right.tempo} is respected.`,
    es: variant === 0
      ? `${A} tiende a ${left.grain}, mientras ${B} pide ${right.tempo}.`
      : variant === 1
        ? `El roce está en el ritmo: ${A} quiere ${left.tempo} y ${B} prefiere ${right.grain}.`
        : `En la práctica, ${A} avanza buscando ${left.grain}; ${B} solo sigue si se respeta ${right.tempo}.`,
    de: variant === 0
      ? `${A} neigt dazu, ${left.grain}, während ${B} ${right.tempo} verlangt.`
      : variant === 1
        ? `Die Reibung liegt im Tempo: ${A} will ${left.tempo}, ${B} würde lieber ${right.grain}.`
        : `In der Praxis geht ${A} voran und versucht, ${left.grain}; ${B} folgt nur, wenn ${right.tempo} gilt.`,
    it: variant === 0
      ? `${A} tende a ${left.grain}, mentre ${B} chiede ${right.tempo}.`
      : variant === 1
        ? `L’attrito è nel ritmo: ${A} vuole ${left.tempo}, ${B} preferisce ${right.grain}.`
        : `In pratica, ${A} avanza cercando di ${left.grain}; ${B} segue solo se si rispetta ${right.tempo}.`,
  }[locale];
  return [elementLine.replace(/\s+/g, ' ').trim(), grainLine];
}

export function compatArticleModel(locale: Locale, a: SignId, b: SignId): ArticleModel {
  const [left, right] = SIGNS[a].index <= SIGNS[b].index ? [a, b] : [b, a];
  const nameA = signName(locale, left);
  const nameB = signName(locale, right);
  const keyword = KEYWORD.compat[locale](nameA, nameB);
  const lead = pairLead(pairKey(left, right), locale);
  const title = {
    fr: `Compatibilité ${nameA} et ${nameB}`,
    en: `${nameA} and ${nameB} compatibility`,
    es: `Compatibilidad ${nameA} y ${nameB}`,
    de: `Kompatibilität ${nameA} und ${nameB}`,
    it: `Compatibilità ${nameA} e ${nameB}`,
  }[locale];
  const description = fitMeta(locale, {
    fr: `Compatibilité ${nameA} et ${nameB} : ${elementLabel(locale, elementOf(left))} ${modalityLabel(locale, modalityOf(left))} (${planetLabel(locale, rulerOf(left))}) et ${elementLabel(locale, elementOf(right))} ${modalityLabel(locale, modalityOf(right))} (${planetLabel(locale, rulerOf(right))}).`,
    en: `${nameA} and ${nameB} compatibility: ${modalityLabel(locale, modalityOf(left))} ${elementLabel(locale, elementOf(left))} (${planetLabel(locale, rulerOf(left))}) and ${modalityLabel(locale, modalityOf(right))} ${elementLabel(locale, elementOf(right))} (${planetLabel(locale, rulerOf(right))}).`,
    es: `Compatibilidad ${nameA} y ${nameB}: ${elementLabel(locale, elementOf(left))} ${modalityLabel(locale, modalityOf(left))} (${planetLabel(locale, rulerOf(left))}) y ${elementLabel(locale, elementOf(right))} ${modalityLabel(locale, modalityOf(right))} (${planetLabel(locale, rulerOf(right))}).`,
    de: `Kompatibilität ${nameA} und ${nameB}: ${modalityLabel(locale, modalityOf(left))} ${elementLabel(locale, elementOf(left))} (${planetLabel(locale, rulerOf(left))}) und ${modalityLabel(locale, modalityOf(right))} ${elementLabel(locale, elementOf(right))} (${planetLabel(locale, rulerOf(right))}).`,
    it: `Compatibilità ${nameA} e ${nameB}: ${elementLabel(locale, elementOf(left))} ${modalityLabel(locale, modalityOf(left))} (${planetLabel(locale, rulerOf(left))}) e ${elementLabel(locale, elementOf(right))} ${modalityLabel(locale, modalityOf(right))} (${planetLabel(locale, rulerOf(right))}).`,
  }[locale]);
  const sections: Section[] = [
    { h2: H2.pairTemper[locale], paragraphs: [lead] },
    {
      h2: H2.pairFacts[locale],
      paragraphs: factualLines(locale, left, right),
      facts: [
        ...factsOf(locale, left).map((fact) => ({ ...fact, label: `${nameA} — ${fact.label}` })),
        ...(left === right ? [] : factsOf(locale, right).map((fact) => ({ ...fact, label: `${nameB} — ${fact.label}` }))),
      ],
    },
    {
      h2: H2.pairLinks[locale],
      paragraphs: [],
      links: [
        { href: signPath(locale, left), label: KEYWORD.sign[locale](nameA) },
        { href: risingPath(locale, left), label: KEYWORD.rising[locale](nameA) },
        ...(left === right
          ? []
          : [
              { href: signPath(locale, right), label: KEYWORD.sign[locale](nameB) },
              { href: risingPath(locale, right), label: KEYWORD.rising[locale](nameB) },
            ]),
      ],
    },
  ];
  return {
    kind: 'compat',
    locale,
    path: compatPath(locale, left, right),
    title,
    description,
    h1: title,
    keywords: [keyword, nameA, nameB, 'Callastral'],
    alternates: compatAlternates(left, right),
    sections,
    prose: proseOf(sections),
  };
}

export function articlesFor(locale: Locale): ArticleModel[] {
  const signs = SIGN_IDS.map((id) => signArticleModel(locale, id));
  const rising = SIGN_IDS.map((id) => risingArticleModel(locale, id));
  const pairs = pairList().map(([a, b]) => compatArticleModel(locale, a, b));
  return [...signs, ...rising, ...pairs];
}

export interface SitemapCluster {
  paths: Record<Locale, string>;
  languages: Record<string, string>;
}

export function clusterSitemap(): SitemapCluster[] {
  const rows: SitemapCluster[] = [];
  for (const id of SIGN_IDS) {
    rows.push({
      paths: Object.fromEntries(LOCALES.map((locale) => [locale, signPath(locale, id)])) as Record<Locale, string>,
      languages: signAlternates(id),
    });
    rows.push({
      paths: Object.fromEntries(LOCALES.map((locale) => [locale, risingPath(locale, id)])) as Record<Locale, string>,
      languages: risingAlternates(id),
    });
  }
  for (const [left, right] of pairList()) {
    rows.push({
      paths: Object.fromEntries(LOCALES.map((locale) => [locale, compatPath(locale, left, right)])) as Record<Locale, string>,
      languages: compatAlternates(left, right),
    });
  }
  rows.push({
    paths: Object.fromEntries(LOCALES.map((locale) => [locale, weekPath(locale)])) as Record<Locale, string>,
    languages: weekAlternates(),
  });
  return rows;
}

export function articleJsonLd(origin: string, article: Pick<ArticleModel, 'path' | 'h1' | 'description' | 'locale'>): Record<string, unknown> {
  const url = `${origin}${article.path}`;
  const home = { fr: 'Accueil', en: 'Home', es: 'Inicio', de: 'Start', it: 'Home' }[article.locale];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: home, item: `${origin}/${article.locale}` },
          { '@type': 'ListItem', position: 2, name: article.h1, item: url },
        ],
      },
      {
        '@type': 'WebPage',
        name: article.h1,
        url,
        description: article.description,
        inLanguage: article.locale,
        isPartOf: { '@id': `${origin}/#website` },
        publisher: { '@id': `${origin}/#organization` },
      },
    ],
  };
}

export function pageCounts(): Record<Locale | 'avis' | 'total', number> {
  const perLocale = SIGN_IDS.length * 2 + pairList().length + 1;
  return {
    fr: perLocale + 1,
    en: perLocale,
    es: perLocale,
    de: perLocale,
    it: perLocale,
    avis: 1,
    total: perLocale * 5 + 1,
  };
}
