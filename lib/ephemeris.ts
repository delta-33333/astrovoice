import 'server-only';
import fs from 'fs';
import path from 'path';
import { calc_ut, constants, houses_ex2, set_ephe_path, utc_to_jd } from 'sweph';
import { locatePlace } from './geocode';
import type { Aspect, House, NatalChart, Planet } from './types';

const SIGNS = [
  'Bélier',
  'Taureau',
  'Gémeaux',
  'Cancer',
  'Lion',
  'Vierge',
  'Balance',
  'Scorpion',
  'Sagittaire',
  'Capricorne',
  'Verseau',
  'Poissons',
] as const;

const BODIES: Array<{ id: number; name: string }> = [
  { id: constants.SE_SUN, name: 'Soleil' },
  { id: constants.SE_MOON, name: 'Lune' },
  { id: constants.SE_MERCURY, name: 'Mercure' },
  { id: constants.SE_VENUS, name: 'Vénus' },
  { id: constants.SE_MARS, name: 'Mars' },
  { id: constants.SE_JUPITER, name: 'Jupiter' },
  { id: constants.SE_SATURN, name: 'Saturne' },
  { id: constants.SE_URANUS, name: 'Uranus' },
  { id: constants.SE_NEPTUNE, name: 'Neptune' },
  { id: constants.SE_PLUTO, name: 'Pluton' },
  { id: constants.SE_MEAN_NODE, name: 'Nœud nord' },
];

const ASPECTS: Array<{ name: string; angle: number; orb: number }> = [
  { name: 'Conjonction', angle: 0, orb: 8 },
  { name: 'Sextile', angle: 60, orb: 4 },
  { name: 'Carré', angle: 90, orb: 6 },
  { name: 'Trigone', angle: 120, orb: 6 },
  { name: 'Opposition', angle: 180, orb: 8 },
];

export type EphemerisEngine = 'swisseph' | 'moshier';

export interface ComputedChart extends NatalChart {
  ascendant: string;
  sunSign: string;
  moonSign: string;
  summary: string;
  coords: { lat: number; lon: number };
  timeUsed: string;
  timeZone: string;
  timeKnown: boolean;
  engine: EphemerisEngine;
  placeLabel: string;
}

export class ChartError extends Error {
  constructor(
    public code: 'PLACE' | 'DATE' | 'EPHEMERIS',
    message: string
  ) {
    super(message);
  }
}

let ephemerisReady = false;

function configureEphemeris(): boolean {
  if (ephemerisReady) return true;
  const dir = path.join(process.cwd(), 'ephemeris');
  const planets = path.join(dir, 'sepl_18.se1');
  if (fs.existsSync(planets)) {
    set_ephe_path(dir);
    ephemerisReady = true;
    return true;
  }
  ephemerisReady = true;
  return false;
}

function norm360(value: number): number {
  const n = value % 360;
  return n < 0 ? n + 360 : n;
}

function signOf(longitude: number): { sign: string; degree: number } {
  const lon = norm360(longitude);
  const index = Math.floor(lon / 30) % 12;
  return { sign: SIGNS[index], degree: Math.round((lon % 30) * 10) / 10 };
}

function houseOf(longitude: number, cusps: number[]): number {
  const lon = norm360(longitude);
  for (let i = 0; i < 12; i += 1) {
    const start = norm360(cusps[i]);
    const end = norm360(cusps[(i + 1) % 12]);
    if (start <= end) {
      if (lon >= start && lon < end) return i + 1;
    } else if (lon >= start || lon < end) {
      return i + 1;
    }
  }
  return 1;
}

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(norm360(a) - norm360(b));
  return Math.min(diff, 360 - diff);
}

interface BodyPosition {
  name: string;
  longitude: number;
  speed: number;
}

function positions(jdUt: number): { bodies: BodyPosition[]; engine: EphemerisEngine } {
  const files = configureEphemeris();
  const swieph = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;
  const moseph = constants.SEFLG_MOSEPH | constants.SEFLG_SPEED;
  const bodies: BodyPosition[] = [];
  let engine: EphemerisEngine = files ? 'swisseph' : 'moshier';

  for (const body of BODIES) {
    let flags = engine === 'swisseph' ? swieph : moseph;
    let result = calc_ut(jdUt, body.id, flags);
    const failed =
      result.flag < 0 ||
      !result.data ||
      (typeof result.error === 'string' && /error|not found|failed/i.test(result.error) && result.flag < 0);
    if (failed && flags !== moseph) {
      result = calc_ut(jdUt, body.id, moseph);
      engine = 'moshier';
      flags = moseph;
    }
    if (result.flag < 0 || !result.data || typeof result.data[0] !== 'number') {
      throw new ChartError('EPHEMERIS', result.error || 'Calcul impossible');
    }
    if (engine === 'swisseph' && typeof result.error === 'string' && /moshier/i.test(result.error)) {
      engine = 'moshier';
    }
    bodies.push({
      name: body.name,
      longitude: result.data[0],
      speed: typeof result.data[3] === 'number' ? result.data[3] : 0,
    });
  }

  return { bodies, engine };
}

