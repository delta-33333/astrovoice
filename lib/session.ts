import { cookies } from 'next/headers';
import { getUserById } from './auth';
import { supabaseAvailable } from './supabase';
import type { UserProfile } from './supabase';

const SESSION_COOKIE_NAME = 'lunara_session';
const USER_COOKIE_NAME = 'lunara_user';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Creates a session by storing userId in lunara_session cookie.
 * Consistent behavior with/without Supabase: always stores userId.
 */
export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Retrieves the current user session.
 * - With Supabase: reads userId from lunara_session, fetches from DB.
 * - Without Supabase (cookie-fallback): reads userId from lunara_session, 
 *   then reads full profile from lunara_user cookie.
 */
export async function getSession(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie?.value) {
    return null;
  }

  const userId = sessionCookie.value;

  // Try Supabase first if available
  if (supabaseAvailable) {
    return getUserById(userId);
  }

  // Fallback: read user data from cookie
  const userCookie = cookieStore.get(USER_COOKIE_NAME);
  if (!userCookie?.value) {
    return null;
  }

  try {
    const userData = JSON.parse(userCookie.value);
    // Ensure the userId matches (security check)
    if (userData.id === userId || userData.userId === userId) {
      return userData as UserProfile;
    }
  } catch (error) {
    console.error('Failed to parse user cookie:', error);
  }

  return null;
}

/**
 * Updates the user cookie with new profile data (cookie-fallback only).
 * Merges updates with existing cookie data.
 */
export async function updateUserCookie(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE_NAME);
  
  if (!userCookie?.value) {
    return false;
  }

  try {
    const existingData = JSON.parse(userCookie.value);
    
    // Security check: ensure userId matches
    if (existingData.id !== userId && existingData.userId !== userId) {
      return false;
    }

    // Merge updates
    const updatedData = {
      ...existingData,
      ...updates,
      id: existingData.id, // Never overwrite core id
      userId: existingData.userId,
    };

    // Update cookie
    cookieStore.set(USER_COOKIE_NAME, JSON.stringify(updatedData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
    });

    return true;
  } catch (error) {
    console.error('Failed to update user cookie:', error);
    return false;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);
}
