import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  FIRST_TOUCH_COOKIE,
  FIRST_TOUCH_MAX_AGE,
  VISITOR_COOKIE,
  VISITOR_MAX_AGE,
  cleanReferrer,
  encodeFirstTouch,
  isBotUserAgent,
  isInternalReferrer,
  utmFrom,
  validVisitorId,
} from '@/lib/attribution';
import { CONSENT_COOKIE, analyticsAllowed } from '@/lib/consent';

const LOCALES = new Set(['fr', 'en', 'es', 'de', 'it']);
const INDEXNOW_KEY = (process.env.INDEXNOW_KEY || '').trim();
const INDEXNOW_READY = /^[A-Za-z0-9-]{8,128}$/.test(INDEXNOW_KEY);

export function middleware(request: NextRequest) {
  if (INDEXNOW_READY && request.nextUrl.pathname === `/${INDEXNOW_KEY}.txt`) {
    return new NextResponse(INDEXNOW_KEY, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
        'X-Robots-Tag': 'noindex',
      },
    });
  }
  const segment = request.nextUrl.pathname.split('/')[1] || '';
  const requestHeaders = new Headers(request.headers);
  if (LOCALES.has(segment)) requestHeaders.set('x-locale', segment);

  const allowAnalytics = analyticsAllowed(request.cookies.get(CONSENT_COOKIE)?.value);
  const secure = request.nextUrl.protocol === 'https:';
  const documentRequest =
    request.method === 'GET' &&
    !request.headers.get('rsc') &&
    !request.headers.get('next-router-prefetch') &&
    !request.headers.get('purpose') &&
    (request.headers.get('accept') || '').includes('text/html');
  const humanDocument = documentRequest && !isBotUserAgent(request.headers.get('user-agent'));
  const existing = allowAnalytics ? validVisitorId(request.cookies.get(VISITOR_COOKIE)?.value) : null;
  const visitorId = existing ?? (allowAnalytics && humanDocument ? crypto.randomUUID() : null);
  if (visitorId) requestHeaders.set('x-cl-vid', visitorId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (!allowAnalytics) {
    if (request.cookies.get(VISITOR_COOKIE)?.value) {
      response.cookies.set(VISITOR_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 0 });
    }
    if (request.cookies.get(FIRST_TOUCH_COOKIE)?.value) {
      response.cookies.set(FIRST_TOUCH_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 0 });
    }
    return response;
  }

  if (!humanDocument) return response;

  if (!existing && visitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
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
        ...utmFrom(request.nextUrl.searchParams),
        referrer: referrer && !isInternalReferrer(referrer, request.headers.get('host')) ? referrer : undefined,
        landing: request.nextUrl.pathname.slice(0, 300),
        at: new Date().toISOString(),
      }),
      { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: FIRST_TOUCH_MAX_AGE }
    );
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_vercel|api/|.*\\..*).*)',
    '/:file.txt',
  ],
};
