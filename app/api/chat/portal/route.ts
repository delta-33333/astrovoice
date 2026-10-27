import { NextRequest, NextResponse } from 'next/server';
import { chatPath } from '@/lib/chat';
import { currentChatUser } from '@/lib/chat-store';
import { appBaseUrl, getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await currentChatUser();
  const stripe = getStripe();
  if (!user?.stripe_customer_id || !stripe) return NextResponse.json({ error: 'unavailable' }, { status: 400 });
  const configuration = process.env.STRIPE_PORTAL_CONFIGURATION_ID?.trim();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${appBaseUrl(request.nextUrl.origin)}${chatPath(user.locale)}`,
    ...(configuration ? { configuration } : {}),
  });
  return NextResponse.json({ url: session.url });
}
