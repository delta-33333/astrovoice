'use client';

import { useRef } from 'react';

const LABEL = {
  fr: 'Extrait généré par IA — voix de synthèse Callastral',
  en: 'AI-generated excerpt — Callastral synthetic voice',
  es: 'Extracto generado por IA — voz sintética Callastral',
  de: 'KI-erzeugter Auszug — synthetische Callastral-Stimme',
  it: 'Estratto generato dall’IA — voce sintetica Callastral',
} as const;

const PLAY = {
  fr: 'Écouter un extrait (25 s)',
  en: 'Play a 25-second excerpt',
  es: 'Escuchar un extracto (25 s)',
  de: 'Auszug anhören (25 s)',
  it: 'Ascolta un estratto (25 s)',
} as const;

const TRANSCRIPT_TITLE = {
  fr: 'Transcription',
  en: 'Transcript',
  es: 'Transcripción',
  de: 'Transkript',
  it: 'Trascrizione',
} as const;

const TRANSCRIPT = {
  fr: 'Extrait généré par IA. Voix de synthèse Callastral. Exemple de lecture de thème.',
  en: 'AI-generated excerpt. Callastral synthetic voice. Example chart reading.',
  es: 'Extracto generado por IA. Voz sintética Callastral. Ejemplo de lectura de carta.',
  de: 'KI-erzeugter Auszug. Synthetische Callastral-Stimme. Beispiel einer Horoskoplesung.',
  it: 'Estratto generato dall’IA. Voce sintetica Callastral. Esempio di lettura del tema.',
} as const;

export default function VoiceSample({
  locale,
  src,
}: {
  locale: keyof typeof LABEL;
  src: string;
}) {
  const sent = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const track = () => {
    if (sent.current) return;
    sent.current = true;
    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'sample_play', metadata: { source: 'sample', label: locale } }),
    }).catch(() => undefined);
  };
  return (
    <figure className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <figcaption className="text-sm text-white/80">{LABEL[locale]}</figcaption>
      <button
        type="button"
        className="btn-secondary mt-3"
        onClick={() => {
          void audioRef.current?.play();
        }}
      >
        {PLAY[locale]}
      </button>
      <audio
        ref={audioRef}
        className="mt-3 w-full"
        controls
        preload="metadata"
        src={src}
        onPlay={track}
      >
        <track kind="captions" src={src.replace(/\.mp3$/, '.vtt')} srcLang={locale === 'en' ? 'en' : 'fr'} label={locale} default />
      </audio>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-white/70">{TRANSCRIPT_TITLE[locale]}</summary>
        <p className="mt-2 text-sm text-white/75">{TRANSCRIPT[locale]}</p>
      </details>
    </figure>
  );
}
