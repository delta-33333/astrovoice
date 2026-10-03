'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AdvisorAvatar from '@/components/AdvisorAvatar';
import AiDisclosure from '@/components/AiDisclosure';
import PaymentSheet from '@/components/PaymentSheet';
import { formatMoney, meterMinor, normalizeCurrency, type Currency } from '@/lib/money';
import {
  CALL_HOLD_CENTS,
  SUMMARY_CENTS,
  formatCurrency,
} from '@/lib/pricing';
import type { BirthData, NatalChart, PublicAdvisor } from '@/lib/types';
import {
  GaplessPcmPlayer,
  VOICE_SAMPLE_RATE,
  attachMicWorklet,
  createVoiceAudioContext,
  int16ToBase64,
  pcm16Base64ToFloat32,
} from '@/lib/voice-audio';

/*
 * Écran d’appel façon messagerie autour du client vocal temps réel :
 * - le micro et l’audio sont ouverts dans le geste « Démarrer l’appel » (iOS) ;
 * - capture AudioWorklet PCM16 24 kHz, lecture sans trou, coupure à la prise de parole ;
 * - le compteur (et donc la facturation) ne démarre qu’après ouverture du socket
 *   ET réception du premier audio ; aucune facturation en cas d’échec.
 */

type Phase = 'ready' | 'connecting' | 'live' | 'ending';

interface Bubble {
  id: string;
  role: 'user' | 'advisor';
  text: string;
  at: string;
}

type VoiceGrant = {
  token: string;
  model: string;
  voice: string;
  instructions: string;
  language: string;
  prepaidSeconds: number;
  metered: boolean;
  subscription?: boolean;
};

type LiveCall = {
  stopped: boolean;
  billingStarted: boolean;
  socketOpen: boolean;
  heardAudio: boolean;
  canSendAudio: boolean;
  localClose: boolean;
  greeted: boolean;
  startMs: number;
  prepaid: number;
  metered: boolean;
  cap: number | null;
  player: GaplessPcmPlayer | null;
  gain: GainNode | null;
  ws: WebSocket | null;
  ctx: AudioContext | null;
  stream: MediaStream | null;
  worklet: AudioWorkletNode | null;
  timer: ReturnType<typeof setInterval> | null;
  greetTimer: number;
  pcmChunks: Int16Array[];
  pcmSamples: number;
  assistantId: string;
  levelAt: number;
};

const PCM_FLUSH_SAMPLES = 2400;
const PCM_BUFFER_CAP = VOICE_SAMPLE_RATE * 2;

function scrub(text: string): string {
  return text
    .replace(/\bx[\s.-]*ai\b/gi, '')
    .replace(/\bgrok\b/gi, '')
    .replace(/\b(bot|chatgpt|openai)\b/gi, '')
    .replace(/\b(IA|AI)\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function mediaError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return 'Micro refusé. Ouvrez Réglages > Safari > Micro, autorisez le micro pour ce site, puis réessayez.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'Aucun microphone n’a été trouvé sur cet appareil.';
  }
  if (name === 'NotReadableError' || name === 'AbortError') {
    return 'Le microphone est indisponible. Fermez les autres applications qui l’utilisent, puis réessayez.';
  }
  return 'Impossible d’accéder au microphone. Réessayez.';
}

