import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/|.*\\..*).*)',
    '/:file.txt',
  ],
};
