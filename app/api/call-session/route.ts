import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Ancien point d’entrée texte. Il ne contacte plus aucun modèle :
 * la voix passe par /api/voice-token, réservé à une session connectée.
 */
export async function POST() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  return NextResponse.json(
    { error: 'Démarrez la consultation depuis la page d’appel.' },
    { status: 410 }
  );
}
