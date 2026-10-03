import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export interface TranscriptLine {
  role: 'user' | 'advisor';
  text: string;
  at: string;
}

export interface CallSessionRow {
  id: string;
  user_id: string | null;
  astrologer_id: string | null;
  booking_id: string | null;
  transcript: TranscriptLine[] | null;
  summary: string | null;
  key_points: string[] | null;
  ended_at: string | null;
  duration_seconds: number | null;
  summary_paid_at: string | null;
  summary_emailed_at: string | null;
  summary_link_emailed_at: string | null;
  summary_declined: boolean;
  summary_checkout_session_id: string | null;
}

export async function ensureCallSession(input: {
  userId: string;
  advisorId: string;
  bookingId: string | null;
}): Promise<string> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  const admin = getSupabaseAdmin();
  if (input.bookingId) {
    const existing = await admin
      .from('call_sessions')
      .select('id')
      .eq('booking_id', input.bookingId)
      .maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    if (existing.data?.id) return existing.data.id as string;
  }

  const inserted = await admin
    .from('call_sessions')
    .insert({
      user_id: input.userId,
      astrologer_id: input.advisorId,
      booking_id: input.bookingId,
      transcript: [],
    })
    .select('id')
    .single();
  if (inserted.error || !inserted.data) {
    throw new Error(inserted.error?.message || 'SESSION_FAILED');
  }
  return inserted.data.id as string;
}

export async function getCallSessionByBooking(bookingId: string): Promise<CallSessionRow | null> {
  if (!supabaseAvailable) return null;
  const { data, error } = await getSupabaseAdmin()
    .from('call_sessions')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CallSessionRow | null) ?? null;
}

export function normalizeLines(value: unknown): TranscriptLine[] {
  if (!Array.isArray(value)) return [];
  const lines: TranscriptLine[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { role?: unknown; text?: unknown; at?: unknown };
    if (row.role !== 'user' && row.role !== 'advisor') continue;
    if (typeof row.text !== 'string') continue;
    const text = row.text.trim().slice(0, 4000);
    if (!text) continue;
    lines.push({
      role: row.role,
      text,
      at: typeof row.at === 'string' ? row.at : new Date().toISOString(),
    });
    if (lines.length >= 400) break;
  }
  return lines;
}

export async function saveTranscript(input: {
  bookingId: string;
  userId: string;
  lines: TranscriptLine[];
  ended: boolean;
  durationSeconds?: number;
  declined?: boolean;
}): Promise<CallSessionRow> {
  const admin = getSupabaseAdmin();
  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select('id, user_id, advisor_id, status')
    .eq('id', input.bookingId)
    .maybeSingle();
  if (bookingError) throw new Error(bookingError.message);
  if (!booking || booking.user_id !== input.userId) throw new Error('NOT_FOUND');
  if (booking.status !== 'confirmed' && booking.status !== 'completed') throw new Error('INVALID');

  await ensureCallSession({
    userId: input.userId,
    advisorId: booking.advisor_id,
    bookingId: input.bookingId,
  });

  const patch: Record<string, unknown> = {
    transcript: input.lines,
  };
  if (input.declined) patch.summary_declined = true;
  if (input.ended) {
    patch.ended_at = new Date().toISOString();
    if (typeof input.durationSeconds === 'number') {
      patch.duration_seconds = Math.max(0, Math.floor(input.durationSeconds));
    }
  }

  const { data, error } = await admin
    .from('call_sessions')
    .update(patch)
    .eq('booking_id', input.bookingId)
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message || 'SAVE_FAILED');
  return data as CallSessionRow;
}
