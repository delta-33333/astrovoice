import type { AdvisorLang } from './money.ts';

export interface HomePlansCopy {
  kicker: string;
  title: string;
  lead: string;
  recommended: string;
  formula: string;
  firstWeek: string;
  thenWeek: (full: string) => string;
  minutes: (count: number) => string;
  choose: (name: string) => string;
  pay: (price: string) => string;
  ai: string;
}

const COPY: Record<AdvisorLang, HomePlansCopy> = {
  fr: {
    kicker: 'Chaque semaine',
    title: 'Trois formules',
    lead: '60 minutes maximum par appel. Sans engagement, résiliable en 1 clic.',
    recommended: 'Recommandé',
    formula: 'Formule',
    firstWeek: 'la 1re semaine',
    thenWeek: (full) => `puis ${full}/semaine`,
    minutes: (count) => `${count} minutes par semaine`,
    choose: (name) => `Choisir ${name}`,
    pay: (price) => `Payer ${price}`,
    ai: 'Conseiller virtuel — voix générée par IA',
  },
  en: {
    kicker: 'Every week',
    title: 'Three plans',
    lead: '60 minutes maximum per call. No commitment, cancel in one click.',
    recommended: 'Recommended',
    formula: 'Plan',
    firstWeek: 'the first week',
    thenWeek: (full) => `then ${full}/week`,
    minutes: (count) => `${count} minutes a week`,
    choose: (name) => `Choose ${name}`,
    pay: (price) => `Pay ${price}`,
    ai: 'Virtual advisor — AI-generated voice',
  },
  es: {
    kicker: 'Cada semana',
    title: 'Tres fórmulas',
    lead: '60 minutos como máximo por llamada. Sin permanencia, cancelable en 1 clic.',
    recommended: 'Recomendado',
    formula: 'Fórmula',
    firstWeek: 'la 1.ª semana',
    thenWeek: (full) => `luego ${full}/semana`,
    minutes: (count) => `${count} minutos por semana`,
    choose: (name) => `Elegir ${name}`,
    pay: (price) => `Pagar ${price}`,
    ai: 'Consejero virtual — voz generada por IA',
  },
  de: {
    kicker: 'Jede Woche',
    title: 'Drei Tarife',
    lead: 'Höchstens 60 Minuten pro Anruf. Ohne Bindung, mit 1 Klick kündbar.',
    recommended: 'Empfohlen',
    formula: 'Tarif',
    firstWeek: 'in der 1. Woche',
    thenWeek: (full) => `danach ${full}/Woche`,
    minutes: (count) => `${count} Minuten pro Woche`,
    choose: (name) => `${name} wählen`,
    pay: (price) => `${price} zahlen`,
    ai: 'Virtueller Berater — KI-Stimme',
  },
  it: {
    kicker: 'Ogni settimana',
    title: 'Tre formule',
    lead: 'Massimo 60 minuti per chiamata. Senza vincoli, disdetta in 1 clic.',
    recommended: 'Consigliato',
    formula: 'Formula',
    firstWeek: 'la 1ª settimana',
    thenWeek: (full) => `poi ${full}/settimana`,
    minutes: (count) => `${count} minuti a settimana`,
    choose: (name) => `Scegli ${name}`,
    pay: (price) => `Paga ${price}`,
    ai: 'Consulente virtuale — voce generata dall’IA',
  },
};

export function homePlansCopy(locale: AdvisorLang): HomePlansCopy {
  return COPY[locale] ?? COPY.fr;
}
