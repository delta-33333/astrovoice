import 'server-only';
import { DateTime } from 'luxon';
import { findUserByEmail, createPasswordlessUser, normalizeFirstName } from './auth';
import { fallbackMemory, type MemoryDraft } from './call-memory-text';
import {
  FREE_CALL_CODE_TTL_MS,
  FREE_CALL_MAX_ATTEMPTS,
  FREE_CALL_SECONDS,
  clampTrialSeconds,
  codeStillValid,
  echoTrialCode,
  freeCallDailyCap,
  freeCallEnabled,
  hashCode,
  hashDevice,
  hashNetwork,
  randomTrialCode,
  remainingTrialSeconds,
  trialEmailDisposable,
  trialEmailNorm,
  trialStartDecision,
  type TrialBlock,
} from './free-call';
import { isMissingRelation } from './missing-relation';
import { authSecret } from './session';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';
import { listDirectoryAdvisors } from './slots';
import type { Locale } from './seo';

export interface TrialRow {
  id: string;
  email_norm: string;
  user_id: string | null;
  ip_hash: string;
  device_hash: string;
  code_hash: string | null;
  code_expires_at: string | null;
  code_attempts: number;
  verified_at: string | null;
  seconds_used: number;
  token_issued_at: string | null;
  advisor_id: string | null;
  heard_from: string | null;
  summary: string | null;
  locale: string;
}

function parisStart(now = new Date()): string {
  return DateTime.fromJSDate(now, { zone: 'Europe/Paris' }).startOf('day').toUTC().toISO() ?? now.toISOString();
}

async function countWhere(column: string, value: string, exceptEmail?: string): Promise<number | 'missing'> {
  let query = getSupabaseAdmin().from('free_trials').select('id', { count: 'exact', head: true }).eq(column, value);
  if (exceptEmail) query = query.neq('email_norm', exceptEmail);
  const { count, error } = await query;
  if (error) {
    if (isMissingRelation(error)) return 'missing';
    throw new Error(error.message);
  }
  return count ?? 0;
}

export async function readTrialByEmail(emailNorm: string): Promise<TrialRow | null | 'missing'> {
  if (!supabaseAvailable) return 'missing';
  const { data, error } = await getSupabaseAdmin().from('free_trials').select('*').eq('email_norm', emailNorm).maybeSingle();
  if (error) {
    if (isMissingRelation(error)) return 'missing';
    throw new Error(error.message);
  }
  return (data as TrialRow | null) ?? null;
}

export async function readTrialById(id: string): Promise<TrialRow | null | 'missing'> {
  if (!supabaseAvailable) return 'missing';
  const { data, error } = await getSupabaseAdmin().from('free_trials').select('*').eq('id', id).maybeSingle();
  if (error) {
    if (isMissingRelation(error)) return 'missing';
    throw new Error(error.message);
  }
  return (data as TrialRow | null) ?? null;
}

async function alreadyPaid(email: string): Promise<boolean> {
  const user = await findUserByEmail(email).catch(() => null);
  if (!user) return false;
  if (user.intro_claimed) return true;
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing', 'past_due'])
    .limit(1);
  if (error) {
    if (isMissingRelation(error)) return false;
    return false;
  }
  return (data ?? []).length > 0;
}

