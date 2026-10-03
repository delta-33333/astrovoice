import { NextResponse } from 'next/server';
import { regenerateSlots } from '@/lib/slots';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: 'Cron désactivé' }, { status: 503 });
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const result = await regenerateSlots();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error('cron slots:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Génération impossible' }, { status: 500 });
  }
}
