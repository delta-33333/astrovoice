/**
 * Bios conseiller dans la langue de la page.
 * - Langue principale du conseiller : la bio enregistrée (modifiable dans l’admin),
 *   avec les mots de spécialité traduits et l’accord au féminin corrigé.
 * - Autres langues : bio recomposée à partir des mêmes faits (spécialités, style), sans âge ni ancienneté,
 *   avec les mêmes gabarits que le générateur du catalogue.
 * Module pur, utilisable côté client.
 */

export type BioLocale = 'fr' | 'en' | 'es' | 'de' | 'it';
const BIO_LOCALES: readonly BioLocale[] = ['fr', 'en', 'es', 'de', 'it'];

export interface BioInput {
  slug: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'femme' | 'homme';
  languages: readonly string[];
  specialties: readonly string[];
  readingStyle: string;
  bio: string;
  yearsExperience?: number | null;
}

const SPECIALTY_WORD: Record<BioLocale, Record<string, string>> = {
  fr: {
    amour: 'amour',
    carrière: 'carrière',
    spiritualité: 'spiritualité',
    'transition de vie': 'transition de vie',
    compatibilité: 'compatibilité',
    argent: 'argent',
    famille: 'famille',
  },
  en: {
    amour: 'love',
    carrière: 'career',
    spiritualité: 'spirituality',
    'transition de vie': 'life transitions',
    compatibilité: 'compatibility',
    argent: 'money',
    famille: 'family',
  },
  es: {
    amour: 'amor',
    carrière: 'carrera',
    spiritualité: 'espiritualidad',
    'transition de vie': 'transiciones vitales',
    compatibilité: 'compatibilidad',
    argent: 'dinero',
    famille: 'familia',
  },
  de: {
    amour: 'Liebe',
    carrière: 'Karriere',
    spiritualité: 'Spiritualität',
    'transition de vie': 'Lebensübergänge',
    compatibilité: 'Kompatibilität',
    argent: 'Geld',
    famille: 'Familie',
  },
  it: {
    amour: 'amore',
    carrière: 'carriera',
    spiritualité: 'spiritualità',
    'transition de vie': 'transizioni di vita',
    compatibilité: 'compatibilità',
    argent: 'denaro',
    famille: 'famiglia',
  },
};

/** Mot de spécialité dans la langue demandée (tags, listes). */
export function specialtyWord(locale: BioLocale, specialty: string): string {
  return SPECIALTY_WORD[locale]?.[specialty] ?? specialty;
}

const STYLE_PHRASE: Record<string, Record<BioLocale, string>> = {
  doux: { fr: 'douce et patiente', en: 'gentle and patient', es: 'suave y paciente', de: 'ruhig und geduldig', it: 'dolce e paziente' },
  direct: { fr: 'directe et nette', en: 'direct and plain-spoken', es: 'directa y nítida', de: 'direkt und nüchtern', it: 'diretta e nitida' },
  mystique: {
    fr: 'mystique, sans se perdre dans les images',
    en: 'mystical, without drifting into vague images',
    es: 'mística, sin perderse en imágenes vagas',
    de: 'mystisch, ohne sich in vagen Bildern zu verlieren',
    it: 'mistica, senza perdersi in immagini vaghe',
  },
  pragmatique: {
    fr: 'pragmatique et orientée vers une décision',
    en: 'pragmatic and aimed at a decision',
    es: 'pragmática y orientada a una decisión',
    de: 'pragmatisch und auf eine Entscheidung ausgerichtet',
    it: 'pragmatica e orientata a una decisione',
  },
  poétique: { fr: 'poétique, puis très concrète', en: 'poetic, then very concrete', es: 'poética y después muy concreta', de: 'poetisch und danach sehr konkret', it: 'poetica e poi molto concreta' },
  structuré: {
    fr: 'structurée, avec des repères de temps',
    en: 'structured, with clear time markers',
    es: 'estructurada, con marcas de tiempo',
    de: 'geordnet, mit klaren Zeitmarken',
    it: 'strutturata, con riferimenti di tempo',
  },
};

