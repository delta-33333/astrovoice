import type { Currency } from './money';

export const LOCALES = ['fr', 'en', 'es', 'de', 'it'] as const;
export type Locale = (typeof LOCALES)[number];

export const SPECIALTY_IDS = [
  'amour',
  'carrière',
  'spiritualité',
  'transition de vie',
  'compatibilité',
  'argent',
  'famille',
] as const;
export type SpecialtyId = (typeof SPECIALTY_IDS)[number];

export const PROFESSION_SLUG: Record<Locale, string> = {
  fr: 'astrologue',
  en: 'astrologer',
  es: 'astrologo',
  de: 'astrologe',
  it: 'astrologo',
};

const HUB_SLUG: Record<SpecialtyId, Record<Locale, string>> = {
  amour: {
    fr: 'astrologie-amour',
    en: 'astrology-love',
    es: 'astrologia-amor',
    de: 'astrologie-liebe',
    it: 'astrologia-amore',
  },
  carrière: {
    fr: 'astrologie-carriere',
    en: 'astrology-career',
    es: 'astrologia-carrera',
    de: 'astrologie-karriere',
    it: 'astrologia-carriera',
  },
  spiritualité: {
    fr: 'astrologie-spiritualite',
    en: 'astrology-spirituality',
    es: 'astrologia-espiritualidad',
    de: 'astrologie-spiritualitaet',
    it: 'astrologia-spiritualita',
  },
  'transition de vie': {
    fr: 'astrologie-transition',
    en: 'astrology-life-transition',
    es: 'astrologia-transicion',
    de: 'astrologie-lebensuebergang',
    it: 'astrologia-transizione',
  },
  compatibilité: {
    fr: 'astrologie-compatibilite',
    en: 'astrology-compatibility',
    es: 'astrologia-compatibilidad',
    de: 'astrologie-kompatibilitaet',
    it: 'astrologia-compatibilita',
  },
  argent: {
    fr: 'astrologie-argent',
    en: 'astrology-money',
    es: 'astrologia-dinero',
    de: 'astrologie-geld',
    it: 'astrologia-denaro',
  },
  famille: {
    fr: 'astrologie-famille',
    en: 'astrology-family',
    es: 'astrologia-familia',
    de: 'astrologie-familie',
    it: 'astrologia-famiglia',
  },
};

const SPECIALTY_LABEL: Record<Locale, Record<SpecialtyId, string>> = {
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
    'transition de vie': 'life transition',
    compatibilité: 'compatibility',
    argent: 'money',
    famille: 'family',
  },
  es: {
    amour: 'amor',
    carrière: 'carrera',
    spiritualité: 'espiritualidad',
    'transition de vie': 'transición de vida',
    compatibilité: 'compatibilidad',
    argent: 'dinero',
    famille: 'familia',
  },
  de: {
    amour: 'Liebe',
    carrière: 'Karriere',
    spiritualité: 'Spiritualität',
    'transition de vie': 'Lebensübergang',
    compatibilité: 'Kompatibilität',
    argent: 'Geld',
    famille: 'Familie',
  },
  it: {
    amour: 'amore',
    carrière: 'carriera',
    spiritualité: 'spiritualità',
    'transition de vie': 'transizione di vita',
    compatibilité: 'compatibilità',
    argent: 'denaro',
    famille: 'famiglia',
  },
};

const STYLE_LABEL: Record<Locale, Record<string, string>> = {
  fr: { doux: 'doux', direct: 'direct', mystique: 'mystique', pragmatique: 'pragmatique', poétique: 'poétique', structuré: 'structuré' },
  en: { doux: 'gentle', direct: 'direct', mystique: 'mystical', pragmatique: 'pragmatic', poétique: 'poetic', structuré: 'structured' },
  de: { doux: 'sanft', direct: 'direkt', mystique: 'mystisch', pragmatique: 'pragmatisch', poétique: 'poetisch', structuré: 'strukturiert' },
  es: { doux: 'suave', direct: 'directo', mystique: 'místico', pragmatique: 'pragmático', poétique: 'poético', structuré: 'estructurado' },
  it: { doux: 'delicato', direct: 'diretto', mystique: 'mistico', pragmatique: 'pragmatico', poétique: 'poetico', structuré: 'strutturato' },
};

