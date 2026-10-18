'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import CoupleShareButton from '@/components/CoupleShareButton';
import HoneypotField from '@/components/HoneypotField';
import VoiceSample from '@/components/VoiceSample';
import {
  COUPLE_CTA,
  couplePath,
  coupleShareBookPath,
  coupleToolBookPath,
  type PublicCoupleResult,
} from '@/lib/couple-compat';

const TRIAL_PATH: Record<Locale, string> = {
  fr: '/fr/essai',
  en: '/en/free-trial',
  es: '/es/prueba',
  de: '/de/probe',
  it: '/it/prova',
};
import { HONEYPOT_FIELD } from '@/lib/form-checks';
import type { Locale } from '@/lib/seo';

const inputClass =
  'mt-1 w-full px-4 py-3 text-base bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50';

const LABELS: Record<
  Locale,
  {
    you: string;
    partner: string;
    name: string;
    date: string;
    time: string;
    unknown: string;
    place: string;
    submit: string;
    pending: string;
    score: string;
    strengths: string;
    tensions: string;
    share: string;
    note: string;
    errors: Record<string, string>;
  }
> = {
  fr: {
    you: 'Vous',
    partner: 'L’autre personne',
    name: 'Prénom (facultatif)',
    date: 'Date de naissance',
    time: 'Heure',
    unknown: 'Heure inconnue',
    place: 'Lieu de naissance',
    submit: 'Voir le score',
    pending: 'Calcul…',
    score: 'Score',
    strengths: 'Appuis',
    tensions: 'Tensions',
    share: 'Lien à partager',
    note: 'Le lien partagé montre les initiales et le score. Il ne contient pas les dates, heures ni lieux.',
    errors: {
      DATE: 'Vérifiez les deux dates.',
      PLACE: 'Un lieu n’a pas été reconnu. Essayez ville, pays.',
      RATE: 'Trop de calculs d’affilée. Réessayez dans une minute.',
      EPHEMERIS: 'Le calcul n’a pas abouti.',
      FAIL: 'Le calcul n’a pas abouti.',
    },
  },
  en: {
    you: 'You',
    partner: 'The other person',
    name: 'First name (optional)',
    date: 'Birth date',
    time: 'Time',
    unknown: 'Time unknown',
    place: 'Birth place',
    submit: 'See the score',
    pending: 'Calculating…',
    score: 'Score',
    strengths: 'Strengths',
    tensions: 'Tensions',
    share: 'Link to share',
    note: 'The shared link shows initials and the score. It does not include dates, times or places.',
    errors: {
      DATE: 'Check both dates.',
      PLACE: 'A place was not found. Try city, country.',
      RATE: 'Too many calculations. Try again in a minute.',
      EPHEMERIS: 'The calculation did not finish.',
      FAIL: 'The calculation did not finish.',
    },
  },
  es: {
    you: 'Usted',
    partner: 'La otra persona',
    name: 'Nombre (opcional)',
    date: 'Fecha de nacimiento',
    time: 'Hora',
    unknown: 'Hora desconocida',
    place: 'Lugar de nacimiento',
    submit: 'Ver la puntuación',
    pending: 'Cálculo…',
    score: 'Puntuación',
    strengths: 'Apoyos',
    tensions: 'Tensiones',
    share: 'Enlace para compartir',
    note: 'El enlace compartido muestra las iniciales y la puntuación. No incluye fechas, horas ni lugares.',
    errors: {
      DATE: 'Revise las dos fechas.',
      PLACE: 'No se reconoció un lugar. Pruebe ciudad, país.',
      RATE: 'Demasiados cálculos. Reintente en un minuto.',
      EPHEMERIS: 'El cálculo no terminó.',
      FAIL: 'El cálculo no terminó.',
    },
  },
  de: {
    you: 'Sie',
    partner: 'Die andere Person',
    name: 'Vorname (optional)',
    date: 'Geburtsdatum',
    time: 'Uhrzeit',
    unknown: 'Uhrzeit unbekannt',
    place: 'Geburtsort',
    submit: 'Score ansehen',
    pending: 'Berechnung…',
    score: 'Score',
    strengths: 'Stärken',
    tensions: 'Spannungen',
    share: 'Link zum Teilen',
    note: 'Der geteilte Link zeigt Initialen und Score. Er enthält keine Daten, Zeiten oder Orte.',
    errors: {
      DATE: 'Prüfen Sie beide Daten.',
      PLACE: 'Ein Ort wurde nicht erkannt. Versuchen Sie Stadt, Land.',
      RATE: 'Zu viele Berechnungen. In einer Minute erneut versuchen.',
      EPHEMERIS: 'Die Berechnung ist nicht zu Ende gekommen.',
      FAIL: 'Die Berechnung ist nicht zu Ende gekommen.',
    },
  },
  it: {
    you: 'Tu',
    partner: 'L’altra persona',
    name: 'Nome (facoltativo)',
    date: 'Data di nascita',
    time: 'Ora',
    unknown: 'Ora sconosciuta',
    place: 'Luogo di nascita',
    submit: 'Vedere il punteggio',
    pending: 'Calcolo…',
    score: 'Punteggio',
    strengths: 'Appoggi',
    tensions: 'Tensioni',
    share: 'Link da condividere',
    note: 'Il link condiviso mostra le iniziali e il punteggio. Non contiene date, ore né luoghi.',
    errors: {
      DATE: 'Controlla le due date.',
      PLACE: 'Un luogo non è stato riconosciuto. Prova città, paese.',
      RATE: 'Troppi calcoli. Riprova tra un minuto.',
      EPHEMERIS: 'Il calcolo non è arrivato in fondo.',
      FAIL: 'Il calcolo non è arrivato in fondo.',
    },
  },
};