const SIGNATURES: Record<BioLocale, string[]> = {
  fr: [
    'Les maisons d’eau et de terre servent de boussole, jamais de verdict.',
    'Un transit n’est nommé que s’il éclaire la question posée.',
    'La Lune et Saturne reviennent souvent : le besoin, puis la durée.',
    'Les nœuds lunaires servent à nommer ce qui se termine et ce qui commence.',
    'Vénus et Mars sont lus ensemble, désir et manière d’agir.',
    'L’Ascendant n’est utilisé que lorsque l’heure de naissance est connue.',
    'Chaque séance se termine par un geste simple pour les sept jours suivants.',
    'Le silence est laissé quand la personne cherche ses mots.',
  ],
  en: [
    'Water and earth houses are treated as a compass, never a verdict.',
    'A transit is named only when it clarifies the question at hand.',
    'The Moon and Saturn often return: the need, then the duration.',
    'The lunar nodes are used to name what is ending and what is starting.',
    'Venus and Mars are read together, desire and the way of acting.',
    'The Ascendant is used only when the birth time is known.',
    'Each session ends with one plain step for the next seven days.',
    'Silence is left in place when someone is searching for words.',
  ],
  es: [
    'Las casas de agua y de tierra sirven de brújula, nunca de sentencia.',
    'Un tránsito se nombra solo si aclara la pregunta del momento.',
    'La Luna y Saturno vuelven a menudo: la necesidad, luego la duración.',
    'Los nodos lunares sirven para nombrar lo que termina y lo que empieza.',
    'Venus y Marte se leen juntos, el deseo y la manera de actuar.',
    'El Ascendente se usa solo cuando la hora de nacimiento es conocida.',
    'Cada sesión cierra con un gesto simple para los siete días siguientes.',
    'El silencio se respeta cuando la persona busca las palabras.',
  ],
  de: [
    'Wasser- und Erd-Häuser dienen als Kompass, nie als Urteil.',
    'Ein Transit wird nur genannt, wenn er die Frage erhellt.',
    'Mond und Saturn kehren oft wieder: das Bedürfnis, dann die Dauer.',
    'Die Mondknoten benennen, was endet und was beginnt.',
    'Venus und Mars werden zusammen gelesen, Wunsch und Handlungsweise.',
    'Der Aszendent wird nur genutzt, wenn die Geburtszeit bekannt ist.',
    'Jede Sitzung endet mit einem schlichten Schritt für die nächsten sieben Tage.',
    'Stille bleibt, wenn jemand nach Worten sucht.',
  ],
  it: [
    'Le case d’acqua e di terra servono da bussola, mai da verdetto.',
    'Un transito viene nominato solo se chiarisce la domanda.',
    'Luna e Saturno tornano spesso: il bisogno, poi la durata.',
    'I nodi lunari servono a dire ciò che finisce e ciò che inizia.',
    'Venere e Marte si leggono insieme, desiderio e modo di agire.',
    'L’Ascendente si usa solo quando l’ora di nascita è nota.',
    'Ogni seduta si chiude con un gesto semplice per i sette giorni seguenti.',
    'Il silenzio resta quando la persona cerca le parole.',
  ],
};

interface Ctx {
  first: string;
  last: string;
  specs: string;
  primary: string;
  style: string;
  female: boolean;
  /** « de X » / « d’X » (français). */
  deSpecs: string;
  dePrimary: string;
}

type Tpl = (p: Ctx) => string;

/** Ouvertures sans âge ni années de pratique : une persona virtuelle n’a pas de carrière humaine. */
const OPENINGS: Record<BioLocale, Tpl[]> = {
  fr: [
    (p) => `${p.first} ${p.last} est une persona virtuelle Callastral, centrée sur les questions ${p.deSpecs}.`,
    (p) => `${p.first} ${p.last} : persona virtuelle d’astrologie, pour les questions ${p.deSpecs}.`,
    (p) => `Persona virtuelle Callastral, ${p.first} ${p.last} lit le thème natal autour des questions ${p.deSpecs}.`,
  ],
  en: [
    (p) => `${p.first} ${p.last} is a Callastral virtual persona focused on ${p.specs}.`,
    (p) => `${p.first} ${p.last}: a virtual astrology persona for questions of ${p.specs}.`,
    (p) => `A Callastral virtual persona, ${p.first} ${p.last} reads natal charts around ${p.specs}.`,
  ],
  es: [
    (p) => `${p.first} ${p.last} es una persona virtual de Callastral centrada en ${p.specs}.`,
    (p) => `${p.first} ${p.last}: persona virtual de astrología para preguntas de ${p.specs}.`,
    (p) => `Persona virtual de Callastral, ${p.first} ${p.last} lee la carta natal en torno a ${p.specs}.`,
  ],
  de: [
    (p) => `${p.first} ${p.last} ist eine virtuelle Callastral-Persona mit Schwerpunkt ${p.specs}.`,
    (p) => `${p.first} ${p.last}: virtuelle Astrologie-Persona für Fragen zu ${p.specs}.`,
    (p) => `Als virtuelle Callastral-Persona liest ${p.first} ${p.last} Geburtshoroskope rund um ${p.specs}.`,
  ],
  it: [
    (p) => `${p.first} ${p.last} è una persona virtuale di Callastral dedicata a ${p.specs}.`,
    (p) => `${p.first} ${p.last}: persona virtuale di astrologia per domande su ${p.specs}.`,
    (p) => `Persona virtuale di Callastral, ${p.first} ${p.last} legge il tema natale intorno a ${p.specs}.`,
  ],
};

