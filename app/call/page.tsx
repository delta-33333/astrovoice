'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BirthData, NatalChart } from '@/lib/types';
import { getAstrologerById } from '@/lib/astrologers';
import { formatDuration, formatCurrency } from '@/lib/utils';
import { CALL_HOLD_CENTS, INTRO_CENTS, INTRO_SECONDS, PER_MINUTE_CENTS, quoteCall } from '@/lib/pricing';
import {
  GaplessPcmPlayer,
  VOICE_SAMPLE_RATE,
  attachMicWorklet,
  createVoiceAudioContext,
  int16ToBase64,
  pcm16Base64ToFloat32,
} from '@/lib/voice-audio';

type Phase = 'ready' | 'connecting' | 'live' | 'ending';

type VoiceGrant = {
  token: string;
  model: string;
  voice: string;
  instructions: string;
  language: string;
  prepaidSeconds: number;
  metered: boolean;
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
  player: GaplessPcmPlayer | null;
  ws: WebSocket | null;
  ctx: AudioContext | null;
  stream: MediaStream | null;
  worklet: AudioWorkletNode | null;
  timer: ReturnType<typeof setInterval> | null;
  greetTimer: number;
  pcmChunks: Int16Array[];
  pcmSamples: number;
  assistantLine: string;
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
    player: null,
    ws: null,
    ctx: null,
    stream: null,
    worklet: null,
    timer: null,
    greetTimer: 0,
    pcmChunks: [],
    pcmSamples: 0,
    assistantLine: '',
    levelAt: 0,
  };
}

