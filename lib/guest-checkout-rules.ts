import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Achat invité (sans compte avant le paiement).
 * Règles pures, testées sans Stripe ni base.
 */

export const GUEST_CHECKOUT_COOKIE = 'cl_guest_cs';
export const GUEST_CHECKOUT_MAX_AGE = 60 * 60 * 24;

/** Jeton httpOnly signé liant la Checkout Session au navigateur qui l’a ouverte. */
export function signGuestCheckout(checkoutSessionId: string, secret: string): string {
  const mac = createHmac('sha256', secret).update(`guest:${checkoutSessionId}`).digest('base64url');
  return `${checkoutSessionId}.${mac}`;
}

export function guestCheckoutMatches(cookieValue: string | undefined, checkoutSessionId: string, secret: string | null): boolean {
  if (!cookieValue || !secret || !checkoutSessionId) return false;
  const expected = Buffer.from(signGuestCheckout(checkoutSessionId, secret));
  const actual = Buffer.from(cookieValue);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * Connexion automatique après un achat invité : seulement si le compte a été créé
 * par ce paiement (créé après l’ouverture de la session Stripe, sans mot de passe).
 * Un compte existant n’est jamais ouvert sur la seule foi d’un e-mail tapé dans le paiement :
 * les minutes y sont créditées et la personne se connecte normalement.
 */
export function guestAutoLoginAllowed(input: {
  userCreatedAt: string | null | undefined;
  passwordHash: string | null | undefined;
  checkoutCreatedSec: number | null | undefined;
}): boolean {
  if (input.passwordHash) return false;
  if (!input.userCreatedAt || !input.checkoutCreatedSec) return false;
  const created = Date.parse(input.userCreatedAt);
  if (!Number.isFinite(created)) return false;
  // 5 s de marge pour un éventuel décalage d’horloge.
  return created >= input.checkoutCreatedSec * 1000 - 5000;
}

export function isGuestCheckout(metadata: Record<string, string> | null | undefined): boolean {
  return metadata?.guest === 'true';
}
