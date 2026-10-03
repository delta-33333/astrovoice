import 'server-only';
import { find as findTimeZone } from 'geo-tz';
import { isMissingRelation } from './missing-relation';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export interface PlaceLocation {
  lat: number;
  lon: number;
  label: string;
  timeZone: string;
}

const cache = new Map<string, PlaceLocation | null>();
const MAX_CACHE = 400;

function cacheKey(place: string): string {
  return place.trim().toLowerCase().replace(/\s+/g, ' ');
}

function remember(key: string, value: PlaceLocation | null): PlaceLocation | null {
  if (cache.size >= MAX_CACHE) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, value);
  return value;
}

function timeZoneAt(lat: number, lon: number): string {
  try {
    const zones = findTimeZone(lat, lon);
    const zone = zones?.[0];
    if (zone && typeof zone === 'string') return zone;
  } catch (error) {
    console.warn('Fuseau:', error instanceof Error ? error.message : error);
  }
  return 'UTC';
}

async function fromOpenMeteo(place: string): Promise<PlaceLocation | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=fr&format=json`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    results?: Array<{ latitude?: number; longitude?: number; name?: string; country?: string }>;
  };
  const hit = payload.results?.[0];
  if (!hit || typeof hit.latitude !== 'number' || typeof hit.longitude !== 'number') return null;
  const label = [hit.name, hit.country].filter(Boolean).join(', ') || place;
  return {
    lat: hit.latitude,
    lon: hit.longitude,
    label,
    timeZone: timeZoneAt(hit.latitude, hit.longitude),
  };
}

async function fromNominatim(place: string): Promise<PlaceLocation | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Callastral/1.0 (consultation astrologique)' },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>;
  const hit = payload?.[0];
  if (!hit?.lat || !hit.lon) return null;
  const lat = Number(hit.lat);
  const lon = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    lat,
    lon,
    label: hit.display_name || place,
    timeZone: timeZoneAt(lat, lon),
  };
}

async function readStoredPlace(key: string): Promise<PlaceLocation | null> {
  if (!supabaseAvailable) return null;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('place_geocodes')
      .select('label, latitude, longitude, time_zone')
      .eq('place_key', key)
      .maybeSingle();
    if (error) {
      if (!isMissingRelation(error)) console.warn('Lecture lieu:', error.message);
      return null;
    }
    if (!data || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') return null;
    return {
      lat: data.latitude,
      lon: data.longitude,
      label: typeof data.label === 'string' && data.label ? data.label : key,
      timeZone: typeof data.time_zone === 'string' && data.time_zone ? data.time_zone : 'UTC',
    };
  } catch (error) {
    console.warn('Lecture lieu:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function writeStoredPlace(key: string, place: PlaceLocation): Promise<void> {
  if (!supabaseAvailable) return;
  try {
    const { error } = await getSupabaseAdmin().from('place_geocodes').upsert(
      {
        place_key: key,
        label: place.label,
        latitude: place.lat,
        longitude: place.lon,
        time_zone: place.timeZone,
      },
      { onConflict: 'place_key' }
    );
    if (error && !isMissingRelation(error)) console.warn('Écriture lieu:', error.message);
  } catch (error) {
    console.warn('Écriture lieu:', error instanceof Error ? error.message : error);
  }
}

export async function locatePlace(place: string): Promise<PlaceLocation | null> {
  const key = cacheKey(place);
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;

  const stored = await readStoredPlace(key);
  if (stored) return remember(key, stored);

  try {
    const openMeteo = await fromOpenMeteo(place.trim());
    if (openMeteo) {
      await writeStoredPlace(key, openMeteo);
      return remember(key, openMeteo);
    }
  } catch (error) {
    console.warn('Géocodage Open-Meteo:', error instanceof Error ? error.message : error);
  }

  try {
    const nominatim = await fromNominatim(place.trim());
    if (nominatim) await writeStoredPlace(key, nominatim);
    return remember(key, nominatim);
  } catch (error) {
    console.warn('Géocodage Nominatim:', error instanceof Error ? error.message : error);
    return remember(key, null);
  }
}
