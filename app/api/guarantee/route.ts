import { NextRequest, NextResponse } from 'next/server';
import { claimGuarantee, guaranteeState } from '@/lib/guarantee';
import { getSession } from '@/lib/session';
import { supabaseAvailable } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const state = await guaranteeState(user.id);
  return NextResponse.json(state);
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!supabaseAvailable) return NextResponse.json({ error: 'Indisponible' }, { status: 503 });
  const body = await request.json().catch(() => null);
  const bookingId = body?.bookingId;
  if (typeof bookingId !== 'string' || !/^[0-9a-f-]{36}$/i.test(bookingId)) {
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 400 });
  }
  try {
    const result = await claimGuarantee(user.id, bookingId);
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'CLAIM_FAILED';
    if (code === 'ALREADY_CLAIMED') {
      return NextResponse.json({ error: 'La garantie a déjà été utilisée sur ce compte.' }, { status: 409 });
    }
    if (code === 'INELIGIBLE') {
      return NextResponse.json({ error: 'Cet appel n’est pas éligible à la garantie.' }, { status: 403 });
    }
    console.error('Garantie:', code);
    return NextResponse.json({ error: 'Remboursement impossible pour le moment. Écris-nous, nous traitons la demande à la main.' }, { status: 500 });
  }
}
