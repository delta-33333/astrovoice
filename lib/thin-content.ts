import type { Locale } from './seo.ts';
import { LOCALES } from './seo.ts';
import { horoscopeModel } from './weekly-sky.ts';
import { articlesFor, type ArticleModel } from './zodiac/articles.ts';
import { weekPath } from './zodiac/signs.ts';

/** Moins de 80 mots distincts : page trop courte pour l’index. */
export const THIN_MIN_UNIQUE_WORDS = 80;
/** Jaccard des shingles de 5 mots au-dessus de 0,5 : trop proche d’une sœur. */
export const THIN_MAX_JACCARD = 0.5;
export const SHINGLE_SIZE = 5;

export type ProgrammaticKind = 'sign' | 'rising' | 'compat' | 'horoscope';

export interface ThinRow {
  path: string;
  locale: Locale;
  kind: ProgrammaticKind;
  uniqueWords: number;
  maxJaccard: number;
  nearest: string | null;
  noindex: boolean;
}

export interface ThinReport {
  rows: ThinRow[];
  total: number;
  noindex: number;
  indexable: number;
  byKind: Record<ProgrammaticKind, { total: number; noindex: number }>;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .match(/[a-z0-9']+/g) ?? [];
}

export function uniqueWordCount(text: string): number {
  return new Set(tokenize(text)).size;
}

export function shingles(text: string, size = SHINGLE_SIZE): Set<string> {
  const words = tokenize(text);
  const set = new Set<string>();
  for (let i = 0; i <= words.length - size; i += 1) set.add(words.slice(i, i + size).join(' '));
  return set;
}

export function jaccard(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 && right.size === 0) return 1;
  if (left.size === 0 || right.size === 0) return 0;
  let inter = 0;
  const [small, large] = left.size < right.size ? [left, right] : [right, left];
  for (const item of small) if (large.has(item)) inter += 1;
  const union = left.size + right.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function isThinMetrics(uniqueWords: number, maxJaccard: number): boolean {
  return uniqueWords < THIN_MIN_UNIQUE_WORDS || maxJaccard > THIN_MAX_JACCARD;
}

function kindOf(article: ArticleModel): ProgrammaticKind {
  return article.kind;
}

function rowsFor(texts: Array<{ path: string; locale: Locale; kind: ProgrammaticKind; text: string }>): ThinRow[] {
  const groups = new Map<string, number[]>();
  texts.forEach((row, index) => {
    const key = `${row.kind}:${row.locale}`;
    const list = groups.get(key) ?? [];
    list.push(index);
    groups.set(key, list);
  });
  const sets = texts.map((row) => shingles(row.text));
  return texts.map((row, index) => {
    const siblings = (groups.get(`${row.kind}:${row.locale}`) ?? []).filter((item) => item !== index);
    let maxJaccard = 0;
    let nearest: string | null = null;
    for (const other of siblings) {
      const score = jaccard(sets[index], sets[other]);
      if (score > maxJaccard) {
        maxJaccard = score;
        nearest = texts[other].path;
      }
    }
    const uniqueWords = uniqueWordCount(row.text);
    return {
      path: row.path,
      locale: row.locale,
      kind: row.kind,
      uniqueWords,
      maxJaccard,
      nearest,
      noindex: isThinMetrics(uniqueWords, maxJaccard),
    };
  });
}

export function assessProgrammatic(now = new Date()): ThinReport {
  const texts: Array<{ path: string; locale: Locale; kind: ProgrammaticKind; text: string }> = [];
  for (const locale of LOCALES) {
    for (const article of articlesFor(locale)) {
      texts.push({ path: article.path, locale, kind: kindOf(article), text: article.prose });
    }
    const week = horoscopeModel(locale, now);
    texts.push({ path: week.path, locale, kind: 'horoscope', text: week.prose });
  }
  // Une seule page d’horoscope par langue : les sœurs sont les autres langues.
  const base = rowsFor(texts.filter((row) => row.kind !== 'horoscope'));
  const horoTexts = texts.filter((row) => row.kind === 'horoscope');
  const horoSets = horoTexts.map((row) => shingles(row.text));
  const horoRows: ThinRow[] = horoTexts.map((row, index) => {
    let maxJaccard = 0;
    let nearest: string | null = null;
    for (let other = 0; other < horoTexts.length; other += 1) {
      if (other === index) continue;
      const score = jaccard(horoSets[index], horoSets[other]);
      if (score > maxJaccard) {
        maxJaccard = score;
        nearest = horoTexts[other].path;
      }
    }
    const uniqueWords = uniqueWordCount(row.text);
    return {
      path: row.path,
      locale: row.locale,
      kind: 'horoscope',
      uniqueWords,
      maxJaccard,
      nearest,
      noindex: isThinMetrics(uniqueWords, maxJaccard),
    };
  });
  const rows = [...base, ...horoRows];
  const byKind: ThinReport['byKind'] = {
    sign: { total: 0, noindex: 0 },
    rising: { total: 0, noindex: 0 },
    compat: { total: 0, noindex: 0 },
    horoscope: { total: 0, noindex: 0 },
  };
  for (const row of rows) {
    byKind[row.kind].total += 1;
    if (row.noindex) byKind[row.kind].noindex += 1;
  }
  const noindex = rows.filter((row) => row.noindex).length;
  return { rows, total: rows.length, noindex, indexable: rows.length - noindex, byKind };
}

let cached: ThinReport | null = null;

export function thinReport(): ThinReport {
  if (!cached) cached = assessProgrammatic(new Date());
  return cached;
}

export function isThinPath(path: string): boolean {
  return thinReport().rows.some((row) => row.path === path && row.noindex);
}

/** hreflang publié : les pages noindex ne restent pas dans le groupe des pages indexables. */
export function publishedAlternates(locale: Locale, path: string, alternates: Record<string, string>): Record<string, string> {
  if (isThinPath(path)) return { [locale]: path, 'x-default': path };
  const published: Record<string, string> = {};
  for (const item of LOCALES) {
    const href = alternates[item];
    if (href && !isThinPath(href)) published[item] = href;
  }
  if (!published[locale]) published[locale] = path;
  const fallback = LOCALES.map((item) => published[item]).find((href): href is string => Boolean(href)) ?? path;
  published['x-default'] = published.fr ?? fallback;
  return published;
}

export function horoscopePaths(): Record<Locale, string> {
  return {
    fr: weekPath('fr'),
    en: weekPath('en'),
    es: weekPath('es'),
    de: weekPath('de'),
    it: weekPath('it'),
  };
}
