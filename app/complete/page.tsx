'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatMoney, normalizeCurrency } from '@/lib/money';
import { formatDuration } from '@/lib/utils';

interface CallCompleteData {
  durationSeconds: number;
  amountCharged: number;
  currency?: string;
  astrologerName?: string;
  astrologerId?: string;
  bookingId?: string;
  error?: string;
}

export default function CompletePage() {
  const router = useRouter();
  const [data, setData] = useState<CallCompleteData | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [summaryLabel, setSummaryLabel] = useState('');
  const [offers, setOffers] = useState<{
    subscriptionLabel?: string;
    natalLabel?: string;
    forecastLabel?: string;
    compatibilityLabel?: string;
    rebookPercent?: number;
    fairUseMinutes?: number;
    maxCallMinutes?: number;
  }>({});

  useEffect(() => {
    const completeData = sessionStorage.getItem('callComplete');
    if (!completeData) {
      router.push('/');
      return;
    }

    const parsed = JSON.parse(completeData) as CallCompleteData;
    setData(parsed);
    fetch('/api/market')
      .then((response) => response.json())
      .then((payload) => {
        if (typeof payload.summaryLabel === 'string') setSummaryLabel(payload.summaryLabel);
        if (payload.offers) setOffers(payload.offers);
      })
      .catch(() => undefined);
    if (!parsed.bookingId) return;
    fetch(`/api/reviews?bookingId=${encodeURIComponent(parsed.bookingId)}`)
      .then((response) => response.json())
      .then((payload) => {
        if (payload.existing) setReviewMessage('Merci, votre avis est enregistré.');
        else setCanReview(Boolean(payload.eligible));
      })
      .catch(() => undefined);
  }, [router]);

  const sendReview = async () => {
    if (!data?.bookingId || stars < 1) return;
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: data.bookingId, stars, comment }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setReviewMessage(payload?.error || 'L’avis n’a pas été enregistré.');
      return;
    }
    setCanReview(false);
    setReviewMessage('Merci, votre avis est enregistré.');
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="text-7xl mb-6">✨</div>

        <h1 className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl font-bold mb-4 text-glow">
          Consultation terminée
        </h1>
        <p className="text-white/70 text-lg mb-12">
          Merci d'avoir consulté {data.astrologerName || 'nos astrologues'}
        </p>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 space-y-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Récapitulatif</h2>

          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-white/60">Durée</span>
              <span className="text-xl font-semibold">
                {formatDuration(data.durationSeconds)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-white/60">Tarif</span>
              <span className="text-lg">Tarif du conseiller</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-semibold">Total</span>
              <span className="text-3xl font-bold text-celestial-gold">
                {formatMoney(data.amountCharged, normalizeCurrency(data.currency))}
              </span>
            </div>
          </div>

          {data.error && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 mt-4">
              <p className="text-sm text-yellow-200">{data.error}</p>
            </div>
          )}

          <p className="text-xs text-white/50 pt-4 border-t border-white/10">
            Un reçu a été envoyé par email • Paiement sécurisé par Stripe
          </p>
        </div>

        {(canReview || reviewMessage) && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold mb-3">Votre avis sur cette consultation</h2>
            {reviewMessage && <p className="text-white/75">{reviewMessage}</p>}
            {canReview && (
              <>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStars(value)}
                      className={`h-11 w-11 rounded-full border ${
                        stars >= value ? 'bg-celestial-gold text-black border-celestial-gold' : 'border-white/20'
                      }`}
                      aria-label={`${value} sur 5`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={1000}
                  placeholder="Commentaire, si vous le souhaitez"
                  className="w-full rounded-2xl bg-white/5 border border-white/10 p-3 text-sm mb-4"
                />
                <button type="button" onClick={() => void sendReview()} className="btn-primary" disabled={stars < 1}>
                  Envoyer l’avis
                </button>
              </>
            )}
          </div>
        )}

        <div className="bg-white/5 border border-celestial-gold/30 rounded-3xl p-6 mb-8 text-left space-y-3">
          <h2 className="text-lg font-semibold">Pour la suite</h2>
          <p className="text-sm text-white/75">
            Callastral Illimité {offers.subscriptionLabel ? `· ${offers.subscriptionLabel}/mois` : ''} : parole sans
            facturation à la minute, {offers.fairUseMinutes || 300} minutes par mois, {offers.maxCallMinutes || 60} minutes
            par appel.
          </p>
          <p className="text-sm text-white/75">
            Thème natal {offers.natalLabel || ''} · Prévision 2026 et 2027 {offers.forecastLabel || ''} · Compatibilité{' '}
            {offers.compatibilityLabel || ''}.
          </p>
          <p className="text-sm text-white/75">
            Le prochain rendez-vous payant : {offers.rebookPercent || 15} % de réduction, pendant 30 jours.
          </p>
          <Link href="/offres" className="btn-secondary inline-block">Voir les offres</Link>
        </div>

        <div className="space-y-4 mb-8">
          {data.bookingId && (
            <Link href={`/resume/${data.bookingId}`} className="btn-primary inline-block">
              Recevoir le résumé écrit · {summaryLabel || '…'}
            </Link>
          )}
          <p>
            <Link href="/astrologers?dispo=now" className="btn-secondary inline-block">
              Reprendre un créneau
            </Link>
          </p>
          {data.astrologerId && (
            <Link href={`/astrologers?recall=${data.astrologerId}`} className="text-sm text-white/60 underline">
              Rappeler {data.astrologerName}
            </Link>
          )}
          {!data.astrologerId && (
            <Link href="/home" className="btn-primary inline-block">
              Nouvelle consultation
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/packs"
            className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-celestial-gold/50 rounded-2xl p-6 transition-all"
          >
            <div className="text-3xl mb-2">💎</div>
            <h3 className="font-semibold mb-2">Packs minutes</h3>
            <p className="text-sm text-white/60 mb-3">
              Économisez jusqu'à 40% sur vos prochaines consultations
            </p>
            <p className="text-xs text-celestial-gold">
              À partir de 12,90 € pour 10 min
            </p>
          </Link>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 opacity-75">
            <div className="text-3xl mb-2">📜</div>
            <h3 className="font-semibold mb-2">Rapport natal écrit</h3>
            <p className="text-sm text-white/60 mb-3">
              Analyse complète de votre thème natal en PDF
            </p>
            <p className="text-xs text-celestial-gold">4,99 €</p>
            <p className="text-xs text-white/50 mt-2">Bientôt disponible</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 opacity-75">
            <div className="text-3xl mb-2">🌟</div>
            <h3 className="font-semibold mb-2">Pass Callastral</h3>
            <p className="text-sm text-white/60 mb-3">
              Minutes incluses chaque mois
            </p>
            <p className="text-xs text-celestial-gold">À partir de 19,99 €/mois</p>
            <p className="text-xs text-white/50 mt-2">Bientôt disponible</p>
          </div>
        </div>

        <Link href="/home" className="btn-secondary inline-block">
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
