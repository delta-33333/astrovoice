/** Chat par message : règles pures (testables sans serveur). */

export const CHAT_LOCALES = ['fr', 'en', 'es', 'de', 'it'] as const;
export type ChatLocale = (typeof CHAT_LOCALES)[number];

export const CHAT_TOPICS = ['love', 'work', 'money', 'family', 'other'] as const;
export type ChatTopic = (typeof CHAT_TOPICS)[number];

export const CHAT_FREE_MESSAGES = 1;
export const CHAT_MONTHLY_CAP = 300;
export const CHAT_PRICE_CENTS = 690;
export const CHAT_CURRENCY = 'eur';
export const CHAT_PRICE_LOOKUP_KEY = 'callastral_chat_monthly_eur_690';
export const CHAT_MAX_INPUT = 1500;
export const CHAT_NEW_USERS_PER_NETWORK_PER_DAY = 4;

export const TOPIC_SPECIALTY: Record<ChatTopic, string> = {
  love: 'amour',
  work: 'carrière',
  money: 'argent',
  family: 'famille',
  other: 'spiritualité',
};

export function isChatLocale(value: unknown): value is ChatLocale {
  return typeof value === 'string' && (CHAT_LOCALES as readonly string[]).includes(value);
}

export function isChatTopic(value: unknown): value is ChatTopic {
  return typeof value === 'string' && (CHAT_TOPICS as readonly string[]).includes(value);
}

export function chatPath(locale: ChatLocale | string): string {
  return `/${isChatLocale(locale) ? locale : 'fr'}/chat`;
}

export const CHAT_CTA: Record<ChatLocale, string> = {
  fr: 'Pose ta question par message, 1ère réponse offerte',
  en: 'Ask your question by message, first answer free',
  es: 'Haz tu pregunta por mensaje, primera respuesta gratis',
  de: 'Stell deine Frage per Nachricht, erste Antwort gratis',
  it: 'Fai la tua domanda per messaggio, prima risposta gratis',
};

export const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export type ChatEntitlement =
  | { allowed: true; kind: 'free' | 'subscription'; remaining: number }
  | { allowed: false; reason: 'paywall' | 'cap' };

/** Droit d’envoyer un message : 1 offert, puis abonnement actif sous le plafond mensuel. */
export function chatEntitlement(input: {
  freeUsed: boolean;
  subscriptionStatus: string | null;
  periodEnd: string | null;
  periodMessages: number;
  now?: number;
}): ChatEntitlement {
  const now = input.now ?? Date.now();
  const active =
    !!input.subscriptionStatus &&
    ACTIVE_STATUSES.has(input.subscriptionStatus) &&
    (!input.periodEnd || new Date(input.periodEnd).getTime() > now - 2 * 86400_000);
  if (active) {
    const used = Math.max(0, input.periodMessages || 0);
    if (used >= CHAT_MONTHLY_CAP) return { allowed: false, reason: 'cap' };
    return { allowed: true, kind: 'subscription', remaining: CHAT_MONTHLY_CAP - used };
  }
  if (!input.freeUsed) return { allowed: true, kind: 'free', remaining: CHAT_FREE_MESSAGES };
  return { allowed: false, reason: 'paywall' };
}

/** Champs requis avant le premier message. Renvoie le nom du premier champ invalide. */
export function chatStartIssue(input: {
  email: unknown;
  firstName: unknown;
  birthDate: unknown;
  birthTime: unknown;
  timeUnknown: unknown;
  birthPlace: unknown;
  topic: unknown;
  question: unknown;
}, today = new Date()): string | null {
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(email)) return 'email';
  if (typeof input.firstName !== 'string' || !input.firstName.trim() || input.firstName.length > 60) return 'firstName';
  const date = typeof input.birthDate === 'string' ? input.birthDate : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'birthDate';
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.getUTCFullYear() < 1900 || parsed.getTime() > today.getTime()) return 'birthDate';
  if (input.timeUnknown !== true) {
    if (typeof input.birthTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.birthTime)) return 'birthTime';
  }
  if (typeof input.birthPlace !== 'string' || input.birthPlace.trim().length < 2 || input.birthPlace.length > 120) return 'birthPlace';
  if (!isChatTopic(input.topic)) return 'topic';
  if (typeof input.question !== 'string' || input.question.trim().length < 3 || input.question.length > CHAT_MAX_INPUT) return 'question';
  return null;
}

/** Une réponse doit toujours se terminer par une ou deux questions de relance. */
export function endsWithFollowUp(text: string): boolean {
  const tail = text.trim().split(/\n+/).slice(-3).join(' ');
  const count = (tail.match(/\?/g) || []).length;
  return count >= 1;
}

