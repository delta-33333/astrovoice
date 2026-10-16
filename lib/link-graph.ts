import { aboutHubLinks, aboutLegalLinks, aboutPath } from './about.ts';
import { COMPETITORS, HUB_PATHS } from './alternatives.ts';
import { AVIS_PATH } from './avis-callastral.ts';
import { ascendantPath } from './ascendant-tool.ts';
import { GEO_PATHS } from './geo-pages.ts';
import {
  calculatorHubLinks,
  footerLinks,
  horoscopeTextLinks,
  inlineHrefs,
  risingResultLinks,
  stripHash,
  type TextLink,
} from './internal-links.ts';
import { privacyPath } from './privacy-copy.ts';
import { LOCALES, hubPath, localeHomePath, SPECIALTY_IDS, type Locale } from './seo.ts';
import { VIDEOS_PATH } from './videos.ts';
import { articlesFor } from './zodiac/articles.ts';
import { SIGN_IDS, signPath, weekPath } from './zodiac/signs.ts';

export type Placement = 'text' | 'nav';

export interface LinkEdge {
  from: string;
  to: string;
  label: string;
  placement: Placement;
}

export interface LinkGraph {
  pages: string[];
  edges: LinkEdge[];
}

function edge(edges: LinkEdge[], from: string, to: string, label: string, placement: Placement) {
  const target = stripHash(to);
  if (!target || target === from) return;
  edges.push({ from, to: target, label, placement });
}

function addLinks(edges: LinkEdge[], from: string, links: TextLink[], placement: Placement) {
  for (const link of links) edge(edges, from, link.href, link.label, placement);
}

export function buildLinkGraph(): LinkGraph {
  const pages = new Set<string>();
  const edges: LinkEdge[] = [];
  const track = (path: string) => pages.add(stripHash(path));

  for (const locale of LOCALES) {
    track(localeHomePath(locale));
    track(ascendantPath(locale));
    track(privacyPath(locale));
    track(aboutPath(locale));
    track(weekPath(locale));
    for (const id of SPECIALTY_IDS) track(hubPath(locale, id));
    for (const id of SIGN_IDS) track(signPath(locale, id));
  }
  track(AVIS_PATH);
  track(VIDEOS_PATH);
  track('/cgu');
  track('/terms');
  track('/faq');
  track('/offres');
  for (const locale of ['fr', 'en'] as const) {
    track(HUB_PATHS[locale]);
    track(GEO_PATHS.prices[locale]);
    track(GEO_PATHS.compare[locale]);
  }
  for (const page of COMPETITORS) track(page.path);

  for (const locale of LOCALES) {
    const home = localeHomePath(locale);
    for (const id of SPECIALTY_IDS) edge(edges, home, hubPath(locale, id), id, 'text');
    for (const id of SIGN_IDS) edge(edges, home, signPath(locale, id), id, 'text');
    edge(edges, home, ascendantPath(locale), 'calculator', 'text');
    edge(edges, home, aboutPath(locale), 'about', 'text');
    if (locale === 'fr') edge(edges, home, AVIS_PATH, 'avis Callastral', 'text');
    const geo = locale === 'fr' ? 'fr' : 'en';
    edge(edges, home, GEO_PATHS.prices[geo], 'prices', 'text');
    edge(edges, home, GEO_PATHS.compare[geo], 'compare', 'text');
    edge(edges, home, HUB_PATHS[geo], 'alternatives', 'text');

    for (const article of articlesFor(locale)) {
      track(article.path);
      const paragraphs = article.sections.flatMap((section) => section.inline ?? []);
      addLinks(edges, article.path, inlineHrefs(paragraphs), 'text');
      for (const section of article.sections) {
        for (const link of section.links ?? []) edge(edges, article.path, link.href, link.label, 'nav');
      }
    }

    addLinks(edges, weekPath(locale), horoscopeTextLinks(locale), 'text');
    addLinks(edges, ascendantPath(locale), Object.values(risingResultLinks(locale)), 'text');
    addLinks(edges, ascendantPath(locale), calculatorHubLinks(locale), 'text');
    edge(edges, ascendantPath(locale), '/offres', 'offres', 'text');
    if (locale === 'fr') edge(edges, ascendantPath(locale), AVIS_PATH, 'avis Callastral', 'text');

    addLinks(edges, aboutPath(locale), aboutLegalLinks(locale), 'text');
    addLinks(edges, aboutPath(locale), aboutHubLinks(locale), 'text');
  }

  edge(edges, AVIS_PATH, ascendantPath('fr'), 'calcul d’ascendant gratuit', 'text');

  for (const page of COMPETITORS) {
    edge(edges, page.path, ascendantPath(page.market), 'calculator', 'text');
    edge(edges, page.path, HUB_PATHS[page.market], 'hub', 'nav');
    edge(edges, page.path, localeHomePath(page.market), 'home', 'nav');
  }
  for (const locale of ['fr', 'en'] as const) {
    edge(edges, HUB_PATHS[locale], ascendantPath(locale), 'calculator', 'text');
    for (const page of COMPETITORS) edge(edges, HUB_PATHS[locale], page.path, page.h1, 'nav');
  }

  for (const path of pages) {
    const locale = LOCALES.find((item) => path === `/${item}` || path.startsWith(`/${item}/`));
    if (!locale) continue;
    addLinks(edges, path, footerLinks(locale), 'nav');
    edge(edges, path, localeHomePath(locale), 'home', 'nav');
  }

  return { pages: [...pages].sort(), edges };
}

let cached: LinkGraph | null = null;

export function linkGraph(): LinkGraph {
  if (!cached) cached = buildLinkGraph();
  return cached;
}

export interface InboundStats {
  path: string;
  text: number;
  nav: number;
  total: number;
  textSources: number;
}

export function inboundStats(graph = linkGraph()): InboundStats[] {
  return graph.pages.map((path) => {
    const incoming = graph.edges.filter((item) => item.to === path);
    const textEdges = incoming.filter((item) => item.placement === 'text');
    return {
      path,
      text: textEdges.length,
      nav: incoming.length - textEdges.length,
      total: incoming.length,
      textSources: new Set(textEdges.map((item) => item.from)).size,
    };
  });
}

export function linkReport(graph = linkGraph()) {
  const rows = inboundStats(graph);
  const orphans = rows.filter((row) => row.total === 0).map((row) => row.path);
  const underThree = rows.filter((row) => row.total < 3).map((row) => row.path);
  return {
    pages: rows.length,
    edges: graph.edges.length,
    textEdges: graph.edges.filter((item) => item.placement === 'text').length,
    orphans,
    underThree,
  };
}
