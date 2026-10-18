import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { aboutCopy, aboutJsonLd, aboutLegalLinks, aboutMeta, aboutPath, ABOUT_PATHS } from '../lib/about.ts';
import { ascendantJsonLd, ascendantPath } from '../lib/ascendant-tool.ts';
import { getCopy } from '../lib/ascendant-copy.ts';
import { avisJsonLd } from '../lib/avis-callastral.ts';
import { AI_ACT_LINE, AI_ACT_SPOKEN } from '../lib/legal.ts';
import { privacyPath } from '../lib/privacy-copy.ts';
import { LOCALES, organizationGraph } from '../lib/seo.ts';
import { entriesFor, renderSitemapIndex, sitemapIndexPaths, SITEMAP_KINDS } from '../lib/sitemap-public.ts';
import { articleJsonLd, signArticleModel } from '../lib/zodiac/articles.ts';

const BANNED = ['AggregateRating', 'aggregateRating', '"@type":"Review"', '"@type": "Review"', '"@type":"Person"', '"@type": "Person"', '"@type":"Author"', '"@type": "Author"'];

function types(data: Record<string, unknown>): string[] {
  const graph = (data['@graph'] as Array<Record<string, unknown>> | undefined) ?? [data];
  return graph.map((node) => String(node['@type']));
}

test('à propos localisé, sans personne inventée, avec confidentialité et mentions légales', () => {
  assert.deepEqual(ABOUT_PATHS, {
    fr: '/fr/a-propos',
    en: '/en/about',
    es: '/es/acerca',
    de: '/de/ueber-uns',
    it: '/it/chi-siamo',
  });
  for (const locale of LOCALES) {
    const copy = aboutCopy(locale);
    assert.equal(copy.labelLine, AI_ACT_LINE[locale]);
    assert.equal(copy.spokenLine, AI_ACT_SPOKEN[locale]);
    assert.equal(aboutMeta(locale).alternates.canonical, aboutPath(locale));
    assert.equal(aboutMeta(locale).alternates.languages['x-default'], aboutPath('fr'));
    assert.equal(aboutMeta(locale).alternates.languages[locale], aboutPath(locale));
    const legal = aboutLegalLinks(locale).map((link) => link.href);
    assert.ok(legal.includes(privacyPath(locale)));
    assert.ok(legal.includes('/cgu'));
    assert.ok(legal.includes('/terms'));
    const data = aboutJsonLd('https://callastral.com', locale);
    const serialized = JSON.stringify(data);
    for (const token of BANNED) assert.equal(serialized.includes(token), false, `${locale} ${token}`);
    assert.ok(types(data).includes('BreadcrumbList'));
    assert.ok(types(data).includes('AboutPage'));
    const page = fs.readFileSync(new URL(`../app/[locale]/${aboutPath(locale).split('/').pop()}/page.tsx`, import.meta.url), 'utf8');
    assert.equal(page.includes('AboutService'), true, locale);
  }
  const oldFr = fs.readFileSync(new URL('../app/a-propos/page.tsx', import.meta.url), 'utf8');
  const oldEn = fs.readFileSync(new URL('../app/about/page.tsx', import.meta.url), 'utf8');
  const config = fs.readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');
  assert.match(oldFr, /permanentRedirect\('\/fr\/a-propos'\)/);
  assert.match(oldEn, /permanentRedirect\('\/en\/about'\)/);
  assert.match(config, /source: '\/a-propos', destination: '\/fr\/a-propos', permanent: true/);
  assert.match(config, /source: '\/about', destination: '\/en\/about', permanent: true/);
  const geo = fs.readFileSync(new URL('../components/GeoAboutPage.tsx', import.meta.url), 'utf8');
  assert.equal(geo.includes('Julien'), false);
  assert.equal(geo.includes('founder'), false);
  assert.equal(geo.includes('Person'), false);
});

test('Organization sur le site, WebApplication et BreadcrumbList, FAQ seulement si le texte est là', () => {
  const org = organizationGraph('https://callastral.com');
  assert.equal(org.some((node) => node['@type'] === 'Organization'), true);
  assert.equal(org.some((node) => node['@type'] === 'WebSite'), true);
  const orgJson = JSON.stringify(org);
  for (const token of BANNED) assert.equal(orgJson.includes(token), false, token);
  assert.match(orgJson, /AI_ACT_LINE|intelligence artificielle|Conseiller virtuel/);

  const tool = getCopy('fr');
  const app = ascendantJsonLd({
    origin: 'https://callastral.com',
    locale: 'fr',
    path: ascendantPath('fr'),
    h1: tool.h1,
    description: tool.description,
    homeLabel: tool.home,
    faqs: tool.faqs,
  });
  const appTypes = types(app);
  assert.ok(appTypes.includes('WebApplication'));
  assert.ok(appTypes.includes('BreadcrumbList'));
  assert.ok(appTypes.includes('FAQPage'));
  const screen = fs.readFileSync(new URL('../components/AscendantToolScreen.tsx', import.meta.url), 'utf8');
  assert.equal(screen.includes('faqTitle'), true);

  const sign = signArticleModel('fr', 'belier');
  const article = articleJsonLd('https://callastral.com', sign);
  assert.ok(types(article).includes('BreadcrumbList'));
  assert.equal(types(article).includes('FAQPage'), false);
  const articleView = fs.readFileSync(new URL('../components/OrganicArticle.tsx', import.meta.url), 'utf8');
  assert.equal(articleView.includes('FAQPage'), false);

  const avis = avisJsonLd('https://callastral.com');
  assert.ok(types(avis).includes('FAQPage'));
  const avisPage = fs.readFileSync(new URL('../app/[locale]/avis-callastral/page.tsx', import.meta.url), 'utf8');
  assert.equal(avisPage.includes('AVIS_FAQS.map'), true);
  const faq = fs.readFileSync(new URL('../app/faq/page.tsx', import.meta.url), 'utf8');
  assert.equal(faq.includes("canonical: '/faq'"), true);
  assert.equal(faq.includes('FAQPage'), true);
  assert.equal(faq.includes('ENTRIES.map'), true);
});

test('canonical auto-référent, hreflang x-default, sitemap index par type', () => {
  const organic = fs.readFileSync(new URL('../components/OrganicArticle.tsx', import.meta.url), 'utf8');
  assert.match(organic, /canonical: model\.path/);
  assert.match(organic, /publishedAlternates/);
  assert.match(organic, /index: false/);
  for (const file of ['app/cgu/page.tsx', 'app/terms/page.tsx', 'app/offres/page.tsx']) {
    const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, /canonical:/, file);
    assert.match(source, /x-default/, file);
  }
  const avis = fs.readFileSync(new URL('../app/[locale]/avis-callastral/page.tsx', import.meta.url), 'utf8');
  assert.match(avis, /canonical: AVIS_PATH/);
  assert.match(avis, /'x-default': AVIS_PATH/);
  const expected = [
    ...SITEMAP_KINDS.filter((kind) => entriesFor(kind).length > 0).map((kind) => `/sitemaps/${kind}.xml`),
    '/video-sitemap.xml',
  ];
  assert.deepEqual(sitemapIndexPaths(), expected);
  assert.equal(expected.includes('/sitemaps/pages.xml'), true);
  const index = renderSitemapIndex('https://callastral.com');
  for (const path of sitemapIndexPaths()) assert.equal(index.includes(`https://callastral.com${path}`), true, path);
  assert.equal(fs.existsSync(new URL('../app/sitemap.ts', import.meta.url)), false);
  const route = fs.readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8');
  assert.equal(route.includes('renderSitemapIndex'), true);
});
