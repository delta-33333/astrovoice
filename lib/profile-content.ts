/**
 * Contenu éditorial des fiches conseillers : style de lecture, axes du thème regardés
 * par spécialité et 5 exemples de questions par spécialité, dans les 5 langues.
 * Aucun âge, aucune ancienneté, aucune promesse de prédiction. Module pur.
 */
export type ProfileLocale = 'fr' | 'en' | 'es' | 'de' | 'it';

function loc(locale: string): ProfileLocale {
  return (['fr', 'en', 'es', 'de', 'it'] as const).includes(locale as ProfileLocale) ? (locale as ProfileLocale) : 'fr';
}

type Spec = 'amour' | 'carrière' | 'spiritualité' | 'transition de vie' | 'compatibilité' | 'argent' | 'famille';

const QUESTIONS: Record<ProfileLocale, Record<Spec, string[]>> = {
  fr: {
    amour: [
      'Qu’est-ce que mon thème dit de ma façon d’aimer et d’être aimé·e ?',
      'Pourquoi est-ce que je retombe dans le même schéma amoureux ?',
      'Quelles périodes des prochains mois sont favorables pour faire une rencontre ?',
      'Comment ma Vénus et ma Lune influencent-elles ce dont j’ai besoin dans un couple ?',
      'Dois-je laisser une seconde chance à cette relation ? Qu’en dit le ciel actuel ?',
    ],
    carrière: [
      'Quels talents mon Milieu du Ciel met-il en avant pour mon métier ?',
      'Est-ce le bon moment pour changer de poste ou me reconvertir ?',
      'Comment mieux gérer les tensions avec ma hiérarchie, d’après mon thème ?',
      'Quelles périodes de l’année sont propices pour lancer un projet ?',
      'Pourquoi je me sens bloqué·e professionnellement en ce moment ?',
    ],
    spiritualité: [
      'Qu’est-ce que mes nœuds lunaires disent de mon chemin de vie ?',
      'Comment retrouver du sens quand je me sens perdu·e ?',
      'Quelle pratique (méditation, écriture, nature) correspond le mieux à mon thème ?',
      'Que représente la maison 12 dans mon thème et comment la vivre ?',
      'Quels cycles personnels suis-je en train de traverser ?',
    ],
    'transition de vie': [
      'Je traverse un grand changement : qu’est-ce que les transits actuels éclairent ?',
      'Mon retour de Saturne explique-t-il ce que je vis ?',
      'Comment aborder un déménagement ou un nouveau départ ?',
      'Qu’est-ce qui se termine et qu’est-ce qui commence pour moi cette année ?',
      'Comment garder le cap pendant une période d’incertitude ?',
    ],
    compatibilité: [
      'Nos deux thèmes sont-ils compatibles sur le plan affectif ?',
      'Où sont nos points de friction et comment les apaiser ?',
      'Que disent nos Lunes de nos besoins émotionnels respectifs ?',
      'Sommes-nous plutôt complémentaires ou semblables ?',
      'Comment mieux communiquer, d’après nos Mercure ?',
    ],
    argent: [
      'Quel est mon rapport à l’argent selon ma maison 2 ?',
      'Quelles périodes sont favorables pour une décision financière importante ?',
      'Pourquoi j’ai du mal à mettre de côté ?',
      'Comment mon thème parle-t-il de ma valeur et de ce que je peux demander ?',
      'Est-ce le bon moment pour négocier une augmentation ou mes tarifs ?',
    ],
    famille: [
      'Comment mieux comprendre la relation avec mon père ou ma mère ?',
      'Que dit ma maison 4 de mes racines et de mon foyer ?',
      'Comment apaiser une tension avec un frère ou une sœur ?',
      'Comment accompagner mon enfant selon son thème ?',
      'Quels schémas familiaux se répètent chez moi ?',
    ],
  },
  en: {
    amour: [
      'What does my chart say about how I love and want to be loved?',
      'Why do I keep falling into the same relationship pattern?',
      'Which periods in the coming months are good for meeting someone?',
      'How do my Venus and Moon shape what I need in a partner?',
      'Should I give this relationship another chance? What do current transits show?',
    ],
    carrière: [
      'Which strengths does my Midheaven highlight for my work?',
      'Is this a good time to change jobs or careers?',
      'How can I handle tension with my manager, based on my chart?',
      'Which times of the year favour launching a project?',
      'Why do I feel stuck at work right now?',
    ],
    spiritualité: [
      'What do my lunar nodes say about my life path?',
      'How can I find meaning again when I feel lost?',
      'Which practice (meditation, journaling, nature) suits my chart best?',
      'What does my 12th house mean and how can I live it well?',
      'Which personal cycles am I going through?',
    ],
    'transition de vie': [
      'I’m going through a big change: what do current transits shed light on?',
      'Does my Saturn return explain what I’m living?',
      'How should I approach a move or a fresh start?',
      'What is ending and what is beginning for me this year?',
      'How do I stay on course through a period of uncertainty?',
    ],
    compatibilité: [
      'Are our two charts compatible emotionally?',
      'Where are our friction points and how can we ease them?',
      'What do our Moons say about our emotional needs?',
      'Are we more complementary or alike?',
      'How can we communicate better, based on our Mercury placements?',
    ],
    argent: [
      'What is my relationship with money according to my 2nd house?',
      'Which periods favour a big financial decision?',
      'Why do I find it hard to save?',
      'What does my chart say about my worth and what I can ask for?',
      'Is this a good time to negotiate a raise or my rates?',
    ],
    famille: [
      'How can I better understand my relationship with my father or mother?',
      'What does my 4th house say about my roots and home?',
      'How can I ease tension with a brother or sister?',
      'How can I support my child based on their chart?',
      'Which family patterns repeat in my life?',
    ],
  },
  es: {
    amour: [
      '¿Qué dice mi carta sobre mi forma de amar y de ser amado/a?',
      '¿Por qué repito siempre el mismo patrón en pareja?',
      '¿Qué periodos de los próximos meses son buenos para conocer a alguien?',
      '¿Cómo influyen mi Venus y mi Luna en lo que necesito en pareja?',
      '¿Debo dar otra oportunidad a esta relación? ¿Qué muestran los tránsitos?',
    ],
    carrière: [
      '¿Qué talentos destaca mi Medio Cielo para mi trabajo?',
      '¿Es buen momento para cambiar de empleo o de profesión?',
      '¿Cómo gestionar la tensión con mi jefe según mi carta?',
      '¿Qué épocas del año favorecen lanzar un proyecto?',
      '¿Por qué me siento estancado/a en el trabajo?',
    ],
    spiritualité: [
      '¿Qué dicen mis nodos lunares sobre mi camino de vida?',
      '¿Cómo recuperar el sentido cuando me siento perdido/a?',
      '¿Qué práctica (meditación, escritura, naturaleza) encaja con mi carta?',
      '¿Qué significa mi casa 12 y cómo vivirla?',
      '¿Qué ciclos personales estoy atravesando?',
    ],
    'transition de vie': [
      'Vivo un gran cambio: ¿qué aclaran los tránsitos actuales?',
      '¿Mi retorno de Saturno explica lo que vivo?',
      '¿Cómo afrontar una mudanza o un nuevo comienzo?',
      '¿Qué termina y qué empieza para mí este año?',
      '¿Cómo mantener el rumbo en un periodo de incertidumbre?',
    ],
    compatibilité: [
      '¿Son compatibles nuestras cartas en lo afectivo?',
      '¿Dónde están nuestros roces y cómo suavizarlos?',
      '¿Qué dicen nuestras Lunas de nuestras necesidades emocionales?',
      '¿Somos más complementarios o parecidos?',
      '¿Cómo comunicarnos mejor según nuestros Mercurios?',
    ],
    argent: [
      '¿Cuál es mi relación con el dinero según mi casa 2?',
      '¿Qué periodos favorecen una decisión financiera importante?',
      '¿Por qué me cuesta ahorrar?',
      '¿Qué dice mi carta sobre mi valor y lo que puedo pedir?',
      '¿Es buen momento para negociar un aumento o mis tarifas?',
    ],
    famille: [
      '¿Cómo entender mejor la relación con mi padre o mi madre?',
      '¿Qué dice mi casa 4 sobre mis raíces y mi hogar?',
      '¿Cómo calmar la tensión con un hermano o una hermana?',
      '¿Cómo acompañar a mi hijo/a según su carta?',
      '¿Qué patrones familiares se repiten en mí?',
    ],
  },
  de: {
    amour: [
      'Was sagt mein Horoskop darüber, wie ich liebe und geliebt werden möchte?',
      'Warum gerate ich immer wieder in dasselbe Beziehungsmuster?',
      'Welche Zeiten in den nächsten Monaten sind günstig, um jemanden kennenzulernen?',
      'Wie prägen Venus und Mond, was ich in einer Partnerschaft brauche?',
      'Soll ich dieser Beziehung noch eine Chance geben? Was zeigen die Transite?',
    ],
    carrière: [
      'Welche Stärken betont mein Medium Coeli für meinen Beruf?',
      'Ist jetzt ein guter Zeitpunkt für einen Job- oder Berufswechsel?',
      'Wie gehe ich laut Horoskop mit Spannungen mit meiner Führungskraft um?',
      'Welche Zeiten im Jahr sind günstig, um ein Projekt zu starten?',
      'Warum fühle ich mich beruflich gerade blockiert?',
    ],
    spiritualité: [
      'Was sagen meine Mondknoten über meinen Lebensweg?',
      'Wie finde ich wieder Sinn, wenn ich mich verloren fühle?',
      'Welche Praxis (Meditation, Schreiben, Natur) passt zu meinem Horoskop?',
      'Was bedeutet mein 12. Haus und wie lebe ich es gut?',
      'Welche persönlichen Zyklen durchlaufe ich gerade?',
    ],
    'transition de vie': [
      'Ich erlebe einen großen Umbruch: Was zeigen die aktuellen Transite?',
      'Erklärt meine Saturn-Wiederkehr, was ich gerade erlebe?',
      'Wie gehe ich einen Umzug oder Neuanfang an?',
      'Was endet und was beginnt dieses Jahr für mich?',
      'Wie bleibe ich in unsicheren Zeiten auf Kurs?',
    ],
    compatibilité: [
      'Passen unsere beiden Horoskope emotional zusammen?',
      'Wo liegen unsere Reibungspunkte und wie entschärfen wir sie?',
      'Was sagen unsere Monde über unsere emotionalen Bedürfnisse?',
      'Ergänzen wir uns eher, oder sind wir uns ähnlich?',
      'Wie kommunizieren wir besser, laut unseren Merkur-Stellungen?',
    ],
    argent: [
      'Wie ist mein Verhältnis zu Geld laut meinem 2. Haus?',
      'Welche Zeiten sind für eine wichtige finanzielle Entscheidung günstig?',
      'Warum fällt mir das Sparen schwer?',
      'Was sagt mein Horoskop über meinen Wert und das, was ich verlangen kann?',
      'Ist jetzt ein guter Zeitpunkt, eine Gehaltserhöhung oder meine Preise zu verhandeln?',
    ],
    famille: [
      'Wie verstehe ich die Beziehung zu meinem Vater oder meiner Mutter besser?',
      'Was sagt mein 4. Haus über meine Wurzeln und mein Zuhause?',
      'Wie entschärfe ich eine Spannung mit Bruder oder Schwester?',
      'Wie begleite ich mein Kind anhand seines Horoskops?',
      'Welche Familienmuster wiederholen sich bei mir?',
    ],
  },
  it: {
    amour: [
      'Cosa dice il mio tema su come amo e voglio essere amato/a?',
      'Perché ricado sempre nello stesso schema di coppia?',
      'Quali periodi dei prossimi mesi sono favorevoli per un incontro?',
      'Come influiscono Venere e Luna su ciò di cui ho bisogno in coppia?',
      'Devo dare un’altra possibilità a questa relazione? Cosa mostrano i transiti?',
    ],
    carrière: [
      'Quali talenti mette in luce il mio Medio Cielo per il lavoro?',
      'È il momento giusto per cambiare lavoro o professione?',
      'Come gestire le tensioni con il mio responsabile secondo il mio tema?',
      'Quali periodi dell’anno favoriscono il lancio di un progetto?',
      'Perché mi sento bloccato/a sul lavoro in questo momento?',
    ],
    spiritualité: [
      'Cosa dicono i miei nodi lunari sul mio percorso di vita?',
      'Come ritrovare un senso quando mi sento perso/a?',
      'Quale pratica (meditazione, scrittura, natura) si adatta al mio tema?',
      'Cosa rappresenta la mia casa 12 e come viverla?',
      'Quali cicli personali sto attraversando?',
    ],
    'transition de vie': [
      'Sto vivendo un grande cambiamento: cosa chiariscono i transiti attuali?',
      'Il mio ritorno di Saturno spiega quello che vivo?',
      'Come affrontare un trasloco o un nuovo inizio?',
      'Cosa finisce e cosa comincia per me quest’anno?',
      'Come mantenere la rotta in un periodo di incertezza?',
    ],
    compatibilité: [
      'I nostri due temi sono compatibili sul piano affettivo?',
      'Dove sono i nostri attriti e come attenuarli?',
      'Cosa dicono le nostre Lune sui nostri bisogni emotivi?',
      'Siamo più complementari o simili?',
      'Come comunicare meglio secondo i nostri Mercurio?',
    ],
    argent: [
      'Qual è il mio rapporto con il denaro secondo la casa 2?',
      'Quali periodi favoriscono una decisione finanziaria importante?',
      'Perché faccio fatica a risparmiare?',
      'Cosa dice il mio tema sul mio valore e su ciò che posso chiedere?',
      'È il momento giusto per negoziare un aumento o le mie tariffe?',
    ],
    famille: [
      'Come capire meglio il rapporto con mio padre o mia madre?',
      'Cosa dice la mia casa 4 sulle mie radici e sulla casa?',
      'Come calmare una tensione con un fratello o una sorella?',
      'Come accompagnare mio figlio secondo il suo tema?',
      'Quali schemi familiari si ripetono in me?',
    ],
  },
};

