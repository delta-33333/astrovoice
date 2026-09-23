import { randomBytes } from 'crypto';
import Stripe from 'stripe';

const API_VERSION = '2026-07-29.dahlia';

let stripeClient: Stripe | null = null;

export function stripeSecretConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && !key.includes('placeholder');
}

/**
 * Client Stripe instancié (pas de clé globale).
 * Renvoie null tant que la clé secrète Astre n'est pas configurée.
 */
export function getStripe(): Stripe | null {
  if (!stripeSecretConfigured()) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: API_VERSION,
      typescript: true,
    });
  }
  return stripeClient;
}

export function appBaseUrl(requestOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (configured) return configured;
  if (requestOrigin) return requestOrigin.replace(/\/$/, '');
  return 'http://localhost:3000';
}

/** Suffixe de 8 lettres, exigé pour integration_identifier (API Dahlia). */
export function integrationIdentifier(flow: 'call-meter' | 'prepaid'): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const bytes = randomBytes(8);
  let suffix = '';
  for (let i = 0; i < bytes.length; i += 1) {
    suffix += alphabet[bytes[i] % alphabet.length];
  }
  return `callastral-${flow}-${suffix}`;
}
