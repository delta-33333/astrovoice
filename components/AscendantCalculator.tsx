'use client';

import { useState, type FormEvent } from 'react';
import type { AscendantResult } from '@/lib/ascendant-tool';

const inputClass =
  'mt-1 w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50';

export default function AscendantCalculator() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AscendantResult | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!date || !time || place.trim().length < 2) {
      setError('La date, l’heure et le lieu de naissance sont requis.');
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
      if (!response.ok || !payload || typeof payload.sign !== 'string') {
        setResult(null);
        setError(payload?.error || 'Le calcul n’a pas abouti. Vérifiez le lieu, par exemple « Lyon, France ».');
        return;
      }
      setResult(payload);
    } catch {
      setResult(null);
      setError('Le calcul n’a pas abouti. Réessayez dans un instant.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="[color-scheme:dark] rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
      <div className="grid gap-4">
        <div>
          <label htmlFor="asc-date" className="text-sm font-medium">
            Date de naissance
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
            Heure de naissance
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
          <p className="mt-1 text-xs text-white/50">Heure locale du lieu, telle que sur l’acte. L’heure d’été est appliquée.</p>
        </div>
        <div>
          <label htmlFor="asc-place" className="text-sm font-medium">
            Lieu de naissance
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
            placeholder="Lyon, France"
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
        {pending ? 'Calcul…' : 'Calculer l’ascendant'}
      </button>

      <div
        className="mt-5 min-h-[24rem] rounded-2xl border border-white/10 bg-black/20 p-4"
        aria-live="polite"
      >
        {result ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-white/45">Ascendant</p>
            <p className="font-[family-name:var(--font-cinzel)] text-3xl text-celestial-gold">{result.sign}</p>
            <p className="text-white/90">{result.position}</p>
            {result.element && result.modality && (
              <p className="text-sm text-white/70">
                {result.element} · {result.modality}
              </p>
            )}
            <p className="text-sm text-white/70">
              Soleil en {result.sunSign} · Lune en {result.moonSign}
            </p>
            <p className="text-sm text-white/80 leading-relaxed">{result.reading}</p>
            <p className="text-xs text-white/45 break-words line-clamp-2">
              {result.placeLabel} · {result.localMeanTime ? 'temps moyen local' : result.timeZone}
            </p>
            <p className="text-xs text-white/50 leading-relaxed">
              Lecture de tradition astrologique, à titre de divertissement. Aucune prédiction n’est garantie.
            </p>
          </div>
        ) : (
          <p className="text-sm text-white/45 leading-relaxed">
            {pending
              ? 'Calcul en cours, à partir de l’heure locale et du lieu.'
              : 'Le signe, le degré et une lecture courte s’afficheront ici. Rien n’est enregistré dans un compte.'}
          </p>
        )}
      </div>
    </form>
  );
}
