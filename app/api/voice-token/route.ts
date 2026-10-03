import { NextRequest, NextResponse } from 'next/server';
import { evaluateVoiceCallAccess } from '@/lib/credits';
import { getSession } from '@/lib/session';
import { getAdvisorById } from '@/lib/astrologers';
import { canJoinCall, getBooking } from '@/lib/bookings';
import { ensureCallSession } from '@/lib/call-records';
import { trackEvent } from '@/lib/events';
import { getVoiceSystemPrompt } from '@/lib/voice-prompts';
import type { BirthData, NatalChart } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'grok-voice-latest';

function asString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name.trim();
}

function asBirthData(value: unknown): BirthData | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<BirthData>;
  const name = asString(raw.name, 80);
  const date = asString(raw.date, 40);
  const place = asString(raw.place, 160);
  if (!name || !date || !place) return null;
  const time = asString(raw.time, 16) ?? undefined;
  return {
    name: firstName(name),
    date,
    place,
    time,
    timeUnknown: Boolean(raw.timeUnknown) || !time,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : undefined,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : undefined,
  };
}

function asNatalChart(value: unknown): NatalChart | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<NatalChart>;
  if (!Array.isArray(raw.planets) || !Array.isArray(raw.houses) || !Array.isArray(raw.aspects)) {
    return null;
  }
  return {
    planets: raw.planets.slice(0, 20),
    houses: raw.houses.slice(0, 12),
    aspects: raw.aspects.slice(0, 20),
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const birthData = asBirthData(body?.birthData);
    const astrologerId = asString(body?.astrologerId, 80);
    const natalChart = asNatalChart(body?.natalChart);
    const checkoutSessionId = asString(body?.checkoutSessionId, 200);
    const bookingId = asString(body?.bookingId, 64);

    if (!birthData || !astrologerId || !natalChart) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    let advisorKey = astrologerId;
    let bookingAccess: { prepaidSeconds: number } | null = null;
    if (bookingId) {
      const booking = await getBooking(bookingId);
      if (!booking || booking.user_id !== user.id) {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      if (!canJoinCall(booking)) {
        return NextResponse.json({ error: 'L’appel n’est pas ouvert' }, { status: 409 });
      }
      advisorKey = booking.advisor_id;
      const end = new Date(booking.starts_at).getTime() + booking.duration_min * 60 * 1000;
      const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
      bookingAccess = { prepaidSeconds: Math.min(booking.duration_min * 60, remaining) };
    }

    const astrologer = await getAdvisorById(advisorKey);
    if (!astrologer) {
      return NextResponse.json({ error: 'Astrologue introuvable' }, { status: 404 });
    }

    const access = bookingAccess
      ? { allowed: bookingAccess.prepaidSeconds > 0, prepaidSeconds: bookingAccess.prepaidSeconds, metered: false }
      : await evaluateVoiceCallAccess(user, checkoutSessionId);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error:
            'Crédits insuffisants. Ajoutez des minutes ou confirmez le paiement avant d’appeler.',
        },
        { status: 402 }
      );
    }

    await trackEvent({
      name: 'call_started',
      userId: user.id,
      advisorId: astrologer.id,
      bookingId,
    });

    if (bookingId) {
      try {
        await ensureCallSession({ userId: user.id, advisorId: astrologer.id, bookingId });
      } catch (error) {
        console.error('Ouverture session:', error instanceof Error ? error.message : 'erreur');
      }
    }

    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey || apiKey.includes('placeholder')) {
      return NextResponse.json(
        { error: 'La consultation vocale est momentanément indisponible.' },
        { status: 503 }
      );
    }

    const secretResponse = await fetch('https://api.x.ai/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ expires_after: { seconds: 300 } }),
      cache: 'no-store',
    });

    if (!secretResponse.ok) {
      console.error('Jeton vocal refusé:', secretResponse.status);
      return NextResponse.json(
        { error: 'La consultation vocale est momentanément indisponible.' },
        { status: 502 }
      );
    }

    const secret = (await secretResponse.json()) as { value?: unknown };
    if (typeof secret.value !== 'string' || !secret.value) {
      console.error('Jeton vocal vide');
      return NextResponse.json(
        { error: 'La consultation vocale est momentanément indisponible.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      token: secret.value,
      model: MODEL,
      voice: astrologer.voiceId,
      instructions: getVoiceSystemPrompt(astrologer, birthData, natalChart),
      language: astrologer.languages[0] || 'fr',
      prepaidSeconds: access.prepaidSeconds,
      metered: access.metered,
    });
  } catch (error) {
    console.error('Création du jeton vocal:', error instanceof Error ? error.message : 'erreur');
    return NextResponse.json(
      { error: 'La consultation vocale est momentanément indisponible.' },
      { status: 500 }
    );
  }
}
