import FunnelChart from '@/components/FunnelChart';
import { loadFunnel } from '@/lib/admin-data';
import { EVENT_NAMES } from '@/lib/events';

export const dynamic = 'force-dynamic';

const LABELS: Record<string, string> = {
  visit: 'Visites',
  signup: 'Comptes',
  birth_data: 'Naissances',
  slot_selected: 'Créneaux',
  checkout_started: 'Paiements ouverts',
  paid: 'Payés',
  call_started: 'Appels',
  call_completed: 'Appels finis',
  summary_bought: 'Résumés',
};

export default async function AdminHomePage() {
  const funnel = await loadFunnel(14);
  const totals = Object.fromEntries(EVENT_NAMES.map((name) => [name, 0])) as Record<string, number>;
  for (const day of funnel.days) {
    for (const name of EVENT_NAMES) totals[name] += day.counts[name];
  }

  return (
    <main>
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl mb-2">Entonnoir</h1>
      <p className="text-sm text-white/50 mb-6">Quatorze jours, heure de Paris. Chaque barre est une étape du jour.</p>
      {funnel.unavailable && (
        <p className="text-sm text-white/60 mb-4">Les événements ne sont pas disponibles tant que la migration n’est pas appliquée.</p>
      )}
      <FunnelChart days={funnel.days} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
        {EVENT_NAMES.map((name) => (
          <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/45">{LABELS[name]}</p>
            <p className="text-2xl font-semibold mt-1">{totals[name]}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
