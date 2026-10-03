import { EVENT_NAMES, FUNNEL_LABELS, FUNNEL_STEPS, funnelStepOf, type FunnelStep } from '@/lib/events';
import type { FunnelDay } from '@/lib/admin-data';

function stepCount(day: FunnelDay, step: FunnelStep): number {
  return EVENT_NAMES.reduce((sum, name) => (
    funnelStepOf(name) === step ? sum + day.counts[name] : sum
  ), 0);
}

export default function FunnelChart({ days }: { days: FunnelDay[] }) {
  const max = Math.max(1, ...days.flatMap((day) => FUNNEL_STEPS.map((step) => stepCount(day, step))));
  return (
    <div className="space-y-3">
      {days.map((day) => (
        <div key={day.day} className="grid grid-cols-[4.5rem_1fr] gap-3 items-center">
          <p className="text-xs text-white/50">{day.day.slice(5)}</p>
          <div className="flex items-end gap-1 h-16">
            {FUNNEL_STEPS.map((step) => {
              const count = stepCount(day, step);
              const height = Math.max(count > 0 ? 4 : 0, Math.round((count / max) * 64));
              return (
                <div key={step} className="flex-1 flex flex-col items-center justify-end h-16" title={`${FUNNEL_LABELS[step]} : ${count}`}>
                  <div className="w-full rounded-sm bg-celestial-gold/80" style={{ height }} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/55 pt-2">
        {FUNNEL_STEPS.map((step) => (
          <span key={step}>{FUNNEL_LABELS[step]}</span>
        ))}
      </div>
    </div>
  );
}
