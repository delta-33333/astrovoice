import assert from 'node:assert/strict';
import test from 'node:test';
import { pickAttribution } from '../lib/attribution-pick.ts';

const host = 'callastral.com';

test('view_home garde le référent et les UTM de la session', () => {
  const first = pickAttribution({ referrer: 'https://www.reddit.com/', search: '?utm_source=reddit&utm_medium=comment&utm_campaign=c1', host, stored: null });
  assert.equal(first.referrer, 'https://www.reddit.com/');
  assert.match(first.search, /utm_source=reddit/);
  // navigation interne vers l'accueil : document.referrer interne, plus de query
  const home = pickAttribution({ referrer: 'https://callastral.com/fr/essai', search: '', host, stored: first.landing });
  assert.equal(home.referrer, 'https://www.reddit.com/');
  assert.match(home.search, /utm_campaign=c1/);
});

test('visite directe : rien inventé', () => {
  const r = pickAttribution({ referrer: null, search: '', host, stored: null });
  assert.equal(r.referrer, null);
  assert.equal(r.search, '');
});

test('nouvelle source externe remplace la précédente', () => {
  const a = pickAttribution({ referrer: 'https://www.google.com/', search: '', host, stored: { referrer: 'https://www.reddit.com/', search: '' } });
  assert.equal(a.referrer, 'https://www.google.com/');
});
