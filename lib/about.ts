import { ascendantPath } from './ascendant-tool.ts';
import { FREE_CALL_SECONDS } from './free-call.ts';
import { AI_ACT_LINE, AI_ACT_SPOKEN } from './legal.ts';
import { formatMoney } from './money.ts';
import { FIXED_PACKS } from './pricing.ts';
import { privacyPath } from './privacy-copy.ts';
import { hreflangAlternates, hubPath, SPECIALTY_IDS, specialtyLabel, type Locale } from './seo.ts';
import { WEEKLY_MAX_CALL_MINUTES } from './weekly.ts';

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
  const money = (minor: number) => formatMoney(minor, 'eur', locale);
  const list = FIXED_PACKS.map((pack) => `${pack.minutes} min ${money(pack.amountCents)}`).join(', ');
  const free = FREE_CALL_SECONDS / 60;
  if (locale === 'es') {
    return `Callastral vende paquetes de minutos a precio fijo, pagados una sola vez, sin suscripción ni recarga automática: ${list}. La llamada se detiene sola cuando se agota el paquete. Una llamada de ${free} minutos es gratuita una sola vez.`;
  }
  if (locale === 'de') {
    return `Callastral verkauft Minutenpakete zum Festpreis, einmal bezahlt, ohne Abo und ohne automatische Aufladung: ${list}. Der Anruf endet von selbst, wenn das Paket aufgebraucht ist. Ein Anruf von ${free} Minuten ist einmalig kostenlos.`;
  }
  if (locale === 'it') {
    return `Callastral vende pacchetti di minuti a prezzo fisso, pagati una sola volta, senza abbonamento né ricarica automatica: ${list}. La chiamata si ferma da sola quando il pacchetto è esaurito. Una chiamata di ${free} minuti è gratuita una sola volta.`;
  }
  if (locale === 'en') {
    return `Callastral sells fixed-price minute packs, paid once, with no subscription and no auto top-up: ${list}. The call stops by itself when the pack is used up. A ${free}-minute call is free once.`;
  }
  return `Callastral vend des packs de minutes à prix fixe, payés une fois, sans abonnement ni recharge automatique : ${list}. L’appel s’arrête tout seul quand le pack est utilisé. Un appel de ${free} minutes est offert une fois.`;
}

