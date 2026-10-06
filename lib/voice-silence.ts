/*
 * Relance en cas de silence pendant un appel vocal (partagé client / serveur, sans dépendance serveur).
 * - 7 s sans parole après la fin de la réponse du conseiller : relance (question ouverte, personnalisée) ;
 * - 2 relances consécutives au plus ;
 * - 90 s de silence complet après la 2e relance : courte formule d’au revoir, puis fin automatique de l’appel.
 * Toute parole (ou message écrit) de la personne remet les compteurs à zéro.
 */

export const SILENCE_REENGAGE_MS = 7_000;
export const SILENCE_MAX_REENGAGE = 2;
export const SILENCE_HANGUP_MS = 90_000;
/** Délai maximal d’attente de la fin de l’au revoir avant de raccrocher quand même. */
export const SILENCE_GOODBYE_GRACE_MS = 20_000;

type Lang = 'fr' | 'en' | 'es' | 'de' | 'it';

function pick<T>(table: Record<Lang, T>, lang: string): T {
  return table[(lang in table ? lang : 'fr') as Lang];
}

/** Règle ajoutée au prompt de base commun à tous les conseillers. */
const SILENCE_RULE: Record<Lang, string> = {
  fr: `## Silences
Une courte pause est normale : laisse la personne chercher ses mots. Si elle reste silencieuse environ 6 à 8 secondes après ta réponse, relance-la avec douceur par une seule question ouverte et personnalisée, tirée de son thème natal (une planète, une maison ou un aspect précis) et du sujet de l’appel. Varie chaque relance : ne répète jamais une question ni une formulation déjà dite. Ne lui reproche jamais son silence. Si elle reste longtemps silencieuse malgré deux relances, dis-lui au revoir en une phrase chaleureuse.`,
  en: `## Silences
A short pause is normal: let the person search for words. If they stay silent for about 6 to 8 seconds after you answer, gently re-engage them with a single open, personal question drawn from their birth chart (a specific planet, house or aspect) and the topic of the call. Vary every re-engagement: never repeat a question or a phrasing you have already used. Never reproach them for being silent. If they stay silent for a long time despite two re-engagements, say goodbye in one warm sentence.`,
  es: `## Silencios
Una pausa corta es normal: deja que la persona busque sus palabras. Si se queda en silencio unos 6 a 8 segundos después de tu respuesta, retómala con suavidad con una sola pregunta abierta y personal, basada en su carta natal (un planeta, una casa o un aspecto concreto) y en el tema de la llamada. Varía cada intento: nunca repitas una pregunta ni una formulación ya dicha. Nunca le reproches su silencio. Si sigue en silencio mucho tiempo pese a dos intentos, despídete con una frase cálida.`,
  de: `## Stille
Eine kurze Pause ist normal: Lass die Person nach Worten suchen. Bleibt sie nach deiner Antwort etwa 6 bis 8 Sekunden still, sprich sie sanft mit einer einzigen offenen, persönlichen Frage an, die sich auf ihr Geburtshoroskop (einen bestimmten Planeten, ein Haus oder einen Aspekt) und das Thema des Gesprächs stützt. Variiere jedes Nachfragen: Wiederhole nie eine Frage oder Formulierung, die du schon benutzt hast. Mach ihr ihr Schweigen nie zum Vorwurf. Bleibt sie trotz zweimaligem Nachfragen lange still, verabschiede dich mit einem warmen Satz.`,
  it: `## Silenzi
Una breve pausa è normale: lascia che la persona cerchi le parole. Se resta in silenzio per circa 6-8 secondi dopo la tua risposta, riprendila con dolcezza con una sola domanda aperta e personale, tratta dal suo tema natale (un pianeta, una casa o un aspetto preciso) e dall’argomento della chiamata. Varia ogni ripresa: non ripetere mai una domanda o una formulazione già usata. Non rimproverarle mai il silenzio. Se resta a lungo in silenzio nonostante due riprese, salutala con una frase calorosa.`,
};

export function silenceRule(lang: string): string {
  return pick(SILENCE_RULE, lang);
}

