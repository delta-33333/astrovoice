import 'server-only';
import { isMissingRelation } from './missing-relation';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export async function loadTrialAttribution(): Promise<{
  unavailable: boolean;
  trials: number;
  paid: number;
  heard: Array<{ source: string; count: number }>;
  bots: Array<{ source: string; count: number }>;
}> {
  const empty = { unavailable: true, trials: 0, paid: 0, heard: [] as Array<{ source: string; count: number }>, bots: [] as Array<{ source: string; count: number }> };
  if (!supabaseAvailable) return empty;
  const admin = getSupabaseAdmin();
  const bots = await loadAiBots();
  const trials = await admin.from('free_trials').select('id, user_id', { count: 'exact' }).limit(1000);
  if (trials.error) {
    return { ...empty, unavailable: true, bots };
  }
  const userIds = [...new Set((trials.data ?? []).map((row) => String((row as { user_id?: string | null }).user_id || '')).filter(Boolean))];
  let paid = 0;
  if (userIds.length > 0) {
    const subs = await admin.from('subscriptions').select('user_id').in('user_id', userIds).limit(1000);
    if (!subs.error) {
      paid = new Set((subs.data ?? []).map((row) => String((row as { user_id?: string }).user_id || '')).filter(Boolean)).size;
    }
  }
  const users = await admin.from('users').select('heard_from').not('heard_from', 'is', null).limit(1000);
  if (users.error && isMissingRelation(users.error)) {
    return { unavailable: false, trials: trials.count ?? 0, paid, heard: [], bots };
  }
  const map = new Map<string, number>();
  for (const row of users.data ?? []) {
    const source = String((row as { heard_from?: string | null }).heard_from || '');
    if (!source) continue;
    map.set(source, (map.get(source) || 0) + 1);
  }
  return {
    unavailable: false,
    trials: trials.count ?? 0,
    paid,
    heard: [...map.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
    bots,
  };
}

async function loadAiBots(): Promise<Array<{ source: string; count: number }>> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('events')
      .select('metadata')
      .eq('name', 'ai_bot_hit')
      .limit(1000);
    if (error) return [];
    const map = new Map<string, number>();
    for (const row of data ?? []) {
      const metadata = (row as { metadata?: { bot?: string } | null }).metadata;
      const source = String(metadata?.bot || 'inconnu');
      map.set(source, (map.get(source) || 0) + 1);
    }
    return [...map.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}
