// Généré par scripts/daily-horoscope-index.mjs — ne pas éditer à la main.
import type { DailyDay } from './daily-horoscope';

export async function loadDailyDay(date: string): Promise<DailyDay | null> {
  switch (date) {
    case '2026-10-31':
      return (await import('../content/daily-horoscope/2026-10-31.json')).default as unknown as DailyDay;
    case '2026-11-01':
      return (await import('../content/daily-horoscope/2026-11-01.json')).default as unknown as DailyDay;
    case '2026-11-02':
      return (await import('../content/daily-horoscope/2026-11-02.json')).default as unknown as DailyDay;
    case '2026-11-03':
      return (await import('../content/daily-horoscope/2026-11-03.json')).default as unknown as DailyDay;
    case '2026-11-04':
      return (await import('../content/daily-horoscope/2026-11-04.json')).default as unknown as DailyDay;
    case '2026-11-05':
      return (await import('../content/daily-horoscope/2026-11-05.json')).default as unknown as DailyDay;
    case '2026-11-06':
      return (await import('../content/daily-horoscope/2026-11-06.json')).default as unknown as DailyDay;
    case '2026-11-07':
      return (await import('../content/daily-horoscope/2026-11-07.json')).default as unknown as DailyDay;
    case '2026-11-08':
      return (await import('../content/daily-horoscope/2026-11-08.json')).default as unknown as DailyDay;
    default:
      return null;
  }
}
