import 'server-only';
import { createPasswordReset } from './auth';
import { dispatchMail, escapeHtml } from './email';
import { isMissingRelation } from './missing-relation';
import { appBaseUrl } from './stripe';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

/** Après un paiement sans mot de passe : un lien pour en choisir un. */
export async function sendPasswordSetupIfNeeded(userId: string | null | undefined): Promise<void> {
  if (!userId || !supabaseAvailable) return;
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .select('email, password_hash')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    if (!isMissingRelation(error)) console.warn('Mot de passe:', error.message);
    return;
  }
  const email = typeof data?.email === 'string' ? data.email : '';
  if (!email || data?.password_hash) return;
  const reset = await createPasswordReset(email).catch(() => null);
  if (!reset) return;
  const url = `${appBaseUrl()}/auth/reset?token=${encodeURIComponent(reset.token)}`;
  await dispatchMail({
    to: email,
    subject: 'Choisissez votre mot de passe Callastral',
    html: `<p>Votre formule est active. Choisissez un mot de passe pour revenir sur votre compte.</p><p><a href="${escapeHtml(url)}">Choisir un mot de passe</a></p>`,
  });
}
