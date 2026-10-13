import 'server-only';
import { isMissingRelation } from './missing-relation';
import { updateUserCookie } from './session';
import { getSupabaseAdmin, supabaseAvailable, type UserProfile } from './supabase';

/** Le tarif d’accueil des 3 premières minutes ne s’applique qu’une fois par compte. */
export async function introAlreadyClaimed(user: UserProfile): Promise<boolean> {
  if (user.intro_claimed) return true;
  if (!supabaseAvailable) return false;
  const { data, error } = await getSupabaseAdmin()
    .from('users')
    .select('intro_claimed')
    .eq('id', user.id)
    .maybeSingle();
  if (error) {
    if (!isMissingRelation(error)) console.warn('intro_claimed:', error.message);
    return false;
  }
  return Boolean((data as { intro_claimed?: boolean } | null)?.intro_claimed);
}

export async function markIntroClaimed(userId: string): Promise<void> {
  await updateUserCookie(userId, { intro_claimed: true }).catch(() => false);
  if (!supabaseAvailable) return;
  const { error } = await getSupabaseAdmin().from('users').update({ intro_claimed: true }).eq('id', userId);
  if (error && !isMissingRelation(error)) console.warn('intro_claimed:', error.message);
}
