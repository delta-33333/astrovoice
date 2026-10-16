import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { AVIS_PATH } from '../lib/avis-callastral.ts';
import { ascendantPath } from '../lib/ascendant-tool.ts';
import { inboundStats, linkReport } from '../lib/link-graph.ts';
import {
  contextualParagraphs,
  horoscopeTextLinks,
  inlineHrefs,
  risingResultLinks,
} from '../lib/internal-links.ts';
import { LOCALES } from '../lib/seo.ts';
import { articlesFor } from '../lib/zodiac/articles.ts';
import {
  SIGN_IDS,
  compatPath,
  risingPath,
  signPath,
  weekPath,
  type SignId,
} from '../lib/zodiac/signs.ts';

const GENERIC = /^(ici|cliquez|click here|here|lien|link|mehr|más)$/i;

test('chaque page programmatique a au moins 5 liens dans le corps', () => {
  for (const locale of LOCALES) {
    for (const article of articlesFor(locale)) {
      const links = inlineHrefs(article.sections.flatMap((section) => section.inline ?? []));
      assert.ok(links.length >= 5, `${article.path} ${links.length}`);
      for (const link of links) {
        assert.ok(link.label.trim().length >= 8, `${article.path} ${link.label}`);
        assert.equal(GENERIC.test(link.label.trim()), false, link.label);
      }
    }
    const week = horoscopeTextLinks(locale);
    assert.ok(week.length >= 5, `${locale} horoscope ${week.length}`);
    assert.equal(week.some((link) => link.href === ascendantPath(locale)), true, locale);
  }
});

test('signe, ascendant, compatibilité et horoscope se relient', () => {
  for (const locale of LOCALES) {
    for (const id of SIGN_IDS) {
      const signHrefs = new Set(inlineHrefs(contextualParagraphs({ kind: 'sign', locale, id })).map((link) => link.href.split('#')[0]));
      const risingHrefs = new Set(inlineHrefs(contextualParagraphs({ kind: 'rising', locale, id })).map((link) => link.href.split('#')[0]));
      assert.equal(signHrefs.has(risingPath(locale, id)), true, `${locale} ${id} rising`);
      assert.equal(risingHrefs.has(signPath(locale, id)), true, `${locale} ${id} sign`);
      assert.equal(signHrefs.has(weekPath(locale)), true, `${locale} ${id} week`);
      assert.equal(risingHrefs.has(weekPath(locale)), true);
      for (const other of SIGN_IDS) {
        const href = compatPath(locale, id, other);
        assert.equal(signHrefs.has(href), true, `${locale} ${id} ${other}`);
        assert.equal(risingHrefs.has(href), true, `${locale} rising ${id} ${other}`);
      }
      const compatSegment = `/${compatPath(locale, id, id).split('/')[2]}/`;
      const labels = inlineHrefs(contextualParagraphs({ kind: 'sign', locale, id }))
        .filter((link) => link.href.includes(compatSegment))
        .map((link) => link.label);
      assert.ok(new Set(labels).size >= 3, `${locale} ${id}`);
    }
    const same = inlineHrefs(contextualParagraphs({ kind: 'compat', locale, a: 'lion', b: 'lion' }));
    const mixed = inlineHrefs(contextualParagraphs({ kind: 'compat', locale, a: 'belier' as SignId, b: 'taureau' }));
    assert.ok(same.length >= 5, `${locale} same ${same.length}`);
    assert.ok(mixed.length >= 5, `${locale} mixed ${mixed.length}`);
    assert.equal(mixed.some((link) => link.href === signPath(locale, 'belier')), true);
    assert.equal(mixed.some((link) => link.href === signPath(locale, 'taureau')), true);
    assert.equal(mixed.some((link) => link.href === risingPath(locale, 'belier')), true);
    assert.equal(mixed.some((link) => link.href === risingPath(locale, 'taureau')), true);
    assert.equal(mixed.some((link) => link.href === weekPath(locale)), true);
    const weekHrefs = new Set(horoscopeTextLinks(locale).map((link) => link.href));
    assert.equal(weekHrefs.has(signPath(locale, 'belier')), true);
    assert.equal(weekHrefs.has(risingPath(locale, 'belier')), true);
  }
});

test('le résultat du calculateur pointe vers l’ascendant, et les pages argent reçoivent 5 liens de texte', () => {
  for (const locale of LOCALES) {
    const links = risingResultLinks(locale);
    assert.equal(links['Bélier'].href, risingPath(locale, 'belier'));
    assert.equal(links['Lion'].href, risingPath(locale, 'lion'));
    assert.match(links['Bélier'].label, /Bélier|Aries|Widder|Ariete/);
  }
  const screen = fs.readFileSync(new URL('../components/AscendantCalculator.tsx', import.meta.url), 'utf8');
  assert.equal(screen.includes('risingLinks'), true);
  assert.equal(screen.includes('result.sign'), true);
  const alternatives = fs.readFileSync(new URL('../components/AlternativePage.tsx', import.meta.url), 'utf8');
  const avis = fs.readFileSync(new URL('../app/[locale]/avis-callastral/page.tsx', import.meta.url), 'utf8');
  assert.equal(alternatives.includes('ascendantPath'), true);
  assert.match(avis, /ascendantPath\('fr'\)/);
  const stats = inboundStats();
  for (const locale of LOCALES) {
    const row = stats.find((item) => item.path === ascendantPath(locale));
    assert.ok(row && row.text >= 5, `${ascendantPath(locale)} text=${row?.text}`);
  }
  const avisRow = stats.find((item) => item.path === AVIS_PATH);
  assert.ok(avisRow && avisRow.text >= 5, `avis text=${avisRow?.text}`);
});

test('le script signale les orphelines et les pages à moins de 3 liens entrants', () => {
  const source = fs.readFileSync(new URL('../scripts/internal-links-report.ts', import.meta.url), 'utf8');
  assert.equal(source.includes('orphans'), true);
  assert.equal(source.includes('underThree'), true);
  const report = linkReport();
  assert.equal(Array.isArray(report.orphans), true);
  assert.equal(Array.isArray(report.underThree), true);
  assert.equal(report.orphans.length, 0, report.orphans.join(', '));
});
