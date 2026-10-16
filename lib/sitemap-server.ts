import { listPublicAdvisors } from './astrologers.ts';
import { advisorAlternates, advisorPath, indexableAdvisorLocales } from './seo.ts';
import { entriesFor, pageEntries, type SitemapEntry } from './sitemap-public.ts';
import { VIDEOS_PATH } from './videos.ts';

export async function pageEntriesWithAdvisors(): Promise<SitemapEntry[]> {
  const entries = pageEntries();
  try {
    const { advisors } = await listPublicAdvisors();
    for (const advisor of advisors) {
      const locales = indexableAdvisorLocales(advisor.languages);
      const languages = advisorAlternates(advisor.slug, advisor.languages);
      for (const locale of locales) {
        entries.push({ path: advisorPath(locale, advisor.slug), languages });
      }
    }
  } catch (error) {
    console.warn('sitemap conseillers:', error instanceof Error ? error.message : error);
  }
  return entries;
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