const STYLE_TEXT: Record<ProfileLocale, Record<string, string>> = {
  fr: {
    doux: 'Une lecture douce : on avance à votre rythme, avec des mots rassurants, sans brusquer les sujets sensibles.',
    direct: 'Une lecture directe : des réponses franches et concrètes, qui vont droit au point qui vous préoccupe.',
    mystique: 'Une lecture mystique : le thème est lu comme un récit symbolique, avec ses archétypes et ses cycles.',
    pragmatique: 'Une lecture pragmatique : chaque point du thème est relié à une décision ou une action possible.',
    poétique: 'Une lecture poétique : des images et des métaphores pour rendre le thème vivant et mémorable.',
    structuré: 'Une lecture structurée : un plan clair (contexte, points forts, vigilances, périodes clés) et un résumé.',
  },
  en: {
    doux: 'A gentle reading: at your pace, with reassuring words, never rushing sensitive topics.',
    direct: 'A direct reading: frank, concrete answers that go straight to what is on your mind.',
    mystique: 'A mystical reading: your chart is read as a symbolic story, with its archetypes and cycles.',
    pragmatique: 'A practical reading: every point in the chart is tied to a possible decision or action.',
    poétique: 'A poetic reading: images and metaphors that make your chart vivid and memorable.',
    structuré: 'A structured reading: a clear outline (context, strengths, watch-outs, key periods) and a summary.',
  },
  es: {
    doux: 'Una lectura suave: a tu ritmo, con palabras tranquilizadoras, sin forzar los temas delicados.',
    direct: 'Una lectura directa: respuestas francas y concretas, al grano.',
    mystique: 'Una lectura mística: la carta se lee como un relato simbólico, con sus arquetipos y ciclos.',
    pragmatique: 'Una lectura práctica: cada punto de la carta se relaciona con una decisión o acción posible.',
    poétique: 'Una lectura poética: imágenes y metáforas para que la carta cobre vida.',
    structuré: 'Una lectura estructurada: un plan claro (contexto, fortalezas, puntos de atención, periodos clave) y un resumen.',
  },
  de: {
    doux: 'Eine sanfte Deutung: in Ihrem Tempo, mit beruhigenden Worten, ohne heikle Themen zu überstürzen.',
    direct: 'Eine direkte Deutung: offene, konkrete Antworten, die auf den Punkt kommen.',
    mystique: 'Eine mystische Deutung: das Horoskop als symbolische Erzählung mit Archetypen und Zyklen.',
    pragmatique: 'Eine pragmatische Deutung: jeder Punkt im Horoskop wird mit einer möglichen Entscheidung verknüpft.',
    poétique: 'Eine poetische Deutung: Bilder und Metaphern, die das Horoskop lebendig machen.',
    structuré: 'Eine strukturierte Deutung: klarer Aufbau (Kontext, Stärken, Achtsamkeitspunkte, Schlüsselphasen) und Zusammenfassung.',
  },
  it: {
    doux: 'Una lettura delicata: al tuo ritmo, con parole rassicuranti, senza forzare i temi sensibili.',
    direct: 'Una lettura diretta: risposte franche e concrete, dritte al punto.',
    mystique: 'Una lettura mistica: il tema è letto come un racconto simbolico, con archetipi e cicli.',
    pragmatique: 'Una lettura pratica: ogni punto del tema è legato a una decisione o azione possibile.',
    poétique: 'Una lettura poetica: immagini e metafore per rendere vivo il tema.',
    structuré: 'Una lettura strutturata: uno schema chiaro (contesto, punti di forza, attenzioni, periodi chiave) e un riassunto.',
  },
};

