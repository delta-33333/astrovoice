import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin, supabaseAvailable, type UserProfile } from './supabase';

const SALT_ROUNDS = 10;
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function normalizeFirstName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length < 1 || name.length > 40) return null;
  return name;
}

export function passwordError(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }
  if (password.length > 200) return 'Mot de passe trop long';
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  if (!supabaseAvailable) return null;
  const admin = getSupabaseAdmin();
  const byEmail = await admin.from('users').select('*').eq('email', email).maybeSingle();
  if (byEmail.error) throw new Error(byEmail.error.message);
  if (byEmail.data) return byEmail.data as UserProfile;

  const byUsername = await admin.from('users').select('*').eq('username', email).maybeSingle();
  if (byUsername.error) throw new Error(byUsername.error.message);
  return (byUsername.data as UserProfile | null) ?? null;
}

export async function createUser(
  email: string,
  password: string,
  firstName: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  if (!supabaseAvailable) {
    return { success: false, error: 'La création de compte est indisponible' };
  }

  const invalid = passwordError(password);
  if (invalid) return { success: false, error: invalid };

  try {
    const passwordHash = await hashPassword(password);
    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .insert({
        username: email,
        email,
        password_hash: passwordHash,
        display_name: firstName,
        prepaid_seconds: 0,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Un compte existe déjà avec cet e-mail' };
      }
      console.error('Create user error:', error);
      return { success: false, error: 'Erreur lors de la création du compte' };
    }

    return { success: true, userId: data.id };
  } catch (error) {
    console.error('Create user exception:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (!supabaseAvailable) {
    return { success: false, error: 'La connexion est indisponible' };
  }

  try {
    const user = await findUserByEmail(email);
    const isValid = await verifyPassword(password, user?.password_hash);
    if (!user || !isValid) {
      return { success: false, error: 'E-mail ou mot de passe incorrect' };
    }
    return { success: true, user };
  } catch (error) {
    console.error('Authenticate user exception:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

export async function createPasswordReset(email: string): Promise<{ token: string; user: UserProfile } | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();

  await admin
    .from('password_resets')
    .update({ used_at: now })
    .eq('user_id', user.id)
    .is('used_at', null);

  const { error } = await admin.from('password_resets').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });
  if (error) throw new Error(error.message);
  return { token, user };
}

export async function resetPasswordWithToken(
  token: string,
  password: string
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const invalid = passwordError(password);
  if (invalid) return { ok: false, error: invalid };
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(token)) {
    return { ok: false, error: 'Lien invalide ou expiré' };
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('password_resets')
    .select('id, user_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error || !data || data.used_at || new Date(data.expires_at).getTime() <= Date.now()) {
    return { ok: false, error: 'Lien invalide ou expiré' };
  }

  const claim = await admin
    .from('password_resets')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id)
    .is('used_at', null)
    .select('user_id')
    .maybeSingle();

  if (claim.error || !claim.data) {
    return { ok: false, error: 'Lien invalide ou expiré' };
  }

  const passwordHash = await hashPassword(password);
  const updated = await admin.from('users').update({ password_hash: passwordHash }).eq('id', claim.data.user_id);
  if (updated.error) {
    return { ok: false, error: 'Le mot de passe n’a pas pu être enregistré' };
  }

  await admin
    .from('password_resets')
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', claim.data.user_id)
    .is('used_at', null);

  return { ok: true, userId: claim.data.user_id as string };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const invalid = passwordError(newPassword);
  if (invalid) return { ok: false, error: invalid };
  const user = await getUserById(userId);
  if (!user) return { ok: false, error: 'Compte introuvable' };
  if (!user.password_hash) {
    return { ok: false, error: 'Utilisez « Mot de passe oublié » pour choisir un mot de passe.' };
  }
  if (!(await verifyPassword(currentPassword, user.password_hash))) {
    return { ok: false, error: 'Mot de passe actuel incorrect' };
  }
  const passwordHash = await hashPassword(newPassword);
  const { error } = await getSupabaseAdmin().from('users').update({ password_hash: passwordHash }).eq('id', userId);
  if (error) return { ok: false, error: 'Le mot de passe n’a pas pu être modifié' };
  return { ok: true };
}

export async function changeEmail(
  userId: string,
  password: string,
  nextEmail: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normalizeEmail(nextEmail);
  if (!email) return { ok: false, error: 'E-mail invalide' };
  const user = await getUserById(userId);
  if (!user?.password_hash) {
    return { ok: false, error: 'Choisissez d’abord un mot de passe.' };
  }
  if (!(await verifyPassword(password, user.password_hash))) {
    return { ok: false, error: 'Mot de passe incorrect' };
  }

  const updates: { email: string; username?: string } = { email };
  const currentEmail = user.email?.trim().toLowerCase();
  if (!user.username || user.username === currentEmail || user.username.includes('@')) {
    updates.username = email;
  }

  const { error } = await getSupabaseAdmin().from('users').update(updates).eq('id', userId);
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Cet e-mail est déjà utilisé' };
    return { ok: false, error: 'L’e-mail n’a pas pu être modifié' };
  }
  return { ok: true };
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  if (!supabaseAvailable) return null;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserProfile;
  } catch (error) {
    console.error('getUserById failed:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  if (supabaseAvailable) {
    try {
      const { error } = await getSupabaseAdmin()
        .from('users')
        .update(updates)
        .eq('id', userId);
      return !error;
    } catch (error) {
      console.error('Supabase update failed:', error);
      return false;
    }
  }

  const { updateUserCookie } = await import('./session');
  return updateUserCookie(userId, updates);
}