const FALLBACK_FOLLOW_UP: Record<ChatLocale, string> = {
  fr: 'Qu’est-ce qui vous pèse le plus en ce moment dans cette situation ? Et qu’aimeriez-vous voir changer dans les prochaines semaines ?',
  en: 'What weighs on you most in this situation right now? And what would you like to see change in the coming weeks?',
  es: '¿Qué es lo que más te pesa ahora mismo en esta situación? ¿Y qué te gustaría que cambiara en las próximas semanas?',
  de: 'Was belastet dich in dieser Situation gerade am meisten? Und was würdest du dir für die nächsten Wochen wünschen?',
  it: 'Cosa ti pesa di più in questo momento in questa situazione? E cosa vorresti che cambiasse nelle prossime settimane?',
};

export function ensureFollowUp(text: string, locale: ChatLocale): string {
  return endsWithFollowUp(text) ? text.trim() : `${text.trim()}\n\n${FALLBACK_FOLLOW_UP[locale]}`;
}

const TOPIC_LABEL: Record<ChatLocale, Record<ChatTopic, string>> = {
  fr: { love: 'Amour', work: 'Travail', money: 'Argent', family: 'Famille', other: 'Autre' },
  en: { love: 'Love', work: 'Work', money: 'Money', family: 'Family', other: 'Other' },
  es: { love: 'Amor', work: 'Trabajo', money: 'Dinero', family: 'Familia', other: 'Otro' },
  de: { love: 'Liebe', work: 'Beruf', money: 'Geld', family: 'Familie', other: 'Anderes' },
  it: { love: 'Amore', work: 'Lavoro', money: 'Denaro', family: 'Famiglia', other: 'Altro' },
};

export function topicLabel(locale: ChatLocale, topic: ChatTopic): string {
  return TOPIC_LABEL[locale][topic];
}

const LANGUAGE_NAME: Record<ChatLocale, string> = {
  fr: 'français', en: 'English', es: 'español', de: 'Deutsch', it: 'italiano',
};

/** Consignes du chat écrit (ajoutées au persona du conseiller). */
export function chatSystemPrompt(input: {
  locale: ChatLocale;
  advisorName: string;
  advisorLabel: string;
  personaPrompt: string;
  firstName: string;
  birth: string;
  place: string;
  timeUnknown: boolean;
  topic: ChatTopic;
  chartText: string;
  today: string;
}): string {
  const lang = LANGUAGE_NAME[input.locale];
  const persona = input.personaPrompt
    .split('\n')
    .filter((line) => !/voix|voice|oral|silence|appel|call/i.test(line))
    .join('\n')
    .trim();
  return [
    `Tu es ${input.advisorName}, ${input.advisorLabel}. Tu échanges PAR ÉCRIT (messagerie) avec ${input.firstName}. Réponds uniquement en ${lang}.`,
    persona ? `Ton style et ton caractère :\n${persona}` : '',
    `Client : ${input.firstName}, né·e le ${input.birth} à ${input.place}. Thème de sa question : ${TOPIC_LABEL.fr[input.topic]}. Date du jour : ${input.today}.`,
    input.timeUnknown
      ? 'Heure de naissance inconnue : ne t’appuie ni sur l’Ascendant ni sur les maisons ; reste sur les planètes en signes et leurs aspects.'
      : '',
    `Thème natal calculé (positions exactes, n’en invente aucune) :\n${input.chartText}`,
    [
      'Règles de réponse :',
      '- Réponds précisément à la question posée, en citant 2 ou 3 placements concrets du thème (planète, signe, maison, aspect) et ce qu’ils signifient pour sa situation.',
      '- Ton chaleureux, personnel, concret ; tu tutoies si le client tutoie, sinon vouvoiement. 120 à 220 mots. Pas de titres, pas de listes techniques.',
      '- Termine TOUJOURS par une ou deux questions de relance pertinentes et personnelles (contexte, personnes impliquées, échéance, ressenti) pour approfondir la lecture au message suivant.',
      '- Pas de certitude absolue ni de prédiction datée garantie. Aucun avis médical, juridique ou financier : en cas de détresse, oriente vers un professionnel ou le 112.',
      '- Ne mentionne jamais de logiciel, de technologie, d’API, de fournisseur de données ou de calcul automatisé. N’emploie jamais les mots IA, AI, Grok, xAI, chatbot, bot, modèle.',
      '- N’invente pas d’avis clients, ni de rareté, ni d’urgence commerciale.',
    ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n');
}
