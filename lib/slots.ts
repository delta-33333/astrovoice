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

interface SummaryRow {
  advisor_id: string;
  slots_today: number;
  slots_week: number;
  next_slot_at: string | null;
  has_immediate: boolean;
  immediate_slot_id: string | null;
  immediate_starts_at: string | null;
  upcoming: string[] | null;
}

const EMPTY_AVAILABILITY: AdvisorAvailability = {
  slotsToday: 0,
  slotsWeek: 0,
  nextSlotAt: null,
  hasImmediate: false,
  scarcity: null,
  immediateSlotId: null,
  immediateStartsAt: null,
};

const IMMEDIATE_MS = 15 * 60 * 1000;

function decorate(
  advisor: PublicAdvisor,
  starts: Date[],
  now: Date,
  extra?: Partial<AdvisorAvailability>
): DirectoryAdvisor {
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
  const soon = upcoming.find((start) => start.getTime() <= now.getTime() + IMMEDIATE_MS) ?? null;

  return {
    ...advisor,
    badges: advisorBadges({
      reviewCount: advisor.reviewCount,
      specialties: advisor.specialties,
      age: advisor.age,
      bookingCount: advisor.bookingCount,
      hasImmediateSlot: extra?.hasImmediate ?? immediate,
    }),
    availability: {
      slotsToday: extra?.slotsToday ?? slotsToday,
      slotsWeek: extra?.slotsWeek ?? upcoming.length,
      nextSlotAt: extra?.nextSlotAt ?? (next ? next.toISOString() : null),
      hasImmediate: extra?.hasImmediate ?? immediate,
      scarcity: scarcityLabel(now, upcoming),
      immediateSlotId: extra?.immediateSlotId ?? null,
      immediateStartsAt: extra?.immediateStartsAt ?? (soon ? soon.toISOString() : null),
    },
  };
}

export async function ensureImmediateAvailability(): Promise<unknown> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  const { data, error } = await getSupabaseAdmin().rpc('ensure_immediate_availability');
  if (error) throw new Error(error.message);
  return data;
}

async function topUpImmediateSlots(): Promise<void> {
  try {
    await ensureImmediateAvailability();
  } catch (error) {
    console.warn('Créneaux immédiats:', error instanceof Error ? error.message : error);
  }
}

async function loadDirectorySummary(): Promise<SummaryRow[] | null> {
  const { data, error } = await getSupabaseAdmin().rpc('directory_slot_summary');
  if (error) {
    console.warn('Résumé créneaux:', error.message);
    return null;
  }
  return (data ?? []) as SummaryRow[];
}

async function loadFutureAvailableSlots(): Promise<SlotRow[]> {
  const pageSize = 1000;
  const rows: SlotRow[] = [];
  for (let from = 0; from < 20000; from += pageSize) {
    const { data, error } = await getSupabaseAdmin()
      .from('slots')
      .select('id, advisor_id, starts_at, duration_min, status')
      .eq('status', 'available')
      .gt('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);
    const batch = (data ?? []) as SlotRow[];
    rows.push(...batch);
    if (batch.length < pageSize) break;
  }
  return rows;
}

function immediateFrom(rows: SlotRow[], now: Date): { id: string; startsAt: string } | null {
  const horizon = now.getTime() + IMMEDIATE_MS;
  const match = rows
    .filter((row) => {
      const time = new Date(row.starts_at).getTime();
      return time > now.getTime() && time <= horizon;
    })
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
  return match ? { id: match.id, startsAt: match.starts_at } : null;
}

export async function listDirectoryAdvisors(): Promise<{
  advisors: DirectoryAdvisor[];
  unavailable: boolean;
}> {
  const base = await listPublicAdvisors();
  if (base.unavailable) return { advisors: [], unavailable: true };

  const now = new Date();
  await topUpImmediateSlots();

  try {
    const summary = await loadDirectorySummary();
    if (summary) {
      const byId = new Map(summary.map((row) => [row.advisor_id, row]));
      return {
        unavailable: false,
        advisors: base.advisors.map((advisor) => {
          const row = byId.get(advisor.id);
          const upcoming = Array.isArray(row?.upcoming) ? row.upcoming : [];
          const starts = upcoming.map((value) => new Date(value));
          return decorate(advisor, starts, now, row ? {
            slotsToday: Number(row.slots_today) || 0,
            slotsWeek: Number(row.slots_week) || 0,
            nextSlotAt: row.next_slot_at,
            hasImmediate: Boolean(row.has_immediate),
            immediateSlotId: row.immediate_slot_id,
            immediateStartsAt: row.immediate_starts_at,
          } : undefined);
        }),
      };
    }

    const rows = await loadFutureAvailableSlots();
    const byAdvisor = new Map<string, SlotRow[]>();
    for (const row of rows) {
      const list = byAdvisor.get(row.advisor_id) ?? [];
      list.push(row);
      byAdvisor.set(row.advisor_id, list);
    }

    return {
      unavailable: false,
      advisors: base.advisors.map((advisor) => {
        const advisorRows = byAdvisor.get(advisor.id) ?? [];
        const soon = immediateFrom(advisorRows, now);
        return decorate(
          advisor,
          advisorRows.map((row) => new Date(row.starts_at)),
          now,
          soon ? { immediateSlotId: soon.id, immediateStartsAt: soon.startsAt } : undefined
        );
      }),
    };
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
}

export async function getAdvisorProfile(slug: string): Promise<{
  advisor: DirectoryAdvisor | null;
  slots: AdvisorSlot[];
  unavailable: boolean;
}> {
  if (!supabaseAvailable) {
    return { advisor: null, slots: [], unavailable: true };
  }

  await topUpImmediateSlots();
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
  const soon = immediateFrom(rows, now);
  return {
    advisor: decorate(toPublicAdvisor(record), starts, now, soon ? {
      immediateSlotId: soon.id,
      immediateStartsAt: soon.startsAt,
    } : undefined),
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
