import assert from 'node:assert/strict';
import { test } from 'node:test';
import { signProfile } from '../lib/ascendant-copy.ts';
import { chartAtInstant, civilToUtc, formatArcminute, type ComputedChart } from '../lib/chart-calc.ts';

const ARCMINUTE = 1 / 60;

function separation(actual: number, expected: number): number {
  const diff = Math.abs((((actual - expected) % 360) + 360) % 360);
  return Math.min(diff, 360 - diff);
}

function expectWithinArcminute(actual: number, expected: number, label: string): void {
  const minutes = separation(actual, expected) * 60;
  assert.ok(
    minutes < 1,
    `${label}: écart ${minutes.toFixed(3)}′ (obtenu ${actual.toFixed(4)}°, attendu ${expected.toFixed(4)}°)`
  );
}

function bodyLongitude(chart: ComputedChart, name: string): number {
  const planet = chart.planets.find((item) => item.name === name);
  assert.ok(planet && typeof planet.longitude === 'number', `${name} absent`);
  return planet.longitude as number;
}

test('fuseau historique : DST et temps moyen local', () => {
  const summer = civilToUtc(2000, 7, 1, 12, 0, 'Europe/Paris', 2.35);
  assert.equal(summer.localMeanTime, false);
  assert.equal(summer.hour, 10);
  assert.equal(summer.minute, 0);

  const winter = civilToUtc(2000, 1, 1, 12, 0, 'Europe/Paris', 2.35);
  assert.equal(winter.localMeanTime, false);
  assert.equal(winter.hour, 11);
  assert.equal(winter.minute, 0);

  const gap = civilToUtc(2026, 3, 29, 2, 30, 'Europe/Paris', 2.35);
  assert.equal(gap.hour, 1);
  assert.equal(gap.minute, 30);

  const overlap = civilToUtc(2026, 10, 25, 2, 30, 'Europe/Paris', 2.35);
  assert.equal(overlap.localMeanTime, false);
  assert.equal(overlap.offsetMinutes, 120);
  assert.equal(overlap.hour, 0);
  assert.equal(overlap.minute, 30);

  const ulm = civilToUtc(1879, 3, 14, 11, 30, 'Europe/Berlin', 10);
  assert.equal(ulm.localMeanTime, true);
  assert.equal(ulm.hour, 10);
  assert.equal(ulm.minute, 50);

  const honolulu = civilToUtc(1961, 8, 4, 19, 24, 'Pacific/Honolulu', -(157 + 52 / 60));
  assert.equal(honolulu.localMeanTime, false);
  assert.equal(honolulu.offsetMinutes, -600);
  assert.equal(honolulu.day, 5);
  assert.equal(honolulu.hour, 5);
  assert.equal(honolulu.minute, 24);
});

test('thèmes de référence astro.com à moins d’une minute d’arc', () => {
  chartAtInstant({
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    lat: 48.86,
    lon: 2.35,
    timeZone: 'UTC',
    timeKnown: true,
    placeLabel: 'warmup',
  });

  const samples: Array<{
    label: string;
    input: Parameters<typeof chartAtInstant>[0];
    sun: number;
    moon: number;
    asc: number;
  }> = [
    {
      label: 'Obama',
      input: {
        year: 1961,
        month: 8,
        day: 4,
        hour: 19,
        minute: 24,
        lat: 21 + 18 / 60,
        lon: -(157 + 52 / 60),
        timeZone: 'Pacific/Honolulu',
        timeKnown: true,
        placeLabel: 'Honolulu',
      },
      sun: 132 + 33 / 60,
      moon: 63 + 21 / 60,
      asc: 318 + 3 / 60,
    },
    {
      label: 'Diana',
      input: {
        year: 1961,
        month: 7,
        day: 1,
        hour: 19,
        minute: 45,
        lat: 52 + 50 / 60,
        lon: 0.5,
        timeZone: 'Europe/London',
        timeKnown: true,
        placeLabel: 'Sandringham',
      },
      sun: 99 + 40 / 60,
      moon: 325 + 2 / 60,
      asc: 258 + 25 / 60,
    },
    {
      label: 'Einstein',
      input: {
        year: 1879,
        month: 3,
        day: 14,
        hour: 11,
        minute: 30,
        lat: 48 + 24 / 60,
        lon: 10,
        timeZone: 'Europe/Berlin',
        timeKnown: true,
        placeLabel: 'Ulm',
      },
      sun: 353 + 30 / 60,
      moon: 254 + 32 / 60,
      asc: 101 + 39 / 60,
    },
  ];

  for (const sample of samples) {
    const started = performance.now();
    const chart = chartAtInstant(sample.input);
    const elapsed = performance.now() - started;
    assert.equal(chart.engine, 'swisseph', `${sample.label} doit utiliser Swiss Ephemeris`);
    expectWithinArcminute(bodyLongitude(chart, 'Soleil'), sample.sun, `${sample.label} Soleil`);
    expectWithinArcminute(bodyLongitude(chart, 'Lune'), sample.moon, `${sample.label} Lune`);
    expectWithinArcminute(chart.ascendantLongitude, sample.asc, `${sample.label} Ascendant`);
    const rising = formatArcminute(chart.ascendantLongitude).sign;
    assert.equal(signProfile(rising).sign, rising);
    assert.ok(signProfile(rising).reading.length > 40, `${sample.label} lecture ascendant`);
    assert.match(chart.voiceSummary, /Soleil .+maison \d+/);
    assert.match(chart.voiceSummary, /Aspects majeurs:/);
    assert.ok(elapsed < 200, `${sample.label} calculé en ${elapsed.toFixed(1)} ms`);
  }
});