const REENGAGE: Record<Lang, (attempt: number) => string> = {
  fr: (attempt) =>
    `## Relance (consigne pour cette réponse uniquement)
La personne est silencieuse depuis quelques secondes (relance ${attempt} sur 2). Tu es en pleine consultation : ne te présente pas, ne salue pas, ne redis pas la phrase d’ouverture. Ne commente pas son silence et ne répète rien de ce que tu as déjà dit. Pose une seule question ouverte, courte et chaleureuse, personnalisée à partir d’un élément précis de son thème natal (planète, maison ou aspect) en lien avec le sujet de l’appel${attempt > 1 ? ', sous un angle différent de ta relance précédente' : ''}. Puis tais-toi et laisse-la répondre.`,
  en: (attempt) =>
    `## Re-engagement (instruction for this response only)
The person has been silent for a few seconds (re-engagement ${attempt} of 2). You are in the middle of the consultation: do not introduce yourself, do not greet, do not repeat the opening sentence. Do not comment on the silence and do not repeat anything you already said. Ask one short, warm, open question, personalised from a specific element of their birth chart (planet, house or aspect) related to the topic of the call${attempt > 1 ? ', from a different angle than your previous re-engagement' : ''}. Then stop and let them answer.`,
  es: (attempt) =>
    `## Retomar (instrucción solo para esta respuesta)
La persona lleva unos segundos en silencio (intento ${attempt} de 2). Estás en plena consulta: no te presentes, no saludes, no repitas la frase de apertura. No comentes el silencio ni repitas nada de lo ya dicho. Haz una sola pregunta abierta, breve y cálida, personalizada a partir de un elemento concreto de su carta natal (planeta, casa o aspecto) relacionado con el tema de la llamada${attempt > 1 ? ', desde un ángulo distinto al del intento anterior' : ''}. Luego calla y deja que responda.`,
  de: (attempt) =>
    `## Nachfragen (Anweisung nur für diese Antwort)
Die Person schweigt seit einigen Sekunden (Nachfrage ${attempt} von 2). Ihr seid mitten in der Beratung: Stell dich nicht vor, begrüße nicht, wiederhole nicht den Eröffnungssatz. Kommentiere das Schweigen nicht und wiederhole nichts, was du schon gesagt hast. Stelle eine einzige kurze, warme, offene Frage, persönlich zugeschnitten auf ein bestimmtes Element ihres Geburtshoroskops (Planet, Haus oder Aspekt) im Zusammenhang mit dem Thema des Gesprächs${attempt > 1 ? ', aus einem anderen Blickwinkel als bei der vorigen Nachfrage' : ''}. Dann schweig und lass sie antworten.`,
  it: (attempt) =>
    `## Ripresa (istruzione solo per questa risposta)
La persona è in silenzio da qualche secondo (ripresa ${attempt} di 2). Sei nel pieno della consulenza: non presentarti, non salutare, non ripetere la frase di apertura. Non commentare il silenzio e non ripetere nulla di ciò che hai già detto. Fai una sola domanda aperta, breve e calorosa, personalizzata a partire da un elemento preciso del suo tema natale (pianeta, casa o aspetto) legato all’argomento della chiamata${attempt > 1 ? ', da un’angolazione diversa rispetto alla ripresa precedente' : ''}. Poi taci e lasciala rispondere.`,
};

const GOODBYE: Record<Lang, string> = {
  fr: `## Fin de l’appel (consigne pour cette réponse uniquement)
La personne ne répond plus depuis longtemps. Ne redis pas la phrase d’ouverture. Dis-lui au revoir en une ou deux phrases courtes et chaleureuses : indique que tu mets fin à l’appel faute de réponse et qu’elle peut rappeler quand elle le souhaite. Ne pose aucune question.`,
  en: `## End of call (instruction for this response only)
The person has not answered for a long time. Do not repeat the opening sentence. Say goodbye in one or two short, warm sentences: say you are ending the call since there is no answer and that they can call back whenever they like. Ask no question.`,
  es: `## Fin de la llamada (instrucción solo para esta respuesta)
La persona no responde desde hace rato. No repitas la frase de apertura. Despídete en una o dos frases cortas y cálidas: di que terminas la llamada por falta de respuesta y que puede volver a llamar cuando quiera. No hagas ninguna pregunta.`,
  de: `## Gesprächsende (Anweisung nur für diese Antwort)
Die Person antwortet schon lange nicht mehr. Wiederhole nicht den Eröffnungssatz. Verabschiede dich in ein oder zwei kurzen, warmen Sätzen: Sag, dass du das Gespräch mangels Antwort beendest und dass sie jederzeit wieder anrufen kann. Stelle keine Frage.`,
  it: `## Fine della chiamata (istruzione solo per questa risposta)
La persona non risponde da molto tempo. Non ripetere la frase di apertura. Salutala in una o due frasi brevi e calorose: di’ che chiudi la chiamata per mancanza di risposta e che può richiamare quando vuole. Non fare domande.`,
};

/**
 * Consigne d’une réponse de relance. `response.create.instructions` remplace les instructions
 * de session pour cette réponse : `base` est donc le prompt complet (persona + thème), sans la phrase
 * d’ouverture (`followupInstructions` du jeton vocal), suivi de la consigne.
 */
export function reengageInstructions(base: string, lang: string, attempt: number): string {
  return `${base}\n\n${pick(REENGAGE, lang)(attempt)}`;
}

export function goodbyeInstructions(base: string, lang: string): string {
  return `${base}\n\n${pick(GOODBYE, lang)}`;
}
