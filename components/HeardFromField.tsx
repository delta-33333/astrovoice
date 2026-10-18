'use client';

import { HEARD_FROM_IDS, HEARD_FROM_QUESTION, heardFromLabel, type HeardFromId } from '@/lib/heard-from';
import type { Locale } from '@/lib/seo';

export default function HeardFromField({
  locale,
  value,
  onChange,
}: {
  locale: Locale;
  value: string;
  onChange: (value: HeardFromId | '') => void;
}) {
  return (
    <label className="block text-sm text-white/80">
      {HEARD_FROM_QUESTION[locale]}
      <select
        className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-white"
        value={value}
        onChange={(event) => onChange(event.target.value as HeardFromId | '')}
      >
        <option value="">—</option>
        {HEARD_FROM_IDS.map((id) => (
          <option key={id} value={id}>{heardFromLabel(id, locale)}</option>
        ))}
      </select>
    </label>
  );
}
