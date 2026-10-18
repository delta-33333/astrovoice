import { ascendantPath } from './ascendant-tool.ts';
import { discoveryHeadline } from './book-funnel.ts';
import { FREE_CALL_SECONDS } from './free-call.ts';
import { AI_ACT_LINE, AI_ACT_SPOKEN } from './legal.ts';
import { formatMoney } from './money.ts';
import { privacyPath } from './privacy-copy.ts';
import { hreflangAlternates, hubPath, SPECIALTY_IDS, specialtyLabel, type Locale } from './seo.ts';
import { firstWeekMinor, WEEKLY_MAX_CALL_MINUTES, WEEKLY_PLANS } from './weekly.ts';

export const ABOUT_PATHS: Record<Locale, string> = {
  fr: '/fr/a-propos',
  en: '/en/about',
  es: '/es/acerca',
  de: '/de/ueber-uns',
  it: '/it/chi-siamo',
};

export function aboutPath(locale: Locale): string {
  return ABOUT_PATHS[locale];
}

export function aboutAlternates(): Record<string, string> {
  return hreflangAlternates(aboutPath);
}

export interface AboutLink {
  href: string;
  label: string;
}

const TITLE: Record<Locale, string> = {
  fr: 'À propos de Callastral',
  en: 'About Callastral',
  es: 'Acerca de Callastral',
  de: 'Über Callastral',
  it: 'Chi è Callastral',
};

const DESCRIPTION: Record<Locale, string> = {
  fr: 'Callastral est un service d’astrologie : thème natal, ascendant et consultations par téléphone avec des conseillers virtuels.',
  en: 'Callastral is an astrology service: birth chart, rising sign and phone consultations with virtual advisors.',
  es: 'Callastral es un servicio de astrología: carta natal, ascendente y consultas por teléfono con consejeros virtuales.',
  de: 'Callastral ist ein Astrologie-Dienst: Geburtshoroskop, Aszendent und Telefonberatungen mit virtuellen Beratern.',
  it: 'Callastral è un servizio di astrologia: tema natale, ascendente e consulti telefonici con consulenti virtuali.',
};

export interface AboutSection {
  h2: string;
  paragraphs: string[];
}

function priceLine(locale: Locale): string {
  const lang = locale;
  const money = (minor: number) => formatMoney(minor, 'eur', locale === 'en' ? 'en' : 'fr');
  const dec = WEEKLY_PLANS.decouverte;
  const ess = WEEKLY_PLANS.essentiel;
  const pre = WEEKLY_PLANS.premium;
  const first = discoveryHeadline(lang, 'eur');
  if (locale === 'en') {
    return `Callastral charges ${dec.names.en} at ${money(dec.amounts.eur)} per week (${dec.minutes} minutes, ${first}), ${ess.names.en} at ${money(ess.amounts.eur)} (${ess.minutes} minutes, first week ${money(firstWeekMinor('essentiel', 'eur'))}) and ${pre.names.en} at ${money(pre.amounts.eur)} (${pre.minutes} minutes, first week ${money(firstWeekMinor('premium', 'eur'))}). A ${FREE_CALL_SECONDS / 60}-minute call is free once. Callastral does not show a countdown.`;
  }
  return `Callastral facture Découverte ${money(dec.amounts.eur)} par semaine (${dec.minutes} minutes, ${first}), Essentiel ${money(ess.amounts.eur)} (${ess.minutes} minutes, 1re semaine ${money(firstWeekMinor('essentiel', 'eur'))}) et Premium ${money(pre.amounts.eur)} (${pre.minutes} minutes, 1re semaine ${money(firstWeekMinor('premium', 'eur'))}). Un appel de ${FREE_CALL_SECONDS / 60} minutes est offert une fois. Callastral n’affiche pas de compte à rebours.`;
}

