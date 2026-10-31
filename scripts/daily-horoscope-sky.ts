/**
 * Ciel du jour pour l'horoscope quotidien (Swiss Ephemeris via lib/chart-calc, comme /moon-sign-today).
 * Usage : node --experimental-strip-types scripts/daily-horoscope-sky.ts 2026-10-31
 */
import { DateTime } from 'luxon';
import { skyAtUtc } from '../lib/chart-calc.ts';
import { moonPhase } from '../lib/free-tools.ts';

const day = process.argv[2] || DateTime.now().setZone('Europe/Paris').toISODate()!;
const at = (hour: number) => {
  const t = DateTime.fromISO(`${day}T${String(hour).padStart(2, '0')}:00`, { zone: 'Europe/Paris' }).toUTC();
  return skyAtUtc(t.year, t.month, t.day, t.hour, t.minute).bodies;
};
const morning = at(8);
const midnight = at(0);
const nextMidnight = (() => {
  const t = DateTime.fromISO(`${day}T00:00`, { zone: 'Europe/Paris' }).plus({ days: 1 }).toUTC();
  return skyAtUtc(t.year, t.month, t.day, t.hour, t.minute).bodies;
})();
const get = (list: typeof morning, name: string) => list.find((b) => b.name === name)!;
const sun = get(morning, 'Soleil');
const moon = get(morning, 'Lune');
const phase = moonPhase(sun.longitude, moon.longitude);
const bodies = morning.map((b) => ({
  name: b.name,
  sign: b.sign,
  degree: Math.floor(((b.longitude % 30) + 30) % 30),
  retrograde: b.retrograde,
}));
const ingresses = midnight
  .map((b) => ({ name: b.name, from: b.sign, to: get(nextMidnight, b.name)?.sign }))
  .filter((x) => x.to && x.from !== x.to);
const ASPECTS = [
  { name: 'conjunction', angle: 0, orb: 6 },
  { name: 'sextile', angle: 60, orb: 3 },
  { name: 'square', angle: 90, orb: 4 },
  { name: 'trine', angle: 120, orb: 4 },
  { name: 'opposition', angle: 180, orb: 5 },
];
const aspects: { a: string; b: string; aspect: string; orb: number }[] = [];
for (let i = 0; i < morning.length; i++) {
  for (let j = i + 1; j < morning.length; j++) {
    const A = morning[i], B = morning[j];
    if (!['Soleil', 'Lune', 'Mercure', 'Vénus', 'Mars'].includes(A.name) && !['Soleil', 'Lune', 'Mercure', 'Vénus', 'Mars'].includes(B.name)) continue;
    let d = Math.abs(A.longitude - B.longitude) % 360;
    if (d > 180) d = 360 - d;
    for (const asp of ASPECTS) {
      const orb = Math.abs(d - asp.angle);
      if (orb <= asp.orb) aspects.push({ a: A.name, b: B.name, aspect: asp.name, orb: Math.round(orb * 10) / 10 });
    }
  }
}
aspects.sort((x, y) => x.orb - y.orb);
console.log(JSON.stringify({ date: day, computedAt: '08:00 Europe/Paris', phase: { id: phase.id, illumination: phase.illumination, waxing: phase.waxing }, bodies, ingresses, aspects }, null, 2));