export default function CallPage() {
  const router = useRouter();
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [astrologerId, setAstrologerId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('ready');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [showCostAlert, setShowCostAlert] = useState(false);
  const [prepaidSeconds, setPrepaidSeconds] = useState(0);
  const [micLevel, setMicLevel] = useState(0);

  const phaseRef = useRef<Phase>('ready');
  const liveRef = useRef<LiveCall>(emptyLive());
  const sessionRef = useRef<string | null>(null);
  const checkoutRef = useRef<string | null>(null);
  const astrologerIdRef = useRef<string | null>(null);
  const astrologerNameRef = useRef<string | undefined>(undefined);

  const astrologer = astrologerId ? getAstrologerById(astrologerId) : null;
  const quote = quoteCall(callDuration, prepaidSeconds);
  const currentCost = quote.amountCents;

  const setCallPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
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
    if (ctx && ctx.state !== 'closed') {
      void ctx.close().catch(() => undefined);
    }
  };

  const pushLine = (line: string) => {
    const clean = scrub(line);
    if (!clean) return;
    setTranscript((current) => [...current, clean].slice(-30));
  };

  const finishRef = useRef<(note?: string) => Promise<void>>(async () => {});

  const finishCall = async (note?: string) => {
    const live = liveRef.current;
    if (live.stopped) return;
    const shouldBill = live.billingStarted;
    const elapsed = shouldBill ? Math.max(0, Math.floor((Date.now() - live.startMs) / 1000)) : 0;
    const seconds = live.metered ? elapsed : Math.min(elapsed, live.prepaid);
    live.stopped = true;
    teardown();
    setMicLevel(0);

    if (!shouldBill) {
      setCallPhase('ready');
      return;
    }

    setCallPhase('ending');
    const finalQuote = quoteCall(seconds, live.prepaid);

    try {
      const response = await fetch('/api/stripe/finalize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          checkoutSessionId: checkoutRef.current,
          durationSeconds: seconds,
        }),
        keepalive: true,
      });

      const result = response.ok ? await response.json() : null;
      if (!response.ok) {
        throw new Error('settlement');
      }

      sessionStorage.setItem(
        'callComplete',
        JSON.stringify({
          durationSeconds: seconds,
          amountCharged: result.amountCharged,
          prepaidSecondsUsed: result.prepaidSecondsUsed,
          astrologerName: astrologerNameRef.current,
          astrologerId: astrologerIdRef.current,
          error: note,
        })
      );
      router.push('/complete');
    } catch {
      sessionStorage.setItem(
        'callComplete',
        JSON.stringify({
          durationSeconds: seconds,
          amountCharged: finalQuote.amountCents,
          astrologerName: astrologerNameRef.current,
          astrologerId: astrologerIdRef.current,
          error: note || 'Le règlement sera confirmé sous peu',
        })
      );
      router.push('/complete');
    }
  };

  finishRef.current = finishCall;

  useEffect(() => {
    const data = sessionStorage.getItem('birthData');
    const astrId = sessionStorage.getItem('astrologerId');
    if (!data || !astrId) {
      router.push('/birth');
      return;
    }

    try {
      setBirthData(JSON.parse(data) as BirthData);
    } catch {
      router.push('/birth');
      return;
    }

    setAstrologerId(astrId);
    astrologerIdRef.current = astrId;
    astrologerNameRef.current = getAstrologerById(astrId)?.name;
    sessionRef.current = sessionStorage.getItem('sessionId');
    checkoutRef.current = sessionStorage.getItem('checkoutSessionId');

    void fetch('/api/auth/me')
      .then((response) => response.json())
      .then((payload) => {
        if (!payload?.authenticated) {
          router.push('/auth');
          return;
        }
        const seconds = payload?.user?.prepaidSeconds ?? 0;
        setPrepaidSeconds(seconds);
      })
      .catch(() => undefined);

    return () => {
      const live = liveRef.current;
      if (live.billingStarted && !live.stopped) {
        void finishRef.current();
        return;
      }
      teardown();
    };
  }, [router]);

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
    if (live.stopped) return;
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
    setCallDuration(0);
    setCallPhase('live');
    live.timer = setInterval(() => {
      const current = liveRef.current;
      if (current.stopped || !current.billingStarted) return;
      const elapsed = Math.max(0, Math.floor((Date.now() - current.startMs) / 1000));
      setCallDuration(elapsed);
      if (!current.metered) {
        if (elapsed >= current.prepaid) void finishRef.current();
        return;
      }
      const liveQuote = quoteCall(elapsed, current.prepaid);
      if (liveQuote.capped || liveQuote.amountCents >= CALL_HOLD_CENTS) {
        setShowCostAlert(true);
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
    if (phaseRef.current !== 'ready' || !birthData || !astrologerId) return;
    setError(null);
    setTranscript([]);
    setCallDuration(0);
    setShowCostAlert(false);
    setCallPhase('connecting');

    const live = emptyLive();
    live.prepaid = prepaidSeconds;
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

    void runCall(ctx, resumePromise, micPromise, birthData, astrologerId);
  };

  const runCall = async (
    ctx: AudioContext,
    resumePromise: Promise<void>,
    micPromise: Promise<MediaStream>,
    bd: BirthData,
    astrId: string
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
          if (now - live.levelAt > 80) {
            live.levelAt = now;
            setMicLevel(Math.min(1, Math.sqrt(data.rms) * 1.6));
          }
        }
        if (data?.pcm?.length) queuePcm(data.pcm);
      };
      live.player = new GaplessPcmPlayer(ctx, VOICE_SAMPLE_RATE);

      const chartResponse = await fetch('/api/natal-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bd),
      });
      if (!chartResponse.ok) {
        throw new Error('Le thème natal n’a pas pu être préparé. Réessayez.');
      }
      const natalChart = (await chartResponse.json()) as NatalChart;

      const tokenResponse = await fetch('/api/voice-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData: bd,
          astrologerId: astrId,
          natalChart,
          checkoutSessionId: checkoutRef.current,
        }),
      });
      const tokenPayload = (await tokenResponse.json().catch(() => null)) as
        | (VoiceGrant & { error?: string })
        | null;
      if (!tokenResponse.ok || !tokenPayload?.token) {
        if (tokenResponse.status === 401) {
          router.push('/auth');
          live.stopped = true;
          teardown();
          return;
        }
        throw new Error(
          tokenResponse.status === 402
            ? tokenPayload?.error ||
              'Crédits insuffisants. Ajoutez des minutes ou confirmez le paiement avant d’appeler.'
            : 'La consultation vocale est momentanément indisponible.'
        );
      }

      live.prepaid = tokenPayload.prepaidSeconds ?? live.prepaid;
      live.metered = Boolean(tokenPayload.metered);
      setPrepaidSeconds(live.prepaid);
      if (ctx.state === 'suspended') await ctx.resume();
      openSocket(tokenPayload);
    } catch (err) {
      if (live.stopped) return;
      const message = err instanceof DOMException ? mediaError(err) : err instanceof Error ? err.message : mediaError(err);
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
      const current = live;

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

      let message: { type?: string; delta?: string; audio?: string; transcript?: string };
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
        current.player?.stop();
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
        if (message.delta) current.assistantLine += message.delta;
        return;
      }
      if (
        type === 'response.output_audio_transcript.done' ||
        type === 'response.audio_transcript.done'
      ) {
        const line = message.transcript || current.assistantLine;
        current.assistantLine = '';
        if (line) pushLine(line);
        return;
      }
      if (
        type === 'conversation.item.input_audio_transcription.completed' ||
        type === 'conversation.item.input_audio_transcription.updated'
      ) {
        if (type.endsWith('completed') && message.transcript) pushLine(message.transcript);
        return;
      }
      if (type === 'error') {
        console.error('Liaison vocale interrompue');
        if (current.billingStarted) {
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

  if (!birthData || !astrologer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Chargement...</div>
      </div>
    );
  }

  const showMic = phase === 'connecting' || phase === 'live';

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">{astrologer.avatar}</div>
          <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold mb-2">
            {astrologer.name}
          </h1>
          <p className="text-white/60">
            {phase === 'live' ? 'Consultation en cours' : 'Consultation vocale'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          {phase === 'ready' && (
            <div className="text-center py-6 space-y-6">
              <p className="text-white/70">
                Touchez le bouton pour autoriser le micro et joindre {astrologer.name}.
              </p>
              {prepaidSeconds > 0 && (
                <p className="text-sm text-celestial-gold">
                  {Math.floor(prepaidSeconds / 60)} min déjà incluses
                </p>
              )}
              <button type="button" onClick={startCall} className="btn-primary w-full text-xl py-5">
                Démarrer l’appel
              </button>
            </div>
          )}

          {phase === 'connecting' && (
            <div className="text-center py-6">
              <div className="inline-block w-12 h-12 border-4 border-celestial-purple border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white/70">Connexion avec {astrologer.name}...</p>
            </div>
          )}

          {phase === 'ending' && (
            <div className="text-center py-8">
              <p className="text-white/70">Clôture de la consultation...</p>
            </div>
          )}

          {phase === 'live' && (
            <>
              <div className="text-center py-8 space-y-4">
                <div className="text-6xl font-mono font-bold text-celestial-gold">
                  {formatDuration(callDuration)}
                </div>
                <div className="text-2xl font-semibold">{formatCurrency(currentCost)}</div>
                <div className="text-sm text-white/50">
                  {quote.coveredSeconds > 0 && quote.amountCents === 0 ? (
                    <span className="text-celestial-gold">Inclus dans vos minutes</span>
                  ) : quote.billableSeconds <= INTRO_SECONDS ? (
                    <span className="text-celestial-gold">
                      Offre découverte : {formatCurrency(INTRO_CENTS)}/min les 3 premières minutes
                    </span>
                  ) : (
                    <span>{formatCurrency(PER_MINUTE_CENTS)}/min · facturation à la seconde</span>
                  )}
                </div>
              </div>

              {showCostAlert && (
                <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-4">
                  <p className="font-semibold text-yellow-200 mb-1">
                    Empreinte atteinte : {formatCurrency(CALL_HOLD_CENTS)}
                  </p>
                  <p className="text-sm text-yellow-200/80">
                    La consultation s’arrête ici. Seul ce montant, ou moins si vos minutes couvrent une partie, est encaissé.
                  </p>
                </div>
              )}

              {transcript.length > 0 && (
                <div className="max-h-48 overflow-y-auto bg-white/5 rounded-xl p-4 space-y-3">
                  <div className="text-xs text-white/50 uppercase tracking-wide mb-2">Transcription</div>
                  {transcript.map((msg, i) => (
                    <p key={i} className="text-sm text-white/80 leading-relaxed">
                      {msg}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}

          {showMic && (
            <div className="py-2 space-y-2">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
                <div
                  className="h-full bg-emerald-400 transition-[width] duration-100"
                  style={{ width: `${Math.round(micLevel * 100)}%` }}
                />
              </div>
              <p className="text-center text-sm text-white/70">Niveau du micro</p>
            </div>
          )}

          {(phase === 'connecting' || phase === 'live') && (
            <button
              type="button"
              onClick={hangUp}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-full transition-all duration-300 hover:scale-105"
            >
              Terminer la consultation
            </button>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-white/40">
          <p>Le montant exact est encaissé à la fin. L’empreinte non utilisée est libérée.</p>
        </div>
      </div>
    </main>
  );
}
