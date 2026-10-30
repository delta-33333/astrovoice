import 'server-only';
import { validRefCode } from './affiliate';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

/** Clic ou inscription attribué à un affilié actif (dédoublonné par clé). */
export async function recordAffiliateEvent(ref: unknown, kind: 'click' | 'signup', dedupeKey: string): Promise<void> {
  const code = validRefCode(ref);
  if (!code || !supabaseAvailable || !dedupeKey) return;
  const admin = getSupabaseAdmin();
  const { data } = await admin.from('affiliates').select('id, status').eq('code', code).maybeSingle();
  if (!data || data.status !== 'active') return;
  const { error } = await admin.from('affiliate_events').insert({ affiliate_id: data.id, kind, dedupe_key: dedupeKey.slice(0, 200) });
  if (error && error.code !== '23505') console.warn('Affiliation événement:', error.message);
}
