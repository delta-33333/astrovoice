import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createUser } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { supabaseAvailable } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, displayName, email } = body;

    // Support both old (email) and new (username) formats
    const userIdentifier = username || email;
    const userDisplayName = displayName || (email ? email.split('@')[0] : 'User');

    if (!userIdentifier) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur ou email requis' },
        { status: 400 }
      );
    }

    // Try Supabase if available
    if (supabaseAvailable) {
      try {
        if (!password) {
          return NextResponse.json(
            { error: 'Mot de passe requis' },
            { status: 400 }
          );
        }

        if (password.length < 6) {
          return NextResponse.json(
            { error: 'Le mot de passe doit contenir au moins 6 caractères' },
            { status: 400 }
          );
        }

        const result = await createUser(userIdentifier, password, userDisplayName);

        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 400 }
          );
        }

        await createSession(result.userId!);

        return NextResponse.json({
          success: true,
          needsBirthData: true,
          method: 'supabase',
        });
      } catch (supabaseError) {
        console.warn('⚠️ Supabase signup failed, falling back to cookie auth:', supabaseError);
        // Continue to fallback
      }
    }

    // Fallback: Cookie-based session (no 503!)
    // Generate a stable userId that matches Supabase pattern
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store user data in secure cookie
    const userData = {
      id: userId, // Align with Supabase UserProfile.id
      userId, // Keep for backward compatibility
      username: userIdentifier,
      email: email || userIdentifier,
      display_name: userDisplayName,
      displayName: userDisplayName, // Keep for backward compatibility
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(), // Align with Supabase
    };

    const cookieStore = await cookies();
    
    // Set secure HTTP-only cookies with 30 day expiration
    // lunara_session stores the userId (consistent with Supabase path)
    cookieStore.set('lunara_session', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // lunara_user stores full user profile (used when Supabase unavailable)
    cookieStore.set('lunara_user', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    console.log('✅ User signed up with cookie fallback:', { userId, username: userIdentifier });

    return NextResponse.json({
      success: true,
      needsBirthData: true,
      userId,
      method: 'cookie-fallback',
      message: 'Compte créé avec succès',
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
