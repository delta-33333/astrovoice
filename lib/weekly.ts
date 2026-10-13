import type { AdvisorLang, Currency } from './money';

/** Formules hebdomadaires. Les montants sont en unité mineure (centimes). */
export const WEEKLY_PLAN_IDS = ['decouverte', 'essentiel', 'premium'] as const;
export type WeeklyPlanId = (typeof WEEKLY_PLAN_IDS)[number];

export const WEEKLY_CURRENCIES = ['eur', 'chf', 'gbp', 'usd'] as const;
export type WeeklyCurrency = (typeof WEEKLY_CURRENCIES)[number];

export const WEEKLY_MAX_CALL_MINUTES = 60;
export const WEEKLY_MAX_CALL_SECONDS = WEEKLY_MAX_CALL_MINUTES * 60;

export interface WeeklyPlan {
  id: WeeklyPlanId;
  minutes: number;
  /** Nom du produit Stripe à créer à la main. */
  productName: string;
  names: Record<AdvisorLang, string>;
  amounts: Record<WeeklyCurrency, number>;
}

export const WEEKLY_PLANS: Record<WeeklyPlanId, WeeklyPlan> = {
  decouverte: {
    id: 'decouverte',
    minutes: 10,
    productName: 'Callastral Hebdo Découverte',
    names: {
      fr: 'Découverte',
      en: 'Discovery',
      es: 'Descubrimiento',
      de: 'Entdeckung',
      it: 'Scoperta',
    },
    amounts: { eur: 590, chf: 590, gbp: 590, usd: 690 },
  },
  essentiel: {
    id: 'essentiel',
    minutes: 30,
    productName: 'Callastral Hebdo 30',
    names: {
      fr: 'Essentiel',
      en: 'Essential',
      es: 'Esencial',
      de: 'Essenziell',
      it: 'Essenziale',
    },
    amounts: { eur: 1490, chf: 1490, gbp: 1490, usd: 1690 },
  },
  premium: {
    id: 'premium',
    minutes: 60,
    productName: 'Callastral Hebdo Premium',
    names: {
      fr: 'Premium',
      en: 'Premium',
      es: 'Premium',
      de: 'Premium',
      it: 'Premium',
    },
    amounts: { eur: 2790, chf: 2790, gbp: 2790, usd: 3190 },
  },
};

export function isWeeklyPlan(value: string | null | undefined): value is WeeklyPlanId {
  return (WEEKLY_PLAN_IDS as readonly string[]).includes(value || '');
}

export function isWeeklyCurrency(value: string | null | undefined): value is WeeklyCurrency {
  return (WEEKLY_CURRENCIES as readonly string[]).includes(value || '');
}

/** Devise de la formule à partir de la devise du marché. CAD et JPY suivent le dollar. */
export function weeklyCurrency(currency: Currency): WeeklyCurrency {
  if (currency === 'eur' || currency === 'chf' || currency === 'gbp' || currency === 'usd') return currency;
  return 'usd';
}

export function planMinutes(plan: string | null | undefined): number {
  if (!isWeeklyPlan(plan)) return 0;
  return WEEKLY_PLANS[plan].minutes;
}

export function planAllowanceSeconds(plan: string | null | undefined): number {
  return planMinutes(plan) * 60;
}

/**
 * Première semaine. Découverte est un montant fixe (1,99 / 2,49 $).
 * Essentiel et Premium sont à −50 %.
 */
export function firstWeekMinor(plan: WeeklyPlanId, currency: WeeklyCurrency): number {
  if (plan === 'decouverte') return currency === 'usd' ? 249 : 199;
  return Math.round(WEEKLY_PLANS[plan].amounts[currency] / 2);
}

/** amount_off du coupon Découverte, pour que la première facture tombe sur le prix d’appel. */
export function decouverteAmountOff(currency: WeeklyCurrency): number {
  return WEEKLY_PLANS.decouverte.amounts[currency] - firstWeekMinor('decouverte', currency);
}

export function weeklyPriceEnvName(plan: WeeklyPlanId, currency: WeeklyCurrency): string {
  return `STRIPE_PRICE_WEEKLY_${plan.toUpperCase()}_${currency.toUpperCase()}`;
}

/** Coupon d’appel. Découverte : amount_off par devise. Les deux autres : −50 % partagé. */
export function welcomeCouponEnvName(plan: WeeklyPlanId, currency: WeeklyCurrency): string {
  if (plan === 'decouverte') return `STRIPE_COUPON_DECOUVERTE_WEEK1_${currency.toUpperCase()}`;
  return 'STRIPE_COUPON_WEEK1_50';
}

/** Aucun coupon si le client a déjà eu une formule, quelle qu’elle soit. */
export function welcomeCouponEnv(plan: WeeklyPlanId, currency: WeeklyCurrency, everSubscribed: boolean): string | null {
  if (everSubscribed) return null;
  return welcomeCouponEnvName(plan, currency);
}

export const FIRST_FULL_CHARGE_MS = 7 * 24 * 60 * 60 * 1000;

export function firstFullChargeDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + FIRST_FULL_CHARGE_MS);
}
