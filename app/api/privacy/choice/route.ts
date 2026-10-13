import { NextRequest, NextResponse } from 'next/server';
import {
  FIRST_TOUCH_COOKIE,
  FIRST_TOUCH_MAX_AGE,
  VISITOR_COOKIE,
  VISITOR_MAX_AGE,
  cleanReferrer,
  encodeFirstTouch,
  isAdminPath,
  isInternalReferrer,
  utmFrom,
  validVisitorId,
} from '@/lib/attribution';
import { CONSENT_COOKIE, CONSENT_MAX_AGE, parseConsent } from '@/lib/consent';
import { tooManyRequests } from '@/lib/guard';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (tooManyRequests(request, 'consent', 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de demandes.' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const choice = parseConsent(typeof body?.choice === 'string' ? body.choice : null);
  if (!choice) return NextResponse.json({ error: 'Choix invalide' }, { status: 400 });

  const secure = request.nextUrl.protocol === 'https:';
  const response = NextResponse.json({ ok: true, choice });
  response.cookies.set(CONSENT_COOKIE, choice, {
    httpOnly: false,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: CONSENT_MAX_AGE,
  });

  // cl_ft et cl_vid restent : ils décrivent la première visite. Vercel Analytics, lui, suit le choix.
  // /admin ne devient jamais la page d’arrivée.
  let landing = '/';
  let utm = {};
  try {
    const page = new URL(request.headers.get('referer') || `${request.nextUrl.origin}/`);
    landing = page.pathname.slice(0, 300);
    utm = utmFrom(page.searchParams);
  } catch {
    utm = {};
  }
  if (isAdminPath(landing)) return response;

  if (!validVisitorId(request.cookies.get(VISITOR_COOKIE)?.value)) {
    response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: VISITOR_MAX_AGE,
    });
  }
  if (!request.cookies.get(FIRST_TOUCH_COOKIE)?.value) {
    const referrer = cleanReferrer(request.headers.get('referer'));
    response.cookies.set(
      FIRST_TOUCH_COOKIE,
      encodeFirstTouch({
        ...utm,
        referrer: referrer && !isInternalReferrer(referrer, request.headers.get('host')) ? referrer : undefined,
        landing,
        at: new Date().toISOString(),
      }),
      { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: FIRST_TOUCH_MAX_AGE }
    );
  }
  return response;
}
