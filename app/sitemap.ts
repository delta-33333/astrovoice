import type { MetadataRoute } from 'next';
import { listPublicAdvisors } from '@/lib/astrologers';
import {
  LOCALES,
  SPECIALTY_IDS,
  advisorPath,
  hreflangAlternates,
  hubPath,
  localeHomePath,
  type Locale,
} from '@/lib/seo';
import { appBaseUrl } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

function absoluteLanguages(origin: string, pathFor: (locale: Locale) => string): Record<string, string> {
  const relative = hreflangAlternates(pathFor);
  return Object.fromEntries(Object.entries(relative).map(([key, value]) => [key, `${origin}${value}`]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = appBaseUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: `${origin}${localeHomePath(locale)}`,
      alternates: { languages: absoluteLanguages(origin, localeHomePath) },
    });
    for (const specialty of SPECIALTY_IDS) {
      entries.push({
        url: `${origin}${hubPath(locale, specialty)}`,
        alternates: { languages: absoluteLanguages(origin, (item) => hubPath(item, specialty)) },
      });
    }
  }

  try {
    const { advisors } = await listPublicAdvisors();
    for (const advisor of advisors) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${origin}${advisorPath(locale, advisor.slug)}`,
          alternates: { languages: absoluteLanguages(origin, (item) => advisorPath(item, advisor.slug)) },
        });
      }
    }
  } catch (error) {
    console.warn('sitemap conseillers:', error instanceof Error ? error.message : error);
  }

  return entries;
}
