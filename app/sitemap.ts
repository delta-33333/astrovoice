import type { MetadataRoute } from 'next';
import { listPublicAdvisors } from '@/lib/astrologers';
import {
  LOCALES,
  SPECIALTY_IDS,
  advisorAlternates,
  advisorPath,
  hreflangAlternates,
  hubPath,
  indexableAdvisorLocales,
  localeHomePath,
  type Locale,
} from '@/lib/seo';
import { ASCENDANT_PATH } from '@/lib/ascendant-tool';
import { GEO_PATHS, GEO_UPDATED_ISO, geoAlternates, type GeoPage } from '@/lib/geo-pages';
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

  entries.push({
    url: `${origin}${ASCENDANT_PATH}`,
    lastModified: '2026-10-08',
  });

  for (const page of Object.keys(GEO_PATHS) as GeoPage[]) {
    const languages = Object.fromEntries(
      Object.entries(geoAlternates(page)).map(([key, value]) => [key, `${origin}${value}`])
    );
    for (const locale of ['fr', 'en'] as const) {
      entries.push({
        url: `${origin}${GEO_PATHS[page][locale]}`,
        lastModified: GEO_UPDATED_ISO,
        alternates: { languages },
      });
    }
  }

  try {
    const { advisors } = await listPublicAdvisors();
    for (const advisor of advisors) {
      const locales = indexableAdvisorLocales(advisor.languages);
      const alternates = Object.fromEntries(
        Object.entries(advisorAlternates(advisor.slug, advisor.languages)).map(([key, value]) => [key, `${origin}${value}`])
      );
      for (const locale of locales) {
        entries.push({
          url: `${origin}${advisorPath(locale, advisor.slug)}`,
          alternates: { languages: alternates },
        });
      }
    }
  } catch (error) {
    console.warn('sitemap conseillers:', error instanceof Error ? error.message : error);
  }

  return entries;
}