const FOCUS: Record<ProfileLocale, Record<Spec, string>> = {
  fr: {
    amour: 'Vénus, la Lune et la maison 7',
    carrière: 'le Milieu du Ciel, la maison 10 et Saturne',
    spiritualité: 'les nœuds lunaires, Neptune et la maison 12',
    'transition de vie': 'les transits de Saturne, d’Uranus et de Pluton',
    compatibilité: 'la comparaison des deux thèmes (synastrie)',
    argent: 'la maison 2, la maison 8 et Jupiter',
    famille: 'la maison 4, la Lune et Saturne',
  },
  en: {
    amour: 'Venus, the Moon and the 7th house',
    carrière: 'the Midheaven, the 10th house and Saturn',
    spiritualité: 'the lunar nodes, Neptune and the 12th house',
    'transition de vie': 'Saturn, Uranus and Pluto transits',
    compatibilité: 'the comparison of both charts (synastry)',
    argent: 'the 2nd house, the 8th house and Jupiter',
    famille: 'the 4th house, the Moon and Saturn',
  },
  es: {
    amour: 'Venus, la Luna y la casa 7',
    carrière: 'el Medio Cielo, la casa 10 y Saturno',
    spiritualité: 'los nodos lunares, Neptuno y la casa 12',
    'transition de vie': 'los tránsitos de Saturno, Urano y Plutón',
    compatibilité: 'la comparación de ambas cartas (sinastría)',
    argent: 'la casa 2, la casa 8 y Júpiter',
    famille: 'la casa 4, la Luna y Saturno',
  },
  de: {
    amour: 'Venus, Mond und das 7. Haus',
    carrière: 'das Medium Coeli, das 10. Haus und Saturn',
    spiritualité: 'die Mondknoten, Neptun und das 12. Haus',
    'transition de vie': 'die Transite von Saturn, Uranus und Pluto',
    compatibilité: 'den Vergleich beider Horoskope (Synastrie)',
    argent: 'das 2. Haus, das 8. Haus und Jupiter',
    famille: 'das 4. Haus, den Mond und Saturn',
  },
  it: {
    amour: 'Venere, la Luna e la casa 7',
    carrière: 'il Medio Cielo, la casa 10 e Saturno',
    spiritualité: 'i nodi lunari, Nettuno e la casa 12',
    'transition de vie': 'i transiti di Saturno, Urano e Plutone',
    compatibilité: 'il confronto dei due temi (sinastria)',
    argent: 'la casa 2, la casa 8 e Giove',
    famille: 'la casa 4, la Luna e Saturno',
  },
};

