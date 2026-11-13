import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createElementsCheckout } from '@/lib/checkout';
import { trackEvent } from '@/lib/events';
import { foundingAlreadyClaimed } from '@/lib/credits';
import { FOUNDING_MAX_SALES, foundingOfferOpen } from '@/lib/founding';
import { resolveMarket } from '@/lib/market';
import { formatMoney, MARKET_PRICING, packMarketFor } from '@/lib/money';
import { getPack, isFixedPackId, packForMarket, packSeconds } from '@/lib/pricing';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';
import { stripeSecretConfigured } from '@/lib/stripe';
import { authSecret } from '@/lib/session';
import { tooManyRequests } from '@/lib/guard';
import { GUEST_CHECKOUT_COOKIE, GUEST_CHECKOUT_MAX_AGE, signGuestCheckout } from '@/lib/guest-checkout-rules';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Sans compte : achat invité. L’e-mail est saisi dans le paiement Stripe,
    // le compte est créé ou retrouvé après paiement (webhook + page de retour).
    const user = await getSession();
    const secret = authSecret();
    if (!user && !secret) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (!user && tooManyRequests(request, 'guest-checkout', 12, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de demandes. Réessayez dans un moment.' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const packId = typeof body?.packId === 'string' ? body.packId : '';
    const lang = typeof body?.lang === 'string' ? body.lang.slice(0, 2) : null;
    const pack = getPack(packId);
    // Seuls les packs à prix fixe en vigueur (10, 20, 40 min) sont vendus ; jamais d’abonnement ni de recharge auto.
    if (!pack || (!pack.founding && !isFixedPackId(pack.id))) {
      return NextResponse.json({ error: 'Offre introuvable' }, { status: 400 });
    }

    if (pack.founding) {
      if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      const sales = await foundingSalesCount();
      if (!foundingOfferOpen(new Date(), sales)) {
        return NextResponse.json(
          { error: 'L’offre fondateur est close (100 places, jusqu’au 31 octobre 2026).' },
          { status: 410 }
        );
      }
      if (await foundingAlreadyClaimed(user)) {
        return NextResponse.json(
          { error: 'Le Cercle Fondateur est déjà ouvert sur ce compte.' },
          { status: 409 }
        );
      }
    }

    if (!stripeSecretConfigured()) {
      return NextResponse.json(
        { error: 'Le paiement n’est pas disponible pour le moment.' },
        { status: 503 }
      );
    }

    const label = pack.founding
      ? 'Cercle Fondateur'
      : `Pack ${pack.minutes} minutes`;
    const market = await resolveMarket();
    const code = packMarketFor(lang, market);
    const priced = packForMarket(pack, code);
    const currency = MARKET_PRICING[code].currency;
    const amount = priced.amountCents;

    const checkout = await createElementsCheckout({
      request,
      user,
      amountCents: amount,
      currency,
      productName: label,
      productDescription: pack.founding
        ? 'Dix minutes offertes au tarif fondateur'
        : `Prépaiement de ${pack.minutes} minutes de consultation`,
      purpose: 'prepaid',
      manualCapture: false,
      flow: 'pack',
      integrationFlow: 'prepaid',
      metadata: {
        packId: pack.id,
        minutes: String(pack.minutes),
        seconds: String(packSeconds(pack)),
        autoRecharge: 'false',
      },
    });

    await trackEvent({
      name: 'checkout_start',
      userId: user?.id,
      metadata: { purpose: 'prepaid', packId: pack.id, guest: user ? 'false' : 'true' },
    });

    const response = NextResponse.json({
      clientSecret: checkout.clientSecret,
      checkoutSessionId: checkout.checkoutSessionId,
      amount: checkout.amountCents,
      amountLabel: formatMoney(checkout.amountCents, currency, lang || market.language),
      currency,
      minutes: pack.minutes,
      label,
      collectContact: checkout.collectContact,
      guest: !user,
    });
    if (!user && secret) {
      response.cookies.set(GUEST_CHECKOUT_COOKIE, signGuestCheckout(checkout.checkoutSessionId, secret), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: GUEST_CHECKOUT_MAX_AGE,
      });
    }
    return response;
  } catch (error) {
    console.error('Achat de minutes:', error);
    return NextResponse.json(
      { error: 'Le paiement n’a pas pu être préparé. Réessayez dans un instant.' },
      { status: 500 }
    );
  }
}

async function foundingSalesCount(): Promise<number> {
  if (!supabaseAvailable) return 0;
  const { count, error } = await getSupabaseAdmin()
    .from('stripe_credit_grants')
    .select('checkout_session_id', { count: 'exact', head: true })
    .eq('pack_id', 'founding');
  if (error) return FOUNDING_MAX_SALES;
  return count ?? 0;
}
