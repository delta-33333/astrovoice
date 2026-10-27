import { NextRequest, NextResponse } from 'next/server';
import { chatPath } from '@/lib/chat';
import { CHAT_COOKIE, CHAT_COOKIE_MAX_AGE, newToken, sha256 } from '@/lib/chat-store';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  const fail = NextResponse.redirect(new URL('/fr/chat?login=expired', request.url));
  if (!supabaseAvailable || token.length < 20) return fail;
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from('chat_users')
    .select('id, locale, login_expires_at')
    .eq('login_hash', sha256(token))
    .maybeSingle();
  if (!data || !data.login_expires_at || new Date(data.login_expires_at).getTime() < Date.now()) return fail;
  const session = newToken();
  await admin
    .from('chat_users')
    .update({ session_hash: sha256(session), login_hash: null, login_expires_at: null })
    .eq('id', data.id);
  const response = NextResponse.redirect(new URL(chatPath(data.locale), request.url));
  response.cookies.set(CHAT_COOKIE, session, {
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/',
    maxAge: CHAT_COOKIE_MAX_AGE,
  });
  return response;
}
