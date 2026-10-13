import { formatMoney, moneyLocale, type AdvisorLang } from './money.ts';
import {
  WEEKLY_PLANS,
  firstFullChargeDate,
  firstWeekMinor,
  type WeeklyCurrency,
  type WeeklyPlanId,
} from './weekly.ts';

export interface RenewalTerms {
  /** Phrase affichée avant le paiement et à côté du bouton. */
  sentence: string;
  trialLabel: string;
  fullLabel: string;
  chargeAt: string;
}

function chargeLabel(date: Date, locale: AdvisorLang): string {
  return new Intl.DateTimeFormat(moneyLocale(locale), {
    dateStyle: 'long',
    timeZone: 'Europe/Paris',
  }).format(date);
}

/**
 * Conditions de renouvellement, dans les 5 langues du site.
 * Le prélèvement au tarif plein a lieu 7 jours après la souscription.
 */
export function renewalTerms(
  plan: WeeklyPlanId,
  currency: WeeklyCurrency,
  locale: AdvisorLang,
  from: Date = new Date(),
  introWeek = true,
): RenewalTerms {
  const trial = firstWeekMinor(plan, currency);
  const full = WEEKLY_PLANS[plan].amounts[currency];
  const trialLabel = formatMoney(trial, currency, locale);
  const fullLabel = formatMoney(full, currency, locale);
  const chargeAt = chargeLabel(firstFullChargeDate(from), locale);
  const sentence = sentenceFor(locale, trialLabel, fullLabel, chargeAt, introWeek);
  return { sentence, trialLabel, fullLabel, chargeAt };
}

function sentenceFor(locale: AdvisorLang, trial: string, full: string, date: string, introWeek: boolean): string {
  if (!introWeek) {
    switch (locale) {
      case 'en':
        return `${full}/week, no commitment, cancel in one click.`;
      case 'es':
        return `${full}/semana, sin permanencia, cancelable en 1 clic.`;
      case 'de':
        return `${full}/Woche, ohne Bindung, mit 1 Klick kündbar.`;
      case 'it':
        return `${full}/settimana, senza vincoli, disdetta in 1 clic.`;
      default:
        return `${full}/semaine, sans engagement, résiliable en 1 clic.`;
    }
  }
  switch (locale) {
    case 'en':
      return `${trial} the first week, then ${full}/week, no commitment, cancel in one click. First full-price charge on ${date}.`;
    case 'es':
      return `${trial} la 1.ª semana y después ${full}/semana, sin permanencia, cancelable en 1 clic. Primer cobro a precio completo el ${date}.`;
    case 'de':
      return `${trial} in der 1. Woche, danach ${full}/Woche, ohne Bindung, mit 1 Klick kündbar. Erste Abbuchung zum vollen Preis am ${date}.`;
    case 'it':
      return `${trial} la 1ª settimana, poi ${full}/settimana, senza vincoli, disdetta in 1 clic. Primo addebito a prezzo pieno il ${date}.`;
    default:
      return `${trial} la 1re semaine puis ${full}/semaine, sans engagement, résiliable en 1 clic. Premier prélèvement au tarif plein le ${date}.`;
  }
}
