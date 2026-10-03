import { NextResponse } from 'next/server';
import { canJoinCall, getBooking } from '@/lib/bookings';
import { formatMoney, normalizeCurrency } from '@/lib/money';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { id } = await context.params;
  const booking = await getBooking(id);
  if (!booking || booking.user_id !== user.id) {
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
  }

  const { data: advisor } = await getSupabaseAdmin()
    .from('advisors')
    .select('first_name, last_name')
    .eq('id', booking.advisor_id)
    .maybeSingle();

  return NextResponse.json({
    booking: {
      id: booking.id,
      startsAt: booking.starts_at,
      durationMin: booking.duration_min,
      amountCents: booking.amount_cents,
      creditCents: booking.credit_cents,
      currency: normalizeCurrency(booking.currency),
      amountLabel: formatMoney(booking.amount_cents, normalizeCurrency(booking.currency)),
      creditLabel: formatMoney(booking.credit_cents, normalizeCurrency(booking.currency)),
      status: booking.status,
      advisorId: booking.advisor_id,
      advisorName: advisor ? `${advisor.first_name} ${advisor.last_name}` : 'Conseiller',
      canJoin: canJoinCall(booking),
    },
  });
}
