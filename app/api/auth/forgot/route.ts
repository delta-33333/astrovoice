import { NextRequest, NextResponse } from 'next/server';
import { createPasswordReset, normalizeEmail } from '@/lib/auth';
import { sendPasswordResetMail } from '@/lib/email';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { appBaseUrl } from '@/lib/stripe';
import { supabaseAvailable } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const MESSAGE = 'Si un compte correspond à cet e-mail, un lien vient d’être envoyé. Il est valable 1 heure.';

export async function POST(request: NextRequest) {
  if (!supabaseAvailable) {
    return NextResponse.json({ error: 'L’envoi est indisponible.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  if (!email) {
    return NextResponse.json({ error: 'Indiquez un e-mail valide.' }, { status: 400 });
  }

  const limit = await rateLimit({
    kind: 'reset',
    ip: clientIp(request),
    email,
    limit: 5,
    windowMs: 60 * 60 * 1000,
    ipLimit: 20,
  });
  if (limit === 'limited') {
    return NextResponse.json({ error: 'Trop de demandes. Réessayez dans une heure.' }, { status: 429 });
  }
  if (limit === 'unavailable') {
    return NextResponse.json({ error: 'L’envoi est indisponible.' }, { status: 503 });
  }

  try {
    const created = await createPasswordReset(email);
    if (created) {
      const link = `${appBaseUrl(request.nextUrl.origin)}/auth/reset?token=${encodeURIComponent(created.token)}`;
      const sent = await sendPasswordResetMail(email, created.user.display_name, link);
      if (!sent) console.error('E-mail de réinitialisation non envoyé');
    }
  } catch (error) {
    console.error('Mot de passe oublié:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'L’envoi est indisponible.' }, { status: 503 });
  }

  return NextResponse.json({ success: true, message: MESSAGE });
}
