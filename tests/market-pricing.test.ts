import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { DateTime } from 'luxon';
import { foundingOfferOpen } from '../lib/founding.ts';
import { marginPreVat, type MarginCountry } from '../lib/margin.ts';
import {
  DEFAULT_RATES,
  MARKET_PRICING,
  advisorLocalMinor,
  localRates,
  marketCodeForCountry,
  pricePerMinCents,
} from '../lib/money.ts';
import { priceRows } from '../lib/geo-pages.ts';
import { INTRO_CENTS } from '../lib/pricing.ts';
import { renewalTerms } from '../lib/renewal-copy.ts';
import {
  WEEKLY_CURRENCIES,
  WEEKLY_PLAN_IDS,
  WEEKLY_PLANS,
  decouverteAmountOff,
  firstWeekMinor,
  welcomeCouponEnv,
  type WeeklyCurrency,
} from '../lib/weekly.ts';
import type { AdvisorLang } from '../lib/money.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const BANNED = ['illi' + 'mit', 'unlim' + 'ited'];

test('la grille marché reprend les montants publiés', () => {
  assert.deepEqual(MARKET_PRICING.FR, {
    currency: 'eur', minMinor: 99, maxMinor: 199, introMinor: 49,
    packs: { '10min': 1290, '30min': 3490, '60min': 5990 }, founding: 490,
  });
  assert.equal(MARKET_PRICING.BE.minMinor, 99);
  assert.equal(MARKET_PRICING.DE.maxMinor, 199);
  assert.equal(MARKET_PRICING.ES.minMinor, 89);
  assert.equal(MARKET_PRICING.ES.maxMinor, 149);
  assert.equal(MARKET_PRICING.ES.introMinor, 45);
  assert.equal(MARKET_PRICING.ES.packs['60min'], 4790);
  assert.equal(MARKET_PRICING.IT.maxMinor, 129);
  assert.equal(MARKET_PRICING.IT.founding, 490);
  assert.equal(MARKET_PRICING.CH.currency, 'chf');
  assert.equal(MARKET_PRICING.CH.maxMinor, 199);
  assert.equal(MARKET_PRICING.GB.currency, 'gbp');
  assert.equal(MARKET_PRICING.GB.maxMinor, 179);
  assert.equal(MARKET_PRICING.GB.packs['10min'], 1190);
  assert.equal(MARKET_PRICING.US.currency, 'usd');
  assert.equal(MARKET_PRICING.US.minMinor, 149);
  assert.equal(MARKET_PRICING.US.maxMinor, 299);
  assert.equal(MARKET_PRICING.US.introMinor, 69);
  assert.equal(MARKET_PRICING.US.packs['60min'], 8990);
  assert.equal(MARKET_PRICING.US.founding, 590);
  assert.equal(INTRO_CENTS, 49);
});

test('le tarif minute suit 89 + années × 2 + spécialités', () => {
  assert.equal(pricePerMinCents({ years: 1, age: 40, specialties: ['amour'] }), 91);
  assert.equal(pricePerMinCents({ years: 10, age: 40, specialties: ['amour', 'travail'] }), 119);
  assert.equal(pricePerMinCents({ years: 45, age: 80, specialties: Array.from({ length: 12 }, (_, i) => String(i)) }), 199);
  assert.equal(pricePerMinCents({ years: null, age: 28, specialties: ['argent'] }), 91);
});

test('les bornes publiées restent exactes, le milieu s’arrondit', () => {
  assert.equal(advisorLocalMinor(89, 'FR'), 99);
  assert.equal(advisorLocalMinor(199, 'FR'), 199);
  assert.equal(advisorLocalMinor(89, 'ES'), 89);
  assert.equal(advisorLocalMinor(199, 'ES'), 149);
  assert.equal(advisorLocalMinor(89, 'IT'), 89);
  assert.equal(advisorLocalMinor(199, 'IT'), 129);
  assert.equal(advisorLocalMinor(89, 'CH'), 99);
  assert.equal(advisorLocalMinor(199, 'CH'), 199);
  assert.equal(advisorLocalMinor(89, 'GB'), 99);
  assert.equal(advisorLocalMinor(199, 'GB'), 179);
  assert.equal(advisorLocalMinor(89, 'US'), 149);
  assert.equal(advisorLocalMinor(199, 'US'), 299);
  assert.equal(advisorLocalMinor(140, 'FR') % 10, 0);
  assert.equal(advisorLocalMinor(140, 'GB') % 10, 0);
  const usd = advisorLocalMinor(140, 'US');
  assert.ok(usd > 149 && usd < 299);
});

test('le pays détecté choisit le marché', () => {
  assert.equal(marketCodeForCountry('AT'), 'FR');
  assert.equal(marketCodeForCountry(''), 'FR');
  assert.equal(marketCodeForCountry('XX'), 'FR');
  assert.equal(marketCodeForCountry('JP'), 'US');
  assert.equal(marketCodeForCountry('CA'), 'US');
  assert.equal(marketCodeForCountry('es'), 'ES');
  assert.equal(marketCodeForCountry('IT'), 'IT');
  assert.equal(marketCodeForCountry('GB'), 'GB');
  assert.equal(marketCodeForCountry('CH'), 'CH');
  assert.equal(marketCodeForCountry('US'), 'US');
  assert.equal(marketCodeForCountry('DE'), 'DE');
  assert.equal(marketCodeForCountry('BE'), 'BE');
  assert.equal(marketCodeForCountry('FR'), 'FR');
});

