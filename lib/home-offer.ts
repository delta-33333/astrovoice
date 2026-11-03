import { discoveryHeadline } from './book-funnel.ts';
import { VIRTUAL_ADVISOR_DISCLOSURE } from './legal.ts';
import { formatMoney, MARKET_PRICING, type AdvisorLang } from './money.ts';
import type { Locale } from './seo.ts';
import { firstWeekMinor, WEEKLY_PLANS, type WeeklyCurrency } from './weekly.ts';

/** Accueil : au plus douze fiches, le reste passe par « voir tous ». */
export const FEATURED_ADVISOR_LIMIT = 12;

export const HOME_TITLE: Record<Locale, string> = {
  fr: 'Astrologue IA par téléphone, selon votre thème | Callastral',
  en: 'AI astrologer by phone, from your birth chart | Callastral',
  es: 'Astrólogo IA por teléfono con tu carta natal | Callastral',
  de: 'KI-Astrologe am Telefon, nach Ihrem Horoskop | Callastral',
  it: 'Astrologo IA al telefono, a partire dal tema natale | Callastral',
};

export const HOME_H1: Record<Locale, string> = {
  fr: 'Parlez à une astrologue IA, au téléphone, à partir de votre thème natal',
  en: 'Talk to an AI astrologer by phone, from your birth chart',
  es: 'Habla con un astrólogo IA, por teléfono, a partir de tu carta natal',
  de: 'Sprechen Sie mit einem KI-Astrologen am Telefon, ausgehend von Ihrem Geburtshoroskop',
  it: 'Parla con un astrologo IA, al telefono, a partire dal tema natale',
};

export const HOME_SUB: Record<Locale, string> = {
  fr: 'Elle lit votre carte du ciel, répond à vos questions à voix haute et se souvient de vos appels. Voix générée par IA.',
  en: 'She reads your birth chart, answers out loud and remembers your calls. AI-generated voice.',
  es: 'Lee tu carta del cielo, responde en voz alta y recuerda tus llamadas. Voz generada por IA.',
  de: 'Er liest Ihre Himmelskarte, antwortet laut und erinnert sich an Ihre Anrufe. KI-Stimme.',
  it: 'Legge la tua carta del cielo, risponde ad alta voce e ricorda le chiamate. Voce generata dall’IA.',
};

const PRIMARY: Record<Locale, string> = {
  fr: '3 min offertes, sans carte',
  en: 'Try 3 minutes free',
  es: 'Probar 3 minutos gratis',
  de: '3 Minuten kostenlos testen',
  it: 'Prova 3 minuti gratis',
};

const REASSURE: Record<Locale, string> = {
  fr: 'Prix fixe · aucun abonnement · aucune recharge automatique · Apple Pay / Google Pay',
  en: 'Fixed price · no subscription · no auto top-up · Apple Pay / Google Pay',
  es: 'Sin permanencia · cancela en 1 clic · Apple Pay / Google Pay',
  de: 'Ohne Bindung · mit 1 Klick kündbar · Apple Pay / Google Pay',
  it: 'Senza vincoli · disdici in 1 clic · Apple Pay / Google Pay',
};

export function homePrimaryCta(locale: Locale): string {
  return PRIMARY[locale];
}

export function homeReassure(locale: Locale): string {
  return REASSURE[locale];
}

export function homeSecondaryCta(locale: Locale, currency: WeeklyCurrency): string {
  const price = discoveryHeadline(locale, currency);
  switch (locale) {
    case 'en':
      return `Discovery plan: ${price}`;
    case 'es':
      return `Fórmula Descubrimiento: ${price}`;
    case 'de':
      return `Tarif Entdeckung: ${price}`;
    case 'it':
      return `Formula Scoperta: ${price}`;
    default:
      return `Formule Découverte : ${price}`;
  }
}

/** Phrase de prix de l’accueil (Découverte), reprise telle quelle sur les fiches conseillers. Le prix vient des constantes. */
export function homeOfferLine(locale: Locale, currency: WeeklyCurrency): string {
  // Grille unique : packs prépayés à prix fixe (10 / 20 / 40 min), sans abonnement.
  const grid = currency === 'gbp' ? MARKET_PRICING.GB : currency === 'usd' ? MARKET_PRICING.US : currency === 'chf' ? MARKET_PRICING.CH : locale === 'es' ? MARKET_PRICING.ES : locale === 'it' ? MARKET_PRICING.IT : MARKET_PRICING.FR;
  const from = formatMoney(grid.packs['10min'], grid.currency, locale);
  switch (locale) {
    case 'en':
      return `Fixed-price packs from ${from} for 10 minutes, no subscription, never a cent more.`;
    case 'es':
      return `Paquetes de precio fijo desde ${from} los 10 minutos, sin suscripción.`;
    case 'de':
      return `Festpreis-Pakete ab ${from} für 10 Minuten, ohne Abo.`;
    case 'it':
      return `Pacchetti a prezzo fisso da ${from} per 10 minuti, senza abbonamento.`;
    default:
      return `Packs à prix fixe dès ${from} les 10 minutes, sans abonnement, jamais un centime de plus.`;
  }
}

/** Meta description. Le prix vient des constantes, jamais d’un montant écrit en dur. */
const POSITIONING_FR = 'La voix qui lit ton vrai ciel, sans dates inventées.';
const POSITIONING_EN = 'The voice that reads your real sky, with no invented dates.';

