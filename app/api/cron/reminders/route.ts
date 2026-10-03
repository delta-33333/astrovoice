import { NextResponse } from 'next/server';
import { sendDueReminders } from '@/lib/bookings';

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
    const result = await sendDueReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('cron reminders:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Rappels impossibles' }, { status: 500 });
  }
}
