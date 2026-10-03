import FunnelChart from '@/components/FunnelChart';
import { loadFunnel } from '@/lib/admin-data';
import { EVENT_NAMES, FUNNEL_LABELS, FUNNEL_STEPS, funnelStepOf, type FunnelStep } from '@/lib/events';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const funnel = await loadFunnel(14);
  const totals = Object.fromEntries(FUNNEL_STEPS.map((step) => [step, 0])) as Record<FunnelStep, number>;
  for (const day of funnel.days) {
    for (const name of EVENT_NAMES) {
      const step = funnelStepOf(name);
      if (step) totals[step] += day.counts[name];
    }
  }
  const birth = funnel.days.reduce((sum, day) => sum + day.counts.birth_data, 0);
  const summaries = funnel.days.reduce((sum, day) => sum + day.counts.summary_bought, 0);

  return (
    <main>
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl mb-2">Entonnoir</h1>
      <p className="text-sm text-white/50 mb-6">
        Quatorze jours, heure de Paris. Le pourcentage est celui de l’étape précédente.
      </p>
      {funnel.unavailable && (
        <p className="text-sm text-white/60 mb-4">Les événements ne sont pas disponibles tant que la migration n’est pas appliquée.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {FUNNEL_STEPS.map((step, index) => {
          const count = totals[step];
          const previous = index === 0 ? count : totals[FUNNEL_STEPS[index - 1]];
          const rate = index > 0 && previous > 0 ? Math.round((count / previous) * 100) : null;
          return (
            <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">{FUNNEL_LABELS[step]}</p>
              <p className="text-2xl font-semibold mt-1">{count}</p>
              {rate != null && <p className="text-xs text-celestial-gold mt-1">{rate} % de l’étape précédente</p>}
            </div>
          );
        })}
      </div>
      <FunnelChart days={funnel.days} />
      <p className="text-sm text-white/50 mt-8">
        Naissances renseignées : {birth} · Résumés écrits : {summaries}
      </p>
    </main>
  );
}
