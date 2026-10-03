import { advisorBadges } from './advisor-badges';
import { MAX_EUR_CENTS, pricePerMinCents, yearsFromAge } from './money';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';
import type { PublicAdvisor, VoiceId } from './types';

const VOICES: readonly VoiceId[] = ['ara', 'eve', 'leo', 'rex', 'sal'];

const PUBLIC_COLUMNS =
  'id, slug, first_name, last_name, age, gender, languages, specialties, reading_style, bio, photo_url, voice_id, featured, daily_capacity';
const PRICE_COLUMNS = 'years_experience, price_per_min_cents';

export interface AdvisorRecord extends PublicAdvisor {
  personaPrompt: string;
}

interface AdvisorRow {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: 'femme' | 'homme';
  languages: string[] | null;
  specialties: string[] | null;
  reading_style: string;
  bio: string;
  photo_url: string | null;
  voice_id: string;
  persona_prompt?: string | null;
  featured: boolean;
  daily_capacity: number;
  years_experience?: number | null;
  price_per_min_cents?: number | null;
}

function missingColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = error.message || '';
  return error.code === '42703' || error.code === 'PGRST204' || /does not exist/i.test(message);
}

function asVoice(value: string): VoiceId {
  return VOICES.includes(value as VoiceId) ? (value as VoiceId) : 'ara';
}

interface AdvisorSignal {
  advisor_id: string;
  review_count: number;
  rating_sum: number | null;
  booking_count: number;
}

async function loadSignals(): Promise<Map<string, AdvisorSignal>> {
  const map = new Map<string, AdvisorSignal>();
  if (!supabaseAvailable) return map;
  const { data, error } = await getSupabaseAdmin()
    .from('advisor_signals')
    .select('advisor_id, review_count, rating_sum, booking_count');
  if (error) {
    console.warn('Signaux conseillers:', error.message);
    return map;
  }
  for (const row of (data ?? []) as AdvisorSignal[]) {
    map.set(row.advisor_id, row);
  }
  return map;
}

function toPublic(row: AdvisorRow, signal?: AdvisorSignal): PublicAdvisor {
  const specialties = row.specialties ?? [];
  const reviewCount = signal?.review_count ?? 0;
  const bookingCount = signal?.booking_count ?? 0;
  const averageRating =
    reviewCount >= 5 && signal?.rating_sum != null
      ? Math.round((signal.rating_sum / reviewCount) * 10) / 10
      : null;
  return {
    id: row.id,
    slug: row.slug,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`,
    age: row.age,
    gender: row.gender,
    languages: row.languages ?? [],
    specialties,
    readingStyle: row.reading_style,
    bio: row.bio,
    photoUrl: row.photo_url,
    voiceId: asVoice(row.voice_id),
    featured: row.featured,
    dailyCapacity: row.daily_capacity,
    reviewCount,
    averageRating,
    bookingCount,
    badges: advisorBadges({
      reviewCount,
      specialties,
      age: row.age,
      bookingCount,
    }),
    yearsExperience:
      row.years_experience != null && row.years_experience > 0
        ? row.years_experience
        : yearsFromAge(row.age),
    pricePerMinCents:
      row.price_per_min_cents != null && row.price_per_min_cents >= 50
        ? Math.min(row.price_per_min_cents, MAX_EUR_CENTS)
        : pricePerMinCents({
            years: row.years_experience,
            age: row.age,
            specialties,
          }),
  };
}

export async function listPublicAdvisors(): Promise<{
  advisors: PublicAdvisor[];
  unavailable: boolean;
}> {
  if (!supabaseAvailable) {
    return { advisors: [], unavailable: true };
  }

  const admin = getSupabaseAdmin();
  let { data, error } = await admin
    .from('advisors')
    .select(`${PUBLIC_COLUMNS}, ${PRICE_COLUMNS}`)
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('last_name', { ascending: true });

  if (error && missingColumn(error)) {
    const fallback = await admin
      .from('advisors')
      .select(PUBLIC_COLUMNS)
      .eq('active', true)
      .order('featured', { ascending: false })
      .order('last_name', { ascending: true });
    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error) {
    console.error('list advisors:', error.message);
    throw new Error('ADVISORS_UNAVAILABLE');
  }

  const signals = await loadSignals();
  return {
    advisors: ((data ?? []) as AdvisorRow[]).map((row) => toPublic(row, signals.get(row.id))),
    unavailable: false,
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAdvisorById(idOrSlug: string): Promise<AdvisorRecord | null> {
  if (!supabaseAvailable || !idOrSlug) return null;
  const column = UUID_RE.test(idOrSlug) ? 'id' : 'slug';

  const admin = getSupabaseAdmin();
  let { data, error } = await admin
    .from('advisors')
    .select(`${PUBLIC_COLUMNS}, ${PRICE_COLUMNS}, persona_prompt`)
    .eq(column, idOrSlug)
    .eq('active', true)
    .maybeSingle();

  if (error && missingColumn(error)) {
    const fallback = await admin
      .from('advisors')
      .select(`${PUBLIC_COLUMNS}, persona_prompt`)
      .eq(column, idOrSlug)
      .eq('active', true)
      .maybeSingle();
    data = fallback.data as typeof data;
    error = fallback.error;
  }

  if (error) {
    console.error('get advisor:', error.message);
    throw new Error('ADVISORS_UNAVAILABLE');
  }
  if (!data) return null;

  const row = data as AdvisorRow;
  const signals = await loadSignals();
  return {
    ...toPublic(row, signals.get(row.id)),
    personaPrompt: row.persona_prompt ?? '',
  };
}

export function toPublicAdvisor(advisor: AdvisorRecord): PublicAdvisor {
  const { personaPrompt, ...pub } = advisor;
  void personaPrompt;
  return pub;
}

export async function getPublicAdvisorById(id: string): Promise<PublicAdvisor | null> {
  const advisor = await getAdvisorById(id);
  return advisor ? toPublicAdvisor(advisor) : null;
}
