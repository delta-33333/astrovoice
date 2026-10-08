'use client';

import { useState, type FormEvent } from 'react';
import type { AscendantResult } from '@/lib/ascendant-tool';
import type { AscendantFormCopy, SignCopy } from '@/lib/ascendant-copy';

const inputClass =
  'mt-1 w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50';

const ERROR_CODES = ['DATE', 'PLACE', 'RATE', 'EPHEMERIS', 'FAIL'] as const;

type ErrorCode = (typeof ERROR_CODES)[number];

function isErrorCode(value: string): value is ErrorCode {
  return (ERROR_CODES as readonly string[]).includes(value);
}

export default function AscendantCalculator({
  labels,
  signs,
}: {
  labels: AscendantFormCopy;
  signs: Record<string, SignCopy>;
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AscendantResult | null>(null);

  const named = (key: string) => signs[key]?.name ?? key;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!date || !time || place.trim().length < 2) {
      setError(labels.required);
      return;
    }
    setPending(true);
    try {
      const response = await fetch('/api/ascendant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, place: place.trim() }),
      });
      const payload = (await response.json().catch(() => null)) as (AscendantResult & { error?: string }) | null;
      if (!response.ok || !payload || typeof payload.sign !== 'string' || typeof payload.arc !== 'string') {
        setResult(null);
        const code = payload && typeof payload.error === 'string' && isErrorCode(payload.error) ? payload.error : 'FAIL';
        setError(labels.errors[code]);
        return;
      }
      setResult(payload);
    } catch {
      setResult(null);
      setError(labels.errors.FAIL);
    } finally {
      setPending(false);
    }
  };

  const profile = result ? signs[result.sign] : undefined;
  const signName = result ? named(result.sign) : '';

  return (
    <form onSubmit={onSubmit} className="[color-scheme:dark] rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <div className="grid gap-4">
        <div>
          <label htmlFor="asc-date" className="text-sm font-medium">
            {labels.date}
          </label>
          <input
            id="asc-date"
            name="asc-date"
            type="date"
            required
            min="1800-01-01"
            max="2200-12-31"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClass}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="asc-time" className="text-sm font-medium">
            {labels.time}
          </label>
          <input
            id="asc-time"
            name="asc-time"
            type="time"
            required
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className={inputClass}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-white/50">{labels.timeHint}</p>
        </div>
        <div>
          <label htmlFor="asc-place" className="text-sm font-medium">
            {labels.place}
          </label>
          <input
            id="asc-place"
            name="asc-place"
            type="text"
            required
            minLength={2}
            maxLength={80}
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            placeholder={labels.placePlaceholder}
            className={inputClass}
            autoComplete="off"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-200">
          {error}
        </p>
      )}

      <button type="submit" className="btn-secondary mt-5 w-full" disabled={pending}>
        {pending ? labels.submitting : labels.submit}
      </button>

      <div
        className="mt-5 min-h-[24rem] rounded-2xl border border-white/10 bg-black/20 p-4"
        aria-live="polite"
      >
        {result ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-white/45">{labels.resultKicker}</p>
            <p className="font-[family-name:var(--font-cinzel)] text-3xl text-celestial-gold">{signName}</p>
            <p className="text-white/90">{signName} {result.arc}</p>
            {profile && profile.element && profile.modality && (
              <p className="text-sm text-white/70">
                {profile.element} · {profile.modality}
              </p>
            )}
            <p className="text-sm text-white/70">
              {labels.sunIn} {named(result.sunSign)} · {labels.moonIn} {named(result.moonSign)}
            </p>
            {profile && <p className="text-sm text-white/80 leading-relaxed">{profile.reading}</p>}
            <p className="text-xs text-white/45 break-words line-clamp-2">
              {result.placeLabel} · {result.localMeanTime ? labels.localMean : result.timeZone}
            </p>
            <p className="text-xs text-white/50 leading-relaxed">{labels.disclaimer}</p>
          </div>
        ) : (
          <p className="text-sm text-white/45 leading-relaxed">
            {pending ? labels.pending : labels.empty}
          </p>
        )}
      </div>
    </form>
  );
}