const LANG_LABEL: Record<Locale, Record<string, string>> = {
  fr: { fr: 'français', en: 'anglais', es: 'espagnol', de: 'allemand', it: 'italien' },
  en: { fr: 'French', en: 'English', es: 'Spanish', de: 'German', it: 'Italian' },
  es: { fr: 'francés', en: 'inglés', es: 'español', de: 'alemán', it: 'italiano' },
  de: { fr: 'Französisch', en: 'Englisch', es: 'Spanisch', de: 'Deutsch', it: 'Italienisch' },
  it: { fr: 'francese', en: 'inglese', es: 'spagnolo', de: 'tedesco', it: 'italiano' },
};

const PHONE: Record<Locale, string> = {
  fr: 'consultation par téléphone',
  en: 'phone consultation',
  es: 'consulta por teléfono',
  de: 'Beratung am Telefon',
  it: 'consulto telefonico',
};

const HOME_LABEL: Record<Locale, string> = {
  fr: 'Accueil',
  en: 'Home',
  es: 'Inicio',
  de: 'Start',
  it: 'Home',
};

const DATE_LOCALE: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  de: 'de-DE',
  it: 'it-IT',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function isSpecialtyId(value: string): value is SpecialtyId {
  return (SPECIALTY_IDS as readonly string[]).includes(value);
}

export function localeCurrency(locale: Locale): Currency {
  return locale === 'en' ? 'usd' : 'eur';
}

export function professionSlug(locale: Locale): string {
  return PROFESSION_SLUG[locale];
}

const PROFESSION_TITLE: Record<Locale, string> = {
  fr: 'Astrologue',
  en: 'Astrologer',
  es: 'Astrólogo',
  de: 'Astrologe',
  it: 'Astrologo',
};

export function professionTitle(locale: Locale): string {
  return PROFESSION_TITLE[locale];
}

export function hubSlug(locale: Locale, specialty: string): string | null {
  if (!isSpecialtyId(specialty)) return null;
  return HUB_SLUG[specialty][locale];
}

export function specialtyFromHub(locale: Locale, slug: string): SpecialtyId | null {
  for (const id of SPECIALTY_IDS) {
    if (HUB_SLUG[id][locale] === slug) return id;
  }
  return null;
}

export function specialtyLabel(locale: Locale, specialty: string): string {
  if (!isSpecialtyId(specialty)) return specialty;
  return SPECIALTY_LABEL[locale][specialty];
}

export function styleLabel(locale: Locale, style: string): string {
  return STYLE_LABEL[locale][style] ?? style;
}

export function languageLabel(locale: Locale, code: string): string {
  return LANG_LABEL[locale][code] ?? code;
}

export function phonePhrase(locale: Locale): string {
  return PHONE[locale];
}

export function homeLabel(locale: Locale): string {
  return HOME_LABEL[locale];
}

export function localeHomePath(locale: Locale): string {
  return `/${locale}`;
}

export function advisorPath(locale: Locale, slug: string): string {
  return `/${locale}/${PROFESSION_SLUG[locale]}/${slug}`;
}

/** Locales où la fiche a un contenu propre : les langues réellement parlées. */
export function indexableAdvisorLocales(languages: readonly string[]): Locale[] {
  const spoken = new Set(languages.filter((code): code is Locale => isLocale(code)));
  return LOCALES.filter((locale) => spoken.has(locale));
}

export function advisorSpeaks(languages: readonly string[], locale: Locale): boolean {
  return indexableAdvisorLocales(languages).includes(locale);
}

/** hreflang limité aux langues parlées. x-default vise la première de ces langues. */
export function advisorAlternates(slug: string, languages: readonly string[]): Record<string, string> {
  const locales = indexableAdvisorLocales(languages);
  const map: Record<string, string> = {};
  for (const locale of locales) map[locale] = advisorPath(locale, slug);
  if (locales[0]) map['x-default'] = advisorPath(locales[0], slug);
  return map;
}

export function hubPath(locale: Locale, specialty: string): string {
  const slug = hubSlug(locale, specialty);
  return slug ? `/${locale}/${slug}` : localeHomePath(locale);
}

export function hreflangAlternates(pathFor: (locale: Locale) => string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) languages[locale] = pathFor(locale);
  languages['x-default'] = pathFor('fr');
  return languages;
}

