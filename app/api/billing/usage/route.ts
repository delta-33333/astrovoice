import { NextRequest, NextResponse } from 'next/server';
import { grantRebookOffer } from '@/lib/rebook';
import { getSession } from '@/lib/session';
import { recordSubscriptionUsage } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const seconds = body?.seconds;
  if (typeof seconds !== 'number' || seconds < 0 || seconds > 60 * 60) {
    return NextResponse.json({ error: 'Durée invalide' }, { status: 400 });
  }
  await recordSubscriptionUsage(user.id, seconds);
  await grantRebookOffer(user.id, typeof body?.bookingId === 'string' ? body.bookingId : null);
  return NextResponse.json({ ok: true });
}
