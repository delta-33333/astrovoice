import { NextRequest, NextResponse } from 'next/server';
import { createPasswordlessUser, createUser, normalizeEmail, normalizeFirstName, passwordError } from '@/lib/auth';
import { parseHeardFrom } from '@/lib/heard-from';
import { isMissingRelation } from '@/lib/missing-relation';
import { getSupabaseAdmin } from '@/lib/supabase';
import { honeypotTripped } from '@/lib/form-checks';
import { tooManyRequests } from '@/lib/guard';
import { recordFirstTouch, trackEvent } from '@/lib/events';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { createSession } from '@/lib/session';
import { supabaseAvailable } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!supabaseAvailable) {
    return NextResponse.json({ error: 'La création de compte est indisponible.' }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (honeypotTripped(body)) {
      return NextResponse.json({ error: 'Indiquez un e-mail valide.' }, { status: 400 });
    }
    if (tooManyRequests(request, 'signup', 20, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, { status: 429 });
    }
    const email = normalizeEmail(body?.email);
    const firstName = normalizeFirstName(body?.displayName ?? body?.firstName);
    const passwordless = body?.passwordless === true;
    const passwordIssue = passwordless ? null : passwordError(body?.password);

    if (!email) {
      return NextResponse.json({ error: 'Indiquez un e-mail valide.' }, { status: 400 });
    }
    if (!firstName) {
      return NextResponse.json({ error: 'Indiquez votre prénom.' }, { status: 400 });
    }
    if (passwordIssue) {
      return NextResponse.json({ error: passwordIssue }, { status: 400 });
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
      return NextResponse.json({ error: 'La création de compte est indisponible.' }, { status: 503 });
    }

    const result = passwordless
      ? await createPasswordlessUser(email, firstName)
      : await createUser(email, body.password, firstName);
    if (!result.success || !result.userId) {
      return NextResponse.json({ error: result.error || 'Erreur lors de la création du compte' }, { status: 400 });
    }

    const session = await createSession(result.userId);
    if (!session) {
      return NextResponse.json({ error: 'La connexion sécurisée n’est pas configurée.' }, { status: 503 });
    }

    const heard = parseHeardFrom(body?.heardFrom);
    if (heard) {
      const saved = await getSupabaseAdmin().from('users').update({ heard_from: heard }).eq('id', result.userId);
      if (saved.error && !isMissingRelation(saved.error)) console.warn('heard_from:', saved.error.message);
    }
    await recordFirstTouch(result.userId);
    await trackEvent({ name: 'signup', userId: result.userId, metadata: heard ? { heardFrom: heard } : undefined });
    return NextResponse.json({ success: true, needsBirthData: true });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 });
  }
}
