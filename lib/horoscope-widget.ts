import type { Locale } from './seo.ts';

export const WIDGET_COPY: Record<
  Locale,
  { title: string; email: string; sign: string; birth: string; consent: string; submit: string; pending: string; ok: string; need: string; fail: string }
> = {
  fr: {
    title: 'Horoscope du matin',
    email: 'E-mail',
    sign: 'Signe',
    birth: 'Date de naissance (facultatif, pour une version personnalisée)',
    consent: 'J’accepte de recevoir l’horoscope du matin par e-mail. Je peux me désinscrire en un clic.',
    submit: 'Recevoir l’horoscope',
    pending: 'Envoi…',
    ok: 'Un e-mail de confirmation vient de partir. L’horoscope commence après ce clic.',
    need: 'Cochez le consentement pour continuer.',
    fail: 'L’inscription n’a pas abouti. Réessayez dans un instant.',
  },
  en: {
    title: 'Morning horoscope',
    email: 'Email',
    sign: 'Sign',
    birth: 'Birth date (optional, for a personalised version)',
    consent: 'I agree to receive the morning horoscope by email. I can unsubscribe in one click.',
    submit: 'Get the horoscope',
    pending: 'Sending…',
    ok: 'A confirmation email has been sent. The horoscope starts after that click.',
    need: 'Tick the consent box to continue.',
    fail: 'Signup did not go through. Try again in a moment.',
  },
  es: {
    title: 'Horóscopo de la mañana',
    email: 'Correo',
    sign: 'Signo',
    birth: 'Fecha de nacimiento (opcional, para una versión personalizada)',
    consent: 'Acepto recibir el horóscopo de la mañana por correo. Puedo darme de baja en un clic.',
    submit: 'Recibir el horóscopo',
    pending: 'Envío…',
    ok: 'Se ha enviado un correo de confirmación. El horóscopo empieza después de ese clic.',
    need: 'Marque el consentimiento para continuar.',
    fail: 'La inscripción no se completó. Reintente en un momento.',
  },
  de: {
    title: 'Morgenhoroskop',
    email: 'E-Mail',
    sign: 'Zeichen',
    birth: 'Geburtsdatum (optional, für eine persönliche Fassung)',
    consent: 'Ich willige ein, das Morgenhoroskop per E-Mail zu erhalten. Ich kann mich mit einem Klick abmelden.',
    submit: 'Horoskop erhalten',
    pending: 'Senden…',
    ok: 'Eine Bestätigungs-E-Mail ist unterwegs. Das Horoskop beginnt nach diesem Klick.',
    need: 'Bitte die Einwilligung ankreuzen.',
    fail: 'Die Anmeldung ist nicht durchgegangen. Gleich noch einmal versuchen.',
  },
  it: {
    title: 'Oroscopo del mattino',
    email: 'E-mail',
    sign: 'Segno',
    birth: 'Data di nascita (facoltativa, per una versione personalizzata)',
    consent: 'Accetto di ricevere l’oroscopo del mattino via e-mail. Posso disiscrivermi con un clic.',
    submit: 'Ricevere l’oroscopo',
    pending: 'Invio…',
    ok: 'È partita un’e-mail di conferma. L’oroscopo inizia dopo quel clic.',
    need: 'Spunta il consenso per continuare.',
    fail: 'L’iscrizione non è andata a buon fine. Riprova tra un momento.',
  },
};

export function widgetCopy(locale: Locale) {
  return WIDGET_COPY[locale];
}
