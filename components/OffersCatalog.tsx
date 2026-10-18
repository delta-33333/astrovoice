'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PaymentSheet from '@/components/PaymentSheet';
import { birthLine } from '@/components/BirthSummary';
import type { BirthData } from '@/lib/types';

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

export interface PlanCard {
  id: string;
  name: string;
  minutes: number;
  highlighted: boolean;
  priceLabel: string;
  trialLabel: string;
  renewal: string;
}

export interface OfferLabels {
  plans: PlanCard[];
  summary: string;
  natal: string;
  forecast: string;
  compatibility: string;
  floor: string;
  ceiling: string;
  intro: string;
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

/** Coordonnées du compte si elles existent (avec « Modifier »), sinon le formulaire. */
function AccountBirth({
  saved,
  editing,
  onEdit,
  value,
  onChange,
}: {
  saved: BirthForm | null;
  editing: boolean;
  onEdit: () => void;
  value: BirthForm;
  onChange: (next: BirthForm) => void;
}) {
  if (saved && saved.name && !editing) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-left">
        <p className="text-white/50">Vos coordonnées de naissance</p>
        <p className="text-white/90">{saved.name ? `${saved.name} · ` : ''}{birthLine(saved as BirthData)}</p>
        <button type="button" className="mt-1 text-celestial-gold underline" onClick={onEdit}>Modifier</button>
      </div>
    );
  }
  return <BirthFields value={value} onChange={onChange} />;
}

export default function OffersCatalog({ labels }: { labels: OfferLabels }) {
  const router = useRouter();
  const [natal, setNatal] = useState(emptyBirth);
  const [forecast, setForecast] = useState(emptyBirth);
  const [personA, setPersonA] = useState(emptyBirth);
  const [personB, setPersonB] = useState(emptyBirth);
  const [saved, setSaved] = useState<BirthForm | null>(null);
  const [editing, setEditing] = useState({ natal: false, forecast: false, a: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Les coordonnées du compte remplissent le thème, la prévision et la première personne.
  useEffect(() => {
    fetch('/api/birth-data', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { birthData?: BirthData | null } | null) => {
        const data = payload?.birthData;
        if (!data?.date || !data.place) return;
        const form: BirthForm = {
          name: data.name || '',
          date: data.date,
          time: data.time || '',
          timeUnknown: Boolean(data.timeUnknown),
          place: data.place,
        };
        setSaved(form);
        setNatal(form);
        setForecast(form);
        setPersonA(form);
      })
      .catch(() => undefined);
  }, []);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [collectContact, setCollectContact] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('');
  const [sheetAmount, setSheetAmount] = useState('');
  const [sheetKind, setSheetKind] = useState<'subscription' | 'report'>('report');
  const [sheetRenewal, setSheetRenewal] = useState('');

  const openCheckout = async (
    path: string,
    body: unknown,
    title: string,
    amount: string,
    kind: 'subscription' | 'report',
    renewal = '',
  ) => {
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
    setSheetTitle(payload.name || title);
    setSheetAmount(payload.amountLabel || amount);
    setSheetRenewal(payload.renewal || renewal);
    setSheetKind(kind);
    setSheetOpen(true);
  };

  const payReport = (kind: 'natal_pdf' | 'forecast' | 'compatibility', input: unknown, title: string, amount: string) =>
    openCheckout('/api/reports/checkout', { kind, input }, title, amount, 'report');

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-200">{error}</p>}

      <section id="formules" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-celestial-gold">Chaque semaine</p>
          <h2 className="font-[family-name:var(--font-cinzel)] text-3xl">Trois formules</h2>
          <p className="mt-2 text-white/75">
            60 minutes maximum par appel. La première semaine est à tarif réduit, puis le prix affiché. Sans engagement, résiliable en 1 clic.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {labels.plans.map((plan) => (
            <article
              key={plan.id}
              className={`flex flex-col rounded-3xl border p-5 ${
                plan.highlighted
                  ? 'border-celestial-gold bg-celestial-gold/15 shadow-lg shadow-celestial-gold/10 md:scale-[1.03]'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {plan.highlighted ? (
                <p className="text-xs uppercase tracking-[0.16em] text-celestial-gold">Recommandé</p>
              ) : (
                <p className="text-xs uppercase tracking-[0.16em] text-white/40">Formule</p>
              )}
              <h3 className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl">{plan.name}</h3>
              <p className="mt-3 text-3xl font-bold text-celestial-gold">{plan.trialLabel}</p>
              <p className="text-sm text-white/60">la 1re semaine, puis {plan.priceLabel}/semaine</p>
              <p className="mt-3 text-sm text-white/80">{plan.minutes} minutes par semaine</p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{plan.renewal}</p>
              <button
                type="button"
                className="btn-primary mt-4"
                disabled={busy}
                onClick={() => void openCheckout(
                  '/api/billing/subscribe',
                  { plan: plan.id },
                  plan.name,
                  plan.trialLabel,
                  'subscription',
                  plan.renewal,
                )}
              >
                Choisir {plan.name}
              </button>
            </article>
          ))}
        </div>
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
          <AccountBirth saved={saved} editing={editing.natal} onEdit={() => setEditing({ ...editing, natal: true })} value={natal} onChange={setNatal} />
          <button className="btn-secondary" type="submit" disabled={busy}>Recevoir le thème</button>
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
          <AccountBirth saved={saved} editing={editing.forecast} onEdit={() => setEditing({ ...editing, forecast: true })} value={forecast} onChange={setForecast} />
          <button className="btn-secondary" type="submit" disabled={busy}>Recevoir la prévision</button>
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
            <AccountBirth saved={saved} editing={editing.a} onEdit={() => setEditing({ ...editing, a: true })} value={personA} onChange={setPersonA} />
          </div>
          <div>
            <p className="text-sm text-white/50 mb-2">Deuxième personne</p>
            <BirthFields value={personB} onChange={setPersonB} />
          </div>
          <button className="btn-secondary" type="submit" disabled={busy}>Recevoir la lecture</button>
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
        funnelKind="offer"
        open={sheetOpen}
        title={sheetTitle}
        amountLabel={sheetAmount}
        detail={sheetKind === 'subscription' ? '60 minutes maximum par appel.' : 'Paiement sécurisé. Le document arrive par e-mail et dans le compte.'}
        renewal={sheetKind === 'subscription' ? sheetRenewal : undefined}
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
