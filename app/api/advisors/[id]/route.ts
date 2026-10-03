import { NextResponse } from 'next/server';
import { getPublicAdvisorById } from '@/lib/astrologers';
import { resolveMarket } from '@/lib/market';
import { quoteAdvisor } from '@/lib/money';
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
    const market = await resolveMarket();
    return NextResponse.json({
      advisor,
      quote: quoteAdvisor(advisor.pricePerMinCents, market.currency, market.rates),
    });
  } catch {
    return NextResponse.json({ error: 'Annuaire indisponible' }, { status: 503 });
  }
}
