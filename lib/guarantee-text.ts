import { INTRO_MINUTES } from './price-bands';

/** Paiement historique de 0,70 € : jamais remboursé automatiquement. */
export const GUARANTEE_EXCLUDED_PAYMENT_INTENTS = new Set(['pi_3UMSlCLWCoPr9C3J1JR6kDLB']);
export const GUARANTEE_MAX_SECONDS = INTRO_MINUTES * 60;
export const GUARANTEE_WINDOW_HOURS = 24;

export const GUARANTEE_TEXT = {
  title: `Remboursé si les ${INTRO_MINUTES} premières minutes ne te conviennent pas`,
  short: `Si un appel ne te convient pas et s’arrête dans les ${INTRO_MINUTES} premières minutes, tu peux demander son remboursement depuis ton compte dans les 24 h (une fois par compte).`,
  body: `Raccroche dans les ${INTRO_MINUTES} premières minutes facturées, puis demande le remboursement depuis ton compte dans les 24 h. La part payée par carte est remboursée sur le même moyen de paiement ; la part payée avec un avoir est recréditée. Une demande par compte.`,
} as const;

