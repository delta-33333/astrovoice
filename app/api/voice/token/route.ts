import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorById } from '@/lib/astrologers';
import { canJoinCall, getBooking } from '@/lib/bookings';
import { ensureCallSession } from '@/lib/call-records';
import { trackEvent } from '@/lib/events';
import { getSession } from '@/lib/session';
import type { BirthData, NatalChart } from '@/lib/types';
import { getVoiceSystemPrompt } from '@/lib/voice-prompts';

export const dynamic = 'force-dynamic';

const LIMITED =
  'La voix en direct est momentanément indisponible. La consultation continue en mode limité.';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const bookingId = typeof body?.bookingId === 'string' ? body.bookingId : null;
  const birthData = body?.birthData as BirthData | undefined;
  const natalChart = body?.natalChart as NatalChart | undefined;
  if (!birthData?.name || !birthData.date || !natalChart) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  let advisorId = typeof body?.advisorId === 'string' ? body.advisorId : '';
  let expiresSeconds = 900;

  if (bookingId) {
    const booking = await getBooking(bookingId);
    if (!booking || booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }
    if (!canJoinCall(booking)) {
      return NextResponse.json({ error: 'L’appel n’est pas ouvert' }, { status: 409 });
    }
    advisorId = booking.advisor_id;
    const end = new Date(booking.starts_at).getTime() + booking.duration_min * 60 * 1000;
    expiresSeconds = Math.min(3600, Math.max(180, Math.ceil((end - Date.now()) / 1000) + 120));
  }

  const advisor = await getAdvisorById(advisorId);
  if (!advisor) return NextResponse.json({ error: 'Conseiller introuvable' }, { status: 404 });
  await trackEvent({
    name: 'call_started',
    userId: user.id,
    advisorId: advisor.id,
    bookingId,
  });

  let callSessionId: string | null = null;
  try {
    callSessionId = await ensureCallSession({
      userId: user.id,
      advisorId: advisor.id,
      bookingId,
    });
  } catch (error) {
    console.error('Ouverture session:', error instanceof Error ? error.message : error);
  }

  const key = process.env.XAI_API_KEY?.trim();
  if (!key || key.includes('placeholder')) {
    return NextResponse.json({ unavailable: true, message: LIMITED, callSessionId });
  }

  const instructions = getVoiceSystemPrompt(advisor, birthData, natalChart);
  const session = {
    voice: advisor.voiceId,
    instructions,
    turn_detection: { type: 'server_vad' },
    audio: {
      input: {
        format: { type: 'audio/pcm', rate: 24000 },
        transcription: { model: 'grok-transcribe' },
      },
      output: {
        format: { type: 'audio/pcm', rate: 24000 },
      },
    },
  };

  try {
    const minted = await fetch('https://api.x.ai/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expires_after: { seconds: expiresSeconds },
        session,
      }),
    });
    if (!minted.ok) {
      console.error('Jeton vocal refusé:', minted.status);
      return NextResponse.json({ unavailable: true, message: LIMITED, callSessionId });
    }
    const payload = await minted.json();
    const token = payload?.client_secret?.value ?? payload?.value;
    if (typeof token !== 'string' || !token) {
      return NextResponse.json({ unavailable: true, message: LIMITED, callSessionId });
    }
    return NextResponse.json({
      token,
      session,
      callSessionId,
      socketUrl: 'wss://api.x.ai/v1/realtime?model=grok-voice-latest',
    });
  } catch (error) {
    console.error('Jeton vocal:', error instanceof Error ? error.message : error);
    return NextResponse.json({ unavailable: true, message: LIMITED, callSessionId });
  }
}
