/** Réponse facultative « Comment nous avez-vous connus ? ». */
export const HEARD_FROM_IDS = [
  'tiktok',
  'instagram',
  'facebook',
  'google',
  'chatgpt',
  'perplexity',
  'gemini',
  'proche',
  'autre',
] as const;

export type HeardFromId = (typeof HEARD_FROM_IDS)[number];

const LABELS: Record<HeardFromId, { fr: string; en: string; es: string; de: string; it: string }> = {
  tiktok: { fr: 'TikTok', en: 'TikTok', es: 'TikTok', de: 'TikTok', it: 'TikTok' },
  instagram: { fr: 'Instagram', en: 'Instagram', es: 'Instagram', de: 'Instagram', it: 'Instagram' },
  facebook: { fr: 'Facebook', en: 'Facebook', es: 'Facebook', de: 'Facebook', it: 'Facebook' },
  google: { fr: 'Google', en: 'Google', es: 'Google', de: 'Google', it: 'Google' },
  chatgpt: { fr: 'ChatGPT', en: 'ChatGPT', es: 'ChatGPT', de: 'ChatGPT', it: 'ChatGPT' },
  perplexity: { fr: 'Perplexity', en: 'Perplexity', es: 'Perplexity', de: 'Perplexity', it: 'Perplexity' },
  gemini: { fr: 'Gemini / Google IA', en: 'Gemini / Google AI', es: 'Gemini / Google IA', de: 'Gemini / Google KI', it: 'Gemini / Google IA' },
  proche: { fr: 'Un proche', en: 'Someone I know', es: 'Alguien cercano', de: 'Jemand aus dem Umfeld', it: 'Una persona vicina' },
  autre: { fr: 'Autre', en: 'Other', es: 'Otro', de: 'Sonstiges', it: 'Altro' },
};

export function heardFromLabel(id: HeardFromId, locale: keyof (typeof LABELS)['tiktok']): string {
  return LABELS[id][locale];
}

export function parseHeardFrom(value: unknown): HeardFromId | null {
  if (typeof value !== 'string') return null;
  const id = value.trim().toLowerCase();
  return (HEARD_FROM_IDS as readonly string[]).includes(id) ? (id as HeardFromId) : null;
}

export const HEARD_FROM_QUESTION = {
  fr: 'Comment nous avez-vous connus ?',
  en: 'How did you hear about us?',
  es: '¿Cómo nos has conocido?',
  de: 'Wie haben Sie uns kennengelernt?',
  it: 'Come ci hai conosciuti?',
} as const;
