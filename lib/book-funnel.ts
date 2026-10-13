import { formatMoney, type AdvisorLang } from './money.ts';
import { firstWeekMinor, type WeeklyCurrency } from './weekly.ts';

/**
 * Parcours /book avant cette branche : le prix Découverte n’est pas affiché,
 * le compte est exigé avant le paiement, et la page attend le tarif du conseiller.
 */
export const FUNNEL_BEFORE = [
  'Ouvrir /book (retour à l’accueil sans créneau)',
  'Attendre le chargement du compte, du marché et du tarif',
  'Choisir 10, 20 ou 30 minutes',
  'Créer un compte (prénom, e-mail, mot de passe) avant un prix actionnable',
  'Ouvrir le paiement',
] as const;

/** Deux étapes au plus jusqu’au paiement. */
export const FUNNEL_AFTER = [
  'Voir l’offre Découverte, le prix de la 1re semaine, le renouvellement, la mention IA et la naissance déjà remplie',
  'Payer avec Apple Pay, Google Pay ou la carte',
] as const;

export function narrowPrice(label: string): string {
  return label.replace(/[\u00a0\u202f]/g, ' ');
}

export function discoveryPriceLabel(locale: AdvisorLang, currency: WeeklyCurrency): string {
  return narrowPrice(formatMoney(firstWeekMinor('decouverte', currency), currency, locale));
}

/** Ligne affichée en tête de /book. En français et en euros : « 1,99 € la 1re semaine ». */
export function discoveryHeadline(locale: AdvisorLang, currency: WeeklyCurrency): string {
  const price = discoveryPriceLabel(locale, currency);
  switch (locale) {
    case 'en':
      return `${price} the first week`;
    case 'es':
      return `${price} la 1.ª semana`;
    case 'de':
      return `${price} in der 1. Woche`;
    case 'it':
      return `${price} la 1ª settimana`;
    default:
      return `${price} la 1re semaine`;
  }
}

/** CTA sous le résultat d’ascendant. Le prix suit la devise du marché. */
export function chartReadingCta(locale: AdvisorLang, currency: WeeklyCurrency): string {
  const offer = discoveryHeadline(locale, currency);
  switch (locale) {
    case 'en':
      return `Have your full chart read in 10 min — ${offer}`;
    case 'es':
      return `Haz leer tu carta completa en 10 min — ${offer}`;
    case 'de':
      return `Lass dein vollständiges Horoskop in 10 min lesen — ${offer}`;
    case 'it':
      return `Fai leggere il tema completo in 10 min — ${offer}`;
    default:
      return `Fais lire ton thème complet en 10 min — ${offer}`;
  }
}

export interface BirthQuery {
  date: string;
  time: string;
  place: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function readBirthParams(params: URLSearchParams): BirthQuery | null {
  const date = (params.get('date') || '').trim();
  const time = (params.get('time') || '').trim().slice(0, 5);
  const place = (params.get('place') || '').trim().slice(0, 160);
  if (!DATE_RE.test(date) || !TIME_RE.test(time) || place.length < 2) return null;
  return { date, time, place };
}

/**
 * Lien de paiement avec la naissance déjà dans l’adresse.
 * Un créneau immédiat déjà choisi est conservé. Sinon, /book sans créneau.
 */
export function resultCheckoutPath(input: {
  consultHref: string;
  date: string;
  time: string;
  place: string;
}): string {
  const birth = new URLSearchParams({
    date: input.date,
    time: input.time,
    place: input.place,
    offer: 'decouverte',
  });
  if (input.consultHref.startsWith('/book')) {
    const url = new URL(input.consultHref, 'https://callastral.com');
    for (const [key, value] of birth) url.searchParams.set(key, value);
    const query = url.searchParams.toString();
    return query ? `${url.pathname}?${query}` : url.pathname;
  }
  return `/book?${birth.toString()}`;
}
