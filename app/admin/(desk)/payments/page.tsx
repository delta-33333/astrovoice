import { loadRows, loadStripePayments } from '@/lib/admin-data';
import { formatCurrency } from '@/lib/pricing';
import { getSupabaseAdmin, supabaseAvailable } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Grant {
  checkout_session_id: string;
  amount_cents: number;
  seconds: number;
  pack_id: string | null;
  created_at: string;
}

interface SummaryPay {
  booking_id: string | null;
  summary_paid_at: string | null;
  summary_checkout_session_id: string | null;
}

export default async function AdminPaymentsPage() {
  let paidSummaries: SummaryPay[] = [];
  if (supabaseAvailable) {
    const { data } = await getSupabaseAdmin()
      .from('call_sessions')
      .select('booking_id, summary_paid_at, summary_checkout_session_id')
      .not('summary_paid_at', 'is', null)
      .order('summary_paid_at', { ascending: false })
      .limit(40);
    paidSummaries = (data ?? []) as SummaryPay[];
  }
  const [grants, stripe] = await Promise.all([
    loadRows<Grant>('stripe_credit_grants', 'checkout_session_id, amount_cents, seconds, pack_id, created_at', 'created_at', 40),
    loadStripePayments(),
  ]);

  return (
    <main className="space-y-10">
      <section>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl mb-4">Paiements Stripe</h1>
        {stripe.length === 0 && <p className="text-white/55">Aucun paiement récent, ou Stripe n’est pas configuré.</p>}
        <ul className="space-y-2 text-sm">
          {stripe.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 border-b border-white/10 py-2">
              <span className="text-white/70">{item.purpose || 'paiement'} · {item.status}</span>
              <span>{formatCurrency(item.amount)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-3">Minutes créditées</h2>
        <ul className="space-y-2 text-sm">
          {grants.map((grant) => (
            <li key={grant.checkout_session_id} className="flex justify-between border-b border-white/10 py-2">
              <span>{grant.pack_id || 'minutes'} · {Math.round(grant.seconds / 60)} min</span>
              <span>{formatCurrency(grant.amount_cents)}</span>
            </li>
          ))}
        </ul>
        {grants.length === 0 && <p className="text-white/55">Aucun crédit.</p>}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-3">Résumés payés</h2>
        <ul className="space-y-2 text-sm">
          {paidSummaries.map((row) => (
            <li key={row.summary_checkout_session_id || row.booking_id} className="border-b border-white/10 py-2 text-white/70">
              {row.summary_paid_at ? new Date(row.summary_paid_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) : ''}
            </li>
          ))}
        </ul>
        {paidSummaries.length === 0 && <p className="text-white/55">Aucun résumé payé.</p>}
      </section>
    </main>
  );
}
