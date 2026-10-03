import { advisorBadges } from './advisor-badges';
import { listPublicAdvisors, getAdvisorById, toPublicAdvisor } from './astrologers';
import { hasImmediateSlot, scarcityLabel } from './scarcity';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';
import type { AdvisorAvailability, AdvisorSlot, DirectoryAdvisor, PublicAdvisor } from './types';

interface SlotRow {
  id: string;
  advisor_id: string;
  starts_at: string;
  duration_min: number;
  status: 'available' | 'held' | 'booked';
}

const EMPTY_AVAILABILITY: AdvisorAvailability = {
  slotsToday: 0,
  slotsWeek: 0,
  nextSlotAt: null,
  hasImmediate: false,
  scarcity: null,
};

function decorate(advisor: PublicAdvisor, starts: Date[], now: Date): DirectoryAdvisor {
  const upcoming = starts.filter((start) => start.getTime() > now.getTime());
  const todayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const slotsToday = upcoming.filter((start) => {
    const key = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(start);
    return key === todayKey;
  }).length;
  const immediate = hasImmediateSlot(now, upcoming);
  const next = upcoming.sort((a, b) => a.getTime() - b.getTime())[0] ?? null;

  return {
    ...advisor,
    badges: advisorBadges({
      reviewCount: advisor.reviewCount,
      specialties: advisor.specialties,
      age: advisor.age,
      bookingCount: advisor.bookingCount,
      hasImmediateSlot: immediate,
    }),
    availability: {
      slotsToday,
      slotsWeek: upcoming.length,
      nextSlotAt: next ? next.toISOString() : null,
      hasImmediate: immediate,
      scarcity: scarcityLabel(now, upcoming),
    },
  };
}

async function loadFutureAvailableSlots(): Promise<SlotRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('slots')
    .select('id, advisor_id, starts_at, duration_min, status')
    .eq('status', 'available')
    .gt('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(20000);

  if (error) throw new Error(error.message);
  return (data ?? []) as SlotRow[];
}

export async function listDirectoryAdvisors(): Promise<{
  advisors: DirectoryAdvisor[];
  unavailable: boolean;
}> {
  const base = await listPublicAdvisors();
  if (base.unavailable) return { advisors: [], unavailable: true };

  const now = new Date();
  let rows: SlotRow[] = [];
  try {
    rows = await loadFutureAvailableSlots();
  } catch (error) {
    console.warn('Créneaux indisponibles:', error instanceof Error ? error.message : error);
    return {
      advisors: base.advisors.map((advisor) => ({
        ...advisor,
        availability: EMPTY_AVAILABILITY,
      })),
      unavailable: false,
    };
  }

  const byAdvisor = new Map<string, Date[]>();
  for (const row of rows) {
    const list = byAdvisor.get(row.advisor_id) ?? [];
    list.push(new Date(row.starts_at));
    byAdvisor.set(row.advisor_id, list);
  }

  return {
    advisors: base.advisors.map((advisor) => decorate(advisor, byAdvisor.get(advisor.id) ?? [], now)),
    unavailable: false,
  };
}

export async function getAdvisorProfile(slug: string): Promise<{
  advisor: DirectoryAdvisor | null;
  slots: AdvisorSlot[];
  unavailable: boolean;
}> {
  if (!supabaseAvailable) {
    return { advisor: null, slots: [], unavailable: true };
  }

  const record = await getAdvisorById(slug);
  if (!record) return { advisor: null, slots: [], unavailable: false };

  const now = new Date();
  const { data, error } = await getSupabaseAdmin()
    .from('slots')
    .select('id, advisor_id, starts_at, duration_min, status')
    .eq('advisor_id', record.id)
    .eq('status', 'available')
    .gt('starts_at', now.toISOString())
    .order('starts_at', { ascending: true })
    .limit(80);

  if (error) {
    console.error('slots profil:', error.message);
    throw new Error('SLOTS_UNAVAILABLE');
  }

  const rows = (data ?? []) as SlotRow[];
  const starts = rows.map((row) => new Date(row.starts_at));
  return {
    advisor: decorate(toPublicAdvisor(record), starts, now),
    slots: rows.map((row) => ({
      id: row.id,
      startsAt: row.starts_at,
      durationMin: row.duration_min,
    })),
    unavailable: false,
  };
}

export async function regenerateSlots(): Promise<unknown> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  const { data, error } = await getSupabaseAdmin().rpc('generate_advisor_slots');
  if (error) throw new Error(error.message);
  return data;
}
