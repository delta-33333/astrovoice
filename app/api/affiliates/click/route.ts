import { NextRequest, NextResponse } from 'next/server';
import { recordAffiliateEvent } from '@/lib/affiliate-events';
import { validVisitorId } from '@/lib/attribution';
import { clientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Clic sur un lien affilié (appelé par le middleware). Compté une fois par visiteur et par jour. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const visitor = validVisitorId(typeof body?.vid === 'string' ? body.vid : null) || `ip:${clientIp(request)}`;
  const day = new Date().toISOString().slice(0, 10);
  await recordAffiliateEvent(body?.code, 'click', `${visitor}:${day}`);
  return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
