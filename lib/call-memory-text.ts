import { discoveryHeadline } from './book-funnel.ts';
import { escapeHtml } from './email.ts';
import { isLocale, type Locale } from './seo.ts';
import { horoscopeModel } from './weekly-sky.ts';

export interface MemoryNote {
  id: string;
  bookingId: string | null;
  createdAt: string;
  topics: string[];
  questions: string[];
  advice: string[];
  mood: string;
  summary: string;
}

export interface MemoryDraft {
  topics: string[];
  questions: string[];
  advice: string[];
  mood: string;
  summary: string;
}

export interface MemoryLine {
  role: 'user' | 'advisor';
  text: string;
}

const FOLLOW: Record<string, string> = {
  fr: 'Mémoire des consultations précédentes, laissée active par la personne. Reprends naturellement, par exemple « la dernière fois tu me parlais de… ». N’invente rien au-delà de ces notes. Ne lis pas la liste à voix haute.',
  en: 'Memory of earlier consultations, left on by the person. Follow up naturally, for example “last time you were telling me about…”. Do not invent anything beyond these notes. Do not read the list aloud.',
  es: 'Memoria de consultas anteriores, dejada activa por la persona. Retoma con naturalidad, por ejemplo «la última vez me hablabas de…». No inventes nada fuera de estas notas. No leas la lista en voz alta.',
  de: 'Erinnerung an frühere Beratungen, von der Person aktiv gelassen. Knüpfe natürlich an, zum Beispiel „beim letzten Mal hast du mir von … erzählt“. Erfinde nichts über diese Notizen hinaus. Lies die Liste nicht laut vor.',
  it: 'Memoria dei consulti precedenti, lasciata attiva dalla persona. Riprendi con naturalezza, per esempio «l’ultima volta mi parlavi di…». Non inventare nulla oltre queste note. Non leggere l’elenco ad alta voce.',
};

export function memoryEnabled(flag: boolean | null | undefined): boolean {
  return flag !== false;
}

