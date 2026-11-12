import type { AdvisorLang } from './money.ts';

export interface HomePlansCopy {
  kicker: string;
  title: string;
  lead: string;
  recommended: string;
  formula: string;
  minutes: (count: number) => string;
  choose: (name: string) => string;
  pay: (price: string) => string;
  ai: string;
}

const COPY: Record<AdvisorLang, HomePlansCopy> = {
  fr: {
    kicker: 'Tarif unique',
    title: 'Packs de minutes à prix fixe',
    lead: 'Vous payez une fois. L’appel s’arrête tout seul quand le pack est utilisé. Pas d’abonnement, pas de recharge automatique.',
    recommended: 'Le plus choisi',
    formula: 'Pack',
    minutes: (count) => `${count} minutes`,
    choose: (name) => `Choisir ${name}`,
    pay: (price) => `Choisir un pack — ${price}`,
    ai: 'Conseiller virtuel — voix générée par IA',
  },
  en: {
    kicker: 'One price list',
    title: 'Fixed-price minute packs',
    lead: 'You pay once. The call stops by itself when the pack is used up. No subscription, no auto top-up.',
    recommended: 'Most chosen',
    formula: 'Pack',
    minutes: (count) => `${count} minutes`,
    choose: (name) => `Choose ${name}`,
    pay: (price) => `Choose a pack — ${price}`,
    ai: 'Virtual advisor — AI-generated voice',
  },
  es: {
    kicker: 'Tarifa única',
    title: 'Paquetes de minutos a precio fijo',
    lead: 'Pagas una vez. La llamada se detiene sola cuando el paquete se acaba. Sin suscripción ni recarga automática.',
    recommended: 'El más elegido',
    formula: 'Pack',
    minutes: (count) => `${count} minutos`,
    choose: (name) => `Elegir ${name}`,
    pay: (price) => `Elegir un pack — ${price}`,
    ai: 'Consejero virtual — voz generada por IA',
  },
  de: {
    kicker: 'Ein Preisraster',
    title: 'Minutenpakete zum Festpreis',
    lead: 'Sie zahlen einmal. Der Anruf endet von selbst, wenn das Paket aufgebraucht ist. Kein Abo, keine automatische Aufladung.',
    recommended: 'Am häufigsten gewählt',
    formula: 'Paket',
    minutes: (count) => `${count} Minuten`,
    choose: (name) => `${name} wählen`,
    pay: (price) => `Paket wählen — ${price}`,
    ai: 'Virtueller Berater — KI-Stimme',
  },
  it: {
    kicker: 'Tariffa unica',
    title: 'Pacchetti di minuti a prezzo fisso',
    lead: 'Paghi una volta. La chiamata si ferma da sola quando il pacchetto è esaurito. Niente abbonamento né ricarica automatica.',
    recommended: 'Il più scelto',
    formula: 'Pacchetto',
    minutes: (count) => `${count} minuti`,
    choose: (name) => `Scegli ${name}`,
    pay: (price) => `Scegli un pacchetto — ${price}`,
    ai: 'Consulente virtuale — voce generata dall’IA',
  },
};

export function homePlansCopy(locale: AdvisorLang): HomePlansCopy {
  return COPY[locale] ?? COPY.fr;
}
