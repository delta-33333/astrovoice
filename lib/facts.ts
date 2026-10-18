import { aboutPath } from './about.ts';
import { discoveryHeadline } from './book-funnel.ts';
import { formatMoney } from './money.ts';
import { hreflangAlternates, LOCALES, type Locale } from './seo.ts';
import { firstWeekMinor, WEEKLY_MAX_CALL_MINUTES, WEEKLY_PLANS } from './weekly.ts';
import { FREE_CALL_SECONDS } from './free-call.ts';
import { AI_ACT_SPOKEN, VIRTUAL_ADVISOR_DISCLOSURE } from './legal.ts';

export const FACTS_UPDATED = '2026-10-18';

export const FACTS_PATHS: Record<Locale, string> = {
  fr: '/fr/callastral-faits-et-chiffres',
  en: '/en/callastral-facts',
  es: '/es/callastral-datos',
  de: '/de/callastral-fakten',
  it: '/it/callastral-fatti',
};

export function factsPath(locale: Locale): string {
  return FACTS_PATHS[locale];
}

export function factsAlternates(): Record<string, string> {
  return hreflangAlternates(factsPath);
}

export interface FactRow {
  label: string;
  value: string;
}

export function factRows(locale: Locale, advisorCount: number | null): FactRow[] {
  const money = (minor: number) => formatMoney(minor, 'eur', locale === 'en' ? 'en' : 'fr');
  const dec = WEEKLY_PLANS.decouverte;
  const ess = WEEKLY_PLANS.essentiel;
  const pre = WEEKLY_PLANS.premium;
  const plans = `${dec.names[locale]} ${dec.minutes} min ${money(dec.amounts.eur)} / ${discoveryHeadline(locale, 'eur')} · ${ess.names[locale]} ${ess.minutes} min ${money(ess.amounts.eur)} · ${pre.names[locale]} ${pre.minutes} min ${money(pre.amounts.eur)}`;
  const labels = {
    fr: {
      service: 'Service',
      serviceValue: 'Astrologie par téléphone avec des conseillers virtuels, voix générée par IA.',
      plans: 'Formules',
      free: 'Appel gratuit',
      freeValue: `${FREE_CALL_SECONDS / 60} minutes, une fois par e-mail, par appareil et par réseau /24. Coupure serveur à ${FREE_CALL_SECONDS} secondes.`,
      memory: 'Mémoire',
      memoryValue: 'Résumé court après l’appel, relu au même conseiller, consultable et effaçable dans le compte.',
      call: 'Durée max d’un appel',
      callValue: `${WEEKLY_MAX_CALL_MINUTES} minutes.`,
      languages: 'Langues',
      languagesValue: LOCALES.join(', '),
      advisors: 'Personas',
      advisorsValue: advisorCount == null ? 'Nombre publié depuis l’annuaire.' : String(advisorCount),
      disclosure: 'Mention',
      limits: 'Limites',
      limitsValue: 'Divertissement. Pas un avis médical, juridique ou financier.',
      data: 'Données',
      dataValue: 'Compte, naissance et résumés d’appels conservés le temps du compte, effaçables sur demande. L’audio brut n’est pas archivé.',
      updated: 'Mis à jour',
    },
    en: {
      service: 'Service',
      serviceValue: 'Astrology by phone with virtual advisors and an AI-generated voice.',
      plans: 'Plans',
      free: 'Free call',
      freeValue: `${FREE_CALL_SECONDS / 60} minutes, once per email, device and /24 network. The server cuts the call at ${FREE_CALL_SECONDS} seconds.`,
      memory: 'Memory',
      memoryValue: 'A short summary after the call is read back to the same advisor. You can view and delete it in the account.',
      call: 'Max call length',
      callValue: `${WEEKLY_MAX_CALL_MINUTES} minutes.`,
      languages: 'Languages',
      languagesValue: LOCALES.join(', '),
      advisors: 'Personas',
      advisorsValue: advisorCount == null ? 'Count published from the directory.' : String(advisorCount),
      disclosure: 'Disclosure',
      limits: 'Limits',
      limitsValue: 'Entertainment. Not medical, legal or financial advice.',
      data: 'Data',
      dataValue: 'Account, birth data and call summaries are kept for the life of the account and can be deleted on request. Raw call audio is not archived.',
      updated: 'Updated',
    },
  };
  const copy = locale === 'en' ? labels.en : labels.fr;
  return [
    { label: copy.service, value: `Callastral. ${copy.serviceValue}` },
    { label: copy.plans, value: plans },
    { label: copy.free, value: copy.freeValue },
    { label: copy.memory, value: copy.memoryValue },
    { label: copy.call, value: copy.callValue },
    { label: copy.languages, value: copy.languagesValue },
    { label: copy.advisors, value: copy.advisorsValue },
    { label: copy.disclosure, value: `${VIRTUAL_ADVISOR_DISCLOSURE} ${AI_ACT_SPOKEN[locale]}` },
    { label: copy.limits, value: copy.limitsValue },
    { label: copy.data, value: copy.dataValue },
    { label: copy.updated, value: FACTS_UPDATED },
  ];
}

export function factsIntro(locale: Locale): { title: string; description: string; h1: string } {
  if (locale === 'en') {
    return {
      title: 'Callastral facts and figures',
      description: 'Official facts for Callastral: weekly plans, free 3-minute call, call memory, languages and limits.',
      h1: 'Callastral facts and figures',
    };
  }
  return {
    title: 'Callastral, faits et chiffres',
    description: 'Fiche officielle de Callastral : formules hebdomadaires, appel gratuit de 3 minutes, mémoire, langues et limites.',
    h1: 'Callastral, faits et chiffres',
  };
}

export function factsAboutHref(locale: Locale): string {
  return aboutPath(locale);
}
