import { NextResponse } from 'next/server';
import { sendMorningHoroscopes } from '@/lib/horoscope-subscribers';
import { sendDueMails } from '@/lib/mail-schedule';
import { sendDueRenewalReminders } from '@/lib/subscriptions';

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
    const result = await sendDueRenewalReminders();
    let sequences = 0;
    try {
      sequences = await sendDueMails();
    } catch (error) {
      console.error('cron séquences:', error instanceof Error ? error.message : error);
    }
    let horoscope: { issues: number; sent: number } = { issues: 0, sent: 0 };
    try {
      horoscope = await sendMorningHoroscopes();
    } catch (error) {
      console.error('cron horoscope:', error instanceof Error ? error.message : error);
    }
    return NextResponse.json({ ok: true, ...result, horoscope, sequences });
  } catch (error) {
    console.error('cron weekly-renewal:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Rappels impossibles' }, { status: 500 });
  }
}
