import { NextRequest, NextResponse } from 'next/server';
import { getVoiceSystemPrompt } from '@/lib/voice-prompts';
import { getAdvisorById } from '@/lib/astrologers';

const XAI_API_KEY = process.env.XAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { sessionId, birthData, astrologerId, natalChart } = await request.json();

    if (!sessionId || !birthData || !astrologerId || !natalChart) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const astrologer = await getAdvisorById(astrologerId);
    if (!astrologer) {
      return NextResponse.json(
        { error: 'Astrologue introuvable' },
        { status: 404 }
      );
    }

    if (!XAI_API_KEY || XAI_API_KEY === 'xai-placeholder') {
      console.warn('Voix temps réel non configurée — session limitée');
      return NextResponse.json({
        mock: true,
        sessionId,
        message: 'La voix en direct est momentanément indisponible. La consultation continue en mode limité.',
        astrologer: {
          id: astrologer.id,
          name: astrologer.name,
          voice: astrologer.voiceId,
        },
      });
    }

    const systemPrompt = getVoiceSystemPrompt(astrologer, birthData, natalChart);
    const voiceId = astrologer.voiceId;

    // Initialize xAI Grok session with grok-3
    // Using standard chat completions endpoint (voice API may require separate config)
    
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-3',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: `Bonjour, je suis ${birthData.name}. Je souhaite commencer ma consultation astrologique.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`xAI API error: ${response.status} — ${errorText}`);
      }

      const sessionData = await response.json();

      return NextResponse.json({
        sessionToken: sessionData.id,
        initialMessage: sessionData.choices?.[0]?.message?.content,
        sessionId,
        model: 'grok-3',
        astrologer: {
          id: astrologer.id,
          name: astrologer.name,
          voice: voiceId,
        },
      });

    } catch (xaiError) {
      console.error('xAI API error:', xaiError);
      
      // Fallback: Return a session that will use text-based chat
      return NextResponse.json({
        mock: true,
        fallback: 'text-chat',
        sessionId,
        astrologer: {
          id: astrologer.id,
          name: astrologer.name,
          voice: voiceId,
        },
        message: 'La voix en direct est momentanément indisponible. La consultation continue en mode limité.',
      });
    }

  } catch (error) {
    console.error('Call session creation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}
