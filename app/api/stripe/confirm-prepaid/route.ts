import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { grantPrepaidCredits, loadCheckoutSession } from '@/lib/credits';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Même crédit que le webhook, pour afficher les minutes sans attendre. */
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { checkoutSessionId } = await request.json();
  if (!checkoutSessionId || typeof checkoutSessionId !== 'string' || !checkoutSessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'Session invalide' }, { status: 400 });
  }

  const session = await loadCheckoutSession(checkoutSessionId);
  if (!session || session.metadata?.userId !== user.id) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }

  if (session.metadata?.purpose !== 'prepaid') {
    return NextResponse.json({ error: 'Ce paiement ne crédite pas de minutes' }, { status: 400 });
  }

  const result = await grantPrepaidCredits(session, { allowCookie: true });
  const refreshed = await getSession();

  return NextResponse.json({
    success: true,
    granted: result.granted,
    already: result.already ?? false,
    prepaidSeconds: refreshed?.prepaid_seconds ?? user.prepaid_seconds ?? 0,
  });
}