const SECTIONS: Record<'fr' | 'en', AboutSection[]> = {
  fr: [
    {
      h2: 'Qu’est-ce que Callastral ?',
      paragraphs: [
        'Callastral est un service d’astrologie par téléphone où l’on parle à des conseillers virtuels, des voix générées par IA, qui lisent votre thème natal.',
        'Callastral calcule le thème à partir de la date, de l’heure et du lieu de naissance, en zodiaque tropical. Le même calcul sert à l’ascendant gratuit et à la compatibilité de couple. Callastral indique la date de mise à jour de cette page. Les prix viennent des formules hebdomadaires. Callastral ne publie pas de note agrégée ni de témoignage inventé.',
      ],
    },
    {
      h2: 'Qui est derrière Callastral ?',
      paragraphs: [
        'Callastral est le nom du service. L’éditeur, l’identifiant, l’adresse, le directeur de la publication et l’e-mail de contact figurent dans les mentions légales lorsqu’ils sont renseignés. Callastral n’invente pas ces données.',
        'Callastral n’a aucun lien avec Call Astro (callastro.com). Le site est disponible en français, anglais, espagnol, allemand et italien.',
      ],
    },
    {
      h2: 'Combien ça coûte ?',
      paragraphs: [priceLine('fr')],
    },
    {
      h2: 'Comment fonctionne un appel ?',
      paragraphs: [
        `Callastral ouvre l’appel dans le navigateur. Le conseiller reçoit le résumé du thème natal et, s’il y en a, les derniers résumés d’appels. Un appel dure au plus ${WEEKLY_MAX_CALL_MINUTES} minutes. La personne peut raccrocher à tout moment.`,
      ],
    },
    {
      h2: 'Le conseiller se souvient-il de moi ?',
      paragraphs: [
        'Callastral enregistre après chaque appel un court résumé : thèmes, questions et conseils. Ce résumé est visible dans le compte et transmis au même conseiller au début de l’appel suivant. Callastral permet de le consulter et de l’effacer depuis le compte.',
      ],
    },
    {
      h2: 'Est-ce une vraie personne ?',
      paragraphs: [
        'Callastral ne met pas en ligne une personne humaine. Les conseillers sont des personas virtuels. Au début de chaque appel, le conseiller dit : « Je suis une conseillère virtuelle Callastral, et ma voix est générée par intelligence artificielle. »',
      ],
    },
    {
      h2: 'Limites',
      paragraphs: [
        'Callastral propose un divertissement et une réflexion personnelle. Ce n’est ni un avis médical, ni un conseil juridique ou financier, ni une prédiction certaine. Pour une question de santé, de droit, d’argent ou en cas de détresse, il faut s’adresser à un professionnel ou aux urgences (112, ou 3114 en France).',
      ],
    },
  ],
  en: [
    {
      h2: 'What is Callastral?',
      paragraphs: [
        'Callastral is a phone astrology service where you speak with virtual advisors, AI-generated voices, who read your birth chart.',
        'Callastral computes the chart from the date, time and place of birth, in the tropical zodiac. The same calculation powers the free rising-sign tool and the couple compatibility tool.',
      ],
    },
    {
      h2: 'Who is behind Callastral?',
      paragraphs: [
        'Callastral is the name of the service. The publisher, identifier, address, publication director and contact email appear on the legal notice when they are set. Callastral does not invent those details.',
        'Callastral has no link with Call Astro (callastro.com). The site is available in French, English, Spanish, German and Italian.',
      ],
    },
    {
      h2: 'What does it cost?',
      paragraphs: [priceLine('en')],
    },
    {
      h2: 'How does a call work?',
      paragraphs: [
        `Callastral opens the call in the browser. The advisor receives the birth-chart summary and, when they exist, the latest call summaries. A call lasts at most ${WEEKLY_MAX_CALL_MINUTES} minutes. You can hang up at any time.`,
      ],
    },
    {
      h2: 'Does the advisor remember me?',
      paragraphs: [
        'Callastral stores a short summary after each call: topics, questions and advice. The summary is visible in the account and given to the same advisor at the start of the next call. Callastral lets you read it and delete it from the account.',
      ],
    },
    {
      h2: 'Is this a real person?',
      paragraphs: [
        'Callastral does not connect you to a human. The advisors are virtual personas. At the start of every call the advisor says: “I am a Callastral virtual advisor, and my voice is generated by artificial intelligence.”',
      ],
    },
    {
      h2: 'Limits',
      paragraphs: [
        'Callastral offers entertainment and personal reflection. It is not medical, legal or financial advice, and it is not a certain prediction. For health, law, money or distress, contact a qualified professional or the emergency services.',
      ],
    },
  ],
};

function localizedSections(locale: Locale): AboutSection[] {
  if (locale === 'fr' || locale === 'en') return SECTIONS[locale];
  return SECTIONS.en.map((section) => ({
    h2: section.h2,
    paragraphs: section.paragraphs.map((paragraph) => paragraph),
  }));
}

const PARAGRAPHS: Record<Locale, string[]> = {
  fr: SECTIONS.fr.flatMap((section) => section.paragraphs),
  en: SECTIONS.en.flatMap((section) => section.paragraphs),
  es: SECTIONS.en.flatMap((section) => section.paragraphs),
  de: SECTIONS.en.flatMap((section) => section.paragraphs),
  it: SECTIONS.en.flatMap((section) => section.paragraphs),
};

