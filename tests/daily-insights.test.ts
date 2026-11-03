import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dailyInsights } from '../lib/daily-horoscope-insights.ts';
import { SIGN_IDS } from '../lib/zodiac/signs.ts';

const FORBIDDEN = [/come back/i, /reviendra/i, /revient vers/i, /astrology-api/i, /\bwill (meet|get|receive|win)\b/i, /undefined|NaN/];

test('horoscope du jour : lecture par signe calculée du ciel, sans promesse datée', () => {
  const files = readdirSync('content/daily-horoscope').filter((f) => f.endsWith('.json'));
  assert.ok(files.length > 0);
  for (const file of files) {
    const day = JSON.parse(readFileSync(`content/daily-horoscope/${file}`, 'utf8'));
    for (const locale of ['en', 'fr'] as const) {
      const seen = new Set<string>();
      for (const sign of SIGN_IDS) {
        const sections = dailyInsights(locale, sign, day);
        const ids = sections.map((s) => s.id);
        for (const id of ['moon', 'love', 'work', 'money'] as const) assert.ok(ids.includes(id), `${file} ${locale} ${sign} ${id}`);
        const text = sections.flatMap((s) => [s.h2, ...s.paragraphs]).join(' ');
        assert.ok(text.split(/\s+/).length >= 250, `${file} ${locale} ${sign} trop court`);
        for (const re of FORBIDDEN) assert.ok(!re.test(text), `${file} ${locale} ${sign} ${re}`);
        assert.ok(!seen.has(text), `${file} ${locale} ${sign} identique à un autre signe`);
        seen.add(text);
      }
    }
  }
});
