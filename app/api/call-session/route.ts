import { NextRequest, NextResponse } from 'next/server';
import { getVoiceSystemPrompt, getAstrologerVoice } from '@/lib/voice-prompts';
import { getAstrologerById } from '@/lib/astrologers';

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

    const astrologer = getAstrologerById(astrologerId);
    if (!astrologer) {
      return NextResponse.json(
        { error: 'Astrologue introuvable' },
        { status: 404 }
      );
    }

    // Check if xAI is configured
    if (!XAI_API_KEY || XAI_API_KEY === 'xai-placeholder') {
      console.warn('⚠️ xAI not configured - returning mock session');
      return NextResponse.json({
        mock: true,
        sessionId,
        message: 'Mode démo : la connexion vocale nécessite une clé API xAI valide',
      });
    }

    // Get system prompt with persona-specific voice instructions
    const systemPrompt = getVoiceSystemPrompt(
      astrologer.id,
      astrologer.name,
      birthData,
      natalChart
    );

    // Get the voice ID for this astrologer (ara/eve/leo/rex/sal)
    const voiceId = getAstrologerVoice(astrologer.id);

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
        systemPrompt, // Client can use this for text-based fallback
        astrologer: {
          id: astrologer.id,
          name: astrologer.name,
          voice: voiceId,
        },
        message: 'Connexion vocale indisponible - mode texte activé',
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
