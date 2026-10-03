import { ensureCallSession, getCallSessionByBooking, type CallSessionRow, type TranscriptLine } from './call-records';
import { trackEvent } from './events';
import { recipientEmail, sendMail } from './email';
import { SUMMARY_CENTS, formatCurrency } from './pricing';
import { appBaseUrl } from './stripe';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scrub(text: string): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !/\b(IA|AI|Grok|xAI|chatbot|bot|intelligence artificielle)\b/i.test(sentence))
    .join(' ')
    .trim();
}

function languageName(code: string): string {
  const names: Record<string, string> = {
    fr: 'français',
    en: 'English',
    es: 'español',
    de: 'Deutsch',
    it: 'italiano',
  };
  return names[code] ?? 'français';
}

function splitKeyPoints(summary: string): { text: string; points: string[] } {
  const marker = summary.search(/\n\s*points\s*:/i);
  if (marker < 0) return { text: summary.trim(), points: [] };
  const body = summary.slice(0, marker).trim();
  const rest = summary.slice(marker);
  const points = rest
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim())
    .filter((line) => line.length > 0 && !/^points\s*:/i.test(line))
    .slice(0, 6);
  return { text: body || summary.trim(), points };
}

async function advisorMeta(advisorId: string): Promise<{ name: string; language: string }> {
  const { data } = await getSupabaseAdmin()
    .from('advisors')
    .select('first_name, last_name, languages')
    .eq('id', advisorId)
    .maybeSingle();
  if (!data) return { name: 'votre conseiller', language: 'fr' };
  const languages = (data.languages as string[] | null) ?? [];
  return {
    name: `${data.first_name} ${data.last_name}`,
    language: languages[0] || 'fr',
  };
}

async function writeSummary(lines: TranscriptLine[], advisorName: string, language: string): Promise<string> {
  const key = process.env.XAI_API_KEY?.trim();
  if (!key || key.includes('placeholder')) throw new Error('SUMMARY_UNAVAILABLE');

  const dialogue = lines
    .map((line) => `${line.role === 'advisor' ? advisorName : 'Consultant'} : ${line.text}`)
    .join('\n')
    .slice(0, 24000);

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-3',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            `Tu rédiges le résumé écrit d'une consultation d'astrologie, en ${languageName(language)}. ` +
            'Reste fidèle à ce qui a été dit. 4 à 6 paragraphes courts, puis une ligne « Points : » suivie de 3 puces. ' +
            'N’évoque aucune technologie, aucun modèle, aucune voix synthétique.',
        },
        {
          role: 'user',
          content: dialogue || 'La consultation n’a pas laissé de transcription exploitable. Résume cela en une phrase honnête.',
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error('Résumé refusé:', response.status);
    throw new Error('SUMMARY_FAILED');
  }
  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('SUMMARY_FAILED');
  return scrub(text.trim());
}

