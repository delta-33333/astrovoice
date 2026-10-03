'use client';

import { useEffect, useRef, useState } from 'react';
import AdvisorAvatar from '@/components/AdvisorAvatar';
import PaymentSheet from '@/components/PaymentSheet';
import {
  CALL_HOLD_CENTS,
  SUMMARY_CENTS,
  formatCurrency,
  quoteCall,
} from '@/lib/pricing';
import type { BirthData, NatalChart, PublicAdvisor } from '@/lib/types';

interface Bubble {
  id: string;
  role: 'user' | 'advisor';
  text: string;
  at: string;
}

interface VoicePayload {
  unavailable?: boolean;
  message?: string;
  token?: string;
  session?: Record<string, unknown>;
  socketUrl?: string;
  callSessionId?: string | null;
}

function mmss(total: number): string {
  const safe = Math.max(0, total);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function downsample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const length = Math.max(1, Math.floor(input.length / ratio));
  const out = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j += 1) {
      sum += input[j];
      count += 1;
    }
    out[i] = count ? sum / count : 0;
  }
  return out;
}

function floatToBase64(samples: Float32Array): string {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function playPcm16(context: AudioContext, gain: GainNode, b64: string, cursor: { time: number }) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const samples = new Float32Array(Math.floor(bytes.length / 2));
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < samples.length; i += 1) {
    samples[i] = view.getInt16(i * 2, true) / 0x8000;
  }
  if (!samples.length) return;
  const buffer = context.createBuffer(1, samples.length, 24000);
  buffer.copyToChannel(samples, 0);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  const start = Math.max(context.currentTime + 0.05, cursor.time);
  source.start(start);
  cursor.time = start + buffer.duration;
}