test('l’accueil est le montant fixe du marché, une fois', () => {
  const fresh = localRates(149, 'eur', DEFAULT_RATES, { country: 'FR', introEligible: true });
  assert.equal(fresh.introLocal, 49);
  assert.equal(fresh.currency, 'eur');
  const used = localRates(149, 'eur', DEFAULT_RATES, { country: 'FR', introEligible: false });
  assert.equal(used.introLocal, used.standardLocal);
  assert.equal(localRates(149, 'usd', DEFAULT_RATES, { country: 'US' }).introLocal, 69);
  assert.equal(localRates(149, 'eur', DEFAULT_RATES, { country: 'ES' }).introLocal, 45);
});

test('l’offre fondateur ferme à 23:59 heure de Paris et à 100 ventes', () => {
  const end = DateTime.fromISO('2026-10-31T23:59:00', { zone: 'Europe/Paris' });
  assert.equal(end.toUTC().toISO(), '2026-10-31T22:59:00.000Z');
  assert.equal(foundingOfferOpen(end.toJSDate(), 0), true);
  assert.equal(foundingOfferOpen(end.toJSDate(), 99), true);
  assert.equal(foundingOfferOpen(end.plus({ minutes: 1 }).toJSDate(), 0), false);
  assert.equal(foundingOfferOpen(end.toJSDate(), 100), false);
});

test('chaque plein tarif hebdomadaire garde au moins 75 % de marge HT', () => {
  const countries: Record<WeeklyCurrency, MarginCountry[]> = {
    eur: ['FR', 'BE', 'DE', 'ES', 'IT'],
    chf: ['CH'],
    gbp: ['GB'],
    usd: ['US'],
  };
  for (const plan of WEEKLY_PLAN_IDS) {
    for (const currency of WEEKLY_CURRENCIES) {
      const major = WEEKLY_PLANS[plan].amounts[currency] / 100;
      for (const country of countries[currency]) {
        const margin = marginPreVat(major, WEEKLY_PLANS[plan].minutes, country);
        assert.ok(margin >= 0.75, `${plan} ${currency} ${country} ${margin}`);
      }
    }
  }
});

test('Découverte tombe à 1,99 grâce à un amount_off, les autres à −50 %', () => {
  for (const currency of WEEKLY_CURRENCIES) {
    const full = WEEKLY_PLANS.decouverte.amounts[currency];
    const off = decouverteAmountOff(currency);
    assert.equal(full - off, firstWeekMinor('decouverte', currency));
    assert.equal(firstWeekMinor('decouverte', currency), currency === 'usd' ? 249 : 199);
    assert.equal(off, currency === 'usd' ? 441 : 391);
  }
  assert.equal(firstWeekMinor('essentiel', 'eur'), 745);
  assert.equal(firstWeekMinor('premium', 'usd'), 1595);
  assert.equal(firstWeekMinor('essentiel', 'gbp'), 745);
  assert.equal(welcomeCouponEnv('decouverte', 'eur', false), 'STRIPE_COUPON_DECOUVERTE_WEEK1_EUR');
  assert.equal(welcomeCouponEnv('decouverte', 'usd', false), 'STRIPE_COUPON_DECOUVERTE_WEEK1_USD');
  assert.equal(welcomeCouponEnv('essentiel', 'chf', false), 'STRIPE_COUPON_WEEK1_50');
  assert.equal(welcomeCouponEnv('premium', 'gbp', false), 'STRIPE_COUPON_WEEK1_50');
  for (const plan of WEEKLY_PLAN_IDS) {
    for (const currency of WEEKLY_CURRENCIES) {
      assert.equal(welcomeCouponEnv(plan, currency, true), null);
    }
  }
});

test('le texte de renouvellement Découverte annonce 1,99 puis 5,90', () => {
  const fr = renewalTerms('decouverte', 'eur', 'fr', new Date('2026-10-13T09:00:00Z'));
  assert.match(fr.sentence, /1,99/);
  assert.match(fr.sentence, /5,90/);
  assert.match(fr.sentence, /1re semaine/);
  assert.match(fr.sentence, /sans engagement/);
  assert.match(fr.sentence, /1 clic/);
  assert.match(fr.sentence, /20 octobre 2026/);
  const locales: AdvisorLang[] = ['fr', 'en', 'es', 'de', 'it'];
  for (const locale of locales) {
    for (const plan of WEEKLY_PLAN_IDS) {
      const sentence = renewalTerms(plan, 'eur', locale).sentence.toLowerCase();
      for (const word of BANNED) assert.equal(sentence.includes(word), false);
    }
  }
});

test('les pages géo affichent 0,99–1,99 € et plus l’ancienne fourchette', () => {
  const fr = priceRows('fr', 'conseillers virtuels').find((row) => row.ours);
  const en = priceRows('en', 'virtual advisors').find((row) => row.ours);
  assert.ok(fr);
  assert.ok(en);
  assert.match(fr.price, /0,99/);
  assert.match(fr.price, /1,99/);
  assert.doesNotMatch(fr.price, /0,50/);
  assert.match(en.price, /€0\.99/);
  assert.match(en.price, /€1\.99/);
  assert.doesNotMatch(en.price, /0\.50/);
  const blob = `${fr.price}\n${en.price}`.toLowerCase();
  for (const word of BANNED) assert.equal(blob.includes(word), false);
});

test('le dépôt ne contient plus les mots bannis', () => {
  const hits: string[] = [];
  const skip = new Set(['node_modules', '.git', '.next', 'coverage']);
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx|js|jsx|md|sql|txt|json|css)$/.test(entry.name)) continue;
      if (entry.name === 'package-lock.json') continue;
      const text = fs.readFileSync(full, 'utf8').toLowerCase();
      for (const word of BANNED) {
        if (text.includes(word)) hits.push(path.relative(ROOT, full));
      }
    }
  };
  walk(ROOT);
  assert.deepEqual(hits, []);
});
