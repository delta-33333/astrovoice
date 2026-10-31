import { DateTime } from 'luxon';
import { BIG_THREE_PATHS, MOON_PATHS } from './free-tools.ts';
import { DAILY_HOROSCOPE_DATES } from './daily-horoscope-dates.ts';
import { SIGN_IDS, signBySlug, signName, signSlug, type SignId } from './zodiac/signs.ts';

/**
 * Horoscope du jour (EN + FR), une page par signe et par jour, réponse d’abord.
 * Ciel calculé chaque matin (08:00 Paris) avec la même éphéméride que /moon-sign-today
 * (scripts/daily-horoscope-sky.ts), textes rédigés dans content/daily-horoscope/<date>.json.
 */
export type DailyLocale = 'en' | 'fr';
export const DAILY_LOCALES: DailyLocale[] = ['en', 'fr'];
export const DAILY_ORIGIN = 'https://callastral.com';

export interface DailySkyBody {
  name: string;
  sign: string;
  degree: number;
  retrograde: boolean;
}

export interface DailyDay {
  date: string;
  sky: {
    date: string;
    computedAt: string;
    phase: { id: string; illumination: number; waxing: boolean };
    bodies: DailySkyBody[];
    ingresses: { name: string; from: string; to: string }[];
    aspects: { a: string; b: string; aspect: string; orb: number }[];
  };
  en: { summary: string; signs: Record<SignId, string> };
  fr: { summary: string; signs: Record<SignId, string> };
}

const BASE: Record<DailyLocale, string> = { en: '/en/daily-horoscope', fr: '/fr/horoscope-du-jour' };
export const DAILY_SEGMENT: Record<DailyLocale, string> = { en: 'daily-horoscope', fr: 'horoscope-du-jour' };

export const DAILY_LINKS: Record<DailyLocale, { chart: string; moon: string; chat: string; trial: string }> = {
  en: { chart: BIG_THREE_PATHS.en, moon: MOON_PATHS.en, chat: '/en/chat', trial: '/en/free-trial' },
  fr: { chart: BIG_THREE_PATHS.fr, moon: MOON_PATHS.fr, chat: '/fr/chat', trial: '/fr/essai' },
};

export function dailyDates(): string[] {
  return [...DAILY_HOROSCOPE_DATES].sort();
}

export function latestDailyDate(): string | null {
  const dates = dailyDates();
  return dates.length ? dates[dates.length - 1] : null;
}

export function isDailyDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && DAILY_HOROSCOPE_DATES.includes(value);
}

export function dailyHubPath(locale: DailyLocale, date?: string): string {
  return date ? `${BASE[locale]}/${date}` : BASE[locale];
}

export function dailySignPath(locale: DailyLocale, sign: SignId, date?: string): string {
  const slug = signSlug(locale, sign);
  return date ? `${BASE[locale]}/${date}/${slug}` : `${BASE[locale]}/${slug}`;
}

export function dailySignFromSlug(locale: DailyLocale, slug: string): SignId | null {
  return signBySlug(locale, slug);
}

/** Pages du dernier jour : la version datée pointe (canonical) vers la page « aujourd’hui ». */
export function dailyCanonical(locale: DailyLocale, date: string, sign?: SignId): string {
  const today = date === latestDailyDate();
  if (sign) return today ? dailySignPath(locale, sign) : dailySignPath(locale, sign, date);
  return today ? dailyHubPath(locale) : dailyHubPath(locale, date);
}

export function dailyAlternates(date: string, sign?: SignId): Record<string, string> {
  const fr = dailyCanonical('fr', date, sign);
  return { en: dailyCanonical('en', date, sign), fr, 'x-default': fr };
}

export function dailyDateLabel(locale: DailyLocale, date: string): string {
  return DateTime.fromISO(date, { zone: 'Europe/Paris' }).setLocale(locale === 'fr' ? 'fr' : 'en-GB').toFormat('cccc d LLLL yyyy');
}

export function dailySignName(locale: DailyLocale, sign: SignId): string {
  return signName(locale, sign);
}

export function firstSentence(text: string): string {
  const para = text.split('\n')[0].trim();
  const match = para.match(/^(.+?[.!?])(\s|$)/);
  return match ? match[1] : para;
}

const BODY_EN: Record<string, string> = {
  Soleil: 'Sun', Lune: 'Moon', Mercure: 'Mercury', 'Vénus': 'Venus', Mars: 'Mars', Jupiter: 'Jupiter',
  Saturne: 'Saturn', Uranus: 'Uranus', Neptune: 'Neptune', Pluton: 'Pluto', 'Nœud nord': 'North Node',
};
const SIGN_EN: Record<string, string> = {
  'Bélier': 'Aries', Taureau: 'Taurus', 'Gémeaux': 'Gemini', Cancer: 'Cancer', Lion: 'Leo', Vierge: 'Virgo',
  Balance: 'Libra', Scorpion: 'Scorpio', Sagittaire: 'Sagittarius', Capricorne: 'Capricorn', Verseau: 'Aquarius', Poissons: 'Pisces',
};

export function bodyLabel(locale: DailyLocale, name: string): string {
  return locale === 'fr' ? name : BODY_EN[name] ?? name;
}

export function skySignLabel(locale: DailyLocale, sign: string): string {
  return locale === 'fr' ? sign : SIGN_EN[sign] ?? sign;
}

export interface DailySitemapEntry {
  path: string;
  lastModified?: string;
  languages?: Record<string, string>;
}

/** Hub + 12 signes « aujourd’hui », puis les archives datées des jours précédents. */
export function dailySitemapEntries(): DailySitemapEntry[] {
  const latest = latestDailyDate();
  if (!latest) return [];
  const entries: DailySitemapEntry[] = [];
  for (const date of dailyDates()) {
    for (const locale of DAILY_LOCALES) {
      const languages = dailyAlternates(date);
      entries.push({ path: dailyCanonical(locale, date), lastModified: date, languages });
      for (const sign of SIGN_IDS) {
        entries.push({ path: dailyCanonical(locale, date, sign), lastModified: date, languages: dailyAlternates(date, sign) });
      }
    }
  }
  return entries;
}

export function dailyJsonLd(input: {
  locale: DailyLocale;
  url: string;
  headline: string;
  description: string;
  date: string;
  home: string;
  crumbs: { name: string; url: string }[];
  faqs: { question: string; answer: string }[];
}): Record<string, unknown> {
  const lang = input.locale === 'fr' ? 'fr-FR' : 'en';
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: input.home, item: `${DAILY_ORIGIN}/${input.locale}` },
          ...input.crumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 2, name: crumb.name, item: crumb.url })),
        ],
      },
      {
        '@type': 'Article',
        headline: input.headline,
        description: input.description,
        url: input.url,
        mainEntityOfPage: input.url,
        inLanguage: lang,
        datePublished: input.date,
        dateModified: input.date,
        author: { '@type': 'Organization', name: 'Callastral', url: DAILY_ORIGIN },
        publisher: { '@type': 'Organization', name: 'Callastral', url: DAILY_ORIGIN },
      },
      {
        '@type': 'FAQPage',
        inLanguage: lang,
        mainEntity: input.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}
