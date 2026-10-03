import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordWithToken } from '@/lib/auth';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { createSession } from '@/lib/session';
import { supabaseAvailable } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!supabaseAvailable) {
    return NextResponse.json({ error: 'La réinitialisation est indisponible.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  const limit = await rateLimit({
    kind: 'reset',
    ip: clientIp(request),
    email: token.slice(0, 16) || 'reset',
    limit: 8,
    windowMs: 60 * 60 * 1000,
    ipLimit: 20,
  });
  if (limit === 'limited') {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
  }
  if (limit === 'unavailable') {
    return NextResponse.json({ error: 'La réinitialisation est indisponible.' }, { status: 503 });
  }

  try {
    const result = await resetPasswordWithToken(token, password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const session = await createSession(result.userId);
    if (!session) {
      return NextResponse.json({
        success: true,
        signedIn: false,
        message: 'Mot de passe enregistré. Connectez-vous.',
      });
    }
    return NextResponse.json({ success: true, signedIn: true });
  } catch (error) {
    console.error('Reset:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'La réinitialisation est indisponible.' }, { status: 503 });
  }
}