export default function CallScreen({
  advisor,
  birthData,
  booking,
  prepaidSeconds,
  onFinished,
}: {
  advisor: PublicAdvisor;
  birthData: BirthData;
  booking: { id: string; durationSec: number } | null;
  prepaidSeconds: number;
  onFinished: (seconds: number) => void;
}) {
  const [status, setStatus] = useState<'en ligne' | 'appel en cours'>('en ligne');
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [limited, setLimited] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [summaryState, setSummaryState] = useState<'idle' | 'paying' | 'bought' | 'declined'>('idle');
  const [payOpen, setPayOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const mutedRef = useRef(false);
  const chartRef = useRef<NatalChart | null>(null);
  const linesRef = useRef<Bubble[]>([]);
  const elapsedRef = useRef(0);
  const declinedRef = useRef(false);
  const stoppedRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const playCursor = useRef({ time: 0 });
  const streamRef = useRef<MediaStream | null>(null);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const quote = quoteCall(elapsed, prepaidSeconds);
  const remaining = booking ? booking.durationSec - elapsed : null;

  const syncLines = (next: Bubble[]) => {
    linesRef.current = next;
    setBubbles(next);
  };

  const upsert = (id: string, role: Bubble['role'], text: string, replace: boolean) => {
    const current = linesRef.current;
    const index = current.findIndex((item) => item.id === id);
    const next = current.slice();
    if (index >= 0) {
      next[index] = {
        ...next[index],
        text: replace ? text : `${next[index].text}${text}`,
      };
    } else if (text) {
      next.push({ id, role, text, at: new Date().toISOString() });
    }
    syncLines(next);
  };

  const flush = async (ended: boolean) => {
    if (!booking) return;
    await fetch('/api/call/transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking.id,
        lines: linesRef.current.map((line) => ({ role: line.role, text: line.text, at: line.at })),
        ended,
        durationSeconds: elapsedRef.current,
        declined: declinedRef.current,
      }),
    }).catch(() => undefined);
  };

  const finish = async (seconds: number) => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    elapsedRef.current = seconds;
    wsRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void audioRef.current?.close();
    await flush(true);
    onFinishedRef.current(seconds);
  };

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const gain = gainRef.current;
    if (gain) gain.gain.value = speakerOn ? 1 : 0;
  }, [speakerOn]);

  useEffect(() => {
    let cancelled = false;
    const audio = new AudioContext();
    audioRef.current = audio;
    const gain = audio.createGain();
    gain.gain.value = 1;
    gain.connect(audio.destination);
    gainRef.current = gain;

    let timer = 0;
    const startTimer = () => {
      if (timer) return;
      const started = Date.now();
      setStatus('appel en cours');
      timer = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - started) / 1000);
        elapsedRef.current = seconds;
        setElapsed(seconds);
        if (booking && seconds >= booking.durationSec) {
          window.clearInterval(timer);
          void finish(seconds);
          return;
        }
        if (!booking) {
          const live = quoteCall(seconds, prepaidSeconds);
          if (live.capped || live.amountCents >= CALL_HOLD_CENTS) {
            window.clearInterval(timer);
            void finish(seconds);
          }
        }
      }, 1000);
    };

    const boot = async () => {
      let chart: NatalChart;
      try {
        const chartResponse = await fetch('/api/natal-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(birthData),
        });
        if (!chartResponse.ok) throw new Error('chart');
        chart = await chartResponse.json();
        chartRef.current = chart;
      } catch {
        if (!cancelled) setNotice('Le thème n’a pas pu être préparé. Réessayez dans un instant.');
        return;
      }

      const tokenResponse = await fetch('/api/voice/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking?.id ?? null,
          advisorId: advisor.id,
          birthData,
          natalChart: chart,
        }),
      });
      const tokenBody = (await tokenResponse.json()) as VoicePayload;
      if (cancelled) return;
      if (!tokenResponse.ok || tokenBody.unavailable || !tokenBody.token || !tokenBody.socketUrl) {
        setLimited(true);
        setNotice(tokenBody.message || 'La voix en direct est momentanément indisponible. La consultation continue en mode limité.');
        startTimer();
        return;
      }

      const ws = new WebSocket(tokenBody.socketUrl, [`xai-client-secret.${tokenBody.token}`]);
      wsRef.current = ws;
      ws.onopen = () => {
        if (tokenBody.session) {
          ws.send(JSON.stringify({ type: 'session.update', session: tokenBody.session }));
        }
        ws.send(JSON.stringify({ type: 'response.create' }));
        startTimer();
      };
      ws.onmessage = (message) => {
        if (typeof message.data !== 'string') return;
        let event: Record<string, unknown>;
        try {
          event = JSON.parse(message.data) as Record<string, unknown>;
        } catch {
          return;
        }
        const type = String(event.type || '');
        const delta = typeof event.delta === 'string' ? event.delta : '';
        if ((type === 'response.output_audio.delta' || type === 'response.audio.delta') && delta && audioRef.current && gainRef.current) {
          playPcm16(audioRef.current, gainRef.current, delta, playCursor.current);
        }
        if (type === 'response.output_audio_transcript.delta' || type === 'response.audio_transcript.delta') {
          const id = String(event.response_id || event.item_id || 'advisor-live');
          if (delta) upsert(id, 'advisor', delta, false);
        }
        if (type === 'response.output_audio_transcript.done' || type === 'response.audio_transcript.done') {
          const transcript = typeof event.transcript === 'string' ? event.transcript : '';
          const id = String(event.response_id || event.item_id || 'advisor-live');
          if (transcript) upsert(id, 'advisor', transcript, true);
        }
        if (type.includes('input_audio_transcription')) {
          const transcript = typeof event.transcript === 'string' ? event.transcript : '';
          const id = String(event.item_id || 'user-live');
          if (transcript) upsert(id, 'user', transcript, true);
        }
      };
      ws.onerror = () => {
        if (!cancelled) {
          setLimited(true);
          setNotice('La voix en direct est momentanément indisponible. La consultation continue en mode limité.');
          startTimer();
        }
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const source = audio.createMediaStreamSource(stream);
        const processor = audio.createScriptProcessor(4096, 1, 1);
        const sink = audio.createGain();
        sink.gain.value = 0;
        processor.onaudioprocess = (event) => {
          if (mutedRef.current || ws.readyState !== WebSocket.OPEN) return;
          const channel = event.inputBuffer.getChannelData(0);
          const pcm = downsample(channel, audio.sampleRate, 24000);
          ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: floatToBase64(pcm),
          }));
        };
        source.connect(processor);
        processor.connect(sink);
        sink.connect(audio.destination);
      } catch {
        if (!cancelled) setNotice('Le micro est indisponible. Vous pouvez écrire dans la conversation.');
      }
    };

    void boot();

    const persist = window.setInterval(() => {
      void flush(false);
    }, 12000);

    const resume = () => {
      void audio.resume();
    };
    window.addEventListener('pointerdown', resume);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearInterval(persist);
      window.removeEventListener('pointerdown', resume);
      wsRef.current?.close();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void audio.close();
    };
    // La session vocale démarre une fois pour cet appel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advisor.id, booking?.id]);

  useEffect(() => {
    if (!booking || summaryState !== 'idle') return;
    if (booking.durationSec > 300 && elapsed >= booking.durationSec - 300 && elapsed > 0) {
      setShowUpsell(true);
    }
  }, [booking, elapsed, summaryState]);

  const sendText = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const history = linesRef.current.slice(-8).map((line) => ({ role: line.role, text: line.text }));
    const id = `user-${Date.now()}`;
    upsert(id, 'user', text, true);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && !limited) {
      ws.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }],
        },
      }));
      ws.send(JSON.stringify({ type: 'response.create' }));
      return;
    }
    const response = await fetch('/api/call/turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking?.id ?? null,
        advisorId: advisor.id,
        birthData,
        natalChart: chartRef.current,
        text,
        history,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (response.ok && typeof payload?.reply === 'string') {
      upsert(`advisor-${Date.now()}`, 'advisor', payload.reply, true);
    }
  };

  const buySummary = async () => {
    if (!booking) return;
    setSummaryState('paying');
    setPayOpen(true);
    const response = await fetch('/api/summaries/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.clientSecret) {
      setNotice(payload?.error || 'Le paiement du résumé est indisponible.');
      setSummaryState('idle');
      setPayOpen(false);
      return;
    }
    setClientSecret(payload.clientSecret);
    setCheckoutId(payload.checkoutSessionId);
  };

  const confirmSummary = async () => {
    if (!checkoutId) return;
    const response = await fetch('/api/summaries/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutSessionId: checkoutId }),
    });
    if (response.ok) {
      setSummaryState('bought');
      setShowUpsell(false);
      setPayOpen(false);
      setNotice('Le résumé vous sera envoyé par e-mail à la fin de la consultation.');
      return;
    }
    setNotice('Le paiement n’a pas été confirmé. Vous pouvez réessayer.');
    setSummaryState('idle');
  };

  const declineSummary = () => {
    declinedRef.current = true;
    setSummaryState('declined');
    setShowUpsell(false);
  };

  return (
    <main className="call-stage fixed inset-0 z-40 text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-36">
        <div className={status === 'appel en cours' ? 'call-pulse rounded-full' : 'rounded-full'}>
          <AdvisorAvatar advisor={advisor} size="call" />
        </div>
        <h1 className="mt-6 font-[family-name:var(--font-cinzel)] text-3xl text-center">{advisor.name}</h1>
        <p className="mt-2 text-sm uppercase tracking-[0.18em] text-emerald-100/80">{status}</p>
        <p className="mt-4 font-mono text-5xl tabular-nums">{mmss(elapsed)}</p>
        {booking ? (
          <p className="mt-2 text-sm text-white/55">
            {remaining != null && remaining > 0 ? `${mmss(remaining)} restantes` : 'Durée réservée'}
          </p>
        ) : (
          <p className="mt-2 text-sm text-white/70">{formatCurrency(quote.amountCents)}</p>
        )}
        {notice && <p className="mt-4 max-w-sm text-center text-sm text-emerald-50/80">{notice}</p>}
      </div>

      {showUpsell && booking && summaryState !== 'bought' && summaryState !== 'declined' && (
        <div className="mx-4 mb-3 rounded-3xl border border-white/15 bg-black/35 p-4 backdrop-blur">
          <p className="font-semibold">Recevoir le résumé écrit de votre consultation</p>
          <p className="mt-1 text-sm text-white/70">{formatCurrency(SUMMARY_CENTS)}, envoyé par e-mail.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => void buySummary()} className="btn-primary flex-1 py-2">
              Recevoir
            </button>
            <button type="button" onClick={declineSummary} className="btn-secondary flex-1 py-2">
              Plus tard
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 px-6 pb-8 pt-4 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => setMuted((value) => !value)}
          className={`h-14 w-14 rounded-full border border-white/20 ${muted ? 'bg-white text-black' : 'bg-white/10'}`}
          aria-pressed={muted}
        >
          {muted ? 'Muet' : 'Micro'}
        </button>
        <button
          type="button"
          onClick={() => void finish(elapsedRef.current)}
          className="h-16 w-16 rounded-full bg-red-600 text-white text-sm font-semibold"
          aria-label="Raccrocher"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={() => setSpeakerOn((value) => !value)}
          className={`h-14 w-14 rounded-full border border-white/20 text-xs ${speakerOn ? 'bg-white/10' : 'bg-white text-black'}`}
          aria-pressed={speakerOn}
        >
          Son
        </button>
      </div>

      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="absolute top-4 right-4 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm"
      >
        Messages
      </button>

      {chatOpen && (
        <div className="absolute inset-x-0 bottom-0 top-16 z-50 flex flex-col rounded-t-3xl bg-[#10241c] border border-white/10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="font-semibold">Conversation</p>
            <button type="button" onClick={() => setChatOpen(false)} className="text-sm text-white/70">
              Fermer
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {bubbles.length === 0 && (
              <p className="text-sm text-white/50">Les échanges apparaissent ici.</p>
            )}
            {bubbles.map((bubble) => (
              <div key={bubble.id} className={`flex ${bubble.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  bubble.role === 'user' ? 'bg-emerald-700/80' : 'bg-white/10'
                }`}>
                  {bubble.text}
                </p>
              </div>
            ))}
          </div>
          <form
            className="flex gap-2 p-3 border-t border-white/10"
            onSubmit={(event) => {
              event.preventDefault();
              void sendText();
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Écrire un message"
              className="flex-1 rounded-full bg-white/10 px-4 py-3 text-sm outline-none"
            />
            <button type="submit" className="rounded-full bg-emerald-700 px-4 text-sm font-semibold">
              Envoyer
            </button>
          </form>
        </div>
      )}

      <PaymentSheet
        open={payOpen}
        title="Résumé écrit"
        amountLabel={formatCurrency(SUMMARY_CENTS)}
        detail="Envoyé par e-mail à la fin de la consultation."
        payLabel={`Payer ${formatCurrency(SUMMARY_CENTS)}`}
        clientSecret={clientSecret}
        onClose={() => {
          setPayOpen(false);
          if (summaryState === 'paying') setSummaryState('idle');
        }}
        onSuccess={() => {
          void confirmSummary();
        }}
      />
    </main>
  );
}
