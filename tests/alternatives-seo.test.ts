import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  ALT_CHECKED_ISO,
  COMPETITORS,
  HUB_PATHS,
  alternativeJsonLd,
  hubCopy,
  hubJsonLd,
} from '../lib/alternatives.ts';

const FORBIDDEN = ['AggregateRating', 'aggregateRating', 'reviewCount', 'ratingValue', '"@type":"Person"', '"@type": "Person"', '"@type":"Product"', '"@type": "Product"', 'Astrology-API', 'astrology-api'];

test('dix fiches, marchés, mots-clés, title, meta et H1', () => {
  assert.equal(COMPETITORS.length, 10);
  assert.equal(COMPETITORS.filter((item) => item.market === 'fr').length, 7);
  assert.equal(COMPETITORS.filter((item) => item.market === 'en').length, 3);
  const titles = new Set<string>();
  const paths = new Set<string>();
  for (const page of COMPETITORS) {
    assert.equal(titles.has(page.title), false, page.title);
    assert.equal(paths.has(page.path), false, page.path);
    titles.add(page.title);
    paths.add(page.path);
    assert.equal(page.path.startsWith(page.market === 'fr' ? '/fr/' : '/en/'), true, page.path);
    assert.equal(page.h1.toLowerCase().includes(page.keyword.toLowerCase()), true, page.h1);
    assert.equal(page.title.toLowerCase().includes(page.keyword.toLowerCase()), true, page.title);
    assert.equal(page.description.toLowerCase().includes(page.keyword.toLowerCase()), true, page.description);
    assert.ok(page.description.length >= 70 && page.description.length <= 160, `${page.id} ${page.description.length}`);
    assert.ok(page.faqs.length >= 4 && page.faqs.length <= 6, page.id);
    assert.ok(page.sources.length >= 1, page.id);
    assert.ok(page.whenChoose.length >= 2, page.id);
    for (const source of page.sources) {
      assert.equal(source.url.startsWith('https://'), true, source.url);
    }
    assert.equal(fs.existsSync(new URL(`../app/[locale]/${page.path.split('/').pop()}/page.tsx`, import.meta.url)), true, page.path);
  }
});

test('JSON-LD : FAQ et fil d’Ariane, sans avis, Person ni Product', () => {
  for (const page of COMPETITORS) {
    const data = alternativeJsonLd('https://callastral.com', page.market, page);
    const graph = data['@graph'] as Array<Record<string, unknown>>;
    assert.equal(graph.some((node) => node['@type'] === 'FAQPage'), true, page.id);
    assert.equal(graph.some((node) => node['@type'] === 'BreadcrumbList'), true, page.id);
    const faq = graph.find((node) => node['@type'] === 'FAQPage');
    const questions = faq?.mainEntity as Array<Record<string, unknown>>;
    assert.equal(questions.length, page.faqs.length);
    const serialized = JSON.stringify(data);
    for (const token of FORBIDDEN) {
      assert.equal(serialized.includes(token), false, `${page.id} ${token}`);
    }
  }
  for (const locale of ['fr', 'en'] as const) {
    const copy = hubCopy(locale);
    assert.equal(copy.h1.toLowerCase().includes(copy.keyword.toLowerCase()), true);
    assert.ok(copy.description.length >= 70 && copy.description.length <= 160, `${locale} ${copy.description.length}`);
    assert.ok(copy.faqs.length >= 4 && copy.faqs.length <= 6);
    const data = hubJsonLd('https://callastral.com', locale);
    const graph = data['@graph'] as Array<Record<string, unknown>>;
    const crumbs = graph.find((node) => node['@type'] === 'BreadcrumbList');
    const items = crumbs?.itemListElement as Array<Record<string, unknown>>;
    assert.equal(items[1].item, `https://callastral.com${HUB_PATHS[locale]}`);
    const serialized = JSON.stringify(data);
    for (const token of FORBIDDEN) assert.equal(serialized.includes(token), false, token);
  }
});

test('un CTA, redirect Instagram 307, sitemap, sans pénurie inventée', () => {
  const screen = fs.readFileSync(new URL('../components/AlternativePage.tsx', import.meta.url), 'utf8');
  const data = fs.readFileSync(new URL('../lib/alternatives.ts', import.meta.url), 'utf8');
  assert.equal((screen.match(/btn-primary/g) ?? []).length, 2);
  assert.equal((screen.match(/data-funnel="book"/g) ?? []).length, 2);
  assert.equal(screen.includes('ascendantPath'), true);
  assert.equal(screen.includes('AggregateRating'), false);
  const config = fs.readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');
  assert.match(config, /source: '\/insta'/);
  assert.match(config, /utm_source=instagram&utm_medium=bio&utm_campaign=callastral_bio/);
  const insta = config.slice(config.indexOf("source: '/insta'"));
  assert.match(insta, /permanent: false/);
  const sitemap = fs.readFileSync(new URL('../lib/sitemap-public.ts', import.meta.url), 'utf8');
  assert.equal(sitemap.includes('HUB_PATHS'), true);
  assert.equal(sitemap.includes('COMPETITORS'), true);
  const footer = fs.readFileSync(new URL('../components/SiteFooter.tsx', import.meta.url), 'utf8');
  const links = fs.readFileSync(new URL('../lib/internal-links.ts', import.meta.url), 'utf8');
  assert.equal(footer.includes('footerLinks'), true);
  assert.equal(links.includes('HUB_PATHS'), true);
  const blob = `${screen}\n${data}`;
  for (const token of ['Astrology-API', 'astrology-api', 'dernière place', 'offre limitée', 'dépêchez']) {
    assert.equal(blob.includes(token), false, token);
  }
  assert.equal(ALT_CHECKED_ISO, '2026-10-13');
  assert.equal(data.includes('non communiqué'), true);
});
