import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, normalizeEmail } from '@/lib/auth';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { createSession } from '@/lib/session';
import { supabaseAvailable } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!supabaseAvailable) {
    return NextResponse.json({ error: 'La connexion est indisponible.' }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email ?? body?.username);
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail et mot de passe requis.' }, { status: 400 });
    }

    const limit = await rateLimit({
      kind: 'login',
      ip: clientIp(request),
      email,
      limit: 8,
      windowMs: 15 * 60 * 1000,
      ipLimit: 40,
    });
    if (limit === 'limited') {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, { status: 429 });
    }
    if (limit === 'unavailable') {
      return NextResponse.json({ error: 'La connexion est indisponible.' }, { status: 503 });
    }

    const result = await authenticateUser(email, password);
    if (!result.success || !result.user) {
      return NextResponse.json({ error: result.error || 'E-mail ou mot de passe incorrect' }, { status: 401 });
    }

    const session = await createSession(result.user.id);
    if (!session) {
      return NextResponse.json({ error: 'La connexion sécurisée n’est pas configurée.' }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      needsBirthData: !result.user.birth_date,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
