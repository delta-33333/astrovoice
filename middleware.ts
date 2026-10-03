import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = new Set(['fr', 'en', 'es', 'de', 'it']);

export function middleware(request: NextRequest) {
  const segment = request.nextUrl.pathname.split('/')[1] || '';
  const requestHeaders = new Headers(request.headers);
  if (LOCALES.has(segment)) requestHeaders.set('x-locale', segment);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api/|.*\\..*).*)'],
};
