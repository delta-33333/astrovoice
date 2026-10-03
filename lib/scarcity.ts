const PARIS = 'Europe/Paris';

function parisDayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function addDayKey(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

function parisHour(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: PARIS,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  return minute === '00' ? `${hour}h` : `${hour}h${minute}`;
}

function parisWeekday(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: PARIS,
    weekday: 'long',
  }).format(date);
}

/** Textes de rareté calculés uniquement sur des créneaux encore libres. */
export function scarcityLabel(now: Date, availableStarts: Date[]): string | null {
  const upcoming = availableStarts
    .filter((start) => start.getTime() > now.getTime())
    .sort((a, b) => a.getTime() - b.getTime());

  if (upcoming.length === 0) return 'Complet cette semaine';
  if (upcoming.length === 1) return 'Dernière place cette semaine';

  const todayKey = parisDayKey(now);
  const todayCount = upcoming.filter((start) => parisDayKey(start) === todayKey).length;

  if (todayCount === 1) return 'Il reste 1 créneau aujourd’hui';
  if (todayCount > 1 && todayCount <= 3) {
    return `Il reste ${todayCount} créneaux aujourd’hui`;
  }
  if (todayCount > 3) return null;

  const next = upcoming[0];
  const hour = parisHour(next);
  if (parisDayKey(next) === addDayKey(todayKey, 1)) {
    return `Complet jusqu’à demain ${hour}`;
  }
  return `Complet jusqu’au ${parisWeekday(next)} ${hour}`;
}

export function hasImmediateSlot(now: Date, availableStarts: Date[]): boolean {
  const horizon = now.getTime() + 15 * 60 * 1000;
  return availableStarts.some((start) => {
    const time = start.getTime();
    return time > now.getTime() && time <= horizon;
  });
}