export function memoryPromptBlock(lang: string, notes: MemoryNote[]): string {
  const slice = notes.slice(0, 3).filter((note) => note.summary.trim());
  if (!slice.length) return '';
  const intro = FOLLOW[lang] ?? FOLLOW.fr;
  const body = slice
    .map((note, index) => {
      const topics = note.topics.slice(0, 3).join(', ');
      const questions = note.questions.slice(0, 2).join(' | ');
      const advice = note.advice.slice(0, 2).join(' | ');
      return [
        `#${index + 1} ${note.createdAt.slice(0, 10)}`,
        note.summary,
        topics ? `sujets: ${topics}` : '',
        questions ? `questions: ${questions}` : '',
        advice ? `conseils: ${advice}` : '',
        note.mood ? `humeur: ${note.mood}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');
  return `${intro}\n\n${body}`;
}

export function clipList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const text = item.replace(/\s+/g, ' ').trim().slice(0, 180);
    if (!text) continue;
    out.push(text);
    if (out.length >= max) break;
  }
  return out;
}

export function parseMemoryDraft(raw: string): MemoryDraft | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    const summary = typeof parsed.summary === 'string' ? parsed.summary.replace(/\s+/g, ' ').trim().slice(0, 500) : '';
    const mood = typeof parsed.mood === 'string' ? parsed.mood.replace(/\s+/g, ' ').trim().slice(0, 40) : '';
    if (!summary) return null;
    return {
      topics: clipList(parsed.topics, 3),
      questions: clipList(parsed.questions, 3),
      advice: clipList(parsed.advice, 3),
      mood,
      summary,
    };
  } catch {
    return null;
  }
}

const MOODS: Array<{ mood: string; words: string[] }> = [
  { mood: 'inquiet', words: ['peur', 'angoisse', 'inquiet', 'anxious', 'worried', 'miedo', 'angst', 'paura'] },
  { mood: 'triste', words: ['triste', 'pleure', 'sad', 'tristeza', 'traurig', 'piango'] },
  { mood: 'léger', words: ['heureux', 'joie', 'happy', 'alegre', 'froh', 'felice'] },
  { mood: 'tendu', words: ['colère', 'énervé', 'angry', 'enfado', 'wütend', 'arrabbi'] },
];

export function fallbackMemory(lines: MemoryLine[]): MemoryDraft {
  const userLines = lines.map((line) => (line.role === 'user' ? line.text.trim() : '')).filter(Boolean);
  const advisorLines = lines.map((line) => (line.role === 'advisor' ? line.text.trim() : '')).filter(Boolean);
  const questions = userLines.filter((text) => text.includes('?')).slice(0, 3);
  const topics = (questions.length ? questions : userLines).slice(0, 3).map((text) => text.slice(0, 160));
  const advice = advisorLines.slice(-2).map((text) => text.slice(0, 160));
  const blob = userLines.join(' ').toLowerCase();
  const mood = MOODS.find((item) => item.words.some((word) => blob.includes(word)))?.mood ?? 'posé';
  const summary = topics[0]
    ? `La personne a parlé de : ${topics[0].slice(0, 180)}`
    : 'Échange court, sans sujet nettement formulé.';
  return { topics, questions, advice, mood, summary };
}

export function recapMail(input: {
  locale: Locale;
  name: string;
  summary: string;
  topics: string[];
  transits: string[];
  bookUrl: string;
  privacyUrl: string;
}): { subject: string; html: string } {
  const price = discoveryHeadline(input.locale, 'eur');
  const subject = {
    fr: 'Après votre appel — un court rappel',
    en: 'After your call — a short recap',
    es: 'Después de su llamada — un breve recordatorio',
    de: 'Nach Ihrem Anruf — eine kurze Erinnerung',
    it: 'Dopo la chiamata — un breve promemoria',
  }[input.locale];
  const hello = {
    fr: `Bonjour ${escapeHtml(input.name || '')},`,
    en: `Hello ${escapeHtml(input.name || '')},`,
    es: `Hola ${escapeHtml(input.name || '')},`,
    de: `Guten Tag ${escapeHtml(input.name || '')},`,
    it: `Buongiorno ${escapeHtml(input.name || '')},`,
  }[input.locale];
  const intro = {
    fr: 'Voici ce qui est resté de l’échange, pour le reprendre plus tard.',
    en: 'Here is what stayed from the conversation, so you can pick it up later.',
    es: 'Esto es lo que quedó de la conversación, para retomarlo más tarde.',
    de: 'Das ist hängen geblieben, damit Sie später anknüpfen können.',
    it: 'Questo è rimasto dal colloquio, per riprenderlo più tardi.',
  }[input.locale];
  const sky = {
    fr: 'Transits de la semaine',
    en: 'This week’s transits',
    es: 'Tránsitos de la semana',
    de: 'Transite dieser Woche',
    it: 'Transiti della settimana',
  }[input.locale];
  const upsell = {
    fr: `Si vous voulez reprendre cela avec un conseiller, la première semaine Découverte est à ${price}.`,
    en: `If you want to continue with an advisor, the Découverte first week is ${price}.`,
    es: `Si quiere retomarlo con un consejero, la primera semana Découverte es ${price}.`,
    de: `Wenn Sie das mit einem Berater aufnehmen wollen, kostet die erste Découverte-Woche ${price}.`,
    it: `Se vuole riprenderlo con un consulente, la prima settimana Découverte è ${price}.`,
  }[input.locale];
  const cta = {
    fr: 'Voir la semaine Découverte',
    en: 'See the Découverte week',
    es: 'Ver la semana Découverte',
    de: 'Découverte-Woche ansehen',
    it: 'Vedere la settimana Découverte',
  }[input.locale];
  const topics = input.topics.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const transits = input.transits.slice(0, 3).map((item) => `<p>${escapeHtml(item)}</p>`).join('');
  const html = `<p>${hello}</p>
<p>${intro}</p>
<p>${escapeHtml(input.summary)}</p>
${topics ? `<ul>${topics}</ul>` : ''}
<h2>${sky}</h2>
${transits}
<p>${upsell}</p>
<p><a href="${escapeHtml(input.bookUrl)}">${cta}</a></p>
<p><a href="${escapeHtml(input.privacyUrl)}">${escapeHtml(input.privacyUrl)}</a></p>`;
  return { subject, html };
}

export function weekTransitLines(locale: Locale, now: Date): string[] {
  return horoscopeModel(locale, now).skyParagraphs.slice(0, 3);
}

export function asMemoryLocale(value: string | null | undefined): Locale {
  return value && isLocale(value) ? value : 'fr';
}

export function recapBookPath(): string {
  const params = new URLSearchParams({
    offer: 'decouverte',
    utm_source: 'recap',
    utm_medium: 'email',
    utm_campaign: 'memoire',
  });
  return `/book?${params.toString()}`;
}
