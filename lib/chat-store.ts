import 'server-only';
import { createHash, randomBytes } from 'crypto';
import type Stripe from 'stripe';
import { cookies } from 'next/headers';
import { getAdvisorById, listPublicAdvisors } from './astrologers';
import {
  CHAT_CURRENCY,
  CHAT_PRICE_CENTS,
  CHAT_PRICE_LOOKUP_KEY,
  TOPIC_SPECIALTY,
  chatEntitlement,
  chatSystemPrompt,
  ensureFollowUp,
  type ChatLocale,
  type ChatTopic,
} from './chat';
import { advisorLabel } from './legal';
import { getStripe } from './stripe';
import { getSupabaseAdmin } from './supabase';
import { chatModel, scrubProse } from './xai';

export const CHAT_COOKIE = 'cl_chat';
export const CHAT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface ChatUserRow {
  id: string;
  email: string;
  email_norm: string;
  first_name: string | null;
  birth_date: string;
  birth_time: string | null;
  birth_time_unknown: boolean;
  birth_place: string;
  topic: ChatTopic;
  locale: ChatLocale;
  advisor_id: string | null;
  chart_summary: string | null;
  sun_sign: string | null;
  free_used_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  period_start: string | null;
  period_end: string | null;
  period_messages: number;
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function newToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function currentChatUser(): Promise<ChatUserRow | null> {
  const jar = await cookies();
  const token = jar.get(CHAT_COOKIE)?.value;
  if (!token || token.length < 20) return null;
  const { data, error } = await getSupabaseAdmin()
    .from('chat_users')
    .select('*')
    .eq('session_hash', sha256(token))
    .maybeSingle();
  if (error) {
    console.warn('Chat session:', error.message);
    return null;
  }
  return (data as ChatUserRow | null) ?? null;
}

export function entitlementOf(user: ChatUserRow) {
  return chatEntitlement({
    freeUsed: !!user.free_used_at,
    subscriptionStatus: user.subscription_status,
    periodEnd: user.period_end,
    periodMessages: user.period_messages,
  });
}

/** Choix d’un conseiller qui parle la langue et couvre le thème ; stable par e-mail. */
export async function pickAdvisor(locale: ChatLocale, topic: ChatTopic, seed: string): Promise<string | null> {
  try {
    const { advisors } = await listPublicAdvisors();
    const speaking = advisors.filter((a) => a.languages.includes(locale));
    const pool = speaking.length ? speaking : advisors.filter((a) => a.languages.includes('fr'));
    const specialty = TOPIC_SPECIALTY[topic];
    const matching = pool.filter((a) => a.specialties.includes(specialty));
    const featured = matching.filter((a) => a.featured);
    const list = featured.length ? featured : matching.length ? matching : pool;
    if (!list.length) return null;
    const index = parseInt(sha256(seed).slice(0, 8), 16) % list.length;
    return list[index].id;
  } catch {
    return null;
  }
}

export async function advisorCard(advisorId: string | null, locale: ChatLocale) {
  if (!advisorId) return null;
  const advisor = await getAdvisorById(advisorId).catch(() => null);
  if (!advisor) return null;
  return {
    id: advisor.id,
    slug: advisor.slug,
    name: advisor.name,
    firstName: advisor.firstName,
    photoUrl: advisor.photoUrl,
    gender: advisor.gender,
    label: advisorLabel(locale, advisor.gender),
  };
}

export async function loadMessages(userId: string, limit = 60) {
  const { data, error } = await getSupabaseAdmin()
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('chat_user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{ id: string; role: 'user' | 'advisor'; content: string; created_at: string }>;
}

/** Rédige la réponse écrite du conseiller. */
export async function advisorReply(user: ChatUserRow, history: Array<{ role: 'user' | 'advisor'; content: string }>): Promise<string> {
  const key = process.env.XAI_API_KEY?.trim();
  if (!key || key.includes('placeholder')) throw new Error('CHAT_UNAVAILABLE');
  const advisor = user.advisor_id ? await getAdvisorById(user.advisor_id).catch(() => null) : null;
  const system = chatSystemPrompt({
    locale: user.locale,
    advisorName: advisor?.name ?? 'Callastral',
    advisorLabel: advisorLabel(user.locale, advisor?.gender),
    personaPrompt: advisor?.personaPrompt ?? '',
    firstName: user.first_name || '',
    birth: `${user.birth_date}${user.birth_time_unknown || !user.birth_time ? '' : ` ${user.birth_time}`}`,
    place: user.birth_place,
    timeUnknown: user.birth_time_unknown,
    topic: user.topic,
    chartText: user.chart_summary || '',
    today: new Date().toISOString().slice(0, 10),
  });
  const messages = [
    { role: 'system', content: system },
    ...history.slice(-20).map((m) => ({ role: m.role === 'advisor' ? 'assistant' : 'user', content: m.content.slice(0, 4000) })),
  ];
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: chatModel(), temperature: 0.7, max_tokens: 700, messages }),
  });
  if (!response.ok) {
    console.error('Réponse chat refusée:', response.status);
    throw new Error('CHAT_FAILED');
  }
  const payload = await response.json();
  const raw = payload?.choices?.[0]?.message?.content;
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('CHAT_FAILED');
  const clean = scrubProse(raw.trim().replace(/\*\*/g, '')) || raw.trim();
  return ensureFollowUp(clean, user.locale);
}

