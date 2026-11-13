import { NextRequest, NextResponse } from 'next/server';
import { authSecret, createSession, getSession } from '@/lib/session';
import { grantPrepaidCredits, loadCheckoutSession } from '@/lib/credits';
import { attachGuestPrepaid } from '@/lib/guest-checkout';
import {
  GUEST_CHECKOUT_COOKIE,
  guestAutoLoginAllowed,
  guestCheckoutMatches,
  isGuestCheckout,
} from '@/lib/guest-checkout-rules';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Même crédit que le webhook, pour afficher les minutes sans attendre. */
export async function POST(request: NextRequest) {
  const user = await getSession();

  const { checkoutSessionId } = await request.json().catch(() => ({}));
  if (!checkoutSessionId || typeof checkoutSessionId !== 'string' || !checkoutSessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'Session invalide' }, { status: 400 });
  }

  if (!user) return confirmGuest(request, checkoutSessionId);

  const session = await loadCheckoutSession(checkoutSessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }
  // Achat invité terminé alors qu’une session existe déjà sur ce navigateur.
  if (isGuestCheckout(session.metadata) && !session.metadata?.userId) {
    return confirmGuest(request, checkoutSessionId);
  }
  if (session.metadata?.userId !== user.id) {
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

/**
 * Achat invité : seul le navigateur qui a ouvert le paiement (cookie signé) peut le confirmer.
 * Les minutes vont au compte de l’e-mail saisi dans Stripe ; connexion automatique
 * uniquement si ce compte vient d’être créé par ce paiement.
 */
async function confirmGuest(request: NextRequest, checkoutSessionId: string) {
  const cookie = request.cookies.get(GUEST_CHECKOUT_COOKIE)?.value;
  if (!guestCheckoutMatches(cookie, checkoutSessionId, authSecret())) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const session = await loadCheckoutSession(checkoutSessionId);
  if (!session || !isGuestCheckout(session.metadata) || session.metadata?.purpose !== 'prepaid') {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }
  const attached = await attachGuestPrepaid(session);
  if (!attached) {
    return NextResponse.json({ success: false, pending: true, guest: true }, { status: 202 });
  }
  const loggedIn =
    guestAutoLoginAllowed({
      userCreatedAt: attached.createdAt,
      passwordHash: attached.passwordHash,
      checkoutCreatedSec: session.created,
    }) && (await createSession(attached.userId));
  const response = NextResponse.json({
    success: true,
    guest: true,
    granted: attached.granted,
    already: attached.already,
    loggedIn,
  });
  response.cookies.delete(GUEST_CHECKOUT_COOKIE);
  return response;
}
