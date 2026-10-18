import 'server-only';
import { cancelScheduledMail, dispatchMail } from './email';
import { isMissingRelation } from './missing-relation';
import { dueSequenceIds, type SequenceMail } from './sequences';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

interface ScheduleRow {
  id: string;
  user_id: string | null;
  email_norm: string;
  kind: string;
  resend_id: string | null;
  send_at: string;
  cancelled_at: string | null;
  sent_at: string | null;
  payload: { subject?: string; html?: string; to?: string };
}

export async function queueMails(input: {
  userId: string | null;
  email: string;
  mails: SequenceMail[];
}): Promise<void> {
  if (!supabaseAvailable || !input.mails.length) return;
  const rows = input.mails.map((mail) => ({
    user_id: input.userId,
    email_norm: input.email,
    kind: mail.kind,
    send_at: mail.sendAt,
    payload: { subject: mail.subject, html: mail.html, to: input.email },
  }));
  const { error } = await getSupabaseAdmin().from('mail_schedule').insert(rows);
  if (error && !isMissingRelation(error)) console.warn('File e-mail:', error.message);
}

/** Envoie les échéances dues. Le cron de 8 h appelle cette fonction. J+0 part tout de suite. */
export async function sendDueMails(now = new Date()): Promise<number> {
  if (!supabaseAvailable) return 0;
  const { data, error } = await getSupabaseAdmin()
    .from('mail_schedule')
    .select('id, user_id, email_norm, kind, resend_id, send_at, cancelled_at, sent_at, payload')
    .is('sent_at', null)
    .is('cancelled_at', null)
    .lte('send_at', now.toISOString())
    .limit(100);
  if (error) {
    if (!isMissingRelation(error)) console.warn('File e-mail:', error.message);
    return 0;
  }
  const due = dueSequenceIds(
    ((data ?? []) as ScheduleRow[]).map((row) => ({
      id: row.id,
      sendAt: row.send_at,
      sentAt: row.sent_at,
      cancelledAt: row.cancelled_at,
    })),
    now,
  );
  let sent = 0;
  for (const row of (data ?? []) as ScheduleRow[]) {
    if (!due.includes(row.id)) continue;
    const to = row.payload?.to || row.email_norm;
    const subject = row.payload?.subject;
    const html = row.payload?.html;
    if (!to || !subject || !html) continue;
    const id = await dispatchMail({ to, subject, html, headers: { 'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_APP_URL || ''}/account>` } });
    if (!id) continue;
    const saved = await getSupabaseAdmin().from('mail_schedule').update({ sent_at: now.toISOString(), resend_id: id }).eq('id', row.id);
    if (!saved.error) sent += 1;
  }
  return sent;
}

export async function cancelUserSequences(userId: string | null | undefined): Promise<number> {
  if (!supabaseAvailable || !userId) return 0;
  const { data, error } = await getSupabaseAdmin()
    .from('mail_schedule')
    .select('id, resend_id')
    .eq('user_id', userId)
    .is('sent_at', null)
    .is('cancelled_at', null);
  if (error) {
    if (!isMissingRelation(error)) console.warn('Annulation e-mails:', error.message);
    return 0;
  }
  const rows = (data ?? []) as Array<{ id: string; resend_id: string | null }>;
  for (const row of rows) {
    if (row.resend_id) await cancelScheduledMail(row.resend_id);
  }
  if (!rows.length) return 0;
  const updated = await getSupabaseAdmin()
    .from('mail_schedule')
    .update({ cancelled_at: new Date().toISOString() })
    .in('id', rows.map((row) => row.id));
  if (updated.error && !isMissingRelation(updated.error)) console.warn('Annulation e-mails:', updated.error.message);
  return rows.length;
}

/** Envoie tout de suite le message J+0, laisse J+1 et J+3 au cron. */
export async function sendImmediate(mail: SequenceMail, to: string): Promise<void> {
  if (Date.parse(mail.sendAt) > Date.now() + 60_000) return;
  await dispatchMail({ to, subject: mail.subject, html: mail.html });
}
