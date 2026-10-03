import 'server-only';
import { createHash } from 'crypto';
import { buildVoiceSummary, type ComputedChart } from './chart-calc';
import { chartFromBirth, type BirthChartInput } from './ephemeris';
import { isMissingRelation } from './missing-relation';
import { getSupabaseAdmin, supabaseAvailable, type UserProfile } from './supabase';

const OPTIONAL_COLUMNS = ['birth_timezone', 'natal_chart_json', 'birth_latitude', 'birth_longitude'];

export function normalizePlace(place: string): string {
  return place.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeTime(time: string | null | undefined, timeUnknown: boolean): string {
  if (timeUnknown || !time?.trim()) return 'unknown';
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return time.trim();
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function chartFingerprint(input: BirthChartInput): string {
  const time = normalizeTime(input.time, Boolean(input.timeUnknown) || !input.time);
  const raw = `${input.date.trim()}|${time}|${normalizePlace(input.place)}`;
  return createHash('sha256').update(raw).digest('hex');
}

export function profileMatchesBirth(user: Pick<UserProfile, 'birth_date' | 'birth_time' | 'birth_time_unknown' | 'birth_place'>, input: BirthChartInput): boolean {
  if (!user.birth_date || !user.birth_place) return false;
  const unknown = Boolean(input.timeUnknown) || !input.time;
  return (
    user.birth_date === input.date.trim() &&
    normalizePlace(user.birth_place) === normalizePlace(input.place) &&
    Boolean(user.birth_time_unknown) === unknown &&
    (unknown || normalizeTime(user.birth_time, false) === normalizeTime(input.time, false))
  );
}

function asChart(value: unknown, depth = 0): ComputedChart | null {
  if (typeof value === 'string' && depth < 2) {
    try {
      return asChart(JSON.parse(value), depth + 1);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object') return null;
  const chart = value as ComputedChart;
  if (!Array.isArray(chart.planets) || chart.planets.length === 0) return null;
  if (!chart.voiceSummary) chart.voiceSummary = buildVoiceSummary(chart);
  return chart;
}

export function readUserChart(user: UserProfile, input: BirthChartInput): ComputedChart | null {
  if (!profileMatchesBirth(user, input)) return null;
  return asChart(user.natal_chart_json);
}

async function readNatalTable(input: BirthChartInput): Promise<ComputedChart | null> {
  if (!supabaseAvailable) return null;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('natal_charts')
      .select('chart')
      .eq('fingerprint', chartFingerprint(input))
      .maybeSingle();
    if (error) {
      if (!isMissingRelation(error)) console.warn('Lecture thème:', error.message);
      return null;
    }
    return asChart(data?.chart);
  } catch (error) {
    console.warn('Lecture thème:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function writeNatalTable(input: BirthChartInput, chart: ComputedChart): Promise<void> {
  if (!supabaseAvailable) return;
  try {
    const { error } = await getSupabaseAdmin().from('natal_charts').upsert(
      {
        fingerprint: chartFingerprint(input),
        birth_date: input.date.trim(),
        birth_time: input.timeUnknown || !input.time ? null : normalizeTime(input.time, false),
        birth_time_unknown: Boolean(input.timeUnknown) || !input.time,
        birth_place: input.place.trim(),
        latitude: chart.coords?.lat ?? null,
        longitude: chart.coords?.lon ?? null,
        time_zone: chart.zoneId || chart.timeZone,
        engine: chart.engine,
        chart,
      },
      { onConflict: 'fingerprint' }
    );
    if (error && !isMissingRelation(error)) console.warn('Écriture thème:', error.message);
  } catch (error) {
    console.warn('Écriture thème:', error instanceof Error ? error.message : error);
  }
}

function columnNamedIn(message: string, payload: Record<string, unknown>): string | null {
  const keys = Object.keys(payload).sort((a, b) => b.length - a.length);
  return keys.find((key) => message.includes(key)) ?? null;
}

async function writeUserRow(userId: string, updates: Record<string, unknown>): Promise<boolean> {
  if (!supabaseAvailable) {
    const { updateUserCookie } = await import('./session');
    return updateUserCookie(userId, updates as Partial<UserProfile>);
  }

  const payload: Record<string, unknown> = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );
  for (let attempt = 0; attempt < OPTIONAL_COLUMNS.length + 1; attempt += 1) {
    const { error } = await getSupabaseAdmin().from('users').update(payload).eq('id', userId);
    if (!error) return true;
    if (!isMissingRelation(error)) {
      console.warn('Profil naissance:', error.message);
      return false;
    }
    const named = columnNamedIn(error.message || '', payload);
    if (named && OPTIONAL_COLUMNS.includes(named)) {
      delete payload[named];
      continue;
    }
    let stripped = false;
    for (const key of OPTIONAL_COLUMNS) {
      if (key in payload) {
        delete payload[key];
        stripped = true;
      }
    }
    if (!stripped) return false;
  }
  return false;
}

export async function persistComputedChart(
  userId: string | null,
  input: BirthChartInput,
  chart: ComputedChart,
  profile?: { displayName?: string }
): Promise<void> {
  await writeNatalTable(input, chart);
  if (!userId) return;
  const unknown = Boolean(input.timeUnknown) || !input.time;
  await writeUserRow(userId, {
    ...(profile?.displayName ? { display_name: profile.displayName } : {}),
    birth_date: input.date.trim(),
    birth_time: unknown ? null : normalizeTime(input.time, false),
    birth_time_unknown: unknown,
    birth_place: input.place.trim(),
    birth_latitude: chart.coords?.lat,
    birth_longitude: chart.coords?.lon,
    birth_timezone: chart.zoneId || chart.timeZone,
    natal_chart_json: JSON.stringify(chart),
  });
}

export async function loadOrComputeChart(
  input: BirthChartInput,
  options?: { userId?: string | null; displayName?: string; persistUser?: boolean }
): Promise<ComputedChart> {
  const cached = await readNatalTable(input);
  if (cached?.coords) {
    if (options?.persistUser && options.userId) {
      await persistComputedChart(options.userId, input, cached, { displayName: options.displayName });
    }
    return cached;
  }
  const chart = await chartFromBirth(input);
  await persistComputedChart(options?.persistUser ? options.userId ?? null : null, input, chart, {
    displayName: options?.displayName,
  });
  return chart;
}

/** Thème déjà en mémoire sur le profil, sinon table, sinon un seul calcul. */
export async function chartForCall(user: UserProfile, input: BirthChartInput): Promise<ComputedChart> {
  const ready = readUserChart(user, input);
  if (ready) return ready;
  return loadOrComputeChart(input, {
    userId: user.id,
    displayName: user.display_name,
    persistUser: profileMatchesBirth(user, input) || !user.birth_date,
  });
}
