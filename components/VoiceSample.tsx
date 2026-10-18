'use client';

import { useRef } from 'react';

const LABEL = {
  fr: 'Extrait généré par IA — voix de synthèse Callastral',
  en: 'AI-generated excerpt — Callastral synthetic voice',
  es: 'Extracto generado por IA — voz sintética Callastral',
  de: 'KI-erzeugter Auszug — synthetische Callastral-Stimme',
  it: 'Estratto generato dall’IA — voce sintetica Callastral',
} as const;

export default function VoiceSample({
  locale,
  src,
}: {
  locale: keyof typeof LABEL;
  src: string;
}) {
  const sent = useRef(false);
  return (
    <figure className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <figcaption className="text-sm text-white/80">{LABEL[locale]}</figcaption>
      <audio
        className="mt-3 w-full"
        controls
        preload="metadata"
        src={src}
        onPlay={() => {
          if (sent.current) return;
          sent.current = true;
          void fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'sample_play', metadata: { source: 'home', label: locale } }),
          }).catch(() => undefined);
        }}
      >
        <track kind="captions" src={src.replace(/\.mp3$/, '.vtt')} srcLang={locale} label={locale} default />
      </audio>
    </figure>
  );
}
