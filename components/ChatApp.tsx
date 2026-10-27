'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_TOPICS, topicLabel, type ChatLocale, type ChatTopic } from '@/lib/chat';
import { postEvent } from '@/lib/funnel-client';

type Message = { id: string; role: 'user' | 'advisor'; content: string; created_at: string };
type Entitlement = { allowed: boolean; kind?: string; remaining?: number; reason?: string };
type Advisor = { id: string; slug: string; name: string; firstName: string; photoUrl: string | null; label: string } | null;

const T = {
  fr: {
    intro: 'Pour une première réponse précise, votre conseillère ou conseiller a besoin de votre thème natal.',
    email: 'E-mail', firstName: 'Prénom', birthDate: 'Date de naissance', birthTime: 'Heure de naissance', unknown: 'Je ne connais pas mon heure',
    birthPlace: 'Lieu de naissance (ville, pays)', topic: 'Votre sujet', question: 'Votre question', questionPh: 'Ex. : Est-ce que cette relation a un avenir ?',
    horoscope: 'Recevoir aussi l’horoscope du matin par e-mail (désinscription en 1 clic)', start: 'Envoyer ma question (1ère réponse offerte)',
    sending: 'Votre conseiller·e lit votre thème…', placeholder: 'Écrivez votre réponse…', send: 'Envoyer',
    paywallTitle: 'Continuez la conversation', paywallBody: 'Abonnement Chat : 6,90 €/mois, résiliable à tout moment. Usage raisonnable : 300 messages par mois.',
    subscribe: 'Continuer pour 6,90 €/mois', voice: 'Ou parler de vive voix avec un conseiller', cap: 'Vous avez atteint 300 messages ce mois-ci. Le compteur repart au prochain renouvellement.',
    checkEmail: 'Cette adresse a déjà une conversation. Nous venons d’envoyer un lien de reprise par e-mail.',
    error: 'Une erreur est survenue. Réessayez dans un instant.', limited: 'Trop de nouvelles conversations depuis ce réseau aujourd’hui.', invalid: 'Vérifiez le champ :',
    notice: 'Conseillers virtuels Callastral — réponses générées par IA. À titre de divertissement et de réflexion.', manage: 'Gérer mon abonnement',
    expired: 'Ce lien a expiré. Saisissez à nouveau votre e-mail.', canceled: 'Paiement annulé : rien n’a été débité.',
  },
  en: {
    intro: 'For a precise first answer, your advisor needs your natal chart.',
    email: 'Email', firstName: 'First name', birthDate: 'Date of birth', birthTime: 'Time of birth', unknown: 'I don’t know my birth time',
    birthPlace: 'Place of birth (city, country)', topic: 'Your topic', question: 'Your question', questionPh: 'E.g. Does this relationship have a future?',
    horoscope: 'Also send me the morning horoscope by email (1-click unsubscribe)', start: 'Send my question (first answer free)',
    sending: 'Your advisor is reading your chart…', placeholder: 'Write your reply…', send: 'Send',
    paywallTitle: 'Keep the conversation going', paywallBody: 'Chat subscription: €6.90/month, cancel anytime. Fair use: 300 messages per month.',
    subscribe: 'Continue for €6.90/month', voice: 'Or talk live with an advisor', cap: 'You have reached 300 messages this month. The counter resets at renewal.',
    checkEmail: 'This address already has a conversation. We just emailed you a link to resume it.',
    error: 'Something went wrong. Please try again.', limited: 'Too many new conversations from this network today.', invalid: 'Please check:',
    notice: 'Callastral virtual advisors — AI-generated replies. For entertainment and reflection.', manage: 'Manage my subscription',
    expired: 'This link has expired. Enter your email again.', canceled: 'Payment canceled: nothing was charged.',
  },
  es: {
    intro: 'Para una primera respuesta precisa, tu consejero necesita tu carta natal.',
    email: 'Correo', firstName: 'Nombre', birthDate: 'Fecha de nacimiento', birthTime: 'Hora de nacimiento', unknown: 'No sé mi hora',
    birthPlace: 'Lugar de nacimiento (ciudad, país)', topic: 'Tu tema', question: 'Tu pregunta', questionPh: 'Ej.: ¿Tiene futuro esta relación?',
    horoscope: 'Recibir también el horóscopo de la mañana por correo', start: 'Enviar mi pregunta (primera respuesta gratis)',
    sending: 'Tu consejero está leyendo tu carta…', placeholder: 'Escribe tu respuesta…', send: 'Enviar',
    paywallTitle: 'Continúa la conversación', paywallBody: 'Suscripción Chat: 6,90 €/mes, cancela cuando quieras. Uso razonable: 300 mensajes al mes.',
    subscribe: 'Continuar por 6,90 €/mes', voice: 'O habla en directo con un consejero', cap: 'Has alcanzado 300 mensajes este mes.',
    checkEmail: 'Esta dirección ya tiene una conversación. Te enviamos un enlace para retomarla.',
    error: 'Algo salió mal. Inténtalo de nuevo.', limited: 'Demasiadas conversaciones nuevas desde esta red hoy.', invalid: 'Revisa:',
    notice: 'Consejeros virtuales de Callastral — respuestas generadas por IA. Con fines de entretenimiento.', manage: 'Gestionar mi suscripción',
    expired: 'Este enlace ha caducado.', canceled: 'Pago cancelado: no se cobró nada.',
  },
  de: {
    intro: 'Für eine präzise erste Antwort braucht deine Beratung dein Geburtshoroskop.',
    email: 'E-Mail', firstName: 'Vorname', birthDate: 'Geburtsdatum', birthTime: 'Geburtszeit', unknown: 'Ich kenne meine Geburtszeit nicht',
    birthPlace: 'Geburtsort (Stadt, Land)', topic: 'Dein Thema', question: 'Deine Frage', questionPh: 'z. B.: Hat diese Beziehung Zukunft?',
    horoscope: 'Auch das Morgenhoroskop per E-Mail erhalten', start: 'Frage senden (erste Antwort gratis)',
    sending: 'Deine Beratung liest dein Horoskop…', placeholder: 'Schreibe deine Antwort…', send: 'Senden',
    paywallTitle: 'Gespräch fortsetzen', paywallBody: 'Chat-Abo: 6,90 €/Monat, jederzeit kündbar. Fair Use: 300 Nachrichten pro Monat.',
    subscribe: 'Weiter für 6,90 €/Monat', voice: 'Oder live mit einer Beratung sprechen', cap: 'Du hast diesen Monat 300 Nachrichten erreicht.',
    checkEmail: 'Diese Adresse hat bereits ein Gespräch. Wir haben dir einen Link gesendet.',
    error: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.', limited: 'Zu viele neue Gespräche aus diesem Netz heute.', invalid: 'Bitte prüfen:',
    notice: 'Virtuelle Callastral-Beratung — KI-generierte Antworten. Zur Unterhaltung.', manage: 'Abo verwalten',
    expired: 'Dieser Link ist abgelaufen.', canceled: 'Zahlung abgebrochen: nichts wurde belastet.',
  },
  it: {
    intro: 'Per una prima risposta precisa, il tuo consulente ha bisogno del tuo tema natale.',
    email: 'E-mail', firstName: 'Nome', birthDate: 'Data di nascita', birthTime: 'Ora di nascita', unknown: 'Non conosco la mia ora',
    birthPlace: 'Luogo di nascita (città, paese)', topic: 'Il tuo tema', question: 'La tua domanda', questionPh: 'Es.: Questa relazione ha un futuro?',
    horoscope: 'Ricevi anche l’oroscopo del mattino via e-mail', start: 'Invia la domanda (prima risposta gratis)',
    sending: 'Il tuo consulente sta leggendo il tema…', placeholder: 'Scrivi la tua risposta…', send: 'Invia',
    paywallTitle: 'Continua la conversazione', paywallBody: 'Abbonamento Chat: 6,90 €/mese, disdici quando vuoi. Uso equo: 300 messaggi al mese.',
    subscribe: 'Continua a 6,90 €/mese', voice: 'Oppure parla dal vivo con un consulente', cap: 'Hai raggiunto 300 messaggi questo mese.',
    checkEmail: 'Questo indirizzo ha già una conversazione. Ti abbiamo inviato un link.',
    error: 'Qualcosa è andato storto. Riprova.', limited: 'Troppe nuove conversazioni da questa rete oggi.', invalid: 'Controlla:',
    notice: 'Consulenti virtuali Callastral — risposte generate dall’IA. A scopo di intrattenimento.', manage: 'Gestisci abbonamento',
    expired: 'Questo link è scaduto.', canceled: 'Pagamento annullato: nessun addebito.',
  },
} as const;