function mmss(total: number): string {
  const safe = Math.max(0, total);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function emptyLive(): LiveCall {
  return {
    stopped: false,
    billingStarted: false,
    socketOpen: false,
    heardAudio: false,
    canSendAudio: false,
    localClose: false,
    greeted: false,
    startMs: 0,
    prepaid: 0,
    metered: false,
    cap: null,
    player: null,
    gain: null,
    ws: null,
    ctx: null,
    stream: null,
    worklet: null,
    timer: null,
    greetTimer: 0,
    pcmChunks: [],
    pcmSamples: 0,
    assistantId: '',
    levelAt: 0,
  };
}

export default function CallScreen({
  advisor,
  birthData,
  booking,
  prepaidSeconds,
  checkoutSessionId,
  onFinished,
  onUnauthorized,
}: {
  advisor: PublicAdvisor;
  birthData: BirthData;
  booking: { id: string; durationSec: number } | null;
  prepaidSeconds: number;
  checkoutSessionId: string | null;
  onFinished: (seconds: number, prepaid: number, note?: string) => void;
  onUnauthorized: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [prepaid, setPrepaid] = useState(prepaidSeconds);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [summaryState, setSummaryState] = useState<'idle' | 'paying' | 'bought' | 'declined'>('idle');
  const [payOpen, setPayOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [summaryLabel, setSummaryLabel] = useState('');
  const [included, setIncluded] = useState(false);
  const [meter, setMeter] = useState<{
    currency: Currency;
    introMinor: number;
    standardMinor: number;
    holdMinor: number;
  } | null>(null);
  const meterRef = useRef<typeof meter>(null);

  const phaseRef = useRef<Phase>('ready');
  const liveRef = useRef<LiveCall>(emptyLive());
  const mutedRef = useRef(false);
  const linesRef = useRef<Bubble[]>([]);
  const elapsedRef = useRef(0);
  const declinedRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    setPrepaid(prepaidSeconds);
  }, [prepaidSeconds]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('callastral_meter');
      if (raw) {
        const parsed = JSON.parse(raw) as NonNullable<typeof meter>;
        if (parsed?.introMinor && parsed.standardMinor && parsed.holdMinor) {
          meterRef.current = parsed;
          setMeter(parsed);
        }
      }
    } catch {
      /* affichage au tarif de repli */
    }
    fetch('/api/market')
      .then((response) => response.json())
      .then((payload) => {
        if (typeof payload.summaryLabel === 'string') setSummaryLabel(payload.summaryLabel);
      })
      .catch(() => undefined);
  }, []);

  const snap = meter;
  const quote = snap
    ? (() => {
        const safeDuration = Math.max(0, Math.floor(elapsed));
        const safePrepaid = Math.max(0, Math.floor(prepaid));
        const coveredSeconds = Math.min(safePrepaid, safeDuration);
        const raw = meterMinor(safeDuration - coveredSeconds, snap.introMinor, snap.standardMinor);
        return {
          coveredSeconds,
          amountCents: Math.min(raw, snap.holdMinor),
          capped: raw >= snap.holdMinor,
        };
      })()
    : { coveredSeconds: Math.min(Math.max(0, prepaid), Math.max(0, elapsed)), amountCents: 0, capped: false };
  const moneyLabel = (minor: number) =>
    snap ? formatMoney(minor, normalizeCurrency(snap.currency)) : formatCurrency(minor);
  const remaining = booking ? booking.durationSec - elapsed : null;

  const setCallPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const syncLines = (next: Bubble[]) => {
    linesRef.current = next.slice(-80);
    setBubbles(linesRef.current);
  };

  const upsert = (id: string, role: Bubble['role'], text: string, replace: boolean) => {
    const clean = replace ? scrub(text) : text;
    const current = linesRef.current;
    const index = current.findIndex((item) => item.id === id);
    const next = current.slice();
    if (index >= 0) {
      next[index] = {
        ...next[index],
        text: replace ? clean : `${next[index].text}${clean}`,
      };
    } else if (clean) {
      next.push({ id, role, text: clean, at: new Date().toISOString() });
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
        lines: linesRef.current.map((line) => ({ role: line.role, text: scrub(line.text), at: line.at })),
        ended,
        durationSeconds: elapsedRef.current,
        declined: declinedRef.current,
      }),
      keepalive: ended,
    }).catch(() => undefined);
  };

  const teardown = () => {
    const live = liveRef.current;
    live.localClose = true;
    live.canSendAudio = false;
    if (live.timer) {
      clearInterval(live.timer);
      live.timer = null;
    }
    if (live.greetTimer) {
      window.clearTimeout(live.greetTimer);
      live.greetTimer = 0;
    }
    live.player?.stop();
    live.worklet?.port.close();
    live.worklet?.disconnect();
    live.stream?.getTracks().forEach((track) => track.stop());
    if (live.ws && live.ws.readyState < WebSocket.CLOSING) {
      live.ws.close();
    }
    const ctx = live.ctx;
    live.ctx = null;
    live.stream = null;
    live.worklet = null;
    live.ws = null;
    live.player = null;
    live.gain = null;
    if (ctx && ctx.state !== 'closed') {
      void ctx.close().catch(() => undefined);
    }
  };

  const finishRef = useRef<(note?: string) => Promise<void>>(async () => {});

  const finishCall = async (note?: string) => {
    const live = liveRef.current;
    if (live.stopped) return;
    const shouldBill = live.billingStarted;
    const raw = shouldBill ? Math.max(0, Math.floor((Date.now() - live.startMs) / 1000)) : 0;
    const capped = live.cap ? Math.min(raw, live.cap) : raw;
    const seconds = live.metered ? capped : Math.min(capped, live.prepaid);
    live.stopped = true;
    teardown();
    setMicLevel(0);

    if (!shouldBill) {
      setCallPhase('ready');
      liveRef.current = emptyLive();
      return;
    }

    setCallPhase('ending');
    elapsedRef.current = seconds;
    await flush(true);
    onFinishedRef.current(seconds, live.prepaid, note);
  };

  finishRef.current = finishCall;

  const fail = (message: string) => {
    const live = liveRef.current;
    if (live.stopped) return;
    if (live.billingStarted) {
      void finishCall(message);
      return;
    }
    live.stopped = true;
    teardown();
    setMicLevel(0);
    setError(message);
    setCallPhase('ready');
    liveRef.current = emptyLive();
  };

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const gain = liveRef.current.gain;
    if (gain) gain.gain.value = speakerOn ? 1 : 0;
  }, [speakerOn]);

  useEffect(() => {
    const persist = window.setInterval(() => {
      if (liveRef.current.billingStarted && !liveRef.current.stopped) void flush(false);
    }, 12000);
    return () => {
      window.clearInterval(persist);
      const live = liveRef.current;
      if (live.billingStarted && !live.stopped) {
        void finishRef.current();
        return;
      }
      teardown();
    };
    // Une seule session par montage de l’écran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!booking || summaryState !== 'idle') return;
    if (booking.durationSec > 300 && elapsed >= booking.durationSec - 300 && elapsed > 0) {
      setShowUpsell(true);
    }
  }, [booking, elapsed, summaryState]);

  const flushPcm = () => {
    const live = liveRef.current;
    const ws = live.ws;
    if (!live.canSendAudio || !ws || ws.readyState !== WebSocket.OPEN || live.pcmSamples === 0) {
      return;
    }
    const merged = new Int16Array(live.pcmSamples);
    let offset = 0;
    for (const chunk of live.pcmChunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    live.pcmChunks = [];
    live.pcmSamples = 0;
    ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: int16ToBase64(merged) }));
  };

  const queuePcm = (frame: Int16Array) => {
    const live = liveRef.current;
    if (live.stopped || mutedRef.current) return;
    live.pcmChunks.push(frame);
    live.pcmSamples += frame.length;
    while (live.pcmSamples > PCM_BUFFER_CAP && live.pcmChunks.length > 1) {
      const dropped = live.pcmChunks.shift();
      if (dropped) live.pcmSamples -= dropped.length;
    }
    if (live.canSendAudio && live.pcmSamples >= PCM_FLUSH_SAMPLES) {
      flushPcm();
    }
  };

  const maybeBill = () => {
    const live = liveRef.current;
    if (live.billingStarted || live.stopped || !live.socketOpen || !live.heardAudio) return;
    live.billingStarted = true;
    live.startMs = Date.now();
    elapsedRef.current = 0;
    setElapsed(0);
    setCallPhase('live');
    live.timer = setInterval(() => {
      const current = liveRef.current;
      if (current.stopped || !current.billingStarted) return;
      const seconds = Math.max(0, Math.floor((Date.now() - current.startMs) / 1000));
      elapsedRef.current = seconds;
      setElapsed(seconds);
      if (current.cap) {
        if (seconds >= current.cap) void finishRef.current();
        return;
      }
      if (!current.metered) {
        if (seconds >= current.prepaid) void finishRef.current();
        return;
      }
      const active = meterRef.current;
      const liveQuote = active
        ? (() => {
            const raw = meterMinor(
              Math.max(0, seconds - current.prepaid),
              active.introMinor,
              active.standardMinor
            );
            return { amountCents: Math.min(raw, active.holdMinor), capped: raw >= active.holdMinor };
          })()
        : null;
      if (!liveQuote) return;
      const holdCap = active ? active.holdMinor : CALL_HOLD_CENTS;
      if (liveQuote.capped || liveQuote.amountCents >= holdCap) {
        const holdText = active
          ? formatMoney(active.holdMinor, normalizeCurrency(active.currency))
          : formatCurrency(CALL_HOLD_CENTS);
        setNotice(`Empreinte atteinte : ${holdText}. La consultation s’arrête ici.`);
        void finishRef.current();
      }
    }, 1000);
  };

  const playPcm = (samples: Float32Array) => {
    const live = liveRef.current;
    if (live.stopped || samples.length === 0) return;
    live.heardAudio = true;
    void live.ctx?.resume();
    live.player?.enqueue(samples);
    maybeBill();
  };

  const startCall = () => {
    if (phaseRef.current !== 'ready') return;
    setError(null);
    setNotice(null);
    syncLines([]);
    setElapsed(0);
    elapsedRef.current = 0;
    setCallPhase('connecting');

    const live = emptyLive();
    live.prepaid = prepaid;
    liveRef.current = live;

    const audioSession = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (audioSession) {
      try {
        audioSession.type = 'play-and-record';
      } catch {
        /* ignoré si le navigateur refuse l’affectation */
      }
    }

    const ctx = createVoiceAudioContext();
    live.ctx = ctx;
    const resumePromise = ctx.resume();

    if (!navigator.mediaDevices?.getUserMedia) {
      live.stopped = true;
      void ctx.close().catch(() => undefined);
      setError('Le microphone n’est pas disponible dans ce navigateur.');
      setCallPhase('ready');
      return;
    }

    const micPromise = navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    void runCall(ctx, resumePromise, micPromise);
  };

  const runCall = async (
    ctx: AudioContext,
    resumePromise: Promise<void>,
    micPromise: Promise<MediaStream>
  ) => {
    const live = liveRef.current;
    try {
      const stream = await micPromise;
      await resumePromise;
      if (live.stopped) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      live.stream = stream;
      if (ctx.state === 'suspended') await ctx.resume();

      live.worklet = await attachMicWorklet(ctx, stream);
      const owner = live;
      live.worklet.port.onmessage = (event: MessageEvent<{ pcm?: Int16Array; rms?: number }>) => {
        if (liveRef.current !== owner || owner.stopped) return;
        const data = event.data;
        if (typeof data?.rms === 'number') {
          const now = performance.now();
          if (now - owner.levelAt > 80) {
            owner.levelAt = now;
            setMicLevel(mutedRef.current ? 0 : Math.min(1, Math.sqrt(data.rms) * 1.6));
          }
        }
        if (data?.pcm?.length) queuePcm(data.pcm);
      };
      const gain = ctx.createGain();
      gain.gain.value = speakerOn ? 1 : 0;
      gain.connect(ctx.destination);
      live.gain = gain;
      live.player = new GaplessPcmPlayer(ctx, VOICE_SAMPLE_RATE, gain);

      let natalChart: NatalChart | undefined;
      try {
        const chartKey = `${birthData.date}|${birthData.timeUnknown ? 'unknown' : birthData.time || ''}|${birthData.place}`;
        const stored = sessionStorage.getItem('natalChart');
        if (stored && sessionStorage.getItem('natalChartKey') === chartKey) {
          natalChart = JSON.parse(stored) as NatalChart;
        }
      } catch {
        natalChart = undefined;
      }

      const tokenResponse = await fetch('/api/voice-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData,
          astrologerId: advisor.id,
          natalChart,
          checkoutSessionId,
          bookingId: booking?.id ?? null,
        }),
      });
      const tokenPayload = (await tokenResponse.json().catch(() => null)) as
        | (VoiceGrant & { error?: string })
        | null;
      if (!tokenResponse.ok || !tokenPayload?.token) {
        if (tokenResponse.status === 401) {
          live.stopped = true;
          teardown();
          onUnauthorized();
          return;
        }
        throw new Error(
          tokenResponse.status === 402 || tokenResponse.status === 409 || tokenResponse.status === 404
            ? tokenPayload?.error ||
              'Crédits insuffisants. Ajoutez des minutes ou confirmez le paiement avant d’appeler.'
            : 'La consultation vocale est momentanément indisponible.'
        );
      }

      live.prepaid = tokenPayload.prepaidSeconds ?? live.prepaid;
      live.metered = Boolean(tokenPayload.metered);
      if (tokenPayload.subscription) {
        sessionStorage.setItem('callSubscription', '1');
        setIncluded(true);
      } else {
        sessionStorage.removeItem('callSubscription');
        setIncluded(false);
      }
      live.cap = booking ? Math.min(booking.durationSec, live.prepaid || booking.durationSec) : null;
      setPrepaid(live.prepaid);
      if (ctx.state === 'suspended') await ctx.resume();
      openSocket(tokenPayload);
    } catch (err) {
      if (live.stopped) return;
      const message =
        err instanceof DOMException ? mediaError(err) : err instanceof Error ? err.message : mediaError(err);
      const friendly = /NotAllowed|micro/i.test(message) ? mediaError(err) : scrub(message);
      fail(friendly || 'La consultation n’a pas pu démarrer. Réessayez.');
    }
  };

  const openSocket = (grant: VoiceGrant) => {
    const live = liveRef.current;
    if (live.stopped || !live.ctx) return;

    const protocol = grant.token.startsWith('xai-client-secret.')
      ? grant.token
      : `xai-client-secret.${grant.token}`;
    const ws = new WebSocket('wss://api.x.ai/v1/realtime?model=grok-voice-latest', [protocol]);
    ws.binaryType = 'arraybuffer';
    live.ws = ws;

    const sendUpdate = () => {
      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send(
        JSON.stringify({
          type: 'session.update',
          session: {
            voice: grant.voice,
            instructions: grant.instructions,
            turn_detection: { type: 'server_vad' },
            audio: {
              input: {
                format: { type: 'audio/pcm', rate: VOICE_SAMPLE_RATE },
                transport: 'json',
                transcription: { language_hint: grant.language || 'fr' },
              },
              output: {
                format: { type: 'audio/pcm', rate: VOICE_SAMPLE_RATE },
                transport: 'json',
              },
            },
          },
        })
      );
    };

    const greet = () => {
      if (liveRef.current !== live || live.greeted || live.stopped || ws.readyState !== WebSocket.OPEN) {
        return;
      }
      live.greeted = true;
      live.canSendAudio = true;
      flushPcm();
      ws.send(JSON.stringify({ type: 'response.create' }));
    };

    ws.onopen = () => {
      if (liveRef.current !== live || live.stopped) {
        ws.close();
        return;
      }
      live.socketOpen = true;
      void live.ctx?.resume();
      sendUpdate();
      live.greetTimer = window.setTimeout(greet, 1200);
    };

    ws.onmessage = (event) => {
      if (liveRef.current !== live || live.stopped) return;

      if (event.data instanceof ArrayBuffer) {
        const view = new DataView(event.data);
        const count = Math.floor(event.data.byteLength / 2);
        const samples = new Float32Array(count);
        for (let i = 0; i < count; i += 1) {
          samples[i] = view.getInt16(i * 2, true) / 32768;
        }
        playPcm(samples);
        return;
      }

      let message: {
        type?: string;
        delta?: string;
        audio?: string;
        transcript?: string;
        item_id?: string;
        response_id?: string;
      };
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }

      const type = message.type || '';
      if (type === 'session.updated') {
        greet();
        return;
      }
      if (type === 'input_audio_buffer.speech_started' || type.endsWith('speech_started')) {
        live.player?.stop();
        return;
      }
      if (type === 'response.output_audio.delta' || type === 'response.audio.delta') {
        const payload = message.delta || message.audio;
        if (payload) playPcm(pcm16Base64ToFloat32(payload));
        return;
      }
      if (
        type === 'response.output_audio_transcript.delta' ||
        type === 'response.audio_transcript.delta'
      ) {
        const id = `advisor-${message.response_id || message.item_id || live.assistantId || 'live'}`;
        live.assistantId = message.response_id || message.item_id || live.assistantId;
        if (message.delta) upsert(id, 'advisor', message.delta, false);
        return;
      }
      if (
        type === 'response.output_audio_transcript.done' ||
        type === 'response.audio_transcript.done'
      ) {
        const id = `advisor-${message.response_id || message.item_id || live.assistantId || 'live'}`;
        if (message.transcript) upsert(id, 'advisor', message.transcript, true);
        live.assistantId = '';
        return;
      }
      if (type === 'conversation.item.input_audio_transcription.completed') {
        if (message.transcript) upsert(`user-${message.item_id || Date.now()}`, 'user', message.transcript, true);
        return;
      }
      if (type === 'error') {
        console.error('Liaison vocale interrompue');
        if (live.billingStarted) {
          void finishRef.current('La liaison vocale a été interrompue. Le temps déjà écoulé est comptabilisé.');
        } else {
          fail('La consultation vocale a rencontré un problème. Réessayez.');
        }
      }
    };

    ws.onerror = () => {
      if (liveRef.current !== live || live.localClose || live.stopped) return;
      if (live.billingStarted) {
        void finishRef.current('La liaison vocale a été interrompue. Le temps déjà écoulé est comptabilisé.');
      } else {
        fail('La liaison vocale a été interrompue. Réessayez.');
      }
    };

    ws.onclose = () => {
      if (liveRef.current !== live || live.localClose || live.stopped) return;
      if (live.billingStarted) {
        void finishRef.current('La liaison vocale a été coupée. Le temps déjà écoulé est comptabilisé.');
        return;
      }
      fail('La liaison vocale a été interrompue. Réessayez.');
    };
  };

  const hangUp = () => {
    const live = liveRef.current;
    if (live.billingStarted) {
      void finishCall();
      return;
    }
    live.stopped = true;
    teardown();
    setMicLevel(0);
    setCallPhase('ready');
    liveRef.current = emptyLive();
  };

  const sendText = () => {
    const text = draft.trim();
    if (!text) return;
    const live = liveRef.current;
    const ws = live.ws;
    if (phaseRef.current !== 'live' || !ws || ws.readyState !== WebSocket.OPEN) {
      setNotice('Démarrez l’appel pour écrire à votre conseiller.');
      return;
    }
    setDraft('');
    upsert(`user-${Date.now()}`, 'user', text, true);
    ws.send(
      JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }],
        },
      })
    );
    ws.send(JSON.stringify({ type: 'response.create' }));
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

  const statusLabel =
    phase === 'live'
      ? 'appel en cours'
      : phase === 'connecting'
        ? 'connexion…'
        : phase === 'ending'
          ? 'fin de l’appel…'
          : 'en ligne';

  return (
    <main className="call-stage fixed inset-0 z-40 text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-40">
        <motion.div
          className={phase === 'live' ? 'call-pulse rounded-full' : 'rounded-full'}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <AdvisorAvatar advisor={advisor} size="call" />
        </motion.div>
        <h1 className="mt-6 font-[family-name:var(--font-cinzel)] text-3xl text-center">{advisor.name}</h1>
        <AiDisclosure className="mt-2 max-w-xs text-center" />
        <p className="mt-2 text-sm uppercase tracking-[0.18em] text-emerald-100/80">{statusLabel}</p>

        {phase === 'live' || phase === 'ending' ? (
          <>
            <p className="mt-4 font-mono text-5xl tabular-nums">{mmss(elapsed)}</p>
            {booking ? (
              <p className="mt-2 text-sm text-white/55">
                {included ? 'Inclus dans Callastral Illimité · ' : ''}
                {remaining != null && remaining > 0 ? `${mmss(remaining)} restantes` : 'Durée réservée'}
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/70">
                {included || (quote.coveredSeconds > 0 && quote.amountCents === 0)
                  ? 'Inclus dans vos minutes'
                  : snap
                    ? moneyLabel(quote.amountCents)
                    : 'Tarif du conseiller'}
              </p>
            )}
          </>
        ) : phase === 'connecting' ? (
          <div className="mt-6 inline-block w-10 h-10 border-4 border-emerald-300 border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="mt-6 w-full max-w-xs space-y-3 text-center">
            <p className="text-sm text-white/70">
              Touchez le bouton pour autoriser le micro et joindre {advisor.firstName || advisor.name}.
            </p>
            {!booking && prepaid > 0 && (
              <p className="text-sm text-celestial-gold">{Math.floor(prepaid / 60)} min déjà incluses</p>
            )}
            {!booking && prepaid < 180 && (
              <p className="text-sm text-white/70">
                Moins de 3 minutes d’avance.{' '}
                <Link href="/offres" className="text-celestial-gold underline">
                  Voir Callastral Illimité
                </Link>
              </p>
            )}
            <button
              type="button"
              onClick={startCall}
              className="w-full rounded-full bg-emerald-500 py-4 text-lg font-semibold text-white shadow-lg active:scale-95 transition"
            >
              Démarrer l’appel
            </button>
          </div>
        )}

        {(phase === 'connecting' || phase === 'live') && (
          <div className="mt-5 h-1.5 w-40 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
            <div
              className="h-full bg-emerald-400 transition-[width] duration-100"
              style={{ width: `${Math.round(micLevel * 100)}%` }}
            />
          </div>
        )}

        {error && <p className="mt-4 max-w-sm text-center text-sm text-red-200">{error}</p>}
        {notice && <p className="mt-4 max-w-sm text-center text-sm text-emerald-50/80">{notice}</p>}
      </div>

      {showUpsell && booking && summaryState !== 'bought' && summaryState !== 'declined' && (
        <div className="mx-4 mb-3 rounded-3xl border border-white/15 bg-black/35 p-4 backdrop-blur">
          <p className="font-semibold">Recevoir le résumé écrit de votre consultation</p>
          <p className="mt-1 text-sm text-white/70">{summaryLabel || formatCurrency(SUMMARY_CENTS)}, envoyé par e-mail.</p>
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

      {(phase === 'connecting' || phase === 'live') && (
        <div className="absolute bottom-0 inset-x-0 px-6 pb-8 pt-4 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            className={`h-14 w-14 rounded-full border border-white/20 text-xs ${muted ? 'bg-white text-black' : 'bg-white/10'}`}
            aria-pressed={muted}
          >
            {muted ? 'Muet' : 'Micro'}
          </button>
          <button
            type="button"
            onClick={hangUp}
            className="h-16 w-16 rounded-full bg-red-600 text-white text-sm font-semibold"
            aria-label="Raccrocher"
          >
            Stop
          </button>
          <button
            type="button"
            onClick={() => setSpeakerOn((value) => !value)}
            className={`h-14 w-14 rounded-full border border-white/20 text-xs ${speakerOn ? 'bg-white/10' : 'bg-white text-black'}`}
            aria-pressed={!speakerOn}
          >
            Son
          </button>
        </div>
      )}

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
              sendText();
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={phase === 'live' ? 'Écrire un message' : 'Démarrez l’appel pour écrire'}
              disabled={phase !== 'live'}
              className="flex-1 rounded-full bg-white/10 px-4 py-3 text-sm outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={phase !== 'live'}
              className="rounded-full bg-emerald-700 px-4 text-sm font-semibold disabled:opacity-50"
            >
              Envoyer
            </button>
          </form>
        </div>
      )}

      <PaymentSheet
        open={payOpen}
        title="Résumé écrit"
        amountLabel={summaryLabel || formatCurrency(SUMMARY_CENTS)}
        detail="Envoyé par e-mail à la fin de la consultation."
        payLabel={`Payer ${summaryLabel || formatCurrency(SUMMARY_CENTS)}`}
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
