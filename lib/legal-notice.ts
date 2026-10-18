import { hreflangAlternates, type Locale } from './seo.ts';
import { AI_ACT_LINE, VIRTUAL_ADVISOR_DISCLOSURE } from './legal.ts';

export const LEGAL_NOTICE_PATHS: Record<Locale, string> = {
  fr: '/fr/mentions-legales',
  en: '/en/legal-notice',
  es: '/es/aviso-legal',
  de: '/de/impressum',
  it: '/it/note-legali',
};

export function legalNoticePath(locale: Locale): string {
  return LEGAL_NOTICE_PATHS[locale];
}

export function legalNoticeAlternates(): Record<string, string> {
  return hreflangAlternates(legalNoticePath);
}

const COPY: Record<Locale, {
  title: string;
  description: string;
  h1: string;
  publisher: string;
  director: string;
  contact: string;
  hostTitle: string;
  host: string;
  aiTitle: string;
}> = {
  fr: {
    title: 'Mentions légales',
    description: 'Éditeur, directeur de la publication, hébergeur et mention d’intelligence artificielle de Callastral.',
    h1: 'Mentions légales',
    publisher: 'Éditeur',
    director: 'Directeur de la publication',
    contact: 'Contact',
    hostTitle: 'Hébergeur',
    host: 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.',
    aiTitle: 'Intelligence artificielle',
  },
  en: {
    title: 'Legal notice',
    description: 'Publisher, publication director, host and AI disclosure for Callastral.',
    h1: 'Legal notice',
    publisher: 'Publisher',
    director: 'Publication director',
    contact: 'Contact',
    hostTitle: 'Host',
    host: 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.',
    aiTitle: 'Artificial intelligence',
  },
  es: {
    title: 'Aviso legal',
    description: 'Editor, director de la publicación, alojamiento y mención de inteligencia artificial de Callastral.',
    h1: 'Aviso legal',
    publisher: 'Editor',
    director: 'Director de la publicación',
    contact: 'Contacto',
    hostTitle: 'Alojamiento',
    host: 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.',
    aiTitle: 'Inteligencia artificial',
  },
  de: {
    title: 'Impressum',
    description: 'Anbieter, Verantwortlicher, Host und KI-Hinweis von Callastral.',
    h1: 'Impressum',
    publisher: 'Anbieter',
    director: 'Verantwortlich für den Inhalt',
    contact: 'Kontakt',
    hostTitle: 'Host',
    host: 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.',
    aiTitle: 'Künstliche Intelligenz',
  },
  it: {
    title: 'Note legali',
    description: 'Editore, direttore della pubblicazione, host e informativa sull’IA di Callastral.',
    h1: 'Note legali',
    publisher: 'Editore',
    director: 'Direttore della pubblicazione',
    contact: 'Contatto',
    hostTitle: 'Host',
    host: 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.',
    aiTitle: 'Intelligenza artificiale',
  },
};

export function legalNoticeCopy(locale: Locale) {
  const copy = COPY[locale];
  return {
    ...copy,
    disclosure: VIRTUAL_ADVISOR_DISCLOSURE,
    aiLine: AI_ACT_LINE[locale],
  };
}