function PersonFields({
  prefix,
  title,
  labels,
  name,
  setName,
  date,
  setDate,
  time,
  setTime,
  unknown,
  setUnknown,
  place,
  setPlace,
}: {
  prefix: string;
  title: string;
  labels: (typeof LABELS)['fr'];
  name: string;
  setName: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
  unknown: boolean;
  setUnknown: (value: boolean) => void;
  place: string;
  setPlace: (value: string) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-white/10 p-4 space-y-3">
      <legend className="px-1 text-sm text-celestial-gold">{title}</legend>
      <label className="block text-sm">
        {labels.name}
        <input className={inputClass} name={`${prefix}-name`} value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" />
      </label>
      <label className="block text-sm">
        {labels.date}
        <input className={inputClass} type="date" required name={`${prefix}-date`} value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <label className="block text-sm">
        {labels.time}
        <input className={inputClass} type="time" name={`${prefix}-time`} value={time} disabled={unknown} onChange={(event) => setTime(event.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={unknown} onChange={(event) => setUnknown(event.target.checked)} />
        {labels.unknown}
      </label>
      <label className="block text-sm">
        {labels.place}
        <input className={inputClass} required name={`${prefix}-place`} value={place} onChange={(event) => setPlace(event.target.value)} autoComplete="off" />
      </label>
    </fieldset>
  );
}

export default function CoupleTool({ locale }: { locale: Locale }) {
  const labels = LABELS[locale];
  const [hp, setHp] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<(PublicCoupleResult & { sharePath: string | null }) | null>(null);
  const [you, setYou] = useState({ name: '', date: '', time: '', unknown: false, place: '' });
  const [partner, setPartner] = useState({ name: '', date: '', time: '', unknown: false, place: '' });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError('');
    const response = await fetch('/api/couple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale,
        [HONEYPOT_FIELD]: hp,
        self: { name: you.name, date: you.date, time: you.time, timeUnknown: you.unknown, place: you.place },
        partner: { name: partner.name, date: partner.date, time: partner.time, timeUnknown: partner.unknown, place: partner.place },
      }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) {
      setError(labels.errors[payload?.error] || labels.errors.FAIL);
      return;
    }
    setResult(payload.result);
  };

  return (
    <form onSubmit={submit} className="relative mt-8 space-y-4">
      <HoneypotField value={hp} onChange={setHp} />
      <PersonFields
        prefix="you"
        title={labels.you}
        labels={labels}
        name={you.name}
        setName={(name) => setYou({ ...you, name })}
        date={you.date}
        setDate={(date) => setYou({ ...you, date })}
        time={you.time}
        setTime={(time) => setYou({ ...you, time })}
        unknown={you.unknown}
        setUnknown={(unknown) => setYou({ ...you, unknown })}
        place={you.place}
        setPlace={(place) => setYou({ ...you, place })}
      />
      <PersonFields
        prefix="partner"
        title={labels.partner}
        labels={labels}
        name={partner.name}
        setName={(name) => setPartner({ ...partner, name })}
        date={partner.date}
        setDate={(date) => setPartner({ ...partner, date })}
        time={partner.time}
        setTime={(time) => setPartner({ ...partner, time })}
        unknown={partner.unknown}
        setUnknown={(unknown) => setPartner({ ...partner, unknown })}
        place={partner.place}
        setPlace={(place) => setPartner({ ...partner, place })}
      />
      {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? labels.pending : labels.submit}
      </button>
      {result && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3" aria-live="polite">
          <p className="text-xs uppercase tracking-wide text-white/45">{labels.score}</p>
          <p className="font-[family-name:var(--font-cinzel)] text-5xl text-celestial-gold">{result.score}</p>
          <h2 className="text-lg">{labels.strengths}</h2>
          <ul className="space-y-2 text-sm text-white/80">
            {result.strengths.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <h2 className="text-lg">{labels.tensions}</h2>
          <ul className="space-y-2 text-sm text-white/80">
            {result.tensions.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {result.sharePath && (
            <p className="text-sm break-all">
              <span className="text-white/45">{labels.share} </span>
              <Link href={result.sharePath} className="text-celestial-gold underline">{result.sharePath}</Link>
            </p>
          )}
          <p className="text-xs text-white/45">{labels.note}</p>
          <VoiceSample locale={locale} src={locale === 'en' ? '/samples/sample-en.mp3' : '/samples/sample-fr.mp3'} />
          {result.sharePath && (
            <CoupleShareButton
              url={result.sharePath}
              title="Callastral"
              text={`Notre compatibilité astro : ${result.score}/100 (calcul Callastral)`}
              label={locale === 'en' ? 'Share' : 'Partager'}
            />
          )}
          <p className="flex flex-col gap-2 text-sm">
            <Link href={couplePath(locale)} className="text-celestial-gold underline">
              {locale === 'en' ? 'Calculate yours' : 'Calculer la vôtre'}
            </Link>
            <Link href={`${TRIAL_PATH[locale]}?topic=couple`} className="text-celestial-gold underline">
              {locale === 'en' ? 'Talk 3 minutes free about your couple' : 'Parler 3 min gratuitement de votre couple'}
            </Link>
          </p>
          <Link href={result.sharePath ? coupleShareBookPath() : coupleToolBookPath()} data-funnel="book" className="btn-secondary inline-block text-center">
            {COUPLE_CTA[locale]}
          </Link>
        </div>
      )}
    </form>
  );
}
