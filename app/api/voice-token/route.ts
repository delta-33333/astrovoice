import { NextRequest, NextResponse } from 'next/server';
import { evaluateVoiceCallAccess } from '@/lib/credits';
import { getSession } from '@/lib/session';
import { getAstrologerById } from '@/lib/astrologers';
import { getAstrologerVoice, getVoiceSystemPrompt } from '@/lib/voice-prompts';
import type { BirthData, NatalChart } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'grok-voice-latest';
const LANGUAGE = 'fr';

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
    const astrologerId = asString(body?.astrologerId, 40);
    const natalChart = asNatalChart(body?.natalChart);
    const checkoutSessionId = asString(body?.checkoutSessionId, 200);

    if (!birthData || !astrologerId || !natalChart) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const astrologer = getAstrologerById(astrologerId);
    if (!astrologer) {
      return NextResponse.json({ error: 'Astrologue introuvable' }, { status: 404 });
    }

    const access = await evaluateVoiceCallAccess(user, checkoutSessionId);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error:
            'Crédits insuffisants. Ajoutez des minutes ou confirmez le paiement avant d’appeler.',
        },
        { status: 402 }
      );
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
      voice: getAstrologerVoice(astrologer.id),
      instructions: getVoiceSystemPrompt(astrologer.id, astrologer.name, birthData, natalChart),
      language: LANGUAGE,
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
