import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/events';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (body?.name !== 'select_slot' && body?.name !== 'slot_selected') {
    return NextResponse.json({ error: 'Événement refusé' }, { status: 400 });
  }
  const user = await getSession();
  const advisorId = typeof body.advisorId === 'string' ? body.advisorId : null;
  const slotId = typeof body.metadata?.slotId === 'string' ? body.metadata.slotId.slice(0, 80) : '';
  await trackEvent({
    name: 'select_slot',
    userId: user?.id,
    advisorId,
    metadata: slotId ? { slotId } : {},
  });
  return NextResponse.json({ ok: true });
}
