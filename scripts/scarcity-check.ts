import { hasImmediateSlot, scarcityLabel } from '../lib/scarcity.ts';

const now = new Date('2026-10-03T10:00:00+02:00');

function at(iso: string) {
  return new Date(iso);
}

const cases: [string, string | null, Date[]][] = [
  ['deux aujourd’hui', 'Il reste 2 créneaux aujourd’hui', [at('2026-10-03T14:00:00+02:00'), at('2026-10-03T16:00:00+02:00'), at('2026-10-04T09:00:00+02:00')]],
  ['dernière', 'Dernière place cette semaine', [at('2026-10-05T11:00:00+02:00')]],
  ['demain', 'Complet jusqu’à demain 14h', [at('2026-10-04T14:00:00+02:00'), at('2026-10-05T09:00:00+02:00')]],
  ['vide', 'Complet cette semaine', []],
  ['beaucoup', null, [at('2026-10-03T11:00:00+02:00'), at('2026-10-03T12:00:00+02:00'), at('2026-10-03T13:00:00+02:00'), at('2026-10-03T15:00:00+02:00')]],
];

let failed = 0;
for (const [name, expected, slots] of cases) {
  const actual = scarcityLabel(now, slots);
  if (actual !== expected) {
    console.error(name, JSON.stringify(actual), '!=', JSON.stringify(expected));
    failed += 1;
  }
}

const soon = at('2026-10-03T10:10:00+02:00');
const later = at('2026-10-03T12:00:00+02:00');
if (!hasImmediateSlot(now, [soon])) {
  console.error('immediate manquant');
  failed += 1;
}
if (hasImmediateSlot(now, [later])) {
  console.error('immediate trop loin');
  failed += 1;
}

if (failed) process.exit(1);
console.log('scarcity ok');