function aspectsOf(bodies: BodyPosition[]): Aspect[] {
  const found: Aspect[] = [];
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const distance = angularDistance(bodies[i].longitude, bodies[j].longitude);
      for (const aspect of ASPECTS) {
        const orb = Math.abs(distance - aspect.angle);
        if (orb <= aspect.orb) {
          found.push({
            planet1: bodies[i].name,
            planet2: bodies[j].name,
            type: aspect.name,
            orb: Math.round(orb * 10) / 10,
          });
          break;
        }
      }
    }
  }
  return found.sort((a, b) => a.orb - b.orb).slice(0, 16);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function zonedToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  let zone = timeZone || 'UTC';
  try {
    Intl.DateTimeFormat('en-US', { timeZone: zone });
  } catch {
    zone = 'UTC';
  }
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(new Date(utcGuess))
      .map((part) => [part.type, part.value])
  );
  let hourPart = Number(parts.hour);
  if (hourPart === 24) hourPart = 0;
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hourPart,
    Number(parts.minute),
    Number(parts.second)
  );
  const real = new Date(utcGuess - (asUtc - utcGuess));
  return {
    year: real.getUTCFullYear(),
    month: real.getUTCMonth() + 1,
    day: real.getUTCDate(),
    hour: real.getUTCHours(),
    minute: real.getUTCMinutes(),
    second: real.getUTCSeconds(),
  };
}

export interface InstantChartInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  timeZone: string;
  timeKnown: boolean;
  placeLabel: string;
}

export function chartAtInstant(input: InstantChartInput): ComputedChart {
  const utc = zonedToUtc(input.year, input.month, input.day, input.hour, input.minute, input.timeZone);
  const julian = utc_to_jd(
    utc.year,
    utc.month,
    utc.day,
    utc.hour,
    utc.minute,
    utc.second,
    constants.SE_GREG_CAL
  );
  if (julian.flag !== constants.OK || !julian.data) {
    throw new ChartError('EPHEMERIS', 'Date julienne impossible');
  }
  const jdUt = julian.data[1];
  const { bodies, engine } = positions(jdUt);
  const housesResult = houses_ex2(jdUt, 0, input.lat, input.lon, 'P');
  if (housesResult.flag !== constants.OK || !housesResult.data?.houses || !housesResult.data.points) {
    throw new ChartError('EPHEMERIS', housesResult.error || 'Maisons impossibles');
  }
  const cusps = Array.from(housesResult.data.houses).slice(0, 12);
  if (cusps.length < 12 || cusps.some((cusp) => typeof cusp !== 'number')) {
    throw new ChartError('EPHEMERIS', 'Cuspides incomplètes');
  }
  const ascLongitude = housesResult.data.points[0];
  if (typeof ascLongitude !== 'number') throw new ChartError('EPHEMERIS', 'Ascendant absent');

  const planets: Planet[] = bodies.map((body) => {
    const placed = signOf(body.longitude);
    return {
      name: body.name,
      sign: placed.sign,
      degree: placed.degree,
      house: houseOf(body.longitude, cusps),
      retrograde: body.speed < 0,
    };
  });
  const houses: House[] = cusps.map((cusp, index) => {
    const placed = signOf(cusp);
    return { number: index + 1, sign: placed.sign, degree: placed.degree };
  });
  const asc = signOf(ascLongitude);
  const sun = planets.find((planet) => planet.name === 'Soleil');
  const moon = planets.find((planet) => planet.name === 'Lune');
  const sunSign = sun?.sign || asc.sign;
  const moonSign = moon?.sign || asc.sign;
  const timeUsed = `${input.year}-${pad(input.month)}-${pad(input.day)} ${pad(input.hour)}:${pad(input.minute)}`;

  return {
    planets,
    houses,
    aspects: aspectsOf(bodies),
    ascendant: asc.sign,
    sunSign,
    moonSign,
    timeKnown: input.timeKnown,
    engine,
    summary: input.timeKnown
      ? `Soleil en ${sunSign}, Lune en ${moonSign}, ascendant ${asc.sign}.`
      : `Soleil en ${sunSign}, Lune en ${moonSign}. Heure inconnue : ascendant et maisons calculés pour midi local.`,
    coords: { lat: input.lat, lon: input.lon },
    timeUsed,
    timeZone: input.timeZone,
    placeLabel: input.placeLabel,
  };
}

export interface BirthChartInput {
  date: string;
  time?: string | null;
  timeUnknown?: boolean;
  place: string;
}

export async function chartFromBirth(input: BirthChartInput): Promise<ComputedChart> {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.date.trim());
  if (!match) throw new ChartError('DATE', 'Date invalide');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1800 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new ChartError('DATE', 'Date hors plage');
  }

  const place = input.place.trim();
  if (place.length < 2) throw new ChartError('PLACE', 'Lieu requis');
  const located = await locatePlace(place);
  if (!located) throw new ChartError('PLACE', 'Lieu introuvable. Essayez avec ville, pays (ex: Paris, France)');

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

  return chartAtInstant({
    year,
    month,
    day,
    hour,
    minute,
    lat: located.lat,
    lon: located.lon,
    timeZone: located.timeZone,
    timeKnown,
    placeLabel: located.label,
  });
}

/** Ciel d’une date civile à midi UTC, aux coordonnées déjà connues. */
export function chartAtUtcNoon(
  year: number,
  month: number,
  day: number,
  lat: number,
  lon: number,
  placeLabel: string
): ComputedChart {
  return chartAtInstant({
    year,
    month,
    day,
    hour: 12,
    minute: 0,
    lat,
    lon,
    timeZone: 'UTC',
    timeKnown: true,
    placeLabel,
  });
}