async function emailSummary(input: {
  userId: string;
  advisorName: string;
  summary: string;
  points: string[];
}): Promise<boolean> {
  const { data: user } = await getSupabaseAdmin()
    .from('users')
    .select('email, username, display_name')
    .eq('id', input.userId)
    .maybeSingle();
  if (!user) return false;
  const to = recipientEmail(user);
  if (!to) return false;
  const paragraphs = input.summary
    .split(/\n{2,}/)
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, '<br>')}</p>`)
    .join('');
  const points = input.points.length
    ? `<ul>${input.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>`
    : '';
  return sendMail({
    to,
    subject: 'Le résumé de votre consultation',
    html: `<p>Bonjour ${escapeHtml(user.display_name || '')},</p>
<p>Voici le résumé écrit de votre consultation avec ${escapeHtml(input.advisorName)}.</p>
${paragraphs}
${points}`,
  });
}

export async function emailSummaryPaymentLink(bookingId: string): Promise<boolean> {
  if (!supabaseAvailable) return false;
  const row = await getCallSessionByBooking(bookingId);
  if (!row || !row.summary_declined || row.summary_paid_at || row.summary_link_emailed_at) return false;
  if (!row.user_id) return false;

  const { data: user } = await getSupabaseAdmin()
    .from('users')
    .select('email, username, display_name')
    .eq('id', row.user_id)
    .maybeSingle();
  if (!user) return false;
  const to = recipientEmail(user);
  if (!to) return false;

  const advisorId = row.astrologer_id;
  const advisor = advisorId ? await advisorMeta(advisorId) : { name: 'votre conseiller', language: 'fr' };
  const link = `${appBaseUrl()}/resume/${bookingId}`;
  const sent = await sendMail({
    to,
    subject: 'Le résumé écrit de votre consultation',
    html: `<p>Bonjour ${escapeHtml(user.display_name || '')},</p>
<p>Vous pouvez recevoir le résumé écrit de votre consultation avec ${escapeHtml(advisor.name)} (${escapeHtml(formatCurrency(SUMMARY_CENTS))}).</p>
<p><a href="${link}">Recevoir le résumé</a></p>`,
  });
  if (!sent) return false;
  await getSupabaseAdmin()
    .from('call_sessions')
    .update({ summary_link_emailed_at: new Date().toISOString() })
    .eq('id', row.id)
    .is('summary_link_emailed_at', null);
  return true;
}

/**
 * Génère et envoie le résumé une fois le paiement enregistré et l'appel terminé.
 * Idempotent : un second appel ne renvoie pas l'e-mail.
 */
export async function deliverPaidSummary(bookingId: string): Promise<'sent' | 'already' | 'wait' | 'failed'> {
  if (!supabaseAvailable) throw new Error('SUPABASE_NOT_CONFIGURED');
  const row = await getCallSessionByBooking(bookingId);
  if (!row || !row.summary_paid_at || !row.user_id) return 'wait';
  if (row.summary_emailed_at) return 'already';

  const advisor = row.astrologer_id
    ? await advisorMeta(row.astrologer_id)
    : { name: 'votre conseiller', language: 'fr' };

  let summary = row.summary;
  let points = Array.isArray(row.key_points) ? row.key_points : [];

  if (!summary) {
    if (!row.ended_at) return 'wait';
    const lines = Array.isArray(row.transcript) ? row.transcript : [];
    const written = await writeSummary(lines, advisor.name, advisor.language);
    const split = splitKeyPoints(written);
    summary = split.text;
    points = split.points;
    const claimed = await getSupabaseAdmin()
      .from('call_sessions')
      .update({ summary, key_points: points })
      .eq('id', row.id)
      .is('summary', null)
      .select('id');
    if (claimed.error) throw new Error(claimed.error.message);
    if (!claimed.data?.length) {
      const fresh = await getCallSessionByBooking(bookingId);
      if (fresh?.summary_emailed_at) return 'already';
      summary = fresh?.summary ?? summary;
      points = Array.isArray(fresh?.key_points) ? fresh.key_points : points;
    }
  }

  const sent = await emailSummary({
    userId: row.user_id,
    advisorName: advisor.name,
    summary,
    points,
  });
  if (!sent) return 'failed';
  await getSupabaseAdmin()
    .from('call_sessions')
    .update({ summary_emailed_at: new Date().toISOString() })
    .eq('id', row.id)
    .is('summary_emailed_at', null);
  return 'sent';
}

export async function markSummaryPaid(bookingId: string, checkoutSessionId: string): Promise<CallSessionRow> {
  const admin = getSupabaseAdmin();
  const { data: booking, error } = await admin
    .from('bookings')
    .select('id, user_id, advisor_id, status')
    .eq('id', bookingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!booking) throw new Error('NOT_FOUND');
  if (booking.status !== 'confirmed' && booking.status !== 'completed') throw new Error('INVALID');

  await ensureCallSession({
    userId: booking.user_id,
    advisorId: booking.advisor_id,
    bookingId,
  });

  const paid = await admin
    .from('call_sessions')
    .update({
      summary_paid_at: new Date().toISOString(),
      summary_checkout_session_id: checkoutSessionId,
      summary_declined: false,
    })
    .eq('booking_id', bookingId)
    .is('summary_paid_at', null)
    .select('id');
  if (paid.data?.length) {
    await trackEvent({
      name: 'paid',
      userId: booking.user_id,
      advisorId: booking.advisor_id,
      bookingId,
      metadata: { purpose: 'summary' },
    });
    await trackEvent({
      name: 'summary_bought',
      userId: booking.user_id,
      advisorId: booking.advisor_id,
      bookingId,
    });
  }

  const row = await getCallSessionByBooking(bookingId);
  if (!row) throw new Error('NOT_FOUND');
  return row;
}
