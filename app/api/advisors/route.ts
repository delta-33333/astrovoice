import { NextResponse } from 'next/server';
import { listPublicAdvisors } from '@/lib/astrologers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await listPublicAdvisors();
    if (result.unavailable) {
      return NextResponse.json({ error: 'Annuaire indisponible' }, { status: 503 });
    }
    return NextResponse.json({ advisors: result.advisors });
  } catch {
    return NextResponse.json({ error: 'Annuaire indisponible' }, { status: 503 });
  }
}
