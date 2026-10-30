import { NextRequest, NextResponse } from 'next/server';
import { validRefCode } from '@/lib/affiliate';
import { normalizeEmail } from '@/lib/form-checks';
import { clientIp } from '@/lib/rate-limit';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < 900_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 4000) {
    const first = hits.keys().next().value;
    if (first) hits.delete(first);
  }
  return recent.length > 10;
}

/** Stats d’un affilié (lecture seule) : e-mail + code doivent correspondre. */
export async function POST(request: NextRequest) {
  if (tooMany(clientIp(request))) return NextResponse.json({ error: 'RATE' }, { status: 429, headers: NO_STORE });
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const code = validRefCode(body?.code);
  if (!email || !code) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404, headers: NO_STORE });
  if (!supabaseAvailable) return NextResponse.json({ error: 'FAIL' }, { status: 503, headers: NO_STORE });
  const admin = getSupabaseAdmin();
  const { data: affiliate, error } = await admin.from('affiliates').select('id').eq('code', code).eq('email', email).maybeSingle();
  if (error) return NextResponse.json({ error: 'FAIL' }, { status: 500, headers: NO_STORE });
  if (!affiliate) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404, headers: NO_STORE });
  const [clicks, signups, sales] = await Promise.all([
    admin.from('affiliate_events').select('id', { count: 'exact', head: true }).eq('affiliate_id', affiliate.id).eq('kind', 'click'),
    admin.from('affiliate_events').select('id', { count: 'exact', head: true }).eq('affiliate_id', affiliate.id).eq('kind', 'signup'),
    admin.from('referrals').select('commission_cents, currency, payout_status').eq('affiliate_id', affiliate.id).limit(5000),
  ]);
  if (clicks.error || signups.error || sales.error) return NextResponse.json({ error: 'FAIL' }, { status: 500, headers: NO_STORE });
  const due: Record<string, number> = {};
  const paid: Record<string, number> = {};
  let count = 0;
  for (const row of sales.data ?? []) {
    if (row.payout_status === 'void') continue;
    count += 1;
    const bucket = row.payout_status === 'paid' ? paid : due;
    bucket[row.currency] = (bucket[row.currency] ?? 0) + row.commission_cents;
  }
  return NextResponse.json({ clicks: clicks.count ?? 0, signups: signups.count ?? 0, sales: count, due, paid }, { headers: NO_STORE });
}
