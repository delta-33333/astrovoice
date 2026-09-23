import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { updateUserProfile } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { accepted, timestamp } = await request.json();

    if (!accepted) {
      return NextResponse.json(
        { error: 'Le consentement est requis' },
        { status: 400 }
      );
    }

    const success = await updateUserProfile(user.id, {
      consent_accepted_at: timestamp,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save consent error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