const METHOD: Record<BioLocale, Tpl[]> = {
  fr: [
    (p) => `La lecture est ${p.style} : thème natal, transits du moment et maisons, puis une décision pour les semaines qui viennent.`,
    (p) => `Le travail part du thème de naissance et ne garde que les transits qui touchent la question (${p.primary}), dans une lecture ${p.style}.`,
    (p) => `Un aspect, une maison, une question : rien n’est lu en bloc, et la lecture reste ${p.style}.`,
  ],
  en: [
    (p) => `The reading is ${p.style}: natal chart, current transits and houses, then a decision for the weeks ahead.`,
    (p) => `The work starts from the birth chart and keeps only the transits that touch ${p.primary}, in a manner that is ${p.style}.`,
    (p) => `One aspect, one house, one question: nothing is read all at once, and the manner stays ${p.style}.`,
  ],
  es: [
    (p) => `La lectura es ${p.style}: carta natal, tránsitos del momento y casas, y después una decisión para las próximas semanas.`,
    (p) => `El trabajo parte de la carta de nacimiento y guarda solo los tránsitos que tocan la pregunta (${p.primary}), en una lectura ${p.style}.`,
    (p) => `Un aspecto, una casa, una pregunta: nada se lee de golpe, y la lectura permanece ${p.style}.`,
  ],
  de: [
    (p) => `Die Deutung ist ${p.style}: Radix, aktuelle Transite und Häuser, danach eine Entscheidung für die kommenden Wochen.`,
    (p) => `Die Arbeit geht vom Geburtshoroskop aus und behält nur die Transite, die das Thema ${p.primary} berühren, in einer Deutung, die ${p.style} ist.`,
    (p) => `Ein Aspekt, ein Haus, eine Frage: nichts wird auf einmal gelesen, und die Deutung bleibt ${p.style}.`,
  ],
  it: [
    (p) => `La lettura è ${p.style}: tema natale, transiti del momento e case, poi una decisione per le settimane a venire.`,
    (p) => `Il lavoro parte dal tema di nascita e tiene solo i transiti che toccano la domanda (${p.primary}), in una lettura ${p.style}.`,
    (p) => `Un aspetto, una casa, una domanda: niente viene letto tutto insieme, e la lettura resta ${p.style}.`,
  ],
};

const CLOSING: Record<BioLocale, Tpl[]> = {
  fr: [
    (p) => `On consulte ${p.first} quand il faut faire le point sur ${p.primary} sans se presser, et repartir avec une piste tenable.`,
    (p) => `${p.first} convient à qui veut parler ${p.dePrimary} avec des mots simples et un calendrier réaliste.`,
    (p) => `La séance reste brève dans la forme et précise sur ce qu’il y a à décider côté ${p.primary}.`,
    (p) => `On appelle ${p.first} quand une question ${p.dePrimary} prend trop de place et que le thème peut remettre de l’ordre.`,
  ],
  en: [
    (p) => `People call ${p.first} when ${p.primary} needs sorting without rush, and when they want one workable next step.`,
    (p) => `${p.first} suits anyone who wants ${p.primary} named in plain words and a realistic calendar.`,
    (p) => `The session stays short in form and precise about what ${p.primary} asks them to decide.`,
    (p) => `${p.first} is called when ${p.primary} takes too much room and the chart can put things back in order.`,
  ],
  es: [
    (p) => `Se consulta a ${p.first} cuando hace falta ordenar el tema de ${p.primary} sin prisa y salir con una pista sostenible.`,
    (p) => `${p.first} encaja con quien quiere hablar de ${p.primary} con palabras simples y un calendario realista.`,
    (p) => `La sesión es breve en la forma y precisa en lo que hay que decidir sobre ${p.primary}.`,
    (p) => `Llaman a ${p.first} cuando el tema de ${p.primary} ocupa demasiado sitio y la carta puede volver a ordenar las cosas.`,
  ],
  de: [
    (p) => `${p.first} wird aufgesucht, wenn das Thema ${p.primary} ohne Eile geordnet werden soll und ein gangbarer nächster Schritt fehlt.`,
    (p) => `${p.first} passt zu Menschen, die das Thema ${p.primary} in einfachen Worten und mit einem realistischen Kalender angehen wollen.`,
    (p) => `Das Gespräch bleibt kurz in der Form und genau in dem, was beim Thema ${p.primary} zu entscheiden ist.`,
    (p) => `${p.first} wird gerufen, wenn das Thema ${p.primary} zu viel Raum einnimmt und das Horoskop wieder Ordnung schaffen kann.`,
  ],
  it: [
    (p) => `Si consulta ${p.first} quando serve mettere ordine nel tema ${p.primary} senza fretta e uscire con una pista sostenibile.`,
    (p) => `${p.first} è ${p.female ? 'adatta' : 'adatto'} a chi vuole parlare di ${p.primary} con parole semplici e un calendario realistico.`,
    (p) => `La seduta resta breve nella forma e precisa su ciò che c’è da decidere sul tema ${p.primary}.`,
    (p) => `${p.first} viene ${p.female ? 'chiamata' : 'chiamato'} quando il tema ${p.primary} occupa troppo spazio e il tema natale può rimettere ordine.`,
  ],
};

