import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  AVIS_CAUTIONS,
  AVIS_DESCRIPTION,
  AVIS_EDITORIAL,
  AVIS_FAQS,
  AVIS_KEYWORDS,
  AVIS_PATH,
  AVIS_STRENGTHS,
  AVIS_TITLE,
  avisJsonLd,
} from '../lib/avis-callastral.ts';
import { skyAtUtc } from '../lib/chart-calc.ts';
import { LOCALES } from '../lib/seo.ts';
import { buildWeekSky, horoscopeModel } from '../lib/weekly-sky.ts';
import {
  articlesFor,
  clusterSitemap,
  compatArticleModel,
  ctaLinks,
  pageCounts,
  risingArticleModel,
  signArticleModel,
} from '../lib/zodiac/articles.ts';
import { pairLeadKeys } from '../lib/zodiac/leads.ts';
import {
  BOOK_DISCOVERY_PATH,
  SIGN_IDS,
  pairKey,
  pairList,
  signName,
  weekPath,
} from '../lib/zodiac/signs.ts';

const FORBIDDEN = ['AggregateRating', 'aggregateRating', 'reviewCount', 'ratingValue', 'Review', 'témoignage', '★★'];

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 45);
}

test('comptes : 12 signes, 12 ascendants, 78 duos, horoscope, avis', () => {
  assert.equal(SIGN_IDS.length, 12);
  assert.equal(pairList().length, 78);
  assert.equal(pairLeadKeys().length, 78);
  const counts = pageCounts();
  assert.equal(counts.fr, 104);
  assert.equal(counts.en, 103);
  assert.equal(counts.es, 103);
  assert.equal(counts.de, 103);
  assert.equal(counts.it, 103);
  assert.equal(counts.total, 516);
  for (const locale of LOCALES) {
    const articles = articlesFor(locale);
    assert.equal(articles.filter((item) => item.kind === 'sign').length, 12);
    assert.equal(articles.filter((item) => item.kind === 'rising').length, 12);
    assert.equal(articles.filter((item) => item.kind === 'compat').length, 78);
  }
});

test('pages uniques, hreflang, canonical, mots-clés, sans avis schema', () => {
  const paths = new Set<string>();
  for (const locale of LOCALES) {
    const seen = new Map<string, string>();
    for (const article of articlesFor(locale)) {
      assert.equal(paths.has(article.path), false, article.path);
      paths.add(article.path);
      assert.equal(article.path.startsWith(`/${locale}/`), true, article.path);
      assert.equal(article.alternates[locale], article.path);
      assert.equal(article.alternates['x-default']?.startsWith('/fr/'), true, article.path);
      for (const item of LOCALES) assert.ok(article.alternates[item], `${article.path} ${item}`);
      const keyword = article.keywords[0].toLowerCase();
      assert.equal(article.title.toLowerCase().includes(keyword), true, article.title);
      assert.equal(article.description.toLowerCase().includes(keyword), true, article.description);
      assert.ok(article.description.length >= 70 && article.description.length <= 160, `${article.path} ${article.description.length}`);
      assert.ok(article.prose.length >= 280, `${article.path} ${article.prose.length}`);
      assert.ok(article.sections.some((section) => section.h2.length > 0 && section.h2.length < 48), article.path);
      const ctas = ctaLinks(locale);
      assert.equal(ctas.book.href, BOOK_DISCOVERY_PATH);
      assert.equal(ctas.calc.href.startsWith(`/${locale}/`), true);
      const serialized = JSON.stringify({ title: article.title, prose: article.prose, ld: article.keywords });
      for (const token of FORBIDDEN) assert.equal(serialized.includes(token), false, `${article.path} ${token}`);
      for (const sentence of sentences(article.prose)) {
        const previous = seen.get(sentence);
        assert.equal(previous, undefined, `phrase partagée ${previous} / ${article.path} : ${sentence}`);
        seen.set(sentence, article.path);
      }
    }
    const sample = signArticleModel(locale, 'belier');
    assert.ok(sample.sections.some((section) => section.links?.some((link) => link.href.includes(weekPath(locale).split('/').pop()!))));
    const duo = compatArticleModel(locale, 'belier', 'taureau');
    assert.equal(duo.prose.toLowerCase().includes(signName(locale, 'belier').toLowerCase()), true);
    assert.equal(duo.prose.toLowerCase().includes(signName(locale, 'taureau').toLowerCase()), true);
    const rising = risingArticleModel(locale, 'lion');
    assert.equal(rising.path.includes(locale), true);
  }
  assert.equal(paths.size, 12 * 5 + 12 * 5 + 78 * 5);
});

