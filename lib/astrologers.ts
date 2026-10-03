import { advisorBadges } from './advisor-badges';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';
import type { PublicAdvisor, VoiceId } from './types';

const VOICES: readonly VoiceId[] = ['ara', 'eve', 'leo', 'rex', 'sal'];

const PUBLIC_COLUMNS =
  'id, slug, first_name, last_name, age, gender, languages, specialties, reading_style, bio, photo_url, voice_id, featured, daily_capacity';

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
}

function asVoice(value: string): VoiceId {
  return VOICES.includes(value as VoiceId) ? (value as VoiceId) : 'ara';
}

function toPublic(row: AdvisorRow, reviewCount = 0): PublicAdvisor {
  const specialties = row.specialties ?? [];
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
    averageRating: null,
    badges: advisorBadges({
      reviewCount,
      specialties,
      age: row.age,
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

  const { data, error } = await getSupabaseAdmin()
    .from('advisors')
    .select(PUBLIC_COLUMNS)
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('last_name', { ascending: true });

  if (error) {
    console.error('list advisors:', error.message);
    throw new Error('ADVISORS_UNAVAILABLE');
  }

  return {
    advisors: ((data ?? []) as AdvisorRow[]).map((row) => toPublic(row)),
    unavailable: false,
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAdvisorById(idOrSlug: string): Promise<AdvisorRecord | null> {
  if (!supabaseAvailable || !idOrSlug) return null;
  const column = UUID_RE.test(idOrSlug) ? 'id' : 'slug';

  const { data, error } = await getSupabaseAdmin()
    .from('advisors')
    .select(`${PUBLIC_COLUMNS}, persona_prompt`)
    .eq(column, idOrSlug)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    console.error('get advisor:', error.message);
    throw new Error('ADVISORS_UNAVAILABLE');
  }
  if (!data) return null;

  const row = data as AdvisorRow;
  return {
    ...toPublic(row),
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
