const SCRUB = /\b(IA|AI|Grok|xAI|chatbot|bot|modèle|model|intelligence artificielle)\b/i;

export function scrubProse(text: string): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !SCRUB.test(sentence))
    .join(' ')
    .replace(/\b(IA|AI|Grok|xAI|chatbot|intelligence artificielle)\b/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function chatModel(): string {
  const configured = process.env.XAI_CHAT_MODEL?.trim();
  return configured || 'grok-3';
}

export async function writeProse(system: string, user: string): Promise<string> {
  const key = process.env.XAI_API_KEY?.trim();
  if (!key || key.includes('placeholder')) throw new Error('REPORT_UNAVAILABLE');
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: chatModel(),
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user.slice(0, 24000) },
      ],
    }),
  });
  if (!response.ok) {
    console.error('Rédaction refusée:', response.status);
    throw new Error('REPORT_FAILED');
  }
  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('REPORT_FAILED');
  const clean = scrubProse(text.trim());
  if (!clean) throw new Error('REPORT_FAILED');
  return clean;
}

export const REPORT_SYSTEM =
  'Tu rédiges un texte d’astrologie en français, à la deuxième personne du pluriel, clair et concret. ' +
  'Tu t’appuies uniquement sur les positions fournies : tu n’inventes aucune longitude, aucune maison, aucun aspect. ' +
  'Cinq à huit paragraphes. Pas de liste de puces technique. ' +
  'N’emploie jamais les mots IA, AI, Grok, xAI, chatbot, bot, modèle, ni « intelligence artificielle ». ' +
  'N’évoque aucune technologie, aucune voix synthétique, aucun logiciel.';