export async function beginTrial(input: {
  email: string;
  ip: string;
  deviceId: string;
  locale: Locale;
  heardFrom: string | null;
  firstName: string | null;
}): Promise<{ status: 'ok'; email: string; code?: string } | { status: TrialBlock | 'unavailable' }> {
  if (!freeCallEnabled()) return { status: 'disabled' };
  if (!supabaseAvailable) return { status: 'unavailable' };
  const secret = authSecret();
  if (!secret) return { status: 'unavailable' };
  const norm = trialEmailNorm(input.email);
  if (!norm) return { status: 'mismatch' };
  if (trialEmailDisposable(input.email)) return { status: 'disposable' };

  const existing = await readTrialByEmail(norm);
  if (existing === 'missing') return { status: 'unavailable' };
  const consumed = Boolean(existing?.verified_at) || (existing?.seconds_used ?? 0) > 0;
  const ipHash = hashNetwork(input.ip, secret);
  const deviceHash = hashDevice(input.deviceId, secret);

  if (!existing) {
    const [deviceUsed, ipUsed, paid, verified] = await Promise.all([
      countWhere('device_hash', deviceHash),
      countWhere('ip_hash', ipHash),
      alreadyPaid(norm),
      (async () => {
        const { count, error } = await getSupabaseAdmin()
          .from('free_trials')
          .select('id', { count: 'exact', head: true })
          .gte('verified_at', parisStart());
        if (error) {
          if (isMissingRelation(error)) return 'missing' as const;
          throw new Error(error.message);
        }
        return count ?? 0;
      })(),
    ]);
    if (deviceUsed === 'missing' || ipUsed === 'missing' || verified === 'missing') return { status: 'unavailable' };
    const decision = trialStartDecision({
      enabled: true,
      disposable: false,
      sameEmailExists: false,
      deviceUsedByOther: deviceUsed > 0,
      ipUsedByOther: ipUsed > 0,
      alreadyPaid: paid,
      verifiedToday: verified,
      cap: freeCallDailyCap(),
    });
    if (decision !== 'ok') return { status: decision };
    const code = randomTrialCode();
    const inserted = await getSupabaseAdmin().from('free_trials').insert({
      email_norm: norm,
      ip_hash: ipHash,
      device_hash: deviceHash,
      code_hash: hashCode(code, secret),
      code_expires_at: new Date(Date.now() + FREE_CALL_CODE_TTL_MS).toISOString(),
      code_attempts: 0,
      heard_from: input.heardFrom,
      locale: input.locale,
    });
    if (inserted.error) {
      if (isMissingRelation(inserted.error)) return { status: 'unavailable' };
      if (inserted.error.code === '23505') return { status: 'email' };
      console.warn('Essai:', inserted.error.message);
      return { status: 'unavailable' };
    }
    return { status: 'ok', email: norm, code };
  }

  if (consumed) return { status: 'email' };
  const code = randomTrialCode();
  const updated = await getSupabaseAdmin().from('free_trials').update({
    code_hash: hashCode(code, secret),
    code_expires_at: new Date(Date.now() + FREE_CALL_CODE_TTL_MS).toISOString(),
    code_attempts: 0,
    heard_from: input.heardFrom ?? existing.heard_from,
    locale: input.locale,
  }).eq('id', existing.id);
  if (updated.error) return { status: 'unavailable' };
  void input.firstName;
  return { status: 'ok', email: norm, code };
}

export async function verifyTrial(input: {
  email: string;
  code: string;
  locale: Locale;
  firstName: string | null;
}): Promise<{ status: 'ok'; trialId: string; userId: string; advisorId: string } | { status: TrialBlock | 'unavailable' }> {
  if (!freeCallEnabled()) return { status: 'disabled' };
  const secret = authSecret();
  if (!secret || !supabaseAvailable) return { status: 'unavailable' };
  const norm = trialEmailNorm(input.email);
  if (!norm || !/^\d{6}$/.test(input.code)) return { status: 'mismatch' };
  const row = await readTrialByEmail(norm);
  if (row === 'missing' || !row) return row === 'missing' ? { status: 'unavailable' } : { status: 'mismatch' };
  if (row.verified_at) return { status: 'email' };
  if (row.code_attempts >= FREE_CALL_MAX_ATTEMPTS) return { status: 'attempts' };
  if (!codeStillValid(row.code_expires_at)) return { status: 'expired' };
  if (row.code_hash !== hashCode(input.code, secret)) {
    await getSupabaseAdmin().from('free_trials').update({ code_attempts: row.code_attempts + 1 }).eq('id', row.id);
    return { status: 'mismatch' };
  }
  const verifiedToday = await getSupabaseAdmin()
    .from('free_trials')
    .select('id', { count: 'exact', head: true })
    .gte('verified_at', parisStart());
  if (verifiedToday.error) {
    if (isMissingRelation(verifiedToday.error)) return { status: 'unavailable' };
    return { status: 'unavailable' };
  }
  if ((verifiedToday.count ?? 0) >= freeCallDailyCap()) return { status: 'cap' };

  let user = await findUserByEmail(norm);
  if (user?.intro_claimed) return { status: 'paid' };
  if (!user) {
    const created = await createPasswordlessUser(norm, normalizeFirstName(input.firstName) || 'Vous');
    if (!created.userId) return { status: 'unavailable' };
    user = await findUserByEmail(norm);
  }
  if (!user) return { status: 'unavailable' };
  const advisorId = await pickAdvisor(input.locale);
  const saved = await getSupabaseAdmin().from('free_trials').update({
    verified_at: new Date().toISOString(),
    user_id: user.id,
    advisor_id: advisorId,
    code_hash: null,
  }).eq('id', row.id);
  if (saved.error) return { status: 'unavailable' };
  if (input.firstName) {
    await getSupabaseAdmin().from('users').update({ heard_from: row.heard_from }).eq('id', user.id);
  } else if (row.heard_from) {
    await getSupabaseAdmin().from('users').update({ heard_from: row.heard_from }).eq('id', user.id);
  }
  return { status: 'ok', trialId: row.id, userId: user.id, advisorId };
}