test('les duos citent les deux noms et les lectures ne se répètent pas', () => {
  const keys = pairList().map(([a, b]) => pairKey(a, b));
  assert.deepEqual(pairLeadKeys().sort(), keys.sort());
  for (const locale of LOCALES) {
    const leads = new Set<string>();
    for (const [a, b] of pairList()) {
      const article = compatArticleModel(locale, a, b);
      leads.add(article.sections[0].paragraphs[0]);
      const nameA = signName(locale, a).toLowerCase();
      const nameB = signName(locale, b).toLowerCase();
      const lead = article.sections[0].paragraphs[0].toLowerCase();
      assert.equal(lead.includes(nameA), true, `${locale} ${a} ${lead}`);
      assert.equal(lead.includes(nameB), true, `${locale} ${b} ${lead}`);
      const facts = article.sections[1].paragraphs.join(' ').toLowerCase();
      assert.equal(facts.includes(nameA) && facts.includes(nameB), true, `${locale} ${a}-${b}`);
    }
    assert.equal(leads.size, 78, locale);
  }
});

test('sitemap, accueil, calculateur et page avis', () => {
  const sitemap = fs.readFileSync(new URL('../app/sitemap.ts', import.meta.url), 'utf8');
  assert.equal(sitemap.includes('clusterSitemap'), true);
  assert.equal(sitemap.includes('AVIS_PATH'), true);
  assert.equal(clusterSitemap().length, 12 + 12 + 78 + 1);
  const home = fs.readFileSync(new URL('../app/[locale]/page.tsx', import.meta.url), 'utf8');
  assert.equal(home.includes('AVIS_PATH'), true);
  assert.equal(home.includes('signPath'), true);
  const screen = fs.readFileSync(new URL('../components/AscendantToolScreen.tsx', import.meta.url), 'utf8');
  const calculator = fs.readFileSync(new URL('../components/AscendantCalculator.tsx', import.meta.url), 'utf8');
  assert.equal(screen.includes('AVIS_PATH'), true);
  assert.equal(screen.includes('risingLinks'), true);
  assert.equal(calculator.includes('risingLinks'), true);
  assert.equal(calculator.includes('result.sign'), true);
  const avis = fs.readFileSync(new URL('../app/[locale]/avis-callastral/page.tsx', import.meta.url), 'utf8');
  assert.equal(avis.includes('FAQPage') || avis.includes('avisJsonLd'), true);
  assert.equal(avis.includes('<table'), true);
  for (const token of FORBIDDEN) assert.equal(avis.includes(token), false, token);
  assert.equal(AVIS_TITLE, "Avis Callastral : calcul d'ascendant gratuit et astrologie IA");
  assert.equal(AVIS_PATH, '/fr/avis-callastral');
  assert.equal(AVIS_EDITORIAL, 'Page éditée par Callastral.');
  assert.ok(AVIS_DESCRIPTION.length >= 70 && AVIS_DESCRIPTION.length <= 160, String(AVIS_DESCRIPTION.length));
  assert.deepEqual([...AVIS_KEYWORDS], [
    'Callastral',
    'avis Callastral',
    'calcul ascendant gratuit',
    'astrologie IA',
    'consultation astrologue téléphone',
    'thème natal en ligne',
  ]);
  assert.equal(AVIS_FAQS.length, 3);
  assert.equal(AVIS_STRENGTHS.length, 3);
  assert.equal(AVIS_CAUTIONS.length, 3);
  const data = avisJsonLd('https://callastral.com');
  const graph = data['@graph'] as Array<Record<string, unknown>>;
  assert.equal(graph.some((node) => node['@type'] === 'FAQPage'), true);
  assert.equal(graph.some((node) => node['@type'] === 'WebPage'), true);
  const serialized = JSON.stringify(data);
  for (const token of FORBIDDEN) assert.equal(serialized.includes(token), false, token);
  assert.equal(serialized.includes('Esther') || avis.includes('Esther'), true);
});

test('horoscope hebdomadaire : Swiss Ephemeris, semaines différentes, divertissement', () => {
  const january = skyAtUtc(2026, 1, 7, 12, 0);
  assert.equal(january.engine, 'swisseph');
  assert.equal(january.bodies.find((body) => body.name === 'Soleil')?.sign, 'Capricorne');
  const july = skyAtUtc(2026, 7, 8, 12, 0);
  assert.equal(july.bodies.find((body) => body.name === 'Soleil')?.sign, 'Cancer');

  const equinox = buildWeekSky(new Date('2026-03-18T12:00:00Z'));
  assert.equal(
    equinox.ingresses.some((item) => item.body === 'Soleil' && item.to === 'Bélier'),
    true,
    JSON.stringify(equinox.ingresses.filter((item) => item.body === 'Soleil')),
  );

  for (const locale of LOCALES) {
    const winter = horoscopeModel(locale, new Date('2026-01-07T12:00:00Z'));
    const summer = horoscopeModel(locale, new Date('2026-07-08T12:00:00Z'));
    assert.equal(winter.sections.length, 12);
    assert.notEqual(winter.prose, summer.prose);
    assert.match(winter.entertainment, /Divertissement|Entertainment|Entretenimiento|Unterhaltung|Intrattenimento/);
    assert.match(winter.method, /Swiss Ephemeris/);
    assert.equal(winter.prose.includes(winter.entertainment), true);
    const serialized = JSON.stringify(winter);
    for (const token of FORBIDDEN) assert.equal(serialized.includes(token), false, token);
    const ids = new Set(winter.sections.map((section) => section.paragraphs.join(' ')));
    assert.equal(ids.size, 12, locale);
  }
});
