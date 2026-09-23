import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Fallback signup without Supabase
// Uses secure HTTP-only cookies for session management
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'placeholder' && supabaseKey !== 'placeholder') {
      // Use Supabase if configured
      try {
        const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
          },
          body: JSON.stringify({
            email,
            password: generateTemporaryPassword(),
            data: { name },
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur Supabase');
        }

        const data = await response.json();
        
        return NextResponse.json({
          success: true,
          userId: data.user?.id,
          method: 'supabase',
        });
      } catch (supabaseError) {
        console.warn('⚠️ Supabase signup failed, falling back to cookie auth:', supabaseError);
      }
    }

    // Fallback: Cookie-based session
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store user data in secure cookie (in production, use encrypted KV store)
    const userData = {
      userId,
      email,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    const cookieStore = await cookies();
    
    // Set secure HTTP-only cookie with 30 day expiration
    cookieStore.set('lunara_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    cookieStore.set('lunara_user', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    console.log('✅ User signed up with cookie fallback:', { userId, email });

    return NextResponse.json({
      success: true,
      userId,
      sessionId,
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

function generateTemporaryPassword(): string {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
}
