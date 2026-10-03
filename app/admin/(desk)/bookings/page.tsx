import { loadRows } from '@/lib/admin-data';
import { formatMoney, normalizeCurrency } from '@/lib/money';

export const dynamic = 'force-dynamic';

interface Row {
  id: string;
  starts_at: string;
  duration_min: number;
  amount_cents: number;
  status: string;
  user_id: string;
  advisor_id: string;
  currency?: string | null;
}

export default async function AdminBookingsPage() {
  const withCurrency = await loadRows<Row>(
    'bookings',
    'id, starts_at, duration_min, amount_cents, status, user_id, advisor_id, currency',
    'created_at'
  );
  const rows = withCurrency.length > 0
    ? withCurrency
    : await loadRows<Row>(
        'bookings',
        'id, starts_at, duration_min, amount_cents, status, user_id, advisor_id',
        'created_at'
      );
  return (
    <main>
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl mb-6">Réservations</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-white/45">
            <tr>
              <th className="py-2 pr-3">Quand</th>
              <th className="py-2 pr-3">Durée</th>
              <th className="py-2 pr-3">Montant</th>
              <th className="py-2 pr-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-white/10">
                <td className="py-2 pr-3">{new Date(row.starts_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</td>
                <td className="py-2 pr-3">{row.duration_min} min</td>
                <td className="py-2 pr-3">{formatMoney(row.amount_cents, normalizeCurrency(row.currency))}</td>
                <td className="py-2 pr-3">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="text-white/55 mt-4">Aucune réservation.</p>}
      </div>
    </main>
  );
}