const SECTIONS: Record<Locale, AboutSection[]> = {
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
  es: [
    {
      h2: '¿Qué es Callastral?',
      paragraphs: ['Callastral es un servicio de astrología por teléfono en el que hablas con consejeros virtuales, voces generadas por IA, que leen tu carta natal.', 'Callastral calcula la carta a partir de la fecha, la hora y el lugar de nacimiento, en el zodiaco tropical. El mismo cálculo se usa en la herramienta gratuita del ascendente y en la de compatibilidad de pareja.'],
    },
    {
      h2: '¿Quién está detrás de Callastral?',
      paragraphs: ['Callastral es el nombre del servicio. El editor, el identificador, la dirección, el director de la publicación y el correo de contacto figuran en el aviso legal cuando están completados. Callastral no inventa esos datos.', 'Callastral no tiene ninguna relación con Call Astro (callastro.com). El sitio está disponible en francés, inglés, español, alemán e italiano.'],
    },
    {
      h2: '¿Cuánto cuesta?',
      paragraphs: [priceLine('es')],
    },
    {
      h2: '¿Cómo funciona una llamada?',
      paragraphs: [`Callastral abre la llamada en el navegador. El consejero recibe el resumen de la carta natal y, si existen, los últimos resúmenes de llamadas. Una llamada dura como máximo ${WEEKLY_MAX_CALL_MINUTES} minutos. Puedes colgar en cualquier momento.`],
    },
    {
      h2: '¿El consejero se acuerda de mí?',
      paragraphs: ['Después de cada llamada, Callastral guarda un breve resumen: temas, preguntas y consejos. El resumen es visible en la cuenta y se entrega al mismo consejero al comienzo de la siguiente llamada. Callastral te permite leerlo y borrarlo desde la cuenta.'],
    },
    {
      h2: '¿Es una persona real?',
      paragraphs: [`Callastral no te conecta con una persona humana. Los consejeros son personajes virtuales. Al comienzo de cada llamada, el consejero dice: «${AI_ACT_SPOKEN.es}»`],
    },
    {
      h2: 'Límites',
      paragraphs: ['Callastral ofrece entretenimiento y reflexión personal. No es un consejo médico, jurídico ni financiero, ni una predicción segura. Para cuestiones de salud, derecho, dinero o en caso de angustia, contacta con un profesional cualificado o con los servicios de emergencia (112).'],
    },
  ],
  de: [
    {
      h2: 'Was ist Callastral?',
      paragraphs: ['Callastral ist ein telefonischer Astrologie-Dienst: Sie sprechen mit virtuellen Beratern, KI-generierten Stimmen, die Ihr Geburtshoroskop lesen.', 'Callastral berechnet das Horoskop aus Geburtsdatum, Geburtszeit und Geburtsort im tropischen Tierkreis. Dieselbe Berechnung nutzen der kostenlose Aszendent-Rechner und der Partner-Kompatibilitätstest.'],
    },
    {
      h2: 'Wer steht hinter Callastral?',
      paragraphs: ['Callastral ist der Name des Dienstes. Herausgeber, Kennung, Anschrift, verantwortliche Person und Kontakt-E-Mail stehen im Impressum, sobald sie hinterlegt sind. Callastral erfindet diese Angaben nicht.', 'Callastral hat keine Verbindung zu Call Astro (callastro.com). Die Website ist auf Französisch, Englisch, Spanisch, Deutsch und Italienisch verfügbar.'],
    },
    {
      h2: 'Was kostet es?',
      paragraphs: [priceLine('de')],
    },
    {
      h2: 'Wie läuft ein Anruf ab?',
      paragraphs: [`Callastral startet den Anruf im Browser. Der Berater erhält die Zusammenfassung des Geburtshoroskops und, falls vorhanden, die letzten Gesprächszusammenfassungen. Ein Anruf dauert höchstens ${WEEKLY_MAX_CALL_MINUTES} Minuten. Sie können jederzeit auflegen.`],
    },
    {
      h2: 'Erinnert sich der Berater an mich?',
      paragraphs: ['Nach jedem Anruf speichert Callastral eine kurze Zusammenfassung: Themen, Fragen und Ratschläge. Sie ist im Konto sichtbar und wird zu Beginn des nächsten Anrufs an denselben Berater übergeben. Im Konto können Sie sie lesen und löschen.'],
    },
    {
      h2: 'Ist das ein echter Mensch?',
      paragraphs: [`Callastral verbindet Sie nicht mit einem Menschen. Die Berater sind virtuelle Personas. Zu Beginn jedes Anrufs sagt der Berater: „${AI_ACT_SPOKEN.de}“`],
    },
    {
      h2: 'Grenzen',
      paragraphs: ['Callastral bietet Unterhaltung und persönliche Reflexion. Es ist keine medizinische, rechtliche oder finanzielle Beratung und keine sichere Vorhersage. Bei Fragen zu Gesundheit, Recht, Geld oder in einer Notlage wenden Sie sich an eine Fachperson oder den Notruf (112).'],
    },
  ],
  it: [
    {
      h2: 'Che cos’è Callastral?',
      paragraphs: ['Callastral è un servizio di astrologia al telefono in cui parli con consulenti virtuali, voci generate dall’IA, che leggono il tuo tema natale.', 'Callastral calcola il tema a partire da data, ora e luogo di nascita, nello zodiaco tropicale. Lo stesso calcolo alimenta lo strumento gratuito dell’ascendente e quello della compatibilità di coppia.'],
    },
    {
      h2: 'Chi c’è dietro Callastral?',
      paragraphs: ['Callastral è il nome del servizio. Editore, identificativo, indirizzo, direttore della pubblicazione ed e-mail di contatto compaiono nelle note legali quando sono compilati. Callastral non inventa questi dati.', 'Callastral non ha alcun legame con Call Astro (callastro.com). Il sito è disponibile in francese, inglese, spagnolo, tedesco e italiano.'],
    },
    {
      h2: 'Quanto costa?',
      paragraphs: [priceLine('it')],
    },
    {
      h2: 'Come funziona una chiamata?',
      paragraphs: [`Callastral apre la chiamata nel browser. Il consulente riceve il riassunto del tema natale e, se ci sono, gli ultimi riassunti delle chiamate. Una chiamata dura al massimo ${WEEKLY_MAX_CALL_MINUTES} minuti. Puoi riagganciare in qualsiasi momento.`],
    },
    {
      h2: 'Il consulente si ricorda di me?',
      paragraphs: ['Dopo ogni chiamata Callastral salva un breve riassunto: temi, domande e consigli. Il riassunto è visibile nell’account e viene passato allo stesso consulente all’inizio della chiamata successiva. Dall’account puoi leggerlo e cancellarlo.'],
    },
    {
      h2: 'È una persona vera?',
      paragraphs: [`Callastral non ti mette in contatto con una persona umana. I consulenti sono personaggi virtuali. All’inizio di ogni chiamata il consulente dice: «${AI_ACT_SPOKEN.it}»`],
    },
    {
      h2: 'Limiti',
      paragraphs: ['Callastral offre intrattenimento e riflessione personale. Non è un parere medico, legale o finanziario, né una previsione certa. Per questioni di salute, diritto, denaro o in caso di disagio, rivolgiti a un professionista qualificato o ai servizi di emergenza (112).'],
    },
  ],
};

function localizedSections(locale: Locale): AboutSection[] {
  return SECTIONS[locale];
}

const PARAGRAPHS: Record<Locale, string[]> = {
  fr: SECTIONS.fr.flatMap((section) => section.paragraphs),
  en: SECTIONS.en.flatMap((section) => section.paragraphs),
  es: SECTIONS.es.flatMap((section) => section.paragraphs),
  de: SECTIONS.de.flatMap((section) => section.paragraphs),
  it: SECTIONS.it.flatMap((section) => section.paragraphs),
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
