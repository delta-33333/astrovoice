import 'server-only';
import type { TranscriptLine } from './call-records';
import {
  asMemoryLocale,
  clipList,
  fallbackMemory,
  memoryEnabled,
  parseMemoryDraft,
  recapBookPath,
  recapMail,
  weekTransitLines,
  type MemoryDraft,
  type MemoryNote,
} from './call-memory-text';
import { dispatchMail } from './email';
import { isMissingRelation } from './missing-relation';
import { privacyPath } from './privacy-copy';
import type { Locale } from './seo';
import { appBaseUrl } from './stripe';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';
import { writeProse } from './xai';

export async function listCallMemories(userId: string, limit: number): Promise<MemoryNote[]> {
  if (!supabaseAvailable) return [];
  const { data, error } = await getSupabaseAdmin()
    .from('call_memories')
    .select('id, booking_id, created_at, topics, questions, advice, mood, summary')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    if (!isMissingRelation(error)) console.warn('Mémoire:', error.message);
    return [];
  }
  return (data ?? []).map((row) => asNote(row as Parameters<typeof asNote>[0]));
}

export async function setAdvisorMemory(userId: string, enabled: boolean): Promise<boolean> {
  if (!supabaseAvailable) return false;
  const { error } = await getSupabaseAdmin().from('users').update({ advisor_memory_enabled: enabled }).eq('id', userId);
  if (error) {
    if (!isMissingRelation(error)) console.warn('Mémoire:', error.message);
    return false;
  }
  return true;
}

export async function deleteCallMemories(userId: string): Promise<boolean> {
  if (!supabaseAvailable) return false;
  const { error } = await getSupabaseAdmin().from('call_memories').delete().eq('user_id', userId);
  if (error) {
    if (!isMissingRelation(error)) console.warn('Mémoire:', error.message);
    return false;
  }
  return true;
}

export async function storeCallMemory(input: {
  userId: string;
  bookingId: string;
  advisorId: string | null;
  draft: MemoryDraft;
}): Promise<boolean> {
  if (!supabaseAvailable) return false;
  const { error } = await getSupabaseAdmin().from('call_memories').upsert(
    {
      user_id: input.userId,
      booking_id: input.bookingId,
      advisor_id: input.advisorId,
      topics: input.draft.topics,
      questions: input.draft.questions,
      advice: input.draft.advice,
      mood: input.draft.mood,
      summary: input.draft.summary,
    },
    { onConflict: 'booking_id' }
  );
  if (error) {
    if (!isMissingRelation(error)) console.warn('Mémoire:', error.message);
    return false;
  }
  return true;
}

export async function draftMemory(lines: TranscriptLine[], locale: Locale): Promise<MemoryDraft> {
  const fallback = fallbackMemory(lines);
  const transcript = lines
    .slice(-80)
    .map((line) => `${line.role === 'user' ? 'Personne' : 'Conseiller'}: ${line.text}`)
    .join('\n')
    .slice(0, 12000);
  if (!transcript.trim()) return fallback;
  const system =
    'Tu résumes une consultation d’astrologie en JSON compact. ' +
    'Clés exactes : topics (3 max), questions (3 max), advice (3 max), mood (un mot), summary (2 phrases). ' +
    `Langue : ${locale}. Tu n’inventes aucun fait absent de l’échange. ` +
    'N’emploie jamais les mots IA, AI, Grok, xAI, chatbot, bot, modèle, ni « intelligence artificielle ».';
  try {
    const prose = await writeProse(system, transcript);
    return parseMemoryDraft(prose) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function rememberEndedCall(input: {
  userId: string;
  bookingId: string;
  advisorId: string | null;
  lines: TranscriptLine[];
  locale: string | null;
  enabled: boolean;
  email: string | null;
  name: string;
}): Promise<void> {
  if (!memoryEnabled(input.enabled)) return;
  const locale = asMemoryLocale(input.locale);
  const draft = await draftMemory(input.lines, locale);
  const stored = await storeCallMemory({
    userId: input.userId,
    bookingId: input.bookingId,
    advisorId: input.advisorId,
    draft,
  });
  if (!stored || !input.email) return;
  const origin = appBaseUrl();
  const mail = recapMail({
    locale,
    name: input.name,
    summary: draft.summary,
    topics: draft.topics,
    transits: weekTransitLines(locale, new Date()),
    bookUrl: `${origin}${recapBookPath()}`,
    privacyUrl: `${origin}${privacyPath(locale)}`,
  });
  await dispatchMail({ to: input.email, subject: mail.subject, html: mail.html });
}

function asNote(row: {
  id: string;
  booking_id: string | null;
  created_at: string;
  topics: unknown;
  questions: unknown;
  advice: unknown;
  mood: string | null;
  summary: string | null;
}): MemoryNote {
  return {
    id: row.id,
    bookingId: row.booking_id,
    createdAt: row.created_at,
    topics: clipList(row.topics, 3),
    questions: clipList(row.questions, 3),
    advice: clipList(row.advice, 3),
    mood: row.mood || '',
    summary: row.summary || '',
  };
}
