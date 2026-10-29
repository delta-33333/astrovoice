import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AFFILIATE_PATHS, commissionCents, makeRefCode, validRefCode, REF_MAX_AGE } from '../lib/affiliate.ts';
import { BIG_THREE_PATHS, MOON_PATHS, hoursToNextSign, moonPhase } from '../lib/free-tools.ts';
import { AFFILIATE, BIG_THREE, MOON } from '../lib/free-tools-copy.ts';
import { pageEntries } from '../lib/sitemap-public.ts';

test('ref codes', () => {
  assert.equal(validRefCode(' abcd1234 '), 'ABCD1234');
  assert.equal(validRefCode('ab'), null);
  assert.equal(validRefCode('<script>'), null);
  const code = makeRefCode('Élodie Astro');
  assert.match(code, /^ELOD[A-Z2-9]{4}$/);
  assert.equal(validRefCode(code), code);
  assert.match(makeRefCode('李'), /^XXXX/);
  assert.equal(REF_MAX_AGE, 2592000);
});

test('commission is 30 % of first payment', () => {
  assert.equal(commissionCents(1990), 597);
  assert.equal(commissionCents(0), 0);
  assert.equal(commissionCents(-5), 0);
});

test('moon phase', () => {
  assert.equal(moonPhase(10, 10).id, 'new');
  assert.equal(moonPhase(0, 180).id, 'full');
  assert.equal(moonPhase(0, 180).illumination, 100);
  assert.equal(moonPhase(0, 90).id, 'firstQuarter');
  assert.equal(moonPhase(350, 80).id, 'firstQuarter');
  assert.equal(moonPhase(0, 270).id, 'lastQuarter');
  assert.equal(Math.round(hoursToNextSign(15, 12) as number), 30);
  assert.equal(hoursToNextSign(15, -1), null);
});

test('5 languages, sitemap, honest copy', () => {
  const paths = pageEntries().map((entry) => entry.path);
  for (const locale of ['fr', 'en', 'es', 'de', 'it'] as const) {
    for (const path of [AFFILIATE_PATHS[locale], BIG_THREE_PATHS[locale], MOON_PATHS[locale]]) {
      assert.ok(path.startsWith(`/${locale}/`));
      assert.ok(paths.includes(path), path);
    }
    const text = JSON.stringify([AFFILIATE[locale], BIG_THREE[locale], MOON[locale].faq]);
    assert.ok(!/astrology-api/i.test(text));
    assert.ok(!/aggregateRating|ratingValue/i.test(text));
    assert.ok(/30/.test(AFFILIATE[locale].answer));
  }
  assert.ok(AFFILIATE.fr.terms.some((term) => /Aucun versement automatique/.test(term)));
  assert.ok(AFFILIATE.en.terms.some((term) => /No automatic payouts/.test(term)));
});
