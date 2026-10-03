'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PaymentSheet from '@/components/PaymentSheet';

interface BirthForm {
  name: string;
  date: string;
  time: string;
  timeUnknown: boolean;
  place: string;
}

const emptyBirth = (): BirthForm => ({
  name: '',
  date: '',
  time: '',
  timeUnknown: false,
  place: '',
});

export interface OfferLabels {
  subscription: string;
  summary: string;
  natal: string;
  forecast: string;
  compatibility: string;
  floor: string;
  ceiling: string;
  currencyNote: string;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm text-left">
      <span className="text-white/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={type !== 'time'}
        className="mt-1 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-3"
      />
    </label>
  );
}

function BirthFields({ value, onChange }: { value: BirthForm; onChange: (next: BirthForm) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Prénom" value={value.name} onChange={(name) => onChange({ ...value, name })} />
      <Field label="Date de naissance" type="date" value={value.date} onChange={(date) => onChange({ ...value, date })} />
      <Field label="Heure" type="time" value={value.time} onChange={(time) => onChange({ ...value, time })} />
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={value.timeUnknown}
          onChange={(event) => onChange({ ...value, timeUnknown: event.target.checked })}
        />
        Heure inconnue (midi utilisé pour les maisons)
      </label>
      <Field label="Lieu de naissance" value={value.place} onChange={(place) => onChange({ ...value, place })} />
    </div>
  );
}

export default function OffersCatalog({ labels }: { labels: OfferLabels }) {
  const router = useRouter();
  const [natal, setNatal] = useState(emptyBirth);
  const [forecast, setForecast] = useState(emptyBirth);
  const [personA, setPersonA] = useState(emptyBirth);
  const [personB, setPersonB] = useState(emptyBirth);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [collectContact, setCollectContact] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('');
  const [sheetAmount, setSheetAmount] = useState('');
  const [sheetKind, setSheetKind] = useState<'subscription' | 'report'>('report');

  const openCheckout = async (path: string, body: unknown, title: string, amount: string, kind: 'subscription' | 'report') => {
    setBusy(true);
    setError('');
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    setBusy(false);
    if (response.status === 401) {
      router.push('/auth');
      return;
    }
    if (!response.ok) {
      setError(payload?.error || 'Le paiement n’a pas pu être préparé.');
      return;
    }
    setClientSecret(payload.clientSecret);
    setCheckoutSessionId(payload.checkoutSessionId);
    setCollectContact(Boolean(payload.collectContact));
    setSheetTitle(title);
    setSheetAmount(payload.amountLabel || amount);
    setSheetKind(kind);
    setSheetOpen(true);
  };

  const payReport = (kind: 'natal_pdf' | 'forecast' | 'compatibility', input: unknown, title: string, amount: string) =>
    openCheckout('/api/reports/checkout', { kind, input }, title, amount, 'report');

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-200">{error}</p>}

      <section className="rounded-3xl border border-celestial-gold/40 bg-celestial-gold/10 p-6 sm:p-8 space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-celestial-gold">Abonnement</p>
        <h2 className="font-[family-name:var(--font-cinzel)] text-3xl">Callastral Illimité</h2>
        <p className="text-4xl font-bold text-celestial-gold">{labels.subscription}<span className="text-lg font-normal text-white/70"> / mois</span></p>
        <p className="text-white/80">
          Parole sans facturation à la minute, dans la limite de 300 minutes par mois et de 60 minutes par appel.
          Résiliable à tout moment depuis le compte.
        </p>
        <p className="text-sm text-white/50">{labels.currencyNote}</p>
        <button
          type="button"
          className="btn-primary"
          disabled={busy}
          onClick={() => void openCheckout('/api/billing/subscribe', {}, 'Callastral Illimité', labels.subscription, 'subscription')}
        >
          S’abonner
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
        <h2 className="text-xl font-semibold">Consultation à la minute</h2>
        <p className="text-white/75">
          Chaque conseiller a son tarif, entre {labels.floor} et {labels.ceiling} la minute. Les trois premières minutes
          sont à un tarif réduit, propre à ce tarif.
        </p>
        <Link href="/#annuaire" className="text-celestial-gold underline">Choisir un conseiller</Link>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
        <h2 className="text-xl font-semibold">Offre d’introduction et packs</h2>
        <p className="text-white/75">
          Dix minutes fondateur, une fois par compte, puis des packs de 10, 30 et 60 minutes. Les minutes n’expirent pas
          et passent avant la facturation à la minute.
        </p>
        <Link href="/packs" className="btn-secondary inline-block">Voir les packs</Link>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
        <h2 className="text-xl font-semibold">Résumé écrit · {labels.summary}</h2>
        <p className="text-white/75">
          Après une consultation, le résumé de ce qui a été dit est envoyé par e-mail. Le paiement se fait depuis la page
          de fin d’appel.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Thème natal · {labels.natal}</h2>
        <p className="text-white/75">Portrait écrit à partir des positions calculées, en PDF dans le compte et par e-mail.</p>
        <form
          className="space-y-3"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            void payReport('natal_pdf', natal, 'Thème natal', labels.natal);
          }}
        >
          <BirthFields value={natal} onChange={setNatal} />
          <button className="btn-primary" type="submit" disabled={busy}>Recevoir le thème</button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Prévision 2026 et 2027 · {labels.forecast}</h2>
        <p className="text-white/75">Lecture de l’année à partir du thème natal et du ciel du 1er janvier de chaque année.</p>
        <form
          className="space-y-3"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            void payReport('forecast', forecast, 'Prévision 2026 et 2027', labels.forecast);
          }}
        >
          <BirthFields value={forecast} onChange={setForecast} />
          <button className="btn-primary" type="submit" disabled={busy}>Recevoir la prévision</button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Compatibilité · {labels.compatibility}</h2>
        <p className="text-white/75">Lecture croisée de deux thèmes, envoyée par e-mail et conservée dans le compte.</p>
        <form
          className="space-y-4"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            void payReport('compatibility', { a: personA, b: personB }, 'Lecture de compatibilité', labels.compatibility);
          }}
        >
          <div>
            <p className="text-sm text-white/50 mb-2">Première personne</p>
            <BirthFields value={personA} onChange={setPersonA} />
          </div>
          <div>
            <p className="text-sm text-white/50 mb-2">Deuxième personne</p>
            <BirthFields value={personB} onChange={setPersonB} />
          </div>
          <button className="btn-primary" type="submit" disabled={busy}>Recevoir la lecture</button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
        <h2 className="text-xl font-semibold">Reprise · 15 %</h2>
        <p className="text-white/75">
          Après une consultation, le prochain rendez-vous payant bénéficie de 15 % de réduction, pendant 30 jours.
          Une seule offre en attente à la fois.
        </p>
        <Link href="/astrologers?dispo=now" className="text-celestial-gold underline">Reprendre un créneau</Link>
      </section>

      <PaymentSheet
        open={sheetOpen}
        title={sheetTitle}
        amountLabel={sheetAmount}
        detail="Paiement sécurisé. Le document arrive par e-mail et dans le compte."
        payLabel={sheetAmount ? `Payer ${sheetAmount}` : 'Payer'}
        clientSecret={clientSecret}
        collectContact={collectContact}
        onClose={() => setSheetOpen(false)}
        onSuccess={() => {
          if (!checkoutSessionId) return;
          const path = sheetKind === 'subscription' ? '/api/billing/confirm' : '/api/reports/confirm';
          void fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkoutSessionId }),
          }).finally(() => {
            router.push('/account');
          });
        }}
      />
    </div>
  );
}
