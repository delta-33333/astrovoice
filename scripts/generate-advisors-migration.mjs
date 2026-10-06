/**
 * Génère supabase/migrations/20261003143000_advisors.sql
 * Seed déterministe : 40 FR, 40 EN, 30 ES, 20 DE, 20 IT.
 * Exécuter : node scripts/generate-advisors-migration.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '../supabase/migrations/20261003143000_advisors.sql'
);

const QUOTAS = [
  ['fr', 40, 5],
  ['en', 40, 5],
  ['es', 30, 4],
  ['de', 20, 2],
  ['it', 20, 2],
];

const SECOND = { fr: 'en', en: 'es', es: 'en', de: 'en', it: 'fr' };

const VOICES = {
  femme: ['ara', 'eve', 'sal'],
  homme: ['leo', 'rex'],
};

const STYLES = ['doux', 'direct', 'mystique', 'pragmatique', 'poétique', 'structuré'];

const STYLE_PHRASE = {
  doux: {
    fr: 'douce et patiente',
    en: 'gentle and patient',
    es: 'suave y paciente',
    de: 'ruhig und geduldig',
    it: 'dolce e paziente',
  },
  direct: {
    fr: 'directe et nette',
    en: 'direct and plain-spoken',
    es: 'directa y nítida',
    de: 'direkt und nüchtern',
    it: 'diretta e nitida',
  },
  mystique: {
    fr: 'mystique, sans se perdre dans les images',
    en: 'mystical, without drifting into vague images',
    es: 'mística, sin perderse en imágenes vagas',
    de: 'mystisch, ohne sich in vagen Bildern zu verlieren',
    it: 'mistica, senza perdersi in immagini vaghe',
  },
  pragmatique: {
    fr: 'pragmatique et orientée vers une décision',
    en: 'pragmatic and aimed at a decision',
    es: 'pragmática y orientada a una decisión',
    de: 'pragmatisch und auf eine Entscheidung ausgerichtet',
    it: 'pragmatica e orientata a una decisione',
  },
  poétique: {
    fr: 'poétique, puis très concrète',
    en: 'poetic, then very concrete',
    es: 'poética y después muy concreta',
    de: 'poetisch und danach sehr konkret',
    it: 'poetica e poi molto concreta',
  },
  structuré: {
    fr: 'structurée, avec des repères de temps',
    en: 'structured, with clear time markers',
    es: 'estructurada, con marcas de tiempo',
    de: 'geordnet, mit klaren Zeitmarken',
    it: 'strutturata, con riferimenti di tempo',
  },
};

const SPECIALTIES = [
  'amour',
  'carrière',
  'spiritualité',
  'transition de vie',
  'compatibilité',
  'argent',
  'famille',
];

const NAMES = {
  fr: {
    femme: ['Camille', 'Léa', 'Chloé', 'Manon', 'Inès', 'Jade', 'Louise', 'Alice', 'Agathe', 'Margot', 'Clara', 'Juliette', 'Héloïse', 'Solène', 'Anaïs', 'Élodie', 'Mathilde', 'Céleste', 'Aurore', 'Iris', 'Noémie', 'Pauline', 'Victoire', 'Capucine', 'Maëlle', 'Océane', 'Rose', 'Apolline', 'Lina', 'Colette'],
    homme: ['Hugo', 'Louis', 'Gabriel', 'Arthur', 'Raphaël', 'Jules', 'Adam', 'Lucas', 'Nathan', 'Théo', 'Paul', 'Antoine', 'Maxime', 'Julien', 'Olivier', 'Marc', 'Henri', 'Étienne', 'Alexandre', 'Damien', 'Nicolas', 'François', 'Pierre', 'Bastien', 'Adrien', 'Romain', 'Clément', 'Guillaume', 'Sébastien', 'Yves'],
    last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'Faure', 'Rousseau', 'Blanc', 'Guérin', 'Henry', 'Roussel', 'Perrin', 'Morin', 'Clément', 'Gauthier', 'Dumont', 'Fontaine', 'Chevalier', 'Robin', 'Masson', 'Lemaire'],
  },
  en: {
    femme: ['Amelia', 'Clara', 'Eleanor', 'Grace', 'Hannah', 'Iris', 'Juliet', 'Laura', 'Margaret', 'Nora', 'Olive', 'Penelope', 'Ruth', 'Sophie', 'Thea', 'Violet', 'Willa', 'Adele', 'Beatrice', 'Cecilia', 'Daphne', 'Esther', 'Freya', 'Helen', 'Imogen', 'Joanna', 'Katherine', 'Lydia', 'Martha', 'Naomi'],
    homme: ['Arthur', 'Benjamin', 'Charles', 'Edward', 'Felix', 'George', 'Henry', 'Isaac', 'James', 'Leo', 'Miles', 'Nathan', 'Oscar', 'Peter', 'Samuel', 'Thomas', 'Walter', 'Adrian', 'Caleb', 'Daniel', 'Elliot', 'Francis', 'Graham', 'Hugh', 'Julian', 'Malcolm', 'Patrick', 'Simon', 'Victor', 'William'],
    last: ['Bennett', 'Carter', 'Dawson', 'Ellis', 'Foster', 'Graham', 'Hayes', 'Ingram', 'Keller', 'Lawson', 'Miller', 'Nash', 'Owens', 'Parker', 'Quinn', 'Reed', 'Shaw', 'Turner', 'Walker', 'Young', 'Brooks', 'Coleman', 'Dixon', 'Evans', 'Fletcher', 'Harper', 'Jensen', 'Keating', 'Lang', 'Morgan', 'Porter', 'Rowe', 'Sutton', 'Walsh', 'Adler', 'Brennan', 'Clarke', 'Donovan', 'Ellison', 'Hart'],
  },
  es: {
    femme: ['Alba', 'Beatriz', 'Carmen', 'Daniela', 'Elena', 'Fatima', 'Gloria', 'Inés', 'Jimena', 'Lucía', 'Marina', 'Nuria', 'Olga', 'Paloma', 'Rocío', 'Sofía', 'Teresa', 'Valeria', 'Alicia', 'Berta', 'Clara', 'Dolores', 'Estrella', 'Irene', 'Lara', 'Marta', 'Noa', 'Pilar', 'Rosa', 'Silvia'],
    homme: ['Alejandro', 'Bruno', 'Carlos', 'Diego', 'Enrique', 'Fernando', 'Gonzalo', 'Hugo', 'Iván', 'Javier', 'Luis', 'Miguel', 'Nicolás', 'Óscar', 'Pablo', 'Rafael', 'Sergio', 'Tomás', 'Andrés', 'Emilio', 'Héctor', 'Joaquín', 'Manuel', 'Ramón', 'Vicente', 'Álvaro', 'César', 'Darío', 'Esteban', 'Mateo'],
    last: ['García', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Romero', 'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Serrano', 'Blanco', 'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Iglesias', 'Santos', 'Cano', 'Reyes', 'Herrera', 'Giménez', 'Ferrer', 'Cabrera'],
  },
  de: {
    femme: ['Anna', 'Lena', 'Marie', 'Sophie', 'Emma', 'Hannah', 'Emilia', 'Lea', 'Clara', 'Luisa', 'Johanna', 'Greta', 'Helene', 'Marlene', 'Ingrid', 'Ursula', 'Brigitte', 'Petra', 'Katrin', 'Anja'],
    homme: ['Paul', 'Finn', 'Leon', 'Felix', 'Emil', 'Jonas', 'Lukas', 'Henrik', 'Karl', 'Otto', 'Werner', 'Thomas', 'Markus', 'Stefan', 'Andreas', 'Florian', 'Tobias', 'Sebastian', 'Niklas', 'Matthias'],
    last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hartmann', 'Lange', 'Lehmann', 'Köhler', 'König', 'Huber', 'Kaiser', 'Fuchs', 'Lang'],
  },
  it: {
    femme: ['Giulia', 'Chiara', 'Francesca', 'Alessia', 'Elena', 'Martina', 'Sara', 'Valentina', 'Beatrice', 'Caterina', 'Lucia', 'Anna', 'Paola', 'Silvia', 'Teresa', 'Rosa', 'Ilaria', 'Noemi', 'Greta', 'Bianca'],
    homme: ['Luca', 'Marco', 'Andrea', 'Giovanni', 'Francesco', 'Alessandro', 'Matteo', 'Davide', 'Stefano', 'Paolo', 'Roberto', 'Antonio', 'Giuseppe', 'Lorenzo', 'Riccardo', 'Enrico', 'Pietro', 'Carlo', 'Filippo', 'Nicola'],
    last: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri', 'Fontana', 'Santoro', 'Mariani', 'Rinaldi', 'Caruso', 'Ferrara', 'Galli', 'Pellegrini', 'Palumbo'],
  },
};

const SIGNATURES = {
  fr: [
    'Les maisons d’eau et de terre servent de boussole, jamais de verdict.',
    'Un transit n’est nommé que s’il éclaire la question posée.',
    'La Lune et Saturne reviennent souvent : le besoin, puis la durée.',
    'Les nœuds lunaires servent à nommer ce qui se termine et ce qui commence.',
    'Vénus et Mars sont lus ensemble, désir et manière d’agir.',
    'L’Ascendant n’est utilisé que lorsque l’heure de naissance est connue.',
    'Chaque séance se termine par un geste simple pour les sept jours suivants.',
    'Une courte pause est laissée quand la personne cherche ses mots ; après un long silence, relance avec douceur.',
  ],
  en: [
    'Water and earth houses are treated as a compass, never a verdict.',
    'A transit is named only when it clarifies the question at hand.',
    'The Moon and Saturn often return: the need, then the duration.',
    'The lunar nodes are used to name what is ending and what is starting.',
    'Venus and Mars are read together, desire and the way of acting.',
    'The Ascendant is used only when the birth time is known.',
    'Each session ends with one plain step for the next seven days.',
    'A short pause is left when someone is searching for words; after a long silence, gently re-engage.',
  ],
  es: [
    'Las casas de agua y de tierra sirven de brújula, nunca de sentencia.',
    'Un tránsito se nombra solo si aclara la pregunta del momento.',
    'La Luna y Saturno vuelven a menudo: la necesidad, luego la duración.',
    'Los nodos lunares sirven para nombrar lo que termina y lo que empieza.',
    'Venus y Marte se leen juntos, el deseo y la manera de actuar.',
    'El Ascendente se usa solo cuando la hora de nacimiento es conocida.',
    'Cada sesión cierra con un gesto simple para los siete días siguientes.',
    'Se respeta una pausa corta cuando la persona busca las palabras; tras un silencio largo, retómala con suavidad.',
  ],
  de: [
    'Wasser- und Erd-Häuser dienen als Kompass, nie als Urteil.',
    'Ein Transit wird nur genannt, wenn er die Frage erhellt.',
    'Mond und Saturn kehren oft wieder: das Bedürfnis, dann die Dauer.',
    'Die Mondknoten benennen, was endet und was beginnt.',
    'Venus und Mars werden zusammen gelesen, Wunsch und Handlungsweise.',
    'Der Aszendent wird nur genutzt, wenn die Geburtszeit bekannt ist.',
    'Jede Sitzung endet mit einem schlichten Schritt für die nächsten sieben Tage.',
    'Eine kurze Pause bleibt, wenn jemand nach Worten sucht; nach längerer Stille fragst du sanft nach.',
  ],
  it: [
    'Le case d’acqua e di terra servono da bussola, mai da verdetto.',
    'Un transito viene nominato solo se chiarisce la domanda.',
    'Luna e Saturno tornano spesso: il bisogno, poi la durata.',
    'I nodi lunari servono a dire ciò che finisce e ciò che inizia.',
    'Venere e Marte si leggono insieme, desiderio e modo di agire.',
    'L’Ascendente si usa solo quando l’ora di nascita è nota.',
    'Ogni seduta si chiude con un gesto semplice per i sette giorni seguenti.',
    'Una breve pausa resta quando la persona cerca le parole; dopo un lungo silenzio, riprendila con dolcezza.',
  ],
};

const OPENINGS = {
  fr: [
    (p) => `${p.first} ${p.last}, ${p.age} ans, accompagne depuis ${p.years} ans les personnes qui viennent parler de ${p.specs}.`,
    (p) => `${p.first} ${p.last} a ${p.age} ans et tient des consultations d’astrologie depuis ${p.years} ans, surtout autour de ${p.specs}.`,
    (p) => `Depuis ${p.years} ans, ${p.first} ${p.last} (${p.age} ans) reçoit celles et ceux qui arrivent avec une question de ${p.specs}.`,
  ],
  en: [
    (p) => `${p.first} ${p.last}, ${p.age}, has practiced astrology for ${p.years} years, especially around ${p.specs}.`,
    (p) => `At ${p.age}, ${p.first} ${p.last} has spent ${p.years} years reading charts for people facing ${p.specs}.`,
    (p) => `${p.first} ${p.last} is ${p.age} and has offered natal consultations for ${p.years} years, with a focus on ${p.specs}.`,
  ],
  es: [
    (p) => `${p.first} ${p.last}, ${p.age} años, acompaña desde hace ${p.years} años a quienes llegan con preguntas de ${p.specs}.`,
    (p) => `A los ${p.age} años, ${p.first} ${p.last} lleva ${p.years} años leyendo cartas natales en torno a ${p.specs}.`,
    (p) => `${p.first} ${p.last} tiene ${p.age} años y consulta en astrología desde hace ${p.years} años, sobre todo en ${p.specs}.`,
  ],
  de: [
    (p) => `${p.first} ${p.last}, ${p.age} Jahre, begleitet seit ${p.years} Jahren Menschen bei Fragen zu ${p.specs}.`,
    (p) => `Mit ${p.age} Jahren liest ${p.first} ${p.last} seit ${p.years} Jahren Horoskope, vor allem zu ${p.specs}.`,
    (p) => `${p.first} ${p.last} ist ${p.age} und bietet seit ${p.years} Jahren astrologische Gespräche zu ${p.specs} an.`,
  ],
  it: [
    (p) => `${p.first} ${p.last}, ${p.age} anni, accompagna da ${p.years} anni chi arriva con domande di ${p.specs}.`,
    (p) => `A ${p.age} anni, ${p.first} ${p.last} legge temi natali da ${p.years} anni, soprattutto su ${p.specs}.`,
    (p) => `${p.first} ${p.last} ha ${p.age} anni e consulta in astrologia da ${p.years} anni, in particolare su ${p.specs}.`,
  ],
};

const METHOD = {
  fr: [
    (p) => `La lecture est ${p.stylePhrase} : thème natal, transits du moment et maisons, puis une décision pour les semaines qui viennent.`,
    (p) => `Le travail part du thème de naissance et ne garde que les transits qui touchent ${p.primary}, dans une lecture ${p.stylePhrase}.`,
    (p) => `Un aspect, une maison, une question : rien n'est lu en bloc, et la lecture reste ${p.stylePhrase}.`,
  ],
  en: [
    (p) => `The reading is ${p.stylePhrase}: natal chart, current transits and houses, then a decision for the weeks ahead.`,
    (p) => `The work starts from the birth chart and keeps only the transits that touch ${p.primary}, in a manner that is ${p.stylePhrase}.`,
    (p) => `One aspect, one house, one question: nothing is read all at once, and the manner stays ${p.stylePhrase}.`,
  ],
  es: [
    (p) => `La lectura es ${p.stylePhrase}: carta natal, tránsitos del momento y casas, y después una decisión para las próximas semanas.`,
    (p) => `El trabajo parte de la carta de nacimiento y guarda solo los tránsitos que tocan ${p.primary}, en una lectura ${p.stylePhrase}.`,
    (p) => `Un aspecto, una casa, una pregunta: nada se lee de golpe, y la lectura permanece ${p.stylePhrase}.`,
  ],
  de: [
    (p) => `Die Deutung ist ${p.stylePhrase}: Radix, aktuelle Transite und Häuser, danach eine Entscheidung für die kommenden Wochen.`,
    (p) => `Die Arbeit geht vom Geburtshoroskop aus und behält nur die Transite, die ${p.primary} berühren, in einer Deutung, die ${p.stylePhrase} ist.`,
    (p) => `Ein Aspekt, ein Haus, eine Frage: nichts wird auf einmal gelesen, und die Deutung bleibt ${p.stylePhrase}.`,
  ],
  it: [
    (p) => `La lettura è ${p.stylePhrase}: tema natale, transiti del momento e case, poi una decisione per le settimane a venire.`,
    (p) => `Il lavoro parte dal tema di nascita e tiene solo i transiti che toccano ${p.primary}, in una lettura ${p.stylePhrase}.`,
    (p) => `Un aspetto, una casa, una domanda: niente viene letto tutto insieme, e la lettura resta ${p.stylePhrase}.`,
  ],
};

const CLOSING = {
  fr: [
    (p) => `On consulte ${p.first} quand il faut trier ${p.primary} sans se presser, et repartir avec une piste tenable.`,
    (p) => `${p.first} convient à qui veut nommer ${p.primary} avec des mots simples et un calendrier réaliste.`,
    (p) => `La séance reste brève dans la forme et précise sur ce que ${p.primary} demande de décider.`,
    (p) => `On appelle ${p.first} quand ${p.primary} occupe trop de place et que le thème peut remettre de l'ordre.`,
  ],
  en: [
    (p) => `People call ${p.first} when ${p.primary} needs sorting without rush, and when they want one workable next step.`,
    (p) => `${p.first} suits anyone who wants ${p.primary} named in plain words and a realistic calendar.`,
    (p) => `The session stays short in form and precise about what ${p.primary} asks them to decide.`,
    (p) => `${p.first} is called when ${p.primary} takes too much room and the chart can put things back in order.`,
  ],
  es: [
    (p) => `Se consulta a ${p.first} cuando hace falta ordenar ${p.primary} sin prisa y salir con una pista sostenible.`,
    (p) => `${p.first} encaja con quien quiere nombrar ${p.primary} con palabras simples y un calendario realista.`,
    (p) => `La sesión es breve en la forma y precisa en lo que ${p.primary} pide decidir.`,
    (p) => `Llaman a ${p.first} cuando ${p.primary} ocupa demasiado sitio y la carta puede volver a ordenar las cosas.`,
  ],
  de: [
    (p) => `${p.first} wird aufgesucht, wenn ${p.primary} ohne Eile geordnet werden soll und ein gangbarer nächster Schritt fehlt.`,
    (p) => `${p.first} passt zu Menschen, die ${p.primary} in einfachen Worten und mit einem realistischen Kalender benennen wollen.`,
    (p) => `Das Gespräch bleibt kurz in der Form und genau in dem, was ${p.primary} zu entscheiden gibt.`,
    (p) => `${p.first} wird gerufen, wenn ${p.primary} zu viel Raum einnimmt und das Horoskop wieder Ordnung schaffen kann.`,
  ],
  it: [
    (p) => `Si consulta ${p.first} quando serve mettere ordine in ${p.primary} senza fretta e uscire con una pista sostenibile.`,
    (p) => `${p.first} è adatto a chi vuole nominare ${p.primary} con parole semplici e un calendario realistico.`,
    (p) => `La seduta resta breve nella forma e precisa su ciò che ${p.primary} chiede di decidere.`,
    (p) => `${p.first} viene chiamato quando ${p.primary} occupa troppo spazio e il tema può rimettere ordine.`,
  ],
};

const PERSONA_INTRO = {
  fr: (p) => `Tu es ${p.first} ${p.last}, astrologue, ${p.age} ans. Tu parles français, en tutoyant, d'une manière ${p.stylePhrase}. Tes domaines : ${p.specs}. Tu consultes depuis ${p.years} ans.`,
  en: (p) => `You are ${p.first} ${p.last}, an astrologer, ${p.age} years old. You speak English, in a ${p.stylePhrase} way. Your areas: ${p.specs}. You have been consulting for ${p.years} years.`,
  es: (p) => `Eres ${p.first} ${p.last}, astrólogo o astróloga, ${p.age} años. Hablas español, de tú, de una manera ${p.stylePhrase}. Tus ámbitos: ${p.specs}. Consultas desde hace ${p.years} años.`,
  de: (p) => `Du bist ${p.first} ${p.last}, Astrologe oder Astrologin, ${p.age} Jahre alt. Du sprichst Deutsch, per Du, auf eine ${p.stylePhrase} Art. Deine Gebiete: ${p.specs}. Du berätst seit ${p.years} Jahren.`,
  it: (p) => `Sei ${p.first} ${p.last}, astrologo o astrologa, ${p.age} anni. Parli italiano, dando del tu, in modo ${p.stylePhrase}. I tuoi ambiti: ${p.specs}. Consulti da ${p.years} anni.`,
};

const PERSONA_RULES = {
  fr: (p) => `Manière de consulter :
- Tu salues par le prénom, tu dis en une phrase comment tu lis un thème, puis tu poses une seule question ouverte.
- Tu parles comme au téléphone : phrases courtes, une idée à la fois.
- Tu cites un ou deux facteurs du thème, pas la carte entière.
- Tu proposes une piste pour les sept prochains jours.
- ${p.signature}

Tu restes ${p.first} ${p.last} pendant toute la séance. Si l'on te demande comment se déroule la consultation, tu réponds que c'est une consultation vocale à distance avec toi, ${p.first}.
Tu ne donnes aucun conseil médical, juridique ou d'investissement. Tu ne promets pas un résultat certain.
${p.second}`,
  en: (p) => `How you consult:
- Greet them by first name, say in one sentence how you read a chart, then ask one open question.
- Speak as on the phone: short sentences, one idea at a time.
- Name one or two chart factors, not the whole chart.
- Offer one step for the next seven days.
- ${p.signature}

You remain ${p.first} ${p.last} for the whole session. If asked how the consultation works, say it is a remote voice consultation with you, ${p.first}.
Give no medical, legal, or investment advice. Promise no certain outcome.
${p.second}`,
  es: (p) => `Manera de consultar:
- Saluda por el nombre, di en una frase cómo lees una carta, luego haz una sola pregunta abierta.
- Habla como por teléfono: frases cortas, una idea cada vez.
- Cita uno o dos factores de la carta, no el mapa entero.
- Propón una pista para los siete días siguientes.
- ${p.signature}

Sigues siendo ${p.first} ${p.last} durante toda la sesión. Si preguntan cómo es la consulta, responde que es una consulta de voz a distancia contigo, ${p.first}.
No des consejos médicos, jurídicos ni de inversión. No prometas un resultado seguro.
${p.second}`,
  de: (p) => `So verläuft die Beratung:
- Begrüße mit dem Vornamen, sag in einem Satz, wie du ein Horoskop liest, dann stelle eine offene Frage.
- Sprich wie am Telefon: kurze Sätze, ein Gedanke nach dem anderen.
- Nenne ein oder zwei Faktoren, nicht die ganze Karte.
- Schlage einen Schritt für die nächsten sieben Tage vor.
- ${p.signature}

Du bleibst ${p.first} ${p.last} während der ganzen Sitzung. Wenn jemand fragt, wie die Beratung abläuft, sagst du, es ist ein Ferngespräch per Stimme mit dir, ${p.first}.
Keine medizinischen, rechtlichen oder Anlage-Ratschläge. Kein sicheres Ergebnis versprechen.
${p.second}`,
  it: (p) => `Modo di consultare:
- Saluta per nome, di' in una frase come leggi un tema, poi fai una sola domanda aperta.
- Parla come al telefono: frasi corte, un'idea alla volta.
- Cita uno o due fattori del tema, non l'intera carta.
- Proponi una pista per i sette giorni seguenti.
- ${p.signature}

Resti ${p.first} ${p.last} per tutta la seduta. Se chiedono come si svolge la consulenza, rispondi che è una consulenza vocale a distanza con te, ${p.first}.
Non dare consigli medici, legali o di investimento. Non promettere un esito certo.
${p.second}`,
};

const SECOND_LINE = {
  fr: {
    en: 'Si la personne te parle en anglais, tu peux continuer dans cette langue, avec la même tenue.',
  },
  en: {
    es: 'If the person speaks Spanish, you may continue in that language, with the same manner.',
  },
  es: {
    en: 'Si la persona te habla en inglés, puedes seguir en ese idioma, con la misma manera.',
  },
  de: {
    en: 'Wenn die Person Englisch spricht, kannst du in dieser Sprache weitergehen, mit derselben Haltung.',
  },
  it: {
    fr: 'Se la persona ti parla in francese, puoi continuare in quella lingua, con lo stesso modo.',
  },
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

function shuffle(rand, list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function yearsOf(age, rand) {
  const started = 23 + Math.floor(rand() * 8);
  return Math.max(4, age - started);
}

function ageOf(rand) {
  const r = rand();
  if (r < 0.12) return 28 + Math.floor(rand() * 7);
  if (r < 0.72) return 35 + Math.floor(rand() * 25);
  if (r < 0.92) return 60 + Math.floor(rand() * 16);
  return 76 + Math.floor(rand() * 10);
}

function slugify(first, last) {
  return `${first}-${last}`
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sqlText(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlArray(values) {
  return `ARRAY[${values.map(sqlText).join(', ')}]::text[]`;
}

function uuid(n) {
  return `ad000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;
}

function featuredSet(count, howMany) {
  const step = Math.max(1, Math.floor(count / howMany));
  const set = new Set();
  for (let i = 0; i < howMany; i += 1) set.add(Math.min(count - 1, i * step));
  return set;
}

function buildPeople() {
  const rand = mulberry32(20261003);
  const people = [];
  const usedSlugs = new Set();
  let serial = 1;

  for (const [lang, count, featuredCount] of QUOTAS) {
    const pool = NAMES[lang];
    const featured = featuredSet(count, featuredCount);
    const femmeFirst = shuffle(rand, pool.femme);
    const hommeFirst = shuffle(rand, pool.homme);
    const lasts = shuffle(rand, pool.last);
    let femmeCursor = 0;
    let hommeCursor = 0;

    for (let i = 0; i < count; i += 1) {
      const gender = rand() < 0.52 ? 'femme' : 'homme';
      const firsts = gender === 'femme' ? femmeFirst : hommeFirst;
      const cursor = gender === 'femme' ? femmeFirst.length : hommeFirst.length;
      const index = gender === 'femme' ? femmeCursor++ : hommeCursor++;
      const first = firsts[index % cursor];
      let last = lasts[(i + (gender === 'femme' ? 0 : 3)) % lasts.length];
      let slug = slugify(first, last);
      let guard = 0;
      while (usedSlugs.has(slug) && guard < lasts.length) {
        last = lasts[(i + guard + 7) % lasts.length];
        slug = slugify(first, last);
        guard += 1;
      }
      if (usedSlugs.has(slug)) slug = `${slug}-${serial}`;
      usedSlugs.add(slug);

      const age = ageOf(rand);
      const years = yearsOf(age, rand);
      const style = STYLES[Math.floor(rand() * STYLES.length)];
      const specCount = age >= 52 && rand() < 0.55 ? 3 : rand() < 0.28 ? 3 : 2;
      const specialties = shuffle(rand, SPECIALTIES).slice(0, specCount);
      const languages = [lang];
      if (i % 5 === 0) languages.push(SECOND[lang]);
      const isFeatured = featured.has(i);
      const daily = isFeatured ? 3 + (i % 3) : 8 + (i % 5);
      const voice = VOICES[gender][i % VOICES[gender].length];
      const specs = specialties.join(', ');
      const ctx = {
        first,
        last,
        age,
        years,
        specs,
        primary: specialties[0],
        stylePhrase: STYLE_PHRASE[style][lang],
        signature: SIGNATURES[lang][i % SIGNATURES[lang].length],
        second: languages.length > 1 ? SECOND_LINE[lang][languages[1]] : '',
      };
      const opening = OPENINGS[lang][i % OPENINGS[lang].length](ctx);
      const method = METHOD[lang][i % METHOD[lang].length](ctx);
      const closing = CLOSING[lang][(i * 3) % CLOSING[lang].length](ctx);
      const bio = [opening, method, ctx.signature, closing].join(' ');
      const persona = `${PERSONA_INTRO[lang](ctx)}\n\n${PERSONA_RULES[lang](ctx)}`.trim();

      people.push({
        id: uuid(serial),
        slug,
        first,
        last,
        age,
        gender,
        languages,
        specialties,
        style,
        bio,
        voice,
        persona,
        featured: isFeatured,
        daily,
        lang,
      });
      serial += 1;
    }
  }
  return people;
}

const FORBIDDEN = /\b(ia|ai|chatbot|bot|grok|xai|intelligence artificielle)\b/i;

function assertCatalog(people) {
  if (people.length !== 150) throw new Error(`expected 150, got ${people.length}`);
  const byLang = {};
  for (const person of people) {
    byLang[person.lang] = (byLang[person.lang] || 0) + 1;
    if (person.age < 28 || person.age > 85) throw new Error(`age ${person.age}`);
    if (person.languages.length < 1 || person.languages.length > 2) throw new Error('languages');
    if (person.languages[0] !== person.lang) throw new Error('primary language');
    const allowed = VOICES[person.gender];
    if (!allowed.includes(person.voice)) throw new Error(`voice ${person.voice}`);
    const sentences = person.bio.split(/(?<=\.)\s+/).filter(Boolean);
    if (sentences.length < 3 || sentences.length > 4) {
      throw new Error(`bio sentences ${sentences.length}: ${person.bio}`);
    }
    if (FORBIDDEN.test(person.bio) || FORBIDDEN.test(person.persona)) {
      throw new Error(`forbidden word in ${person.slug}`);
    }
    if (person.featured && person.daily > 6) throw new Error('featured capacity');
    if (!person.featured && person.daily < 8) throw new Error('regular capacity');
  }
  const expected = { fr: 40, en: 40, es: 30, de: 20, it: 20 };
  for (const [lang, n] of Object.entries(expected)) {
    if (byLang[lang] !== n) throw new Error(`${lang} ${byLang[lang]}`);
  }
}

function render(people) {
  const values = people
    .map(
      (p) => `  (${[
        sqlText(p.id),
        sqlText(p.slug),
        sqlText(p.first),
        sqlText(p.last),
        p.age,
        sqlText(p.gender),
        sqlArray(p.languages),
        sqlArray(p.specialties),
        sqlText(p.style),
        sqlText(p.bio),
        'NULL',
        sqlText(p.voice),
        sqlText(p.persona),
        'true',
        p.featured ? 'true' : 'false',
        p.daily,
      ].join(', ')})`
    )
    .join(',\n');

  return `-- Conseillers Callastral (150) — schéma callastral uniquement.
-- FR 40, EN 40, ES 30, DE 20, IT 20.
-- photo_url reste NULL : les portraits sont ajoutés à part.
-- RLS activé, aucune policy anon/authenticated, droits réservés à service_role.
-- Après application : exposer le schéma callastral dans l'API Data si ce n'est pas déjà fait
-- (voir le commentaire en tête de supabase-schema.sql).

BEGIN;

CREATE TABLE IF NOT EXISTS callastral.advisors (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  age integer NOT NULL CHECK (age BETWEEN 28 AND 85),
  gender text NOT NULL CHECK (gender IN ('femme', 'homme')),
  languages text[] NOT NULL CHECK (cardinality(languages) BETWEEN 1 AND 2),
  specialties text[] NOT NULL CHECK (cardinality(specialties) >= 1),
  reading_style text NOT NULL,
  bio text NOT NULL,
  photo_url text,
  voice_id text NOT NULL CHECK (voice_id IN ('ara', 'eve', 'leo', 'rex', 'sal')),
  persona_prompt text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  daily_capacity integer NOT NULL CHECK (daily_capacity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS advisors_active_idx ON callastral.advisors (active);
CREATE INDEX IF NOT EXISTS advisors_featured_idx ON callastral.advisors (featured);
CREATE INDEX IF NOT EXISTS advisors_languages_idx ON callastral.advisors USING gin (languages);
CREATE INDEX IF NOT EXISTS advisors_specialties_idx ON callastral.advisors USING gin (specialties);

ALTER TABLE callastral.advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.advisors FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE callastral.advisors FROM PUBLIC;
REVOKE ALL ON TABLE callastral.advisors FROM anon;
REVOKE ALL ON TABLE callastral.advisors FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.advisors TO service_role;

INSERT INTO callastral.advisors (
  id, slug, first_name, last_name, age, gender, languages, specialties,
  reading_style, bio, photo_url, voice_id, persona_prompt, active, featured, daily_capacity
) VALUES
${values}
ON CONFLICT (id) DO NOTHING;

COMMIT;
`;
}

const people = buildPeople();
assertCatalog(people);
writeFileSync(OUT, render(people));
const featured = people.filter((p) => p.featured).length;
console.log(`wrote ${people.length} advisors (${featured} featured) -> ${OUT}`);
