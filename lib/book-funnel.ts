import type { AdvisorLang } from './money.ts';
import { packPriceLabel, packsCheckoutPath, packsOfferLine } from './pack-offer.ts';
import type { WeeklyCurrency } from './weekly.ts';

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
  'Voir les packs à prix fixe, la mention IA et la naissance déjà remplie',
  'Payer avec Apple Pay, Google Pay ou la carte',
] as const;

export function narrowPrice(label: string): string {
  return label.replace(/[\u00a0\u202f]/g, ' ');
}

export function discoveryPriceLabel(locale: AdvisorLang, currency: WeeklyCurrency): string {
  return packPriceLabel('10min', locale, currency);
}

/** Ligne d’offre publique : les trois packs à prix fixe. */
export function discoveryHeadline(locale: AdvisorLang, currency: WeeklyCurrency): string {
  return packsOfferLine(locale, currency);
}

/** CTA sous le résultat d’ascendant. Le prix suit la devise du marché. */
export function chartReadingCta(locale: AdvisorLang, currency: WeeklyCurrency): string {
  const price = discoveryPriceLabel(locale, currency);
  switch (locale) {
    case 'en':
      return `Have your full chart read in 10 min — from ${price}`;
    case 'es':
      return `Haz leer tu carta completa en 10 min — desde ${price}`;
    case 'de':
      return `Lass dein vollständiges Horoskop in 10 min lesen — ab ${price}`;
    case 'it':
      return `Fai leggere il tema completo in 10 min — da ${price}`;
    default:
      return `Fais lire ton thème complet en 10 min — dès ${price}`;
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
  const birth = {
    date: input.date,
    time: input.time,
    place: input.place,
    pack: '20min',
  };
  if (input.consultHref.startsWith('/book') || input.consultHref.startsWith('/packs')) {
    const url = new URL(input.consultHref, 'https://callastral.com');
    for (const [key, value] of Object.entries(birth)) url.searchParams.set(key, value);
    url.searchParams.delete('offer');
    const query = url.searchParams.toString();
    const path = url.pathname.startsWith('/book') ? '/packs' : url.pathname;
    return query ? `${path}?${query}` : path;
  }
  return packsCheckoutPath(birth);
}
