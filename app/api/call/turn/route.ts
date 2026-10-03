import { NextRequest, NextResponse } from 'next/server';
import { getAdvisorById } from '@/lib/astrologers';
import { canJoinCall, getBooking } from '@/lib/bookings';
import { getSession } from '@/lib/session';
import type { BirthData, NatalChart } from '@/lib/types';
import { getVoiceSystemPrompt } from '@/lib/voice-prompts';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 2000) : '';
  const bookingId = typeof body?.bookingId === 'string' ? body.bookingId : null;
  const birthData = body?.birthData as BirthData | undefined;
  const natalChart = body?.natalChart as NatalChart | undefined;
  if (!text || !birthData?.name || !natalChart) {
    return NextResponse.json({ error: 'Message incomplet' }, { status: 400 });
  }

  let advisorId = typeof body?.advisorId === 'string' ? body.advisorId : '';
  if (bookingId) {
    const booking = await getBooking(bookingId);
    if (!booking || booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }
    if (!canJoinCall(booking) && booking.status !== 'completed') {
      return NextResponse.json({ error: 'L’appel n’est pas ouvert' }, { status: 409 });
    }
    advisorId = booking.advisor_id;
  }

  const advisor = await getAdvisorById(advisorId);
  if (!advisor) return NextResponse.json({ error: 'Conseiller introuvable' }, { status: 404 });

  const key = process.env.XAI_API_KEY?.trim();
  if (!key || key.includes('placeholder')) {
    return NextResponse.json({
      reply: 'Je vous entends. Reprenez quand la voix revient, je reste avec votre thème.',
    });
  }

  const history = Array.isArray(body?.history) ? body.history.slice(-12) : [];
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: getVoiceSystemPrompt(advisor, birthData, natalChart) },
  ];
  for (const item of history) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { role?: unknown; text?: unknown };
    if (typeof row.text !== 'string' || !row.text.trim()) continue;
    messages.push({
      role: row.role === 'advisor' ? 'assistant' : 'user',
      content: row.text.slice(0, 2000),
    });
  }
  messages.push({ role: 'user', content: text });

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3',
        temperature: 0.7,
        messages,
      }),
    });
    if (!response.ok) {
      console.error('Tour de conversation refusé:', response.status);
      return NextResponse.json({ error: 'Réponse indisponible' }, { status: 502 });
    }
    const payload = await response.json();
    const reply = payload?.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return NextResponse.json({ error: 'Réponse indisponible' }, { status: 502 });
    }
    return NextResponse.json({ reply: reply.trim() });
  } catch (error) {
    console.error('Tour de conversation:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Réponse indisponible' }, { status: 502 });
  }
}
