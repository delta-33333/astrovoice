// Généré par scripts/daily-horoscope-index.mjs — ne pas éditer à la main.
import type { DailyDay } from './daily-horoscope';

export async function loadDailyDay(date: string): Promise<DailyDay | null> {
  switch (date) {
    case '2026-10-31':
      return (await import('../content/daily-horoscope/2026-10-31.json')).default as unknown as DailyDay;
    default:
      return null;
  }
}
