import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { LOCALES } from '../lib/seo.ts';
import { clusterEntries, entriesFor } from '../lib/sitemap-public.ts';
import {
  SHINGLE_SIZE,
  THIN_MAX_JACCARD,
  THIN_MIN_UNIQUE_WORDS,
  isThinMetrics,
  isThinPath,
  jaccard,
  publishedAlternates,
  shingles,
  thinReport,
  uniqueWordCount,
} from '../lib/thin-content.ts';
import { clusterSitemap } from '../lib/zodiac/articles.ts';

test('seuils : mots uniques et Jaccard des shingles', () => {
  assert.equal(THIN_MIN_UNIQUE_WORDS, 80);
  assert.equal(THIN_MAX_JACCARD, 0.5);
  assert.equal(SHINGLE_SIZE, 5);
  assert.equal(isThinMetrics(79, 0), true);
  assert.equal(isThinMetrics(80, 0.49), false);
  assert.equal(isThinMetrics(80, 0.5), false);
  assert.equal(isThinMetrics(120, 0.51), true);
  const left = shingles('le ciel de la semaine change avec mars');
  const right = shingles('le ciel de la semaine change avec venus');
  assert.ok(jaccard(left, right) > 0 && jaccard(left, right) < 1);
  assert.equal(uniqueWordCount('Lion lion LION'), 1);
});

test('les pages sous le seuil sont noindex et absentes du sitemap', () => {
  const report = thinReport();
  assert.equal(report.total, report.rows.length);
  assert.equal(report.noindex + report.indexable, report.total);
  assert.equal(report.noindex, report.rows.filter((row) => row.noindex).length);
  const compat = report.rows.filter((row) => row.kind === 'compat');
  assert.ok(compat.some((row) => row.noindex), 'une compatibilité trop courte reste noindex');
  const thin = new Set(report.rows.filter((row) => row.noindex).map((row) => row.path));
  for (const kind of ['signs', 'rising-signs', 'compatibility', 'horoscope'] as const) {
    for (const entry of entriesFor(kind)) {
      assert.equal(thin.has(entry.path), false, entry.path);
      assert.equal(isThinPath(entry.path), false, entry.path);
    }
  }
  for (const row of report.rows.filter((item) => item.noindex)) {
    assert.equal(clusterEntries('signs').some((entry) => entry.path === row.path), false);
  }
  const source = fs.readFileSync(new URL('../scripts/thin-content-audit.ts', import.meta.url), 'utf8');
  assert.equal(source.includes('noindex'), true);
  assert.equal(source.includes('byKind'), true);
});

test('hreflang publié : réciproque, x-default, sans page noindex', () => {
  for (const cluster of clusterSitemap()) {
    for (const locale of LOCALES) {
      const path = cluster.paths[locale];
      const languages = publishedAlternates(locale, path, cluster.languages);
      assert.equal(languages['x-default']?.startsWith('/'), true, path);
      assert.equal(languages[locale], path);
      if (isThinPath(path)) {
        assert.deepEqual(Object.keys(languages).sort(), [locale, 'x-default'].sort());
        assert.equal(languages['x-default'], path);
        continue;
      }
      for (const [lang, href] of Object.entries(languages)) {
        if (lang === 'x-default') {
          const targetLocale = LOCALES.find((item) => cluster.paths[item] === href);
          assert.ok(targetLocale, href);
          const back = publishedAlternates(targetLocale, href, cluster.languages);
          assert.equal(back['x-default'], href);
          assert.equal(isThinPath(href), false);
          continue;
        }
        assert.equal(isThinPath(href), false, href);
        const back = publishedAlternates(lang as typeof locale, href, cluster.languages);
        assert.equal(back[locale], path, `${path} -> ${href}`);
        assert.equal(back[lang], href);
      }
    }
  }
});
