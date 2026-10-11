'use client';

import { HONEYPOT_FIELD } from '@/lib/form-checks';

/** Champ invisible pour les robots. Les personnes ne le remplissent pas. */
export default function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <p className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
      <label>
        Website
        <input
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </p>
  );
}
