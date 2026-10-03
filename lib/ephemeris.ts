import 'server-only';
import { locatePlace } from './geocode';
import { ChartError, chartAtInstant, type ComputedChart } from './chart-calc';

export { ChartError, chartAtInstant, chartAtUtcNoon, civilToUtc, buildVoiceSummary } from './chart-calc';
export type { ComputedChart, EphemerisEngine, InstantChartInput, UtcInstant } from './chart-calc';

export interface BirthChartInput {
  date: string;
  time?: string | null;
  timeUnknown?: boolean;
  place: string;
}

export function parseBirthInstant(input: BirthChartInput): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timeKnown: boolean;
} {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.date.trim());
  if (!match) throw new ChartError('DATE', 'Date invalide');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1800 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new ChartError('DATE', 'Date hors plage');
  }

  let hour = 12;
  let minute = 0;
  const timeKnown = !input.timeUnknown && Boolean(input.time);
  if (timeKnown && input.time) {
    const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(input.time.trim());
    if (!timeMatch) throw new ChartError('DATE', 'Heure invalide');
    hour = Number(timeMatch[1]);
    minute = Number(timeMatch[2]);
    if (hour > 23 || minute > 59) throw new ChartError('DATE', 'Heure invalide');
  }

  return { year, month, day, hour, minute, timeKnown };
}

export async function chartFromBirth(input: BirthChartInput): Promise<ComputedChart> {
  const when = parseBirthInstant(input);
  const place = input.place.trim();
  if (place.length < 2) throw new ChartError('PLACE', 'Lieu requis');
  const located = await locatePlace(place);
  if (!located) throw new ChartError('PLACE', 'Lieu introuvable. Essayez avec ville, pays (ex: Paris, France)');

  return chartAtInstant({
    year: when.year,
    month: when.month,
    day: when.day,
    hour: when.hour,
    minute: when.minute,
    lat: located.lat,
    lon: located.lon,
    timeZone: located.timeZone,
    timeKnown: when.timeKnown,
    placeLabel: located.label,
  });
}
