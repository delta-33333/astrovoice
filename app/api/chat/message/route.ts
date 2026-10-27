import { NextRequest, NextResponse } from 'next/server';
import { CHAT_MAX_INPUT } from '@/lib/chat';
import { advisorReply, currentChatUser, entitlementOf, loadMessages } from '@/lib/chat-store';
import { trackEvent } from '@/lib/events';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!supabaseAvailable) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  const user = await currentChatUser();
  if (!user) return NextResponse.json({ error: 'no_session' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (text.length < 2 || text.length > CHAT_MAX_INPUT) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const entitlement = entitlementOf(user);
  if (!entitlement.allowed) return NextResponse.json({ error: entitlement.reason }, { status: 402 });
  const admin = getSupabaseAdmin();

  // Réserve le message offert de façon atomique (un seul, même en double clic).
  if (entitlement.kind === 'free') {
    const claimed = await admin
      .from('chat_users')
      .update({ free_used_at: new Date().toISOString() })
      .eq('id', user.id)
      .is('free_used_at', null)
      .select('id');
    if (!claimed.data?.length) return NextResponse.json({ error: 'paywall' }, { status: 402 });
  } else {
    await admin
      .from('chat_users')
      .update({ period_messages: (user.period_messages || 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', user.id);
  }

  try {
    const history = await loadMessages(user.id, 40);
    const reply = await advisorReply(user, [...history, { role: 'user', content: text }]);
    const saved = await admin
      .from('chat_messages')
      .insert([
        { chat_user_id: user.id, role: 'user', content: text },
        { chat_user_id: user.id, role: 'advisor', content: reply },
      ])
      .select('id, role, content, created_at');
    if (saved.error) throw new Error(saved.error.message);
    if (entitlement.kind === 'free') {
      await trackEvent({ name: 'chat_first_reply', advisorId: user.advisor_id, metadata: { topic: user.topic, locale: user.locale } });
    }
    const after = entitlement.kind === 'free' ? { allowed: false, reason: 'paywall' } : entitlementOf({ ...user, free_used_at: user.free_used_at ?? 'x', period_messages: (user.period_messages || 0) + 1 });
    return NextResponse.json({ messages: saved.data, entitlement: after });
  } catch (error) {
    console.error('Chat réponse:', error instanceof Error ? error.message : error);
    // Rend le crédit si la réponse n’a pas pu être rédigée.
    if (entitlement.kind === 'free') {
      await admin.from('chat_users').update({ free_used_at: null }).eq('id', user.id);
    } else {
      await admin.from('chat_users').update({ period_messages: user.period_messages || 0 }).eq('id', user.id);
    }
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
}