const SPEC_SET = new Set(Object.keys(QUESTIONS.fr));

export function exampleQuestions(locale: string, specialty: string): string[] {
  if (!SPEC_SET.has(specialty)) return [];
  return QUESTIONS[loc(locale)][specialty as Spec];
}

export function readingStyleText(locale: string, style: string): string | null {
  return STYLE_TEXT[loc(locale)][style] ?? null;
}

/** Second paragraphe de bio : comment la consultation se déroule, sans âge ni ancienneté. */
export function methodParagraph(
  locale: string,
  input: { firstName: string; specialties: readonly string[] }
): string {
  const l = loc(locale);
  const focus = input.specialties
    .filter((item) => SPEC_SET.has(item))
    .map((item) => FOCUS[l][item as Spec])
    .slice(0, 3);
  const name = input.firstName;
  const list = focus.join(l === 'fr' ? ' ; ' : '; ');
  switch (l) {
    case 'en':
      return `Every call with ${name} starts from your birth chart, computed from your date, time and place of birth. ${focus.length ? `Depending on your question, ${name} looks in particular at ${list}.` : ''} You can ask about one topic in depth or several in turn; if your birth time is unknown, the reading stays careful about houses and the Ascendant. ${name} does not make medical, legal or financial decisions for you.`;
    case 'es':
      return `Cada llamada con ${name} parte de tu carta natal, calculada con tu fecha, hora y lugar de nacimiento. ${focus.length ? `Según tu pregunta, ${name} mira en particular ${list}.` : ''} Puedes profundizar en un tema o tratar varios; si no conoces tu hora de nacimiento, la lectura es prudente con las casas y el Ascendente. ${name} no toma decisiones médicas, jurídicas ni financieras por ti.`;
    case 'de':
      return `Jedes Gespräch mit ${name} beginnt mit Ihrem Geburtshoroskop, berechnet aus Datum, Uhrzeit und Ort Ihrer Geburt. ${focus.length ? `Je nach Frage betrachtet ${name} besonders ${list}.` : ''} Sie können ein Thema vertiefen oder mehrere nacheinander ansprechen; ist die Geburtszeit unbekannt, bleibt die Deutung bei Häusern und Aszendent vorsichtig. ${name} trifft keine medizinischen, rechtlichen oder finanziellen Entscheidungen für Sie.`;
    case 'it':
      return `Ogni chiamata con ${name} parte dal tuo tema natale, calcolato con data, ora e luogo di nascita. ${focus.length ? `In base alla domanda, ${name} guarda in particolare ${list}.` : ''} Puoi approfondire un tema o affrontarne diversi; se l’ora di nascita è sconosciuta, la lettura resta prudente su case e Ascendente. ${name} non prende decisioni mediche, legali o finanziarie al posto tuo.`;
    default:
      return `Chaque appel avec ${name} part de votre thème natal, calculé à partir de votre date, heure et lieu de naissance. ${focus.length ? `Selon votre question, ${name} regarde en particulier ${list}.` : ''} Vous pouvez approfondir un seul sujet ou en aborder plusieurs ; si l’heure de naissance est inconnue, la lecture reste prudente sur les maisons et l’Ascendant. ${name} ne prend pas de décision médicale, juridique ou financière à votre place.`;
  }
}
