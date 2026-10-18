import { aboutAlternates, aboutPath } from './about.ts';
import { ALT_CHECKED_ISO, COMPETITORS, HUB_PATHS, hubAlternates } from './alternatives.ts';
import { AVIS_PATH } from './avis-callastral.ts';
import { ascendantPath } from './ascendant-tool.ts';
import { coupleAlternates, couplePath } from './couple-compat.ts';
import { GEO_PATHS, GEO_UPDATED_ISO, geoAlternates, type GeoPage } from './geo-pages.ts';
import { factsAlternates, factsPath } from './facts.ts';
import { legalNoticeAlternates, legalNoticePath } from './legal-notice.ts';
import { privacyPath } from './privacy-copy.ts';
import {
  LOCALES,
  SPECIALTY_IDS,
  hreflangAlternates,
  hubPath,
  localeHomePath,
  type Locale,
} from './seo.ts';
import { isThinPath, publishedAlternates } from './thin-content.ts';
import { clusterSitemap } from './zodiac/articles.ts';
import { risingPath, signPath, weekPath, SIGN_IDS, type SignId } from './zodiac/signs.ts';

export type SitemapKind = 'pages' | 'signs' | 'rising-signs' | 'compatibility' | 'horoscope';

export const SITEMAP_KINDS: SitemapKind[] = ['pages', 'signs', 'rising-signs', 'compatibility', 'horoscope'];

export interface SitemapEntry {
  path: string;
  lastModified?: string;
  languages?: Record<string, string>;
}

function selfLanguages(locale: string, path: string): Record<string, string> {
  return { [locale]: path, 'x-default': path };
}

export function pageEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  for (const locale of LOCALES) {
    entries.push({
      path: localeHomePath(locale),
      languages: hreflangAlternates(localeHomePath),
    });
    for (const specialty of SPECIALTY_IDS) {
      entries.push({
        path: hubPath(locale, specialty),
        languages: hreflangAlternates((item) => hubPath(item, specialty)),
      });
    }
    entries.push({
      path: ascendantPath(locale),
      lastModified: '2026-10-08',
      languages: hreflangAlternates(ascendantPath),
    });
    entries.push({
      path: couplePath(locale),
      lastModified: '2026-10-17',
      languages: coupleAlternates(),
    });
    entries.push({
      path: privacyPath(locale),
      languages: hreflangAlternates(privacyPath),
    });
    entries.push({
      path: legalNoticePath(locale),
      lastModified: '2026-10-18',
      languages: legalNoticeAlternates(),
    });
    entries.push({
      path: factsPath(locale),
      lastModified: '2026-10-18',
      languages: factsAlternates(),
    });
    entries.push({
      path: aboutPath(locale),
      lastModified: '2026-10-16',
      languages: aboutAlternates(),
    });
  }
  for (const locale of ['fr', 'en'] as const) {
    entries.push({
      path: HUB_PATHS[locale],
      lastModified: ALT_CHECKED_ISO,
      languages: hubAlternates(),
    });
  }
  for (const page of COMPETITORS) {
    entries.push({
      path: page.path,
      lastModified: ALT_CHECKED_ISO,
      languages: selfLanguages(page.market, page.path),
    });
  }
  entries.push({
    path: AVIS_PATH,
    lastModified: '2026-10-13',
    languages: selfLanguages('fr', AVIS_PATH),
  });
  for (const page of Object.keys(GEO_PATHS) as GeoPage[]) {
    if (page === 'about') continue;
    const languages = geoAlternates(page);
    for (const locale of ['fr', 'en'] as const) {
      entries.push({
        path: GEO_PATHS[page][locale],
        lastModified: GEO_UPDATED_ISO,
        languages,
      });
    }
  }
  for (const path of ['/cgu', '/terms', '/faq', '/offres']) {
    entries.push({ path, languages: selfLanguages('fr', path) });
  }
  return entries;
}

function clusterKind(path: string): SitemapKind {
  if (path === weekPath('fr')) return 'horoscope';
  if (SIGN_IDS.some((id: SignId) => signPath('fr', id) === path)) return 'signs';
  if (SIGN_IDS.some((id: SignId) => risingPath('fr', id) === path)) return 'rising-signs';
  return 'compatibility';
}

export function clusterEntries(kind: Exclude<SitemapKind, 'pages'>): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  for (const cluster of clusterSitemap()) {
    if (clusterKind(cluster.paths.fr) !== kind) continue;
    for (const locale of LOCALES) {
      const path = cluster.paths[locale];
      if (isThinPath(path)) continue;
      entries.push({
        path,
        lastModified: '2026-10-13',
        languages: publishedAlternates(locale, path, cluster.languages),
      });
    }
  }
  return entries;
}

export function entriesFor(kind: SitemapKind): SitemapEntry[] {
  if (kind === 'pages') return pageEntries();
  return clusterEntries(kind);
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderUrlset(origin: string, entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const loc = `${origin}${entry.path}`;
    const links = entry.languages
      ? Object.entries(entry.languages)
        .map(([lang, path]) => `    <xhtml:link rel="alternate" hreflang="${xmlEscape(lang)}" href="${xmlEscape(`${origin}${path}`)}" />`)
        .join('\n')
      : '';
    const last = entry.lastModified ? `\n    <lastmod>${entry.lastModified}</lastmod>` : '';
    return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${last}${links ? `\n${links}` : ''}\n  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

export function sitemapIndexPaths(): string[] {
  const kinds = SITEMAP_KINDS.filter((kind) => entriesFor(kind).length > 0);
  return [
    ...kinds.map((kind) => `/sitemaps/${kind}.xml`),
    '/video-sitemap.xml',
  ];
}

export function renderSitemapIndex(origin: string): string {
  const body = sitemapIndexPaths()
    .map((path) => `  <sitemap>\n    <loc>${xmlEscape(`${origin}${path}`)}</loc>\n  </sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}
