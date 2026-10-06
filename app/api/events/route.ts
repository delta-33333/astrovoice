import { NextRequest, NextResponse } from 'next/server';
import { cleanPath, cleanReferrer, isInternalReferrer, utmFrom, type Utm } from '@/lib/attribution';
import { getBooking } from '@/lib/bookings';
import { trackEvent, type EventName } from '@/lib/events';
import { getSession } from '@/lib/session';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const CALL_EVENTS = new Set(['call_reengage', 'call_silence_end']);
/** Étapes envoyées par le navigateur (les étapes serveur — compte, paiement, appel — sont enregistrées par leurs routes). */
const CLIENT_EVENTS = new Set(['page_view', 'book_click', 'signup_view', 'birth_start', 'select_slot', 'slot_selected']);
const LOCALES = new Set(['fr', 'en', 'es', 'de', 'it']);
const PROFESSION = new Set(['astrologue', 'astrologer', 'astrologo', 'astrologe']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Pages vues : accueil et fiches conseiller gardent leur nom d'étape, le reste devient page_view. */
function classify(path: string): { name: EventName; slug?: string } {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0 || (parts.length === 1 && (parts[0] === 'home' || LOCALES.has(parts[0])))) {
    return { name: 'view_home' };
  }
  if (parts.length === 2 && parts[0] === 'advisors') return { name: 'view_advisor', slug: parts[1] };
  if (parts.length === 3 && LOCALES.has(parts[0]) && PROFESSION.has(parts[1])) {
    return { name: 'view_advisor', slug: parts[2] };
  }
  return { name: 'page_view' };
}

async function advisorIdForSlug(slug: string | undefined): Promise<string | null> {
  if (!slug || !supabaseAvailable || !/^[a-z0-9-]{2,80}$/.test(slug)) return null;
  const { data } = await getSupabaseAdmin().from('advisors').select('id').eq('slug', slug).maybeSingle();
  return (data as { id?: string } | null)?.id ?? null;
}

function str(value: unknown, max: number): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name : '';

  if (CALL_EVENTS.has(name)) {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const bookingId = typeof body.bookingId === 'string' ? body.bookingId.slice(0, 64) : null;
    let advisorId = typeof body.advisorId === 'string' ? body.advisorId.slice(0, 64) : null;
    if (bookingId) {
      const booking = await getBooking(bookingId).catch(() => null);
      if (!booking || booking.user_id !== user.id) {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      advisorId = booking.advisor_id;
    }
    const metadata: Record<string, string> = {};
    const raw = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};
    for (const key of ['attempt', 'silentMs', 'elapsed', 'reason']) {
      const value = (raw as Record<string, unknown>)[key];
      if (typeof value === 'string' || typeof value === 'number') metadata[key] = String(value).slice(0, 40);
    }
    await trackEvent({
      name: name as 'call_reengage' | 'call_silence_end',
      userId: user.id,
      advisorId,
      bookingId,
      metadata,
    });
    return NextResponse.json({ ok: true });
  }

  if (!CLIENT_EVENTS.has(name)) {
    return NextResponse.json({ error: 'Événement refusé' }, { status: 400 });
  }

  const user = await getSession();
  const path = cleanPath(str(body.path, 300));
  let utm: Utm = {};
  const search = str(body.search, 600);
  if (search) {
    try {
      utm = utmFrom(new URLSearchParams(search));
    } catch {
      utm = {};
    }
  }
  const referrer = cleanReferrer(str(body.referrer, 600));
  const context = {
    path: path ?? null,
    // Navigation interne : pas un référent.
    referrer: referrer && !isInternalReferrer(referrer, request.headers.get('host')) ? referrer : null,
    utm,
  };
  const raw = body.metadata && typeof body.metadata === 'object' ? (body.metadata as Record<string, unknown>) : {};
  const metadata: Record<string, string> = {};
  for (const key of ['slotId', 'source', 'label', 'mode']) {
    const value = str(raw[key], 80);
    if (value) metadata[key] = value;
  }
  let advisorId = typeof body.advisorId === 'string' && UUID_RE.test(body.advisorId) ? body.advisorId : null;

  let eventName: EventName;
  if (name === 'page_view') {
    if (!path) return NextResponse.json({ error: 'Chemin manquant' }, { status: 400 });
    if (path.startsWith('/admin')) return NextResponse.json({ ok: true, skipped: true });
    const kind = classify(path);
    eventName = kind.name;
    if (kind.slug) {
      metadata.slug = kind.slug;
      advisorId = advisorId ?? (await advisorIdForSlug(kind.slug));
    }
  } else if (name === 'slot_selected' || name === 'select_slot') {
    eventName = 'select_slot';
  } else {
    eventName = name as EventName;
  }

  await trackEvent({ name: eventName, userId: user?.id, advisorId, metadata, context });
  return NextResponse.json({ ok: true });
}
