import { formatMoney, normalizeCurrency } from '@/lib/money';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Affiliate { id: string; code: string; name: string; email: string; social_handle: string; locale: string; status: string; created_at: string }
interface Referral { id: string; affiliate_id: string; ref_code: string; purpose: string | null; amount_cents: number; currency: string; commission_cents: number; payout_status: string; created_at: string; stripe_object_id: string }

export default async function AdminAffiliatesPage() {
  let affiliates: Affiliate[] = [];
  let referrals: Referral[] = [];
  if (supabaseAvailable) {
    const admin = getSupabaseAdmin();
    const [a, r] = await Promise.all([
      admin.from('affiliates').select('id, code, name, email, social_handle, locale, status, created_at').order('created_at', { ascending: false }).limit(200),
      admin.from('referrals').select('id, affiliate_id, ref_code, purpose, amount_cents, currency, commission_cents, payout_status, created_at, stripe_object_id').order('created_at', { ascending: false }).limit(300),
    ]);
    affiliates = (a.data ?? []) as Affiliate[];
    referrals = (r.data ?? []) as Referral[];
  }
  const due = new Map<string, Record<string, number>>();
  for (const ref of referrals) {
    if (ref.payout_status !== 'due') continue;
    const bucket = due.get(ref.affiliate_id) ?? {};
    bucket[ref.currency] = (bucket[ref.currency] ?? 0) + ref.commission_cents;
    due.set(ref.affiliate_id, bucket);
  }
  const money = (cents: number, currency: string) => formatMoney(cents, normalizeCurrency(currency));
  return (
    <main className="space-y-10">
      <section>
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl">Affiliés ({affiliates.length})</h1>
        <p className="text-sm text-white/60">Versement manuel. Passer payout_status à « paid » dans Supabase après virement.</p>
        <table className="mt-4 w-full text-sm">
          <thead><tr className="text-left text-white/50"><th>Code</th><th>Nom</th><th>E-mail</th><th>Réseau</th><th>Langue</th><th>Statut</th><th>À verser</th><th>Inscrit</th></tr></thead>
          <tbody>
            {affiliates.map((item) => (
              <tr key={item.id} className="border-t border-white/10">
                <td className="font-mono">{item.code}</td><td>{item.name}</td><td>{item.email}</td><td>{item.social_handle}</td><td>{item.locale}</td><td>{item.status}</td>
                <td>{Object.entries(due.get(item.id) ?? {}).map(([cur, cents]) => money(cents, cur)).join(' · ') || '—'}</td>
                <td>{item.created_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="font-[family-name:var(--font-cinzel)] text-xl">Ventes parrainées ({referrals.length})</h2>
        <table className="mt-4 w-full text-sm">
          <thead><tr className="text-left text-white/50"><th>Date</th><th>Code</th><th>Achat</th><th>Montant</th><th>Commission 30 %</th><th>Statut</th><th>Stripe</th></tr></thead>
          <tbody>
            {referrals.map((item) => (
              <tr key={item.id} className="border-t border-white/10">
                <td>{item.created_at.slice(0, 16).replace('T', ' ')}</td><td className="font-mono">{item.ref_code}</td><td>{item.purpose ?? '—'}</td>
                <td>{money(item.amount_cents, item.currency)}</td><td>{money(item.commission_cents, item.currency)}</td><td>{item.payout_status}</td>
                <td className="font-mono text-xs">{item.stripe_object_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
