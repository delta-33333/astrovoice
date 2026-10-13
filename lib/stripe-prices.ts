import {
  WEEKLY_CURRENCIES,
  WEEKLY_PLAN_IDS,
  weeklyPriceEnvName,
  welcomeCouponEnvName,
  type WeeklyCurrency,
  type WeeklyPlanId,
} from './weekly';

/** Identifiant Price déjà créé dans Stripe. L’application ne crée aucun objet. */
export function weeklyPriceId(plan: WeeklyPlanId, currency: WeeklyCurrency): string | null {
  const value = process.env[weeklyPriceEnvName(plan, currency)]?.trim();
  return value || null;
}

/** Identifiant Coupon déjà créé dans Stripe. L’application ne crée aucun objet. */
export function welcomeCouponId(plan: WeeklyPlanId, currency: WeeklyCurrency): string | null {
  const value = process.env[welcomeCouponEnvName(plan, currency)]?.trim();
  return value || null;
}

export function weeklyPriceEnvList(): string[] {
  return WEEKLY_PLAN_IDS.flatMap((plan) => WEEKLY_CURRENCIES.map((currency) => weeklyPriceEnvName(plan, currency)));
}
