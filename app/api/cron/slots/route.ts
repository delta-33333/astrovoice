import { NextResponse } from 'next/server';
import { submitOncePerDeployment } from '@/lib/indexnow';
import { ensureImmediateAvailability, regenerateSlots } from '@/lib/slots';

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
    let immediate: unknown = null;
    let immediateError: string | null = null;
    try {
      immediate = await ensureImmediateAvailability();
    } catch (error) {
      immediateError = error instanceof Error ? error.message : 'Génération immédiate impossible';
      console.error('cron slots immédiats:', immediateError);
    }
    let indexNow: unknown = null;
    try {
      indexNow = await submitOncePerDeployment('cron');
    } catch (error) {
      console.error('cron indexnow:', error instanceof Error ? error.message : error);
    }
    return NextResponse.json({ ok: true, result, immediate, immediateError, indexNow });
  } catch (error) {
    console.error('cron slots:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Génération impossible' }, { status: 500 });
  }
}
