import { NextRequest, NextResponse } from 'next/server';
import { normalizeLines, saveTranscript } from '@/lib/call-records';
import { getSession } from '@/lib/session';
import { deliverPaidSummary, emailSummaryPaymentLink } from '@/lib/summaries';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const bookingId = body?.bookingId;
  if (typeof bookingId !== 'string') {
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 400 });
  }

  try {
    const row = await saveTranscript({
      bookingId,
      userId: user.id,
      lines: normalizeLines(body?.lines),
      ended: body?.ended === true,
      durationSeconds: typeof body?.durationSeconds === 'number' ? body.durationSeconds : undefined,
      declined: body?.declined === true,
    });

    if (body?.ended === true) {
      if (row.summary_paid_at) {
        try {
          await deliverPaidSummary(bookingId);
        } catch (error) {
          console.error('Résumé:', error instanceof Error ? error.message : error);
        }
      } else if (row.summary_declined) {
        await emailSummaryPaymentLink(bookingId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'NOT_FOUND') return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    if (message === 'INVALID') return NextResponse.json({ error: 'Consultation non confirmée' }, { status: 409 });
    console.error('Transcription:', message);
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 });
  }
}
