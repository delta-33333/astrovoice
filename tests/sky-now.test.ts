import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildSkyNowReading, solarHouseFrom } from '../lib/sky-now.ts';

test('mini-lecture : signe solaire, maisons solaires et question', () => {
  // Soleil natal à 220° (Scorpion), Lune à 130° (Lion), Soleil à 219° (Scorpion).
  const fr = buildSkyNowReading('fr', { natalSun: 220, sunNow: 219, moonNow: 130, moonSpeed: 13 });
  assert.equal(fr.sign, 'scorpion');
  assert.equal(fr.moonHouse, 10);
  assert.equal(fr.sunHouse, 1);
  assert.match(fr.lines[0], /Lion/);
  assert.match(fr.question, /Lune en Lion/);
  const en = buildSkyNowReading('en', { natalSun: 220, sunNow: 219, moonNow: 130, moonSpeed: 13 });
  assert.match(en.headline, /right now/);
  assert.equal(solarHouseFrom(11, 0), 2);
  assert.equal(buildSkyNowReading('fr', { natalSun: 239.5, sunNow: 0, moonNow: 0, moonSpeed: 13 }).cusp, true);
});

test('accueil : promesse « vrai ciel », mini-lecture avant compte, CTA collant, sans fausse rareté', () => {
  for (const file of ['app/page.tsx', 'app/[locale]/page.tsx']) {
    const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, /SkyNowHero/);
    assert.match(source, /TrialStickyCta/);
    assert.equal(/AggregateRating|countdown|compte à rebours/i.test(source), false);
  }
  const hero = fs.readFileSync(new URL('../components/SkyNowHero.tsx', import.meta.url), 'utf8');
  assert.match(hero, /mini_reading_submit/);
  assert.match(hero, /disclosure/);
  assert.equal(/astrology-api/i.test(hero), false);
});

test('en-tête : la langue de l’URL prime sur le cookie (/fr/offres en FR/EUR)', () => {
  const header = fs.readFileSync(new URL('../components/SiteHeader.tsx', import.meta.url), 'utf8');
  assert.match(header, /x-locale/);
  assert.match(header, /pathLocale !== 'en' \? 'eur'/);
});
