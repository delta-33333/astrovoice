import { ascendantPath } from './ascendant-tool.ts';
import { AI_ACT_LINE, AI_ACT_SPOKEN } from './legal.ts';
import { privacyPath } from './privacy-copy.ts';
import { hreflangAlternates, hubPath, SPECIALTY_IDS, specialtyLabel, type Locale } from './seo.ts';

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

const PARAGRAPHS: Record<Locale, string[]> = {
  fr: [
    'Callastral est un service d’astrologie. Le thème natal est calculé à partir de la date, de l’heure et du lieu de naissance avec Swiss Ephemeris. L’ascendant gratuit utilise le même calcul.',
    'Les consultations par téléphone sont menées par des conseillers virtuels créés par Callastral. Ce ne sont pas des personnes humaines, et aucune biographie réelle ne leur est prêtée.',
    'Les lectures sont un divertissement et une réflexion personnelle. Elles ne sont ni un avis médical, ni un conseil juridique ou financier, ni une prédiction certaine.',
  ],
  en: [
    'Callastral is an astrology service. The birth chart is computed from the date, time and place of birth with Swiss Ephemeris. The free rising-sign tool uses the same calculation.',
    'Phone consultations are led by virtual advisors created by Callastral. They are not human beings, and no real biography is attached to them.',
    'Readings are entertainment and personal reflection. They are not medical, legal or financial advice, and they are not a certain prediction.',
  ],
  es: [
    'Callastral es un servicio de astrología. La carta natal se calcula con la fecha, la hora y el lugar de nacimiento mediante Swiss Ephemeris. El ascendente gratis usa el mismo cálculo.',
    'Las consultas por teléfono las hacen consejeros virtuales creados por Callastral. No son personas humanas y no tienen una biografía real.',
    'Las lecturas son entretenimiento y reflexión personal. No son un consejo médico, jurídico o financiero, ni una predicción segura.',
  ],
  de: [
    'Callastral ist ein Astrologie-Dienst. Das Geburtshoroskop wird aus Datum, Uhrzeit und Ort der Geburt mit Swiss Ephemeris berechnet. Der kostenlose Aszendent nutzt dieselbe Rechnung.',
    'Telefonberatungen führen virtuelle Berater, die Callastral erstellt hat. Es sind keine Menschen, und ihnen wird keine echte Biografie zugeschrieben.',
    'Die Deutungen sind Unterhaltung und persönliche Überlegung. Sie sind kein medizinischer, rechtlicher oder finanzieller Rat und keine sichere Vorhersage.',
  ],
  it: [
    'Callastral è un servizio di astrologia. Il tema natale si calcola da data, ora e luogo di nascita con Swiss Ephemeris. L’ascendente gratuito usa lo stesso calcolo.',
    'I consulti telefonici sono condotti da consulenti virtuali creati da Callastral. Non sono persone umane e non hanno una biografia reale.',
    'Le letture sono intrattenimento e riflessione personale. Non sono un parere medico, legale o finanziario, né una previsione certa.',
  ],
};

const GLUE: Record<Locale, { label: string; spoken: string; legal: string; topics: string; home: string }> = {
  fr: {
    label: 'Sur le site, le libellé affiché est :',
    spoken: 'Au début de l’appel, le conseiller le dit :',
    legal: 'Les pages juridiques du service :',
    topics: 'Les sujets proposés aux conseillers virtuels :',
    home: 'Accueil',
  },
  en: {
    label: 'On the site, the label shown is:',
    spoken: 'At the start of the call, the advisor says:',
    legal: 'The legal pages of the service:',
    topics: 'Topics offered to the virtual advisors:',
    home: 'Home',
  },
  es: {
    label: 'En el sitio, la etiqueta visible es:',
    spoken: 'Al inicio de la llamada, el consejero dice:',
    legal: 'Las páginas jurídicas del servicio:',
    topics: 'Temas propuestos a los consejeros virtuales:',
    home: 'Inicio',
  },
  de: {
    label: 'Auf der Website steht dieses Kennzeichen:',
    spoken: 'Zu Beginn des Anrufs sagt der Berater:',
    legal: 'Die rechtlichen Seiten des Dienstes:',
    topics: 'Themen der virtuellen Berater:',
    home: 'Start',
  },
  it: {
    label: 'Sul sito, l’etichetta visibile è:',
    spoken: 'All’inizio della chiamata, il consulente dice:',
    legal: 'Le pagine legali del servizio:',
    topics: 'Temi proposti ai consulenti virtuali:',
    home: 'Home',
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
    paragraphs: PARAGRAPHS[locale],
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
