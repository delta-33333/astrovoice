import 'server-only';
import { isMissingRelation } from './missing-relation';
import { REBOOK_DAYS, REBOOK_PERCENT } from './offers';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export interface RebookOffer {
  id: string;
  percent: number;
  expires_at: string;
}

export async function pendingRebook(userId: string): Promise<RebookOffer | null> {
  if (!supabaseAvailable) return null;
  const { data, error } = await getSupabaseAdmin()
    .from('rebook_offers')
    .select('id, percent, expires_at')
    .eq('user_id', userId)
    .is('consumed_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (isMissingRelation(error)) return null;
    console.warn('Offre de reprise:', error.message);
    return null;
  }
  if (!data) return null;
  return {
    id: data.id as string,
    percent: Number(data.percent) || REBOOK_PERCENT,
    expires_at: data.expires_at as string,
  };
}

export function discountedMinor(listPrice: number, percent: number): number {
  const next = Math.floor((listPrice * (100 - percent)) / 100);
  if (next < 50 || next >= listPrice) return listPrice;
  return next;
}

export async function attachRebook(bookingId: string, offerId: string): Promise<void> {
  if (!supabaseAvailable) return;
  const { error } = await getSupabaseAdmin()
    .from('bookings')
    .update({ rebook_offer_id: offerId })
    .eq('id', bookingId);
  if (error && !isMissingRelation(error)) console.warn('Lien reprise:', error.message);
}

export async function consumeRebookOnBooking(bookingId: string): Promise<void> {
  if (!supabaseAvailable) return;
  const admin = getSupabaseAdmin();
  const booking = await admin.from('bookings').select('rebook_offer_id').eq('id', bookingId).maybeSingle();
  if (booking.error) {
    if (!isMissingRelation(booking.error)) console.warn('Reprise réservation:', booking.error.message);
    return;
  }
  const offerId = booking.data?.rebook_offer_id as string | null | undefined;
  if (!offerId) return;
  const { error } = await admin
    .from('rebook_offers')
    .update({ consumed_at: new Date().toISOString(), consumed_booking_id: bookingId })
    .eq('id', offerId)
    .is('consumed_at', null);
  if (error && !isMissingRelation(error)) console.warn('Consommation reprise:', error.message);
}

export async function grantRebookOffer(userId: string, sourceBookingId?: string | null): Promise<void> {
  if (!supabaseAvailable) return;
  const existing = await pendingRebook(userId);
  if (existing) return;
  const expires = new Date(Date.now() + REBOOK_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await getSupabaseAdmin().from('rebook_offers').insert({
    user_id: userId,
    percent: REBOOK_PERCENT,
    source_booking_id: sourceBookingId || null,
    expires_at: expires,
  });
  if (error && !isMissingRelation(error) && error.code !== '23505') {
    console.warn('Création reprise:', error.message);
  }
}
