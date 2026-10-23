import { entriesFor, pageEntries, type SitemapEntry } from './sitemap-public.ts';
import { VIDEOS_PATH } from './videos.ts';

/**
 * Pages du sitemap « pages ». Les fiches conseillers (/xx/astrologue/<nom>…) sont en noindex
 * depuis le 23/10/2026 et ne figurent plus au sitemap ; le nom est gardé pour les appelants.
 */
export async function pageEntriesWithAdvisors(): Promise<SitemapEntry[]> {
  return pageEntries();
}

export async function indexablePaths(): Promise<string[]> {
  const paths = new Set<string>();
  for (const kind of ['signs', 'rising-signs', 'compatibility', 'horoscope'] as const) {
    for (const entry of entriesFor(kind)) paths.add(entry.path);
  }
  for (const entry of await pageEntriesWithAdvisors()) paths.add(entry.path);
  paths.add(VIDEOS_PATH);
  return [...paths];
}
