import 'server-only';
import { cookies, headers } from 'next/headers';
import {
  FIRST_TOUCH_COOKIE,
  VISITOR_COOKIE,
  decodeFirstTouch,
  validVisitorId,
  type FirstTouch,
} from './attribution';
import { isMissingRelation } from './missing-relation';
import { getSupabaseAdmin, supabaseAvailable } from './supabase';

/** Champs écrits sur la visite, le compte et le paiement. */
export interface AcquisitionFields {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landing_page: string | null;
  visitor_id: string | null;
}

export async function readAcquisition(): Promise<AcquisitionFields> {
  const empty: AcquisitionFields = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    referrer: null,
    landing_page: null,
    visitor_id: null,
  };
  try {
    const jar = await cookies();
    const head = await headers();
    const touch = decodeFirstTouch(jar.get(FIRST_TOUCH_COOKIE)?.value);
    return fieldsFrom(touch, validVisitorId(jar.get(VISITOR_COOKIE)?.value) ?? validVisitorId(head.get('x-cl-vid')));
  } catch {
    return empty;
  }
}

function fieldsFrom(touch: FirstTouch | null, visitorId: string | null): AcquisitionFields {
  return {
    utm_source: touch?.utm_source ?? null,
    utm_medium: touch?.utm_medium ?? null,
    utm_campaign: touch?.utm_campaign ?? null,
    referrer: touch?.referrer ?? null,
    landing_page: touch?.landing ?? null,
    visitor_id: visitorId,
  };
}

/** Copie la première source sur la réservation et sur une ligne de paiement. */
export async function stampCheckoutAcquisition(input: {
  userId: string;
  bookingId?: string | null;
  checkoutSessionId?: string | null;
  purpose: string;
}): Promise<void> {
  if (!supabaseAvailable || !input.userId) return;
  const fields = await readAcquisition();
  if (!fields.utm_source && !fields.utm_medium && !fields.utm_campaign && !fields.referrer && !fields.landing_page) {
    return;
  }
  const admin = getSupabaseAdmin();
  if (input.bookingId) {
    const booking = await admin
      .from('bookings')
      .update({
        utm_source: fields.utm_source,
        utm_medium: fields.utm_medium,
        utm_campaign: fields.utm_campaign,
        referrer: fields.referrer,
        landing_page: fields.landing_page,
      })
      .eq('id', input.bookingId)
      .eq('user_id', input.userId);
    if (booking.error && !isMissingRelation(booking.error)) console.warn('Source réservation:', booking.error.message);
  }
  const inserted = await admin.from('checkout_attributions').insert({
    user_id: input.userId,
    visitor_id: fields.visitor_id,
    purpose: input.purpose,
    checkout_session_id: input.checkoutSessionId ?? null,
    utm_source: fields.utm_source,
    utm_medium: fields.utm_medium,
    utm_campaign: fields.utm_campaign,
    referrer: fields.referrer,
    landing_page: fields.landing_page,
  });
  if (inserted.error && !isMissingRelation(inserted.error)) console.warn('Source paiement:', inserted.error.message);
}