const LIST_LOCALE: Record<BioLocale, string> = { fr: 'fr', en: 'en', es: 'es', de: 'de', it: 'it' };

function isBioLocale(value: string): value is BioLocale {
  return (BIO_LOCALES as readonly string[]).includes(value);
}

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function joinList(locale: BioLocale, items: string[]): string {
  try {
    return new Intl.ListFormat(LIST_LOCALE[locale], { style: 'long', type: 'conjunction' }).format(items);
  } catch {
    return items.join(', ');
  }
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const FRENCH_KEYS = Object.keys(SPECIALTY_WORD.fr).sort((a, b) => b.length - a.length);

/** Bio enregistrée : traduit les mots de spécialité restés en français et accorde au féminin. */
function polishNative(input: BioInput, locale: BioLocale): string {
  let text = input.bio;
  if (locale !== 'fr') {
    for (const key of FRENCH_KEYS) {
      const re = new RegExp(`(?<![\\p{L}])${escapeRe(key)}(?![\\p{L}])`, 'gu');
      text = text.replace(re, SPECIALTY_WORD[locale][key]);
    }
  }
  if (locale === 'it' && input.gender === 'femme') {
    text = text.replace(/(?<!\p{L})è adatto a(?!\p{L})/gu, 'è adatta a').replace(/(?<!\p{L})viene chiamato(?!\p{L})/gu, 'viene chiamata');
  }
  return text;
}

function deFr(word: string): string {
  return /^[aeiouyhàâéèêîôû]/i.test(word) ? `d’${word}` : `de ${word}`;
}

function generate(input: BioInput, locale: BioLocale): string {
  const words = input.specialties.map((item) => specialtyWord(locale, item));
  const style = STYLE_PHRASE[input.readingStyle]?.[locale] ?? STYLE_PHRASE.structuré[locale];
  const ctx: Ctx = {
    first: input.firstName,
    last: input.lastName,
    specs: joinList(locale, words),
    primary: words[0] || specialtyWord(locale, 'amour'),
    style,
    female: input.gender === 'femme',
    deSpecs: '',
    dePrimary: '',
  };
  ctx.deSpecs = joinList('fr', words.map(deFr));
  ctx.dePrimary = deFr(ctx.primary);
  const h = hash(input.slug || `${input.firstName}-${input.lastName}`);
  const opening = OPENINGS[locale][h % OPENINGS[locale].length](ctx);
  const method = METHOD[locale][(h >>> 3) % METHOD[locale].length](ctx);
  const signature = SIGNATURES[locale][(h >>> 6) % SIGNATURES[locale].length];
  const closing = CLOSING[locale][(h >>> 9) % CLOSING[locale].length](ctx);
  return [opening, method, signature, closing].join(' ');
}

/** Bio issue du générateur du catalogue (non retouchée dans l’admin) : on peut la recomposer. */
function fromCatalog(input: BioInput): boolean {
  const native = input.languages[0];
  if (!native || !isBioLocale(native)) return false;
  return SIGNATURES[native].some((sentence) => input.bio.includes(sentence));
}

/** Bio affichée dans la langue de la page. */
const EXPERIENCE_CLAIM =
  /\d+\s*(ans|années|years?|años|Jahren?|anni)\b|depuis\s+\d|since\s+\d{4}|seit\s+\d|desde hace\s+\d|da\s+\d+\s+anni/iu;

export function localizedBio(input: BioInput, locale: string): string {
  const target: BioLocale = isBioLocale(locale) ? locale : 'fr';
  const native = input.languages[0];
  if (native === target && input.bio && !fromCatalog(input) && !EXPERIENCE_CLAIM.test(input.bio)) {
    return polishNative(input, target);
  }
  return generate(input, target);
}
