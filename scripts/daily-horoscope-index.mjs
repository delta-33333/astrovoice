// Régénère lib/daily-horoscope-dates.ts et lib/daily-horoscope-data.ts à partir de content/daily-horoscope/*.json.
// Usage : node scripts/daily-horoscope-index.mjs
import { readdirSync, writeFileSync } from 'node:fs';
const dates = readdirSync('content/daily-horoscope')
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  .map((f) => f.slice(0, 10))
  .sort();
writeFileSync(
  'lib/daily-horoscope-dates.ts',
  `// Généré par scripts/daily-horoscope-index.mjs — ne pas éditer à la main.\nexport const DAILY_HOROSCOPE_DATES: readonly string[] = ${JSON.stringify(dates, null, 2)};\n`
);
const cases = dates.map((d) => `    case '${d}':\n      return (await import('../content/daily-horoscope/${d}.json')).default as unknown as DailyDay;`).join('\n');
writeFileSync(
  'lib/daily-horoscope-data.ts',
  `// Généré par scripts/daily-horoscope-index.mjs — ne pas éditer à la main.\nimport type { DailyDay } from './daily-horoscope';\n\nexport async function loadDailyDay(date: string): Promise<DailyDay | null> {\n  switch (date) {\n${cases}\n    default:\n      return null;\n  }\n}\n`
);
console.log(`${dates.length} jour(s) : ${dates.join(', ')}`);