export default function ChatApp({ locale, voicePath }: { locale: ChatLocale; voicePath: string }) {
  const t = T[locale];
  const [loaded, setLoaded] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [advisor, setAdvisor] = useState<Advisor>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '', firstName: '', birthDate: '', birthTime: '', timeUnknown: false, birthPlace: '', topic: 'love' as ChatTopic, question: '', horoscopeOptin: false, cl_hp: '',
  });
  const paywallSeen = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    if (params.get('login') === 'expired') setNotice(t.expired);
    if (params.get('canceled')) setNotice(t.canceled);
    const res = await fetch(`/api/chat/state${sid ? `?session_id=${encodeURIComponent(sid)}` : ''}`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (sid) window.history.replaceState(null, '', window.location.pathname);
    setHasUser(!!data.user);
    setSubscribed(!!data.user?.subscribed);
    setMessages(data.messages ?? []);
    setAdvisor(data.advisor ?? null);
    setEntitlement(data.entitlement ?? null);
    setLoaded(true);
  }, [t]);

  useEffect(() => {
    postEvent('chat_start', { metadata: { locale } });
    void refresh();
  }, [locale, refresh]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, pending]);

  const blocked = hasUser && entitlement && !entitlement.allowed;
  useEffect(() => {
    if (blocked && entitlement?.reason === 'paywall' && !paywallSeen.current) {
      paywallSeen.current = true;
      postEvent('chat_paywall_view', { metadata: { locale } });
    }
  }, [blocked, entitlement, locale]);

  async function send(text: string) {
    setBusy(true);
    setPending(text);
    setNotice(null);
    try {
      const res = await fetch('/api/chat/message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessages((prev) => [...prev, ...(data.messages ?? [])]);
        setEntitlement(data.entitlement ?? null);
        setDraft('');
      } else if (res.status === 402) {
        setEntitlement({ allowed: false, reason: data.error });
      } else {
        setNotice(t.error);
      }
    } finally {
      setPending(null);
      setBusy(false);
    }
  }

  async function start(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch('/api/chat/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, locale }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'check_email') { setNotice(t.checkEmail); return; }
      if (!res.ok) {
        const label = data.field ? (t as Record<string, string>)[data.field] ?? data.field : '';
        setNotice(res.status === 429 ? t.limited : data.error === 'invalid' ? `${t.invalid} ${label}` : t.error);
        return;
      }
      await refresh();
      setBusy(false);
      if (!data.resumed) await send(form.question.trim());
      else await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function subscribe() {
    setBusy(true);
    const res = await fetch('/api/chat/subscribe', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (data.url) window.location.href = data.url;
    else { setNotice(t.error); setBusy(false); }
  }

  async function portal() {
    const res = await fetch('/api/chat/portal', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (data.url) window.location.href = data.url;
  }

  const field = 'mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-celestial-gold';
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  if (!loaded) return <div className="mt-8 text-white/60">…</div>;

  if (!hasUser) {
    return (
      <form onSubmit={start} className="mt-6 space-y-4 rounded-3xl border border-white/15 bg-white/5 p-5" data-chat-form>
        <p className="text-sm text-white/80">{t.intro}</p>
        <input type="text" name="cl_hp" value={form.cl_hp} onChange={(e) => set('cl_hp', e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <label className="block text-sm">{t.email} *<input required type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={field} /></label>
        <label className="block text-sm">{t.firstName} *<input required autoComplete="given-name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={field} /></label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm">{t.birthDate} *<input required type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} className={field} /></label>
          <label className="block text-sm">{t.birthTime}
            <input type="time" disabled={form.timeUnknown} required={!form.timeUnknown} value={form.birthTime} onChange={(e) => set('birthTime', e.target.value)} className={`${field} disabled:opacity-40`} />
            <span className="mt-1 flex items-center gap-2 text-xs text-white/70"><input type="checkbox" checked={form.timeUnknown} onChange={(e) => set('timeUnknown', e.target.checked)} />{t.unknown}</span>
          </label>
        </div>
        <label className="block text-sm">{t.birthPlace} *<input required value={form.birthPlace} onChange={(e) => set('birthPlace', e.target.value)} className={field} /></label>
        <fieldset className="text-sm">
          <legend>{t.topic} *</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CHAT_TOPICS.map((topic) => (
              <button type="button" key={topic} onClick={() => set('topic', topic)} className={`rounded-full px-4 py-1.5 border ${form.topic === topic ? 'border-celestial-gold bg-celestial-gold/20' : 'border-white/20 bg-white/5'}`}>
                {topicLabel(locale, topic)}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm">{t.question} *<textarea required minLength={3} maxLength={1500} rows={3} placeholder={t.questionPh} value={form.question} onChange={(e) => set('question', e.target.value)} className={field} /></label>
        <label className="flex items-start gap-2 text-xs text-white/70"><input type="checkbox" className="mt-0.5" checked={form.horoscopeOptin} onChange={(e) => set('horoscopeOptin', e.target.checked)} />{t.horoscope}</label>
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? t.sending : t.start}</button>
        {notice && <p className="text-sm text-celestial-gold" role="status">{notice}</p>}
        <p className="text-xs text-white/50">{t.notice}</p>
      </form>
    );
  }

  return (
    <section className="mt-6 rounded-3xl border border-white/15 bg-white/5 p-4 sm:p-5" data-chat-thread>
      {advisor && (
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          {advisor.photoUrl ? <img src={advisor.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-celestial-purple/40" />}
          <div>
            <div className="font-semibold">{advisor.name}</div>
            <div className="text-xs text-white/60">{advisor.label}</div>
          </div>
        </div>
      )}
      <div className="mt-3 space-y-3 max-h-[60vh] overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id} className={`whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'ml-8 bg-celestial-purple/30' : 'mr-8 bg-white/10'}`} data-role={m.role}>
            {m.content}
          </div>
        ))}
        {pending && <div className="ml-8 whitespace-pre-line rounded-2xl px-4 py-3 text-sm bg-celestial-purple/30">{pending}</div>}
        {pending && <div className="mr-8 rounded-2xl px-4 py-3 text-sm bg-white/10 text-white/60 animate-pulse">{t.sending}</div>}
        <div ref={bottom} />
      </div>
      {blocked ? (
        <div className="mt-4 rounded-2xl border border-celestial-gold/40 bg-celestial-gold/10 p-4" data-chat-paywall>
          {entitlement?.reason === 'cap' ? (
            <p className="text-sm">{t.cap}</p>
          ) : (
            <>
              <h2 className="font-semibold">{t.paywallTitle}</h2>
              <p className="mt-1 text-sm text-white/80">{t.paywallBody}</p>
              <button type="button" onClick={subscribe} disabled={busy} className="btn-primary mt-3 w-full disabled:opacity-60">{t.subscribe}</button>
            </>
          )}
          <p className="mt-3 text-center text-sm"><Link href={voicePath} className="underline text-white/80">{t.voice}</Link></p>
        </div>
      ) : (
        <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim().length >= 2 && !busy) void send(draft.trim()); }}>
          <textarea rows={2} maxLength={1500} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t.placeholder} className={`${field} mt-0`} />
          <button type="submit" disabled={busy || draft.trim().length < 2} className="btn-primary px-5 disabled:opacity-50">{t.send}</button>
        </form>
      )}
      {notice && <p className="mt-2 text-sm text-celestial-gold" role="status">{notice}</p>}
      <div className="mt-3 flex justify-between gap-2 text-xs text-white/50">
        <span>{t.notice}</span>
        {subscribed && <button type="button" onClick={portal} className="underline shrink-0">{t.manage}</button>}
      </div>
    </section>
  );
}