const GLUE: Record<Locale, { label: string; spoken: string; legal: string; topics: string; home: string; updated: string }> = {
  fr: {
    label: 'Sur le site, le libellé affiché est :',
    spoken: 'Au début de l’appel, le conseiller le dit :',
    legal: 'Les pages juridiques du service :',
    topics: 'Les sujets proposés aux conseillers virtuels :',
    home: 'Accueil',
    updated: 'Mis à jour le',
  },
  en: {
    label: 'On the site, the label shown is:',
    spoken: 'At the start of the call, the advisor says:',
    legal: 'The legal pages of the service:',
    topics: 'Topics offered to the virtual advisors:',
    home: 'Home',
    updated: 'Updated',
  },
  es: {
    label: 'En el sitio, la etiqueta visible es:',
    spoken: 'Al inicio de la llamada, el consejero dice:',
    legal: 'Las páginas jurídicas del servicio:',
    topics: 'Temas propuestos a los consejeros virtuales:',
    home: 'Inicio',
    updated: 'Actualizado el',
  },
  de: {
    label: 'Auf der Website steht dieses Kennzeichen:',
    spoken: 'Zu Beginn des Anrufs sagt der Berater:',
    legal: 'Die rechtlichen Seiten des Dienstes:',
    topics: 'Themen der virtuellen Berater:',
    home: 'Start',
    updated: 'Aktualisiert am',
  },
  it: {
    label: 'Sul sito, l’etichetta visibile è:',
    spoken: 'All’inizio della chiamata, il consulente dice:',
    legal: 'Le pagine legali del servizio:',
    topics: 'Temi proposti ai consulenti virtuali:',
    home: 'Home',
    updated: 'Aggiornato il',
  },
};

const LEGAL_LABEL: Record<Locale, { privacy: string; terms: string; sales: string; tool: string }> = {
  fr: { privacy: 'politique de confidentialité', terms: 'conditions d’utilisation', sales: 'conditions de vente', tool: 'calcul d’ascendant gratuit' },
  en: { privacy: 'privacy policy', terms: 'terms of use', sales: 'terms of sale', tool: 'free rising sign calculator' },
  es: { privacy: 'política de privacidad', terms: 'condiciones de uso', sales: 'condiciones de venta', tool: 'calcular el ascendente gratis' },
  de: { privacy: 'Datenschutzerklärung', terms: 'Nutzungsbedingungen', sales: 'Verkaufsbedingungen', tool: 'Aszendent kostenlos berechnen' },
  it: { privacy: 'informativa privacy', terms: 'condizioni d’uso', sales: 'condizioni di vendita', tool: 'calcolo ascendente gratuito' },
};

export function aboutCopy(locale: Locale) {
  return {
    title: TITLE[locale],
    description: DESCRIPTION[locale],
    h1: TITLE[locale],
    sections: localizedSections(locale),
    paragraphs: PARAGRAPHS[locale],
    updatedDate: '2026-10-18',
    labelLine: AI_ACT_LINE[locale],
    spokenLine: AI_ACT_SPOKEN[locale],
    ...GLUE[locale],
  };
}

export function aboutLegalLinks(locale: Locale): AboutLink[] {
  const labels = LEGAL_LABEL[locale];
  return [
    { href: privacyPath(locale), label: labels.privacy },
    { href: '/cgu', label: labels.terms },
    { href: '/terms', label: labels.sales },
    { href: ascendantPath(locale), label: labels.tool },
  ];
}

export function aboutHubLinks(locale: Locale): AboutLink[] {
  return SPECIALTY_IDS.map((id) => ({
    href: hubPath(locale, id),
    label: specialtyLabel(locale, id),
  }));
}

export function aboutMeta(locale: Locale) {
  const copy = aboutCopy(locale);
  return {
    title: `${copy.title} | Callastral`,
    description: copy.description,
    alternates: { canonical: aboutPath(locale), languages: aboutAlternates() },
    openGraph: { title: copy.title, description: copy.description, url: aboutPath(locale), type: 'website' as const },
  };
}

export function aboutJsonLd(origin: string, locale: Locale): Record<string, unknown> {
  const copy = aboutCopy(locale);
  const url = `${origin}${aboutPath(locale)}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: GLUE[locale].home, item: `${origin}/${locale}` },
          { '@type': 'ListItem', position: 2, name: copy.h1, item: url },
        ],
      },
      {
        '@type': 'AboutPage',
        '@id': `${url}#about`,
        url,
        name: copy.h1,
        description: copy.description,
        inLanguage: locale,
        isPartOf: { '@id': `${origin}/#website` },
        publisher: { '@id': `${origin}/#organization` },
        about: { '@id': `${origin}/#organization` },
      },
    ],
  };
}
