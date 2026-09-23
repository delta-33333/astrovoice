import bcrypt from 'bcryptjs';
import { supabase, supabaseAvailable, UserProfile } from './supabase';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(
  username: string,
  password: string,
  displayName: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  if (!supabaseAvailable) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    const passwordHash = await hashPassword(password);
    
    const { data, error } = await supabase!
      .from('users')
      .insert({
        username: username.toLowerCase(),
        password_hash: passwordHash,
        display_name: displayName,
        prepaid_seconds: 0,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Ce nom d\'utilisateur existe déjà' };
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
  username: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (!supabaseAvailable) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !data) {
      return { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' };
    }

    const isValid = await verifyPassword(password, data.password_hash);
    if (!isValid) {
      return { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' };
    }

    return { success: true, user: data as UserProfile };
  } catch (error) {
    console.error('Authenticate user exception:', error);
    return { success: false, error: 'Erreur serveur' };
  }
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  if (!supabaseAvailable) return null;

  try {
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data as UserProfile;
  } catch {
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  // Try Supabase first if available
  if (supabaseAvailable) {
    try {
      const { error } = await supabase!
        .from('users')
        .update(updates)
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Supabase update failed:', error);
      return false;
    }
  }

  // Fallback: update cookie-based profile
  const { updateUserCookie } = await import('./session');
  return updateUserCookie(userId, updates);
}