export function homeDescription(locale: Locale, currency: WeeklyCurrency): string {
  const offer = homeOfferLine(locale, currency);
  switch (locale) {
    case 'en':
      return `${POSITIONING_EN} ${offer}`;
    case 'es':
      return `Astrólogo IA por teléfono: tu carta natal y memoria de las llamadas. ${offer}`;
    case 'de':
      return `Sprechen Sie mit einem KI-Astrologen am Telefon: Geburtshoroskop und Erinnerung an Ihre Anrufe. ${offer}`;
    case 'it':
      return `Parla con un astrologo IA al telefono: lettura del tema natale e memoria delle chiamate. ${offer}`;
    default:
      return `${POSITIONING_FR} ${offer}`;
  }
}

export const MEMORY_FAQ: Record<Locale, { question: string; answer: string }> = {
  fr: {
    question: 'Le conseiller se souvient-il de nos appels précédents ?',
    answer:
      'Oui. Après chaque appel, un court résumé (thèmes, questions, conseils) est enregistré dans votre compte et transmis au même conseiller au début de l’appel suivant. Vous pouvez le consulter et l’effacer depuis votre compte.',
  },
  en: {
    question: 'Does the advisor remember previous calls?',
    answer:
      'Yes. After each call, a short summary (topics, questions, advice) is saved in your account and given to the same advisor at the start of the next call. You can read it and delete it from your account.',
  },
  es: {
    question: '¿El consejero recuerda las llamadas anteriores?',
    answer:
      'Sí. Después de cada llamada, un resumen breve (temas, preguntas, consejos) se guarda en tu cuenta y se transmite al mismo consejero al inicio de la siguiente. Puedes verlo y borrarlo desde la cuenta.',
  },
  de: {
    question: 'Erinnert sich der Berater an frühere Anrufe?',
    answer:
      'Ja. Nach jedem Anruf wird eine kurze Zusammenfassung (Themen, Fragen, Rat) im Konto gespeichert und demselben Berater zu Beginn des nächsten Anrufs gegeben. Sie können sie im Konto lesen und löschen.',
  },
  it: {
    question: 'Il consulente ricorda le chiamate precedenti?',
    answer:
      'Sì. Dopo ogni chiamata, un breve riassunto (temi, domande, consigli) viene salvato nell’account e trasmesso allo stesso consulente all’inizio della chiamata successiva. Puoi leggerlo e cancellarlo dall’account.',
  },
};

export function weeklyOfferSentence(locale: AdvisorLang, currency: WeeklyCurrency): string {
  const dec = WEEKLY_PLANS.decouverte;
  const ess = WEEKLY_PLANS.essentiel;
  const pre = WEEKLY_PLANS.premium;
  const money = (minor: number) => formatMoney(minor, currency, locale);
  const first = (plan: 'decouverte' | 'essentiel' | 'premium') => money(firstWeekMinor(plan, currency));
  if (locale === 'en') {
    return `${dec.names.en} ${dec.minutes} min ${money(dec.amounts[currency])}/week, first week ${first('decouverte')}. ${ess.names.en} ${ess.minutes} min ${money(ess.amounts[currency])}/week, first week ${first('essentiel')}. ${pre.names.en} ${pre.minutes} min ${money(pre.amounts[currency])}/week, first week ${first('premium')}. Cancel in one click.`;
  }
  return `Découverte ${dec.minutes} min ${money(dec.amounts.eur)}/semaine, 1re semaine ${first('decouverte')}. Essentiel ${ess.minutes} min ${money(ess.amounts.eur)}/semaine, 1re semaine ${first('essentiel')}. Premium ${pre.minutes} min ${money(pre.amounts.eur)}/semaine, 1re semaine ${first('premium')}. Résiliable en 1 clic.`;
}

export const HOME_DISCLOSURE = VIRTUAL_ADVISOR_DISCLOSURE;

export function publicPerMinute(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = (env.PUBLIC_PER_MINUTE ?? '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'on';
}

/** Promesse du premier écran, alignée sur les vidéos « le vrai ciel » (YouTube). */
export const SKY_PROMISE: Record<'fr' | 'en', { eyebrow: string; h1: string; sub: string; direct: string }> = {
  fr: {
    eyebrow: 'Amour, rupture, ex : le vrai ciel, calculé à l’instant',
    h1: 'Il revient ou pas ? Comprends enfin ton lien. Tes 3 premières minutes sont offertes.',
    sub: 'Commence par ta date de naissance : la Lune et le Soleil réels, maintenant, lus pour ton signe. Gratuit, sans compte. Puis parles-en à une astrologue IA au téléphone.',
    direct: 'Ou directement : 3 min offertes au téléphone, sans carte',
  },
  en: {
    eyebrow: 'Love, breakup, the ex: the real sky, computed right now',
    h1: 'Is he coming back or not? Finally understand your bond. Your first 3 minutes are free.',
    sub: 'Your date of birth is enough: the real Moon and Sun, right now, read for your sign. Free, no account. Then talk it through with an AI astrologer by phone.',
    direct: 'Or go straight to 3 free minutes by phone, no card',
  },
};

/** Phrase de positionnement (meta, à propos). */
export const POSITIONING: Record<'fr' | 'en', string> = {
  fr: 'Callastral, c’est la voix qui lit ton vrai ciel quand ton cœur ou ta vie s’emmêlent : pour comprendre ce qui se joue, sans dates inventées.',
  en: 'Callastral is the voice that reads your real sky when your heart or your life gets tangled: to understand what is at play, with no invented dates.',
};
