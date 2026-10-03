import { EVENT_NAMES, type EventName } from '@/lib/events';
import type { FunnelDay } from '@/lib/admin-data';

const LABELS: Record<EventName, string> = {
  visit: 'Visite',
  signup: 'Compte',
  birth_data: 'Naissance',
  slot_selected: 'Créneau',
  checkout_started: 'Paiement ouvert',
  paid: 'Payé',
  call_started: 'Appel',
  call_completed: 'Appel fini',
  summary_bought: 'Résumé',
};

export default function FunnelChart({ days }: { days: FunnelDay[] }) {
  const max = Math.max(1, ...days.flatMap((day) => EVENT_NAMES.map((name) => day.counts[name])));
  return (
    <div className="space-y-3">
      {days.map((day) => (
        <div key={day.day} className="grid grid-cols-[6.5rem_1fr] gap-3 items-center">
          <p className="text-xs text-white/50">{day.day.slice(5)}</p>
          <div className="flex items-end gap-1 h-12">
            {EVENT_NAMES.map((name) => {
              const count = day.counts[name];
              const height = Math.max(count > 0 ? 4 : 0, Math.round((count / max) * 48));
              return (
                <div key={name} className="flex-1 flex flex-col items-center justify-end h-12" title={`${LABELS[name]} : ${count}`}>
                  <div
                    className="w-full rounded-sm bg-celestial-gold/80"
                    style={{ height }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-3 text-[11px] text-white/55 pt-2">
        {EVENT_NAMES.map((name) => (
          <span key={name}>{LABELS[name]}</span>
        ))}
      </div>
    </div>
  );
}