/** Price mensuel 6,90 EUR : retrouvé par lookup_key, créé une seule fois sinon. */
export async function chatPriceId(stripe: Stripe): Promise<string> {
  const configured = process.env.CHAT_STRIPE_PRICE_ID?.trim();
  if (configured) return configured;
  const found = await stripe.prices.list({ lookup_keys: [CHAT_PRICE_LOOKUP_KEY], active: true, limit: 1 });
  if (found.data[0]) return found.data[0].id;
  const product = await stripe.products.create(
    {
      name: 'Callastral — Chat par message',
      description: 'Échanges écrits par message (usage raisonnable : 300 messages/mois) avec une conseillère ou un conseiller Callastral.',
      metadata: { app: 'callastral', purpose: 'chat' },
    },
    { idempotencyKey: `${CHAT_PRICE_LOOKUP_KEY}-product` }
  );
  const price = await stripe.prices.create(
    {
      product: product.id,
      currency: CHAT_CURRENCY,
      unit_amount: CHAT_PRICE_CENTS,
      recurring: { interval: 'month' },
      lookup_key: CHAT_PRICE_LOOKUP_KEY,
      metadata: { app: 'callastral', purpose: 'chat' },
    },
    { idempotencyKey: `${CHAT_PRICE_LOOKUP_KEY}-price` }
  );
  return price.id;
}

function periodOf(sub: Stripe.Subscription): { start: string | null; end: string | null } {
  const item = sub.items?.data?.[0] as unknown as { current_period_start?: number; current_period_end?: number } | undefined;
  const legacy = sub as unknown as { current_period_start?: number; current_period_end?: number };
  const start = item?.current_period_start ?? legacy.current_period_start;
  const end = item?.current_period_end ?? legacy.current_period_end;
  return {
    start: start ? new Date(start * 1000).toISOString() : null,
    end: end ? new Date(end * 1000).toISOString() : null,
  };
}

/** Recopie l’état Stripe de l’abonnement chat ; remet le compteur à zéro à chaque période. */
export async function syncChatSubscription(sub: Stripe.Subscription): Promise<{ previous: string | null; status: string } | null> {
  const chatUserId = sub.metadata?.chatUserId;
  if (sub.metadata?.purpose !== 'chat' || !chatUserId) return null;
  const admin = getSupabaseAdmin();
  const { data } = await admin.from('chat_users').select('period_start, period_messages, subscription_status').eq('id', chatUserId).maybeSingle();
  const period = periodOf(sub);
  const samePeriod = data?.period_start && period.start && new Date(data.period_start).getTime() === new Date(period.start).getTime();
  const { error } = await admin
    .from('chat_users')
    .update({
      stripe_subscription_id: sub.id,
      stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
      subscription_status: sub.status,
      period_start: period.start,
      period_end: period.end,
      period_messages: samePeriod ? data?.period_messages ?? 0 : 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', chatUserId);
  if (error) throw new Error(error.message);
  return { previous: (data?.subscription_status as string | null) ?? null, status: sub.status };
}
