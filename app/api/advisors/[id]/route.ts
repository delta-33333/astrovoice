import { NextResponse } from 'next/server';
import { getPublicAdvisorById } from '@/lib/astrologers';
import { supabaseAvailable } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!supabaseAvailable) {
    return NextResponse.json({ error: 'Annuaire indisponible' }, { status: 503 });
  }

  try {
    const advisor = await getPublicAdvisorById(id);
    if (!advisor) {
      return NextResponse.json({ error: 'Conseiller introuvable' }, { status: 404 });
    }
    return NextResponse.json({ advisor });
  } catch {
    return NextResponse.json({ error: 'Annuaire indisponible' }, { status: 503 });
  }
}
