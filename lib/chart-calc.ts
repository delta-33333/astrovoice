import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';
import { calc_ut, constants, houses_ex2, set_ephe_path, utc_to_jd } from 'sweph';
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
  ascendantLongitude: number;
  sunSign: string;
  moonSign: string;
  summary: string;
  voiceSummary: string;
  coords: { lat: number; lon: number };
  timeUsed: string;
  timeZone: string;
  zoneId: string;
  localMeanTime: boolean;
  timeKnown: boolean;
  engine: EphemerisEngine;
  placeLabel: string;
}

export class ChartError extends Error {
  code: 'PLACE' | 'DATE' | 'EPHEMERIS';

  constructor(code: 'PLACE' | 'DATE' | 'EPHEMERIS', message: string) {
    super(message);
    this.code = code;
  }
}

export interface UtcInstant {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  offsetMinutes: number;
  localMeanTime: boolean;
}

let ephemerisReady = false;

function configureEphemeris(): boolean {
  if (ephemerisReady) return true;
  const dir = path.join(process.cwd(), 'ephemeris');
  const planets = path.join(dir, 'sepl_18.se1');
  const moon = path.join(dir, 'semo_18.se1');
  if (fs.existsSync(planets) && fs.existsSync(moon)) {
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

export function formatArcminute(longitude: number): { sign: string; text: string } {
  let lon = norm360(longitude);
  let signIndex = Math.floor(lon / 30) % 12;
  let within = lon - signIndex * 30;
  let degrees = Math.floor(within + 1e-9);
  let minutes = Math.round((within - degrees) * 60);
  if (minutes >= 60) {
    minutes = 0;
    degrees += 1;
  }
  if (degrees >= 30) {
    degrees = 0;
    signIndex = (signIndex + 1) % 12;
  }
  const sign = SIGNS[signIndex];
  return { sign, text: `${sign} ${degrees}°${String(minutes).padStart(2, '0')}'` };
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
    const failed = result.flag < 0 || !result.data || typeof result.data[0] !== 'number';
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

function standardOffset(minutes: number): boolean {
  if (!Number.isFinite(minutes)) return false;
  return Math.abs(minutes / 15 - Math.round(minutes / 15)) < 1e-6;
}

function zoneOrUtc(timeZone: string): string {
  const zone = timeZone.trim() || 'UTC';
  const probe = DateTime.now().setZone(zone);
  return probe.isValid ? zone : 'UTC';
}

/**
 * Heure civile → UTC.
 * Luxon applique le DST historique (trou de printemps avancé, recouvrement d’automne = instant le plus tôt).
 * Un décalage qui n’est pas un multiple de 15 minutes est un temps moyen local de ville :
 * on le remplace par la longitude × 4 minutes, comme astro.com.
 */
export function civilToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
  longitude: number
): UtcInstant {
  const zone = zoneOrUtc(timeZone);
  let local = DateTime.fromObject({ year, month, day, hour, minute, second: 0 }, { zone });
  if (!local.isValid) {
    local = DateTime.fromObject({ year, month, day, hour, minute, second: 0 }, { zone }).plus({ hours: 1 });
  }
  if (!local.isValid) {
    local = DateTime.fromObject({ year, month, day, hour, minute, second: 0 }, { zone: 'UTC' });
  }

  let offsetMinutes = local.offset;
  let localMeanTime = false;
  if (!standardOffset(offsetMinutes)) {
    localMeanTime = true;
    offsetMinutes = longitude * 4;
  }

  if (!localMeanTime) {
    const utc = local.toUTC();
    return {
      year: utc.year,
      month: utc.month,
      day: utc.day,
      hour: utc.hour,
      minute: utc.minute,
      second: utc.second + utc.millisecond / 1000,
      offsetMinutes,
      localMeanTime: false,
    };
  }

  const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) - offsetMinutes * 60_000;
  const utc = new Date(utcMs);
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
    hour: utc.getUTCHours(),
    minute: utc.getUTCMinutes(),
    second: utc.getUTCSeconds() + utc.getUTCMilliseconds() / 1000,
    offsetMinutes,
    localMeanTime: true,
  };
}

export function buildVoiceSummary(chart: {
  planets?: Planet[];
  houses?: House[];
  aspects?: Aspect[];
  ascendant?: string;
  ascendantLongitude?: number;
  timeKnown?: boolean;
}): string {
  const planets = (chart.planets ?? []).slice(0, 11).map((planet) => {
    const placed =
      typeof planet.longitude === 'number'
        ? formatArcminute(planet.longitude).text
        : `${planet.sign} ${planet.degree}°`;
    const retro = planet.retrograde ? ' R' : '';
    return `${planet.name} ${placed} maison ${planet.house}${retro}`;
  });
  const asc =
    typeof chart.ascendantLongitude === 'number'
      ? formatArcminute(chart.ascendantLongitude).text
      : chart.ascendant || '';
  const houses = (chart.houses ?? [])
    .slice(0, 12)
    .map((house) => {
      const placed =
        typeof house.longitude === 'number' ? formatArcminute(house.longitude).text : `${house.sign} ${house.degree}°`;
      return `${house.number} ${placed}`;
    })
    .join(' ; ');
  const aspects = (chart.aspects ?? [])
    .slice(0, 8)
    .map((aspect) => `${aspect.planet1} ${aspect.type} ${aspect.planet2} (orbe ${aspect.orb}°)`)
    .join(' ; ');
  const timeNote = chart.timeKnown === false ? 'Heure inconnue, thème pour midi local.\n' : '';
  return `${timeNote}${planets.join('\n')}\nAscendant ${asc}\nMaisons: ${houses}\nAspects majeurs: ${aspects}`;
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
  const utc = civilToUtc(input.year, input.month, input.day, input.hour, input.minute, input.timeZone, input.lon);
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
      longitude: body.longitude,
      house: houseOf(body.longitude, cusps),
      retrograde: body.speed < 0,
    };
  });
  const houses: House[] = cusps.map((cusp, index) => {
    const placed = signOf(cusp);
    return { number: index + 1, sign: placed.sign, degree: placed.degree, longitude: cusp };
  });
  const asc = signOf(ascLongitude);
  const sun = planets.find((planet) => planet.name === 'Soleil');
  const moon = planets.find((planet) => planet.name === 'Lune');
  const sunSign = sun?.sign || asc.sign;
  const moonSign = moon?.sign || asc.sign;
  const timeUsed = `${input.year}-${pad(input.month)}-${pad(input.day)} ${pad(input.hour)}:${pad(input.minute)}`;
  const aspects = aspectsOf(bodies);
  const draft: ComputedChart = {
    planets,
    houses,
    aspects,
    ascendant: asc.sign,
    ascendantLongitude: ascLongitude,
    sunSign,
    moonSign,
    timeKnown: input.timeKnown,
    engine,
    summary: input.timeKnown
      ? `Soleil en ${sunSign}, Lune en ${moonSign}, ascendant ${asc.sign}.`
      : `Soleil en ${sunSign}, Lune en ${moonSign}. Heure inconnue : ascendant et maisons calculés pour midi local.`,
    voiceSummary: '',
    coords: { lat: input.lat, lon: input.lon },
    timeUsed,
    timeZone: utc.localMeanTime ? 'LMT' : input.timeZone,
    zoneId: input.timeZone,
    localMeanTime: utc.localMeanTime,
    placeLabel: input.placeLabel,
  };
  draft.voiceSummary = buildVoiceSummary(draft);
  return draft;
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
