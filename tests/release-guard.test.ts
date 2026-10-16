import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { RELEASE_GUARD_AT, releaseSamples, type ReleaseSample } from '../lib/release-guard.ts';

const snapshot = JSON.parse(fs.readFileSync(new URL('./fixtures/release-guard.json', import.meta.url), 'utf8')) as {
  at: string;
  samples: ReleaseSample[];
};

test('le garde-fou échoue si le JSON-LD, un tableau ou plus de 30 % du texte disparaît', () => {
  assert.equal(snapshot.at, RELEASE_GUARD_AT);
  assert.ok(snapshot.samples.length >= 8);
  const current = releaseSamples(new Date(RELEASE_GUARD_AT));
  for (const previous of snapshot.samples) {
    const next = current.find((item) => item.id === previous.id);
    assert.ok(next, previous.id);
    for (const type of previous.jsonLdTypes) {
      assert.equal(next.jsonLdTypes.includes(type), true, `${previous.id} ${type}`);
    }
    assert.ok(next.tables >= previous.tables, `${previous.id} tables ${next.tables} < ${previous.tables}`);
    const floor = Math.floor(previous.words * 0.7);
    assert.ok(next.words >= floor, `${previous.id} words ${next.words} < ${floor}`);
  }
  const avis = snapshot.samples.find((item) => item.id === 'avis');
  const alternative = snapshot.samples.find((item) => item.id === 'alternative-voyance-fr');
  const calculator = snapshot.samples.find((item) => item.id === 'calculator-fr');
  assert.ok(avis && avis.tables >= 1 && avis.jsonLdTypes.includes('FAQPage'));
  assert.ok(alternative && alternative.tables >= 1);
  assert.ok(calculator && calculator.jsonLdTypes.includes('WebApplication'));
  assert.ok(calculator.jsonLdTypes.includes('BreadcrumbList'));
});
