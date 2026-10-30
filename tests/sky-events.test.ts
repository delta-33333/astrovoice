import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SKY_EVENT_IDS,
  SKY_EVENT_PATHS,
  SKY_FACTS,
  formatParis,
  formatUtc,
  signRows,
  skyEventCopy,
  skyEventJsonLd,
  solarHouse,
} from '../lib/sky-events.ts';
import { pageEntries } from '../lib/sitemap-public.ts';

test('heures de Paris et UTC (heure d’hiver depuis le 25/10/2026)', () => {
  assert.equal(formatUtc(SKY_FACTS.mercuryStationDirect.utc, 'en'), '13 November 2026, 15:54 UTC');
  assert.equal(formatParis(SKY_FACTS.mercuryStationDirect.utc, 'en'), '13 November 2026, 16:54 Paris time');
  assert.equal(formatParis(SKY_FACTS.venusStationDirect.utc, 'fr'), '14 novembre 2026 à 1 h 27 (heure de Paris)');
  assert.equal(formatParis(SKY_FACTS.newMoon.utc, 'en'), '9 November 2026, 08:02 Paris time');
  // Avant le changement d’heure : UTC+2.
  assert.equal(formatParis(SKY_FACTS.mercuryStationRetro.utc, 'en'), '24 October 2026, 09:13 Paris time');
});

test('maisons solaires', () => {
  assert.equal(solarHouse(0, 7), 8); // Bélier : Scorpion en maison 8
  assert.equal(solarHouse(7, 7), 1);
  assert.equal(solarHouse(1, 7), 7);
  assert.equal(solarHouse(8, 7), 12);
});

test('chaque page couvre les 12 signes, FAQ, réponse d’abord et JSON-LD sans AggregateRating', () => {
  for (const id of SKY_EVENT_IDS) {
    for (const locale of ['en', 'fr'] as const) {
      const copy = skyEventCopy(id, locale);
      assert.equal(copy.path, SKY_EVENT_PATHS[id][locale]);
      const rows = signRows(id, locale);
      assert.equal(rows.length, 12);
      assert.equal(new Set(rows.map((r) => r.text)).size, 12);
      assert.ok(copy.faqs.length >= 5);
      assert.ok(copy.description.length <= 170, `${copy.path} description ${copy.description.length}`);
      const ld = JSON.stringify(skyEventJsonLd(copy));
      for (const type of ['FAQPage', 'Article', 'BreadcrumbList']) assert.ok(ld.includes(`"${type}"`));
      assert.equal(ld.includes('AggregateRating'), false);
      const links = copy.links.map((l) => l.href).join(' ');
      for (const needle of ['/chat', locale === 'fr' ? '/fr/essai' : '/en/free-trial', locale === 'fr' ? '/fr/lune-aujourdhui' : '/en/moon-sign-today']) {
        assert.ok(links.includes(needle), needle);
      }
    }
  }
  assert.match(skyEventCopy('newMoonScorpio', 'en').answer[0], /07:02 UTC/);
  assert.match(skyEventCopy('mercuryVenusDirect', 'fr').answer[0], /16 h 54/);
});

test('les pages événement sont au sitemap avec hreflang fr/en', () => {
  const entries = pageEntries();
  for (const id of SKY_EVENT_IDS) {
    for (const locale of ['en', 'fr'] as const) {
      const entry = entries.find((item) => item.path === SKY_EVENT_PATHS[id][locale]);
      assert.ok(entry, SKY_EVENT_PATHS[id][locale]);
      assert.equal(entry?.languages?.en, SKY_EVENT_PATHS[id].en);
      assert.equal(entry?.languages?.fr, SKY_EVENT_PATHS[id].fr);
    }
  }
});
