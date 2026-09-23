import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { supabaseAvailable } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  if (!supabaseAvailable) {
    return NextResponse.json(
      { error: 'Authentification non disponible. Veuillez configurer Supabase.' },
      { status: 503 }
    );
  }

  try {
    const { username, password, displayName } = await request.json();

    if (!username || !password || !displayName) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const result = await createUser(username, password, displayName);

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
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