async function pickAdvisor(locale: Locale): Promise<string> {
  try {
    const { advisors } = await listDirectoryAdvisors();
    const ranked = [...advisors].sort((a, b) => {
      const lang = Number(b.languages.includes(locale)) - Number(a.languages.includes(locale));
      if (lang) return lang;
      return Number(b.availability.hasImmediate) - Number(a.availability.hasImmediate);
    });
    if (ranked[0]) return ranked[0].id;
  } catch {
    /* annuaire indisponible : repli plus bas */
  }
  const { data } = await getSupabaseAdmin().from('advisors').select('id').eq('active', true).limit(1);
  const id = (data?.[0] as { id?: string } | undefined)?.id;
  if (!id) throw new Error('NO_ADVISOR');
  return id;
}

export async function issueTrialSeconds(trialId: string, userId: string): Promise<number | TrialBlock | 'unavailable'> {
  if (!freeCallEnabled()) return 'disabled';
  const row = await readTrialById(trialId);
  if (row === 'missing') return 'unavailable';
  if (!row || row.user_id !== userId || !row.verified_at) return 'mismatch';
  const left = remainingTrialSeconds({ secondsUsed: row.seconds_used, tokenIssuedAt: row.token_issued_at });
  if (left <= 0) return 'email';
  const burned = FREE_CALL_SECONDS - left;
  const saved = await getSupabaseAdmin().from('free_trials').update({
    seconds_used: burned,
    token_issued_at: new Date().toISOString(),
  }).eq('id', trialId);
  if (saved.error) return 'unavailable';
  return left;
}

export async function finishTrial(input: {
  trialId: string;
  userId: string;
  seconds: number;
  lines: Array<{ role: 'user' | 'advisor'; text: string }>;
}): Promise<{ summary: string; advisorId: string | null } | null> {
  const row = await readTrialById(input.trialId);
  if (!row || row === 'missing' || row.user_id !== input.userId) return null;
  const seconds = Math.max(row.seconds_used, clampTrialSeconds(input.seconds));
  const draft: MemoryDraft = fallbackMemory(input.lines);
  await getSupabaseAdmin().from('free_trials').update({
    seconds_used: Math.min(FREE_CALL_SECONDS, seconds),
    token_issued_at: null,
    summary: draft.summary,
  }).eq('id', row.id);
  await getSupabaseAdmin().from('call_memories').insert({
    user_id: input.userId,
    booking_id: null,
    trial_id: row.id,
    advisor_id: row.advisor_id,
    topics: draft.topics,
    questions: draft.questions,
    advice: draft.advice,
    mood: draft.mood,
    summary: draft.summary,
  });
  return { summary: draft.summary, advisorId: row.advisor_id };
}