export function formatSlot(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function availabilitySentence(
  locale: Locale,
  input: { hasImmediate: boolean; nextSlotAt: string | null }
): string {
  if (input.hasImmediate) {
    const now: Record<Locale, string> = {
      fr: 'Un créneau est ouvert maintenant.',
      en: 'An opening is available now.',
      es: 'Hay un horario disponible ahora.',
      de: 'Ein Termin ist jetzt frei.',
      it: 'C’è un orario disponibile adesso.',
    };
    return now[locale];
  }
  if (input.nextSlotAt) {
    const when = formatSlot(locale, input.nextSlotAt);
    const next: Record<Locale, string> = {
      fr: `Prochain créneau : ${when} (heure de Paris).`,
      en: `Next opening: ${when} (Paris time).`,
      es: `Próximo horario: ${when} (hora de París).`,
      de: `Nächster Termin: ${when} (Pariser Zeit).`,
      it: `Prossimo orario: ${when} (ora di Parigi).`,
    };
    return next[locale];
  }
  const none: Record<Locale, string> = {
    fr: 'Les créneaux libres sont indiqués sur la page de réservation.',
    en: 'Open times are listed on the booking page.',
    es: 'Los horarios libres figuran en la página de reserva.',
    de: 'Freie Termine stehen auf der Reservierungsseite.',
    it: 'Gli orari liberi sono sulla pagina di prenotazione.',
  };
  return none[locale];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function advisorFaqs(input: {
  locale: Locale;
  name: string;
  specialties: string;
  style: string;
  languages: string;
  intro: string;
  standard: string;
  availability: string;
}): FaqItem[] {
  const { locale, name, specialties, style, languages, intro, standard, availability } = input;
  const copy: Record<Locale, FaqItem[]> = {
    fr: [
      {
        question: `Comment joindre ${name} par téléphone ?`,
        answer: `Ouvrez la fiche de ${name}, choisissez un créneau, puis créez le compte au moment du paiement. ${availability}`,
      },
      {
        question: `Quelles questions ${name} traite-t-il ?`,
        answer: `${name} consulte sur ${specialties}, avec un style ${style}.`,
      },
      {
        question: `Quel est le tarif de ${name} ?`,
        answer: `La consultation commence à ${intro} pendant les trois premières minutes, puis ${standard}. Le montant d’un rendez-vous est le nombre de minutes multiplié par ces tarifs.`,
      },
      {
        question: `En quelles langues ${name} consulte-t-il ?`,
        answer: `${name} consulte en ${languages}.`,
      },
      {
        question: `Quand ${name} est-il disponible ?`,
        answer: availability,
      },
    ],
    en: [
      {
        question: `How do I book a phone consultation with ${name}?`,
        answer: `Open ${name}’s page, pick a time, and create the account at payment. ${availability}`,
      },
      {
        question: `What does ${name} cover?`,
        answer: `${name} consults on ${specialties}, in a ${style} style.`,
      },
      {
        question: `What does ${name} charge?`,
        answer: `The consultation starts at ${intro} for the first three minutes, then ${standard}. A booking is the number of minutes times those rates.`,
      },
      {
        question: `Which languages does ${name} use?`,
        answer: `${name} consults in ${languages}.`,
      },
      {
        question: `When is ${name} available?`,
        answer: availability,
      },
    ],
    es: [
      {
        question: `¿Cómo reservar una consulta por teléfono con ${name}?`,
        answer: `Abra la ficha de ${name}, elija un horario y cree la cuenta al pagar. ${availability}`,
      },
      {
        question: `¿De qué habla ${name}?`,
        answer: `${name} consulta sobre ${specialties}, con un estilo ${style}.`,
      },
      {
        question: `¿Cuál es el precio de ${name}?`,
        answer: `La consulta empieza a ${intro} durante los tres primeros minutos y sigue a ${standard}. Una reserva es el número de minutos por esas tarifas.`,
      },
      {
        question: `¿En qué idiomas consulta ${name}?`,
        answer: `${name} consulta en ${languages}.`,
      },
      {
        question: `¿Cuándo está disponible ${name}?`,
        answer: availability,
      },
    ],
    de: [
      {
        question: `Wie buche ich eine telefonische Beratung bei ${name}?`,
        answer: `Öffnen Sie die Seite von ${name}, wählen Sie einen Termin und legen Sie das Konto bei der Zahlung an. ${availability}`,
      },
      {
        question: `Welche Themen behandelt ${name}?`,
        answer: `${name} berät zu ${specialties}, in einem ${style} Stil.`,
      },
      {
        question: `Was kostet ${name}?`,
        answer: `Die Beratung beginnt mit ${intro} in den ersten drei Minuten, danach ${standard}. Eine Buchung ist die Minutenzahl mal diesen Tarifen.`,
      },
      {
        question: `In welchen Sprachen berät ${name}?`,
        answer: `${name} berät auf ${languages}.`,
      },
      {
        question: `Wann ist ${name} erreichbar?`,
        answer: availability,
      },
    ],
    it: [
      {
        question: `Come prenotare un consulto telefonico con ${name}?`,
        answer: `Apri la scheda di ${name}, scegli un orario e crea l’account al pagamento. ${availability}`,
      },
      {
        question: `Di cosa si occupa ${name}?`,
        answer: `${name} consulta su ${specialties}, con uno stile ${style}.`,
      },
      {
        question: `Qual è il prezzo di ${name}?`,
        answer: `Il consulto parte da ${intro} per i primi tre minuti, poi ${standard}. Una prenotazione è il numero di minuti per queste tariffe.`,
      },
      {
        question: `In quali lingue consulta ${name}?`,
        answer: `${name} consulta in ${languages}.`,
      },
      {
        question: `Quando è disponibile ${name}?`,
        answer: availability,
      },
    ],
  };
  return copy[locale];
}

export function homeFaqs(locale: Locale, floor: string, ceiling: string): FaqItem[] {
  const disclosure: Record<Locale, string> = {
    fr: 'Les conseillers Callastral sont des voix et des personas virtuels créés par Callastral.',
    en: 'Callastral advisors are virtual voices and personas created by Callastral.',
    es: 'Los consejeros de Callastral son voces y personajes virtuales creados por Callastral.',
    de: 'Die Berater von Callastral sind virtuelle Stimmen und Personas, geschaffen von Callastral.',
    it: 'I consulenti Callastral sono voci e personaggi virtuali creati da Callastral.',
  };
  const rest: Record<Locale, FaqItem[]> = {
    fr: [
      { question: 'Qui sont les conseillers Callastral ?', answer: disclosure.fr },
      { question: 'Comment se passe une consultation par téléphone ?', answer: 'Vous choisissez un conseiller, un créneau, puis vous payez. Le compte se crée à ce moment-là. Le lien d’appel s’ouvre cinq minutes avant le début.' },
      { question: 'Quels sont les tarifs ?', answer: `Chaque conseiller affiche son tarif, entre ${floor} et ${ceiling} la minute. Les trois premières minutes sont à un tarif réduit.` },
    ],
    en: [
      { question: 'Who are the Callastral advisors?', answer: disclosure.en },
      { question: 'How does a phone consultation work?', answer: 'You choose an advisor and a time, then pay. The account is created at that step. The call link opens five minutes before the start.' },
      { question: 'What are the prices?', answer: `Each advisor shows a rate between ${floor} and ${ceiling} per minute. The first three minutes use a reduced rate.` },
    ],
    es: [
      { question: '¿Quiénes son los consejeros de Callastral?', answer: disclosure.es },
      { question: '¿Cómo es una consulta por teléfono?', answer: 'Elige un consejero y un horario, luego paga. La cuenta se crea en ese paso. El enlace de la llamada se abre cinco minutos antes.' },
      { question: '¿Cuáles son los precios?', answer: `Cada consejero muestra una tarifa entre ${floor} y ${ceiling} por minuto. Los tres primeros minutos tienen una tarifa reducida.` },
    ],
    de: [
      { question: 'Wer sind die Berater von Callastral?', answer: disclosure.de },
      { question: 'Wie läuft eine telefonische Beratung ab?', answer: 'Sie wählen einen Berater und einen Termin und zahlen dann. Das Konto entsteht bei diesem Schritt. Der Anruflink öffnet fünf Minuten vor Beginn.' },
      { question: 'Welche Preise gelten?', answer: `Jeder Berater zeigt einen Tarif zwischen ${floor} und ${ceiling} pro Minute. Die ersten drei Minuten sind ermäßigt.` },
    ],
    it: [
      { question: 'Chi sono i consulenti Callastral?', answer: disclosure.it },
      { question: 'Come funziona un consulto telefonico?', answer: 'Scegli un consulente e un orario, poi paghi. L’account si crea in quel passaggio. Il link della chiamata si apre cinque minuti prima.' },
      { question: 'Quali sono i prezzi?', answer: `Ogni consulente mostra una tariffa tra ${floor} e ${ceiling} al minuto. I primi tre minuti hanno una tariffa ridotta.` },
    ],
  };
  return rest[locale];
}

/** URLs officielles pour schema.org sameAs. Vide tant que SITE_SAME_AS n’est pas défini. */
export function siteSameAs(): string[] {
  return (process.env.SITE_SAME_AS || '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => /^https:\/\/[^\s]+$/.test(item));
}

export function organizationGraph(origin: string): Record<string, unknown>[] {
  const sameAs = siteSameAs();
  return [
    {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: 'Callastral',
      url: origin,
      logo: `${origin}/logo.png`,
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      name: 'Callastral',
      url: origin,
      publisher: { '@id': `${origin}/#organization` },
      inLanguage: [...LOCALES],
    },
  ];
}
