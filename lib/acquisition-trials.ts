import 'server-only';
import { isMissingRelation } from './missing-relation';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export async function loadTrialAttribution(): Promise<{
  unavailable: boolean;
  trials: number;
  heard: Array<{ source: string; count: number }>;
}> {
  if (!supabaseAvailable) return { unavailable: true, trials: 0, heard: [] };
  const admin = getSupabaseAdmin();
  const trials = await admin.from('free_trials').select('id', { count: 'exact', head: true });
  if (trials.error) {
    if (isMissingRelation(trials.error)) return { unavailable: true, trials: 0, heard: [] };
    return { unavailable: true, trials: 0, heard: [] };
  }
  const users = await admin.from('users').select('heard_from').not('heard_from', 'is', null).limit(1000);
  if (users.error) {
    return { unavailable: isMissingRelation(users.error), trials: trials.count ?? 0, heard: [] };
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
    heard: [...map.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
  };
}
