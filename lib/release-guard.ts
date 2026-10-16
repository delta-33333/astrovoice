import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aboutCopy, aboutJsonLd } from './about.ts';
import { getCopy } from './ascendant-copy.ts';
import { ascendantJsonLd, ascendantPath } from './ascendant-tool.ts';
import { alternativeJsonLd, COMPETITORS } from './alternatives.ts';
import {
  AVIS_CAUTIONS,
  AVIS_DESCRIPTION,
  AVIS_EDITORIAL,
  AVIS_FAQS,
  AVIS_STRENGTHS,
  AVIS_TITLE,
  avisJsonLd,
} from './avis-callastral.ts';
import { organizationGraph } from './seo.ts';
import { tokenize } from './thin-content.ts';
import { horoscopeModel } from './weekly-sky.ts';
import {
  articleJsonLd,
  compatArticleModel,
  risingArticleModel,
  signArticleModel,
  type ArticleModel,
} from './zodiac/articles.ts';

export const RELEASE_GUARD_AT = '2026-01-07T12:00:00.000Z';

export interface ReleaseSample {
  id: string;
  words: number;
  jsonLdTypes: string[];
  tables: number;
}

function wordsOf(text: string): number {
  return tokenize(text).length;
}

export function jsonLdTypes(data: unknown): string[] {
  const out = new Set<string>();
  const walk = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    const record = value as Record<string, unknown>;
    const type = record['@type'];
    if (typeof type === 'string') out.add(type);
    else if (Array.isArray(type)) {
      for (const item of type) if (typeof item === 'string') out.add(item);
    }
    for (const child of Object.values(record)) walk(child);
  };
  walk(data);
  return [...out].sort();
}

function tablesIn(relative: string): number {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', relative);
  const source = fs.readFileSync(file, 'utf8');
  return (source.match(/<table[\s>]/g) ?? []).length;
}

function articleWords(article: ArticleModel): number {
  const inline = article.sections.flatMap((section) => section.inline ?? []).flat().map((part) => part.text);
  const chips = article.sections.flatMap((section) => section.links ?? []).map((link) => link.label);
  const headings = article.sections.map((section) => section.h2);
  return wordsOf([article.h1, article.prose, ...headings, ...inline, ...chips].join(' '));
}

export function releaseSamples(now = new Date(RELEASE_GUARD_AT)): ReleaseSample[] {
  const origin = 'https://callastral.com';
  const sign = signArticleModel('fr', 'belier');
  const rising = risingArticleModel('fr', 'belier');
  const compat = compatArticleModel('fr', 'belier', 'taureau');
  const week = horoscopeModel('fr', now);
  const about = aboutCopy('fr');
  const tool = getCopy('fr');
  const rival = COMPETITORS.find((page) => page.market === 'fr' && page.id === 'voyance-fr') ?? COMPETITORS[0];
  const toolLd = ascendantJsonLd({
    origin,
    locale: 'fr',
    path: ascendantPath('fr'),
    h1: tool.h1,
    description: tool.description,
    homeLabel: tool.home,
    faqs: tool.faqs,
  });
  return [
    {
      id: 'sign-fr-belier',
      words: articleWords(sign),
      jsonLdTypes: jsonLdTypes(articleJsonLd(origin, sign)),
      tables: tablesIn('components/OrganicArticle.tsx'),
    },
    {
      id: 'rising-fr-belier',
      words: articleWords(rising),
      jsonLdTypes: jsonLdTypes(articleJsonLd(origin, rising)),
      tables: tablesIn('components/OrganicArticle.tsx'),
    },
    {
      id: 'compat-fr-belier-taureau',
      words: articleWords(compat),
      jsonLdTypes: jsonLdTypes(articleJsonLd(origin, compat)),
      tables: tablesIn('components/OrganicArticle.tsx'),
    },
    {
      id: 'horoscope-fr',
      words: wordsOf([
        week.h1,
        week.entertainment,
        week.method,
        week.prose,
        ...week.skyParagraphs,
        ...week.sections.flatMap((section) => [section.h2, ...section.paragraphs]),
      ].join(' ')),
      jsonLdTypes: jsonLdTypes(articleJsonLd(origin, week)),
      tables: tablesIn('components/OrganicArticle.tsx'),
    },
    {
      id: 'avis',
      words: wordsOf([
        AVIS_TITLE,
        AVIS_DESCRIPTION,
        AVIS_EDITORIAL,
        ...AVIS_STRENGTHS,
        ...AVIS_CAUTIONS,
        ...AVIS_FAQS.flatMap((item) => [item.question, item.answer]),
      ].join(' ')),
      jsonLdTypes: jsonLdTypes(avisJsonLd(origin)),
      tables: tablesIn('app/[locale]/avis-callastral/page.tsx'),
    },
    {
      id: 'about-fr',
      words: wordsOf([about.h1, about.description, ...about.paragraphs, about.labelLine, about.spokenLine].join(' ')),
      jsonLdTypes: jsonLdTypes(aboutJsonLd(origin, 'fr')),
      tables: tablesIn('components/AboutService.tsx'),
    },
    {
      id: 'calculator-fr',
      words: wordsOf([
        tool.h1,
        tool.description,
        tool.intro,
        tool.advisorsIntro,
        ...tool.method,
        ...tool.faqs.flatMap((item) => [item.question, item.answer]),
        ...Object.values(tool.signs).flatMap((signCopy) => [signCopy.name, signCopy.reading]),
      ].join(' ')),
      jsonLdTypes: jsonLdTypes(toolLd),
      tables: tablesIn('components/AscendantToolScreen.tsx') + tablesIn('components/AscendantCalculator.tsx'),
    },
    {
      id: 'alternative-voyance-fr',
      words: wordsOf([
        rival.h1,
        rival.description,
        rival.advisors,
        rival.price,
        rival.welcome,
        rival.availability,
        rival.format,
        rival.freeTools,
        ...rival.whenChoose,
        ...rival.faqs.flatMap((item) => [item.question, item.answer]),
      ].join(' ')),
      jsonLdTypes: jsonLdTypes(alternativeJsonLd(origin, rival.market, rival)),
      tables: tablesIn('components/AlternativePage.tsx'),
    },
    {
      id: 'organization',
      words: wordsOf(String((organizationGraph(origin)[0] as { description?: string }).description ?? '')),
      jsonLdTypes: jsonLdTypes(organizationGraph(origin)),
      tables: 0,
    },
  ];
}
