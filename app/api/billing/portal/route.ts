import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession } from '@/lib/checkout';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  try {
    const url = await createPortalSession({ request, user });
    return NextResponse.json({ url });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'NO_CUSTOMER') {
      return NextResponse.json({ error: 'Aucun abonnement à gérer pour le moment.' }, { status: 404 });
    }
    if (code === 'STRIPE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Le portail est indisponible.' }, { status: 503 });
    }
    console.error('Portail:', code);
    return NextResponse.json({ error: 'Le portail n’a pas pu s’ouvrir.' }, { status: 500 });
  }
}
