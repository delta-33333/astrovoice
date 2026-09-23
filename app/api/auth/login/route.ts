import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
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
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    const result = await authenticateUser(username, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    await createSession(result.user!.id);

    const needsBirthData = !result.user!.birth_date;

    return NextResponse.json({
      success: true,
      needsBirthData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
