'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { BirthData } from '@/lib/types';
import { getAstrologerById } from '@/lib/astrologers';
import { formatDuration, formatCurrency } from '@/lib/utils';
import { CALL_HOLD_CENTS, INTRO_CENTS, PER_MINUTE_CENTS, quoteCall } from '@/lib/pricing';

export default function CallPage() {
  const router = useRouter();
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [astrologerId, setAstrologerId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMocked, setIsMocked] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [showCostAlert, setShowCostAlert] = useState(false);
  const [prepaidSeconds, setPrepaidSeconds] = useState(0);

  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stoppedRef = useRef(false);
  const prepaidRef = useRef(0);
  const checkoutRef = useRef<string | null>(null);
  const sessionRef = useRef<string | null>(null);
  const finishRef = useRef<(seconds: number) => Promise<void>>(async () => {});

  const astrologer = astrologerId ? getAstrologerById(astrologerId) : null;
  const quote = quoteCall(callDuration, prepaidSeconds);
  const currentCost = quote.amountCents;

  useEffect(() => {
    const data = sessionStorage.getItem('birthData');
    const astrId = sessionStorage.getItem('astrologerId');
    const sessId = sessionStorage.getItem('sessionId');
    const checkoutId = sessionStorage.getItem('checkoutSessionId');

    if (!data || !astrId || !sessId) {
      router.push('/birth');
      return;
    }

    setBirthData(JSON.parse(data));
    setAstrologerId(astrId);
    sessionRef.current = sessId;
    checkoutRef.current = checkoutId;
    prepaidRef.current = 0;

    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((payload) => {
        const seconds = payload?.user?.prepaidSeconds ?? 0;
        prepaidRef.current = seconds;
        setPrepaidSeconds(seconds);
      })
      .catch(() => undefined);

    // Initialize call session
    initializeCall(JSON.parse(data), astrId, sessId);
  }, [router]);

  const initializeCall = async (bd: BirthData, astrId: string, sessId: string) => {
    try {
      // Get natal chart
      const chartResponse = await fetch('/api/natal-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bd),
      });

      if (!chartResponse.ok) {
        throw new Error('Erreur lors du calcul du thème natal');
      }

      const natalChart = await chartResponse.json();

      // Create call session
      const sessionResponse = await fetch('/api/call-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessId,
          birthData: bd,
          astrologerId: astrId,
          natalChart,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      const sessionData = await sessionResponse.json();

      if (sessionData.mock || sessionData.fallback) {
        setIsMocked(true);
        setError(sessionData.message || 'Mode démo actif');
      }

      // Start the call timer
      startTimeRef.current = Date.now();
      setIsConnected(true);
      setIsConnecting(false);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setCallDuration(elapsed);

        const liveQuote = quoteCall(elapsed, prepaidRef.current);
        if (liveQuote.capped || liveQuote.amountCents >= CALL_HOLD_CENTS) {
          setShowCostAlert(true);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          void finishRef.current(elapsed);
        }
      }, 1000);

      // Add welcome message to transcript
      setTranscript([
        `Bonjour ${bd.name}, je suis ${astrologer?.name}. J'ai préparé votre thème natal et je suis prêt à répondre à vos questions.`,
      ]);

    } catch (err) {
      console.error('Call initialization error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      setIsConnecting(false);
    }
  };

  const finishCall = async (seconds: number) => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setIsConnected(false);
    const finalQuote = quoteCall(seconds, prepaidRef.current);

    try {
      const response = await fetch('/api/stripe/finalize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          checkoutSessionId: checkoutRef.current,
          durationSeconds: seconds,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la finalisation du paiement');
      }

      const result = await response.json();

      sessionStorage.setItem('callComplete', JSON.stringify({
        durationSeconds: seconds,
        amountCharged: result.amountCharged,
        prepaidSecondsUsed: result.prepaidSecondsUsed,
        astrologerName: astrologer?.name,
        astrologerId,
      }));

      router.push('/complete');
    } catch (err) {
      console.error('Hangup error:', err);
      sessionStorage.setItem('callComplete', JSON.stringify({
        durationSeconds: seconds,
        amountCharged: finalQuote.amountCents,
        astrologerName: astrologer?.name,
        astrologerId,
        error: 'Le règlement sera confirmé sous peu',
      }));
      router.push('/complete');
    }
  };

  finishRef.current = finishCall;

  if (!birthData || !astrologer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">{astrologer.avatar}</div>
          <h1 className="text-3xl font-[family-name:var(--font-cinzel)] font-bold mb-2">
            {astrologer.name}
          </h1>
          <p className="text-white/60">Consultation en cours</p>
        </div>

        {/* Call Interface */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 space-y-6">
          {/* Status */}
          {isConnecting && (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-4 border-celestial-purple border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white/70">Connexion avec {astrologer.name}...</p>
            </div>
          )}

          {error && !isConnected && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4">
              <p className="text-sm text-yellow-200">⚠️ {error}</p>
              {isMocked && (
                <p className="text-xs text-yellow-200/70 mt-2">
                  La consultation continue en mode limité. Configurez les clés API pour activer toutes les fonctionnalités.
                </p>
              )}
            </div>
          )}

          {/* Timer and Cost */}
          {isConnected && (
            <>
              <div className="text-center py-8 space-y-4">
                <div className="text-6xl font-mono font-bold text-celestial-gold">
                  {formatDuration(callDuration)}
                </div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(currentCost)}
                </div>
                <div className="text-sm text-white/50">
                  {quote.coveredSeconds > 0 && quote.amountCents === 0 ? (
                    <span className="text-celestial-gold">Inclus dans vos minutes</span>
                  ) : quote.billableSeconds <= 120 ? (
                    <span className="text-celestial-gold">
                      Offre découverte : 2 premières minutes à {formatCurrency(INTRO_CENTS)}
                    </span>
                  ) : (
                    <span>{formatCurrency(PER_MINUTE_CENTS)}/min · facturation à la seconde</span>
                  )}
                </div>
              </div>

              {/* Cost Alert */}
              {showCostAlert && (
                <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-4 mb-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-yellow-200 mb-1">
                        Empreinte atteinte : {formatCurrency(CALL_HOLD_CENTS)}
                      </p>
                      <p className="text-sm text-yellow-200/80">
                        La consultation s’arrête ici. Seul ce montant, ou moins si vos minutes couvrent une partie, est encaissé.
                      </p>
                      <button
                        onClick={() => setShowCostAlert(false)}
                        className="mt-2 text-xs underline hover:no-underline"
                      >
                        J'ai compris
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Transcript */}
              {transcript.length > 0 && (
                <div className="max-h-48 overflow-y-auto bg-white/5 rounded-xl p-4 space-y-3">
                  <div className="text-xs text-white/50 uppercase tracking-wide mb-2">
                    Transcription
                  </div>
                  {transcript.map((msg, i) => (
                    <p key={i} className="text-sm text-white/80 leading-relaxed">
                      {msg}
                    </p>
                  ))}
                </div>
              )}

              {/* Mic indicator */}
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-white/70">Microphone actif</span>
              </div>

              {/* Hangup button */}
              <button
                onClick={() => void finishCall(callDuration)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-full transition-all duration-300 hover:scale-105"
              >
                Terminer la consultation
              </button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-white/40">
          <p>Le montant exact est encaissé à la fin. L’empreinte non utilisée est libérée.</p>
        </div>
      </div>
    </main>
  );
}
