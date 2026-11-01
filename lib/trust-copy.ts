/** Promesse et engagements issus de l’analyse des avis concurrents (compteur, dates inventées, frais cachés…). */
export type TrustLocale = 'fr' | 'en';

export const TRUST_PROMISE: Record<TrustLocale, string> = {
  fr: 'Aucune date inventée. Aucun compteur caché. Ton vrai ciel.',
  en: 'No invented dates. No hidden meter. Your real sky.',
};

export const FIXED_PRICE_LINE: Record<TrustLocale, string> = {
  fr: 'Prix fixe. Jamais un centime de plus.',
  en: 'Fixed price. Never a cent more.',
};

/**
 * Confidentialité : formulation vérifiée dans le code (novembre 2026).
 * - aucun fichier audio n’est archivé (voix traitée en temps réel) ;
 * - appel réservé : la transcription texte est enregistrée (call_sessions.transcript) et conservée avec le compte ;
 * - mémoire du conseiller (active par défaut, désactivable) : court résumé relu aux appels suivants ;
 * - essai gratuit : seul un court résumé est gardé.
 */
export const COMMITMENTS: Record<TrustLocale, { title: string; items: Array<{ title: string; body: string }> }> = {
  fr: {
    title: 'Nos engagements',
    items: [
      { title: 'Prix fixe, plafonné', body: 'Vous achetez un pack de minutes. L’appel s’arrête tout seul quand il est épuisé : pas d’abonnement, pas de recharge automatique, rien d’autre n’est prélevé.' },
      { title: 'Pas de prédiction datée', body: 'Aucune date annoncée pour un événement, aucun « votre ex va revenir ». On parle de tendances et de choix, pas de promesses.' },
      { title: 'Thème calculé sur le ciel réel', body: 'Positions des planètes calculées par éphémérides pour votre date, heure et lieu de naissance, pas un texte générique.' },
      { title: 'Conseillères IA transparentes', body: 'Les Conseillères et Conseillers Callastral sont des IA, et le disent dès la première phrase. Réponses franches, sans flatterie, et sans faire durer l’appel.' },
      { title: 'Confidentialité', body: 'Aucun enregistrement audio n’est conservé. Pour un appel réservé, la transcription écrite est gardée dans votre compte (résumé, mémoire du conseiller) jusqu’à votre demande de suppression ; la mémoire se coupe et s’efface depuis le compte.' },
    ],
  },
  en: {
    title: 'Our commitments',
    items: [
      { title: 'Fixed, capped price', body: 'You buy a pack of minutes. The call stops by itself when it runs out: no subscription, no auto top-up, nothing else is charged.' },
      { title: 'No dated predictions', body: 'No dates announced for events, no “your ex will come back”. We talk about trends and choices, not promises.' },
      { title: 'Chart computed on the real sky', body: 'Planet positions computed from ephemerides for your birth date, time and place, not a generic text.' },
      { title: 'Transparent AI advisors', body: 'Callastral advisors are AI and say so in their first sentence. Straight answers, no flattery, and no stretching the call.' },
      { title: 'Privacy', body: 'No call audio is kept. For a booked call, the written transcript is kept in your account (summary, advisor memory) until you ask for deletion; memory can be turned off and erased from your account.' },
    ],
  },
};

export const TRIAL_NO_CHARGE: Record<TrustLocale, string> = {
  fr: 'Aucun abonnement, aucun prélèvement, aucune carte demandée.',
  en: 'No subscription, no charge, no card requested.',
};

export const DROP_CREDIT: Record<TrustLocale, string> = {
  fr: 'Si la ligne coupe, les minutes non utilisées restent sur votre compte.',
  en: 'If the line drops, unused minutes stay on your account.',
};
