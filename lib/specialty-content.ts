/**
 * Pages thématiques « réponse d’abord » (amour, carrière, compatibilité, argent) et page
 * consultation astrale, en 5 langues. Les prix sont injectés (bande du marché de la langue).
 * Aucune promesse de prédiction ; conseillers virtuels annoncés.
 */
import type { Locale } from './seo';

export type AnswerTopic = 'amour' | 'carrière' | 'compatibilité' | 'argent';
export const ANSWER_TOPICS: AnswerTopic[] = ['amour', 'carrière', 'compatibilité', 'argent'];

export interface PriceFacts {
  floor: string;
  ceiling: string;
  introMinutes: number;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface AnswerContent {
  answer: string;
  points: string[];
  faqs: Faq[];
}

interface TopicText {
  answer: string;
  points: string[];
  faqs: Faq[];
}

const TOPICS: Record<Locale, Record<AnswerTopic, TopicText>> = {
  fr: {
    amour: {
      answer: 'Une consultation d’astrologie amoureuse lit votre thème natal pour éclairer votre façon d’aimer, vos besoins dans le couple et les périodes de rencontre ou de remise en question. Elle s’appuie surtout sur Vénus, la Lune, Mars et la maison 7, et sur les transits du moment.',
      points: [
        'Comprendre un schéma amoureux qui se répète.',
        'Savoir quelles périodes des prochains mois sont plus propices aux rencontres ou aux discussions.',
        'Mettre des mots sur ce dont vous avez besoin dans une relation.',
      ],
      faqs: [
        { question: 'L’astrologie peut-elle dire si je vais retrouver mon ex ?', answer: 'Non, aucune lecture ne garantit un événement. Le conseiller peut en revanche éclairer la dynamique de la relation, vos besoins et les périodes plus favorables pour une discussion.' },
        { question: 'Faut-il connaître son heure de naissance pour une lecture amoureuse ?', answer: 'C’est mieux, car la maison 7 et l’Ascendant en dépendent. Sans heure, la lecture reste utile sur Vénus, la Lune et Mars, avec plus de prudence sur les maisons.' },
      ],
    },
    carrière: {
      answer: 'Une consultation d’astrologie professionnelle lit votre thème natal pour éclairer vos talents, votre façon de travailler et les périodes propices aux changements. Elle s’appuie surtout sur le Milieu du Ciel, les maisons 6 et 10, Saturne et Jupiter, et sur les transits en cours.',
      points: [
        'Faire le point avant une reconversion, une négociation ou un nouveau poste.',
        'Repérer les périodes favorables pour lancer un projet.',
        'Comprendre une tension récurrente au travail.',
      ],
      faqs: [
        { question: 'L’astrologie peut-elle me dire quel métier choisir ?', answer: 'Elle ne décide pas à votre place. Elle met en avant des aptitudes et des motivations lues dans le thème, que vous confrontez ensuite à votre expérience et à vos contraintes.' },
        { question: 'Est-ce un conseil en orientation ou en recrutement ?', answer: 'Non. C’est une lecture symbolique de votre thème. Pour une décision importante, croisez-la avec l’avis d’un professionnel de l’orientation ou des ressources humaines.' },
      ],
    },
    compatibilité: {
      answer: 'Une consultation de compatibilité compare deux thèmes natals (synastrie) pour montrer où deux personnes se complètent et où elles se heurtent. Elle regarde surtout le Soleil, la Lune, Vénus, Mars, Mercure et les aspects entre les deux thèmes ; il faut les données de naissance des deux personnes.',
      points: [
        'Comprendre vos points de friction et comment les apaiser.',
        'Voir comment chacun exprime ses émotions et communique.',
        'Fonctionne aussi pour une relation amicale, familiale ou professionnelle.',
      ],
      faqs: [
        { question: 'Les signes solaires suffisent-ils pour savoir si on est compatibles ?', answer: 'Non. Le signe solaire n’est qu’un point du thème. Une vraie synastrie compare l’ensemble des planètes et leurs aspects ; c’est ce que fait la consultation.' },
        { question: 'Faut-il l’accord de l’autre personne ?', answer: 'Il faut ses date, heure et lieu de naissance. Partagez-les seulement si cette personne est d’accord : ce sont des données personnelles.' },
      ],
    },
    argent: {
      answer: 'Une consultation d’astrologie sur l’argent lit votre thème natal pour éclairer votre rapport à l’argent, à la sécurité et à votre valeur. Elle s’appuie surtout sur les maisons 2 et 8, Vénus, Jupiter et Saturne, et sur les transits en cours ; elle ne remplace pas un conseil financier.',
      points: [
        'Comprendre vos habitudes de dépense et d’épargne.',
        'Préparer une négociation de salaire ou de tarifs.',
        'Repérer les périodes où une décision mérite plus de prudence.',
      ],
      faqs: [
        { question: 'L’astrologie peut-elle me dire quoi acheter ou dans quoi investir ?', answer: 'Non. Les conseillers ne donnent aucune recommandation financière ni d’investissement. Ils proposent une lecture symbolique de votre rapport à l’argent.' },
        { question: 'Quelle maison parle de l’argent dans le thème ?', answer: 'La maison 2 décrit les ressources personnelles et la valeur que l’on s’accorde ; la maison 8 parle des ressources partagées, des dettes et des héritages.' },
      ],
    },
  },
  en: {
    amour: {
      answer: 'A love astrology reading uses your birth chart to shed light on how you love, what you need in a relationship and which periods favour meeting someone or taking stock. It focuses on Venus, the Moon, Mars and the 7th house, plus current transits.',
      points: [
        'Understand a relationship pattern that keeps repeating.',
        'See which periods in the coming months favour meeting someone or talking things through.',
        'Put words on what you need from a partner.',
      ],
      faqs: [
        { question: 'Can astrology tell me if my ex will come back?', answer: 'No reading can guarantee an event. The advisor can shed light on the relationship dynamic, your needs and the periods better suited to a conversation.' },
        { question: 'Do I need my birth time for a love reading?', answer: 'It helps, because the 7th house and the Ascendant depend on it. Without it, the reading is still useful on Venus, the Moon and Mars, with more caution on houses.' },
      ],
    },
    carrière: {
      answer: 'A career astrology reading uses your birth chart to highlight your strengths, how you work and which periods favour change. It focuses on the Midheaven, the 6th and 10th houses, Saturn and Jupiter, plus current transits.',
      points: [
        'Take stock before a career change, negotiation or new role.',
        'Spot good periods to launch a project.',
        'Understand a recurring tension at work.',
      ],
      faqs: [
        { question: 'Can astrology tell me which job to choose?', answer: 'It doesn’t decide for you. It highlights abilities and motivations read in your chart, which you then weigh against your experience and constraints.' },
        { question: 'Is this career counselling?', answer: 'No. It is a symbolic reading of your chart. For a big decision, combine it with advice from a career professional.' },
      ],
    },
    compatibilité: {
      answer: 'A compatibility reading compares two birth charts (synastry) to show where two people complement each other and where they clash. It looks at the Sun, Moon, Venus, Mars, Mercury and the aspects between both charts; you need both people’s birth data.',
      points: [
        'Understand your friction points and how to ease them.',
        'See how each of you expresses emotions and communicates.',
        'Works for friendships, family and work relationships too.',
      ],
      faqs: [
        { question: 'Are Sun signs enough to know if we are compatible?', answer: 'No. The Sun sign is just one point in the chart. Real synastry compares all planets and their aspects, which is what the reading does.' },
        { question: 'Do I need the other person’s consent?', answer: 'You need their date, time and place of birth. Only share them if that person agrees: this is personal data.' },
      ],
    },
    argent: {
      answer: 'A money astrology reading uses your birth chart to shed light on your relationship with money, security and self-worth. It focuses on the 2nd and 8th houses, Venus, Jupiter and Saturn, plus current transits; it is not financial advice.',
      points: [
        'Understand your spending and saving habits.',
        'Prepare a salary or rate negotiation.',
        'Spot periods when a decision deserves extra care.',
      ],
      faqs: [
        { question: 'Can astrology tell me what to buy or invest in?', answer: 'No. Advisors give no financial or investment recommendations. They offer a symbolic reading of your relationship with money.' },
        { question: 'Which house is about money in the chart?', answer: 'The 2nd house describes personal resources and self-worth; the 8th house covers shared resources, debts and inheritances.' },
      ],
    },
  },
  es: {
    amour: {
      answer: 'Una consulta de astrología del amor lee tu carta natal para aclarar tu forma de amar, lo que necesitas en pareja y los periodos de encuentros o de replanteamiento. Se basa sobre todo en Venus, la Luna, Marte y la casa 7, y en los tránsitos actuales.',
      points: ['Entender un patrón amoroso que se repite.', 'Saber qué periodos próximos favorecen encuentros o conversaciones.', 'Poner palabras a lo que necesitas en una relación.'],
      faqs: [
        { question: '¿Puede la astrología decirme si volveré con mi ex?', answer: 'Ninguna lectura garantiza un hecho. El consejero puede aclarar la dinámica de la relación, tus necesidades y los periodos más propicios para hablar.' },
        { question: '¿Necesito mi hora de nacimiento?', answer: 'Es mejor, porque la casa 7 y el Ascendente dependen de ella. Sin hora, la lectura sigue siendo útil sobre Venus, la Luna y Marte.' },
      ],
    },
    carrière: {
      answer: 'Una consulta de astrología profesional lee tu carta natal para destacar tus talentos, tu forma de trabajar y los periodos propicios para cambiar. Se basa en el Medio Cielo, las casas 6 y 10, Saturno y Júpiter, y en los tránsitos actuales.',
      points: ['Hacer balance antes de un cambio, una negociación o un nuevo puesto.', 'Detectar buenos periodos para lanzar un proyecto.', 'Entender una tensión recurrente en el trabajo.'],
      faqs: [
        { question: '¿Puede la astrología decirme qué profesión elegir?', answer: 'No decide por ti. Destaca aptitudes y motivaciones de tu carta, que luego contrastas con tu experiencia.' },
        { question: '¿Es orientación profesional?', answer: 'No. Es una lectura simbólica. Para una decisión importante, combínala con el consejo de un profesional.' },
      ],
    },
    compatibilité: {
      answer: 'Una consulta de compatibilidad compara dos cartas natales (sinastría) para mostrar dónde dos personas se complementan y dónde chocan. Mira el Sol, la Luna, Venus, Marte, Mercurio y los aspectos entre ambas cartas; hacen falta los datos de nacimiento de las dos personas.',
      points: ['Entender vuestros roces y cómo suavizarlos.', 'Ver cómo cada uno expresa emociones y se comunica.', 'Sirve también para amistad, familia o trabajo.'],
      faqs: [
        { question: '¿Bastan los signos solares?', answer: 'No. El signo solar es solo un punto de la carta. Una sinastría compara todos los planetas y sus aspectos.' },
        { question: '¿Necesito el permiso de la otra persona?', answer: 'Necesitas su fecha, hora y lugar de nacimiento. Compártelos solo si está de acuerdo: son datos personales.' },
      ],
    },
    argent: {
      answer: 'Una consulta de astrología sobre el dinero lee tu carta natal para aclarar tu relación con el dinero, la seguridad y tu valor. Se basa en las casas 2 y 8, Venus, Júpiter y Saturno, y en los tránsitos actuales; no sustituye un asesoramiento financiero.',
      points: ['Entender tus hábitos de gasto y ahorro.', 'Preparar una negociación de salario o tarifas.', 'Detectar periodos en los que una decisión pide más prudencia.'],
      faqs: [
        { question: '¿Puede decirme en qué invertir?', answer: 'No. Los consejeros no dan recomendaciones financieras ni de inversión.' },
        { question: '¿Qué casa habla del dinero?', answer: 'La casa 2 describe los recursos propios y el valor personal; la casa 8, los recursos compartidos, deudas y herencias.' },
      ],
    },
  },
  de: {
    amour: {
      answer: 'Eine Liebes-Astrologieberatung deutet Ihr Geburtshoroskop, um zu zeigen, wie Sie lieben, was Sie in einer Partnerschaft brauchen und welche Phasen für Begegnungen oder Klärungen günstig sind. Im Mittelpunkt stehen Venus, Mond, Mars und das 7. Haus sowie die aktuellen Transite.',
      points: ['Ein sich wiederholendes Beziehungsmuster verstehen.', 'Sehen, welche Phasen der nächsten Monate Begegnungen oder Gespräche begünstigen.', 'Benennen, was Sie in einer Beziehung brauchen.'],
      faqs: [
        { question: 'Kann Astrologie sagen, ob mein Ex zurückkommt?', answer: 'Keine Deutung garantiert ein Ereignis. Der Berater kann die Beziehungsdynamik, Ihre Bedürfnisse und günstige Zeiten für ein Gespräch beleuchten.' },
        { question: 'Brauche ich meine Geburtszeit?', answer: 'Sie hilft, denn das 7. Haus und der Aszendent hängen davon ab. Ohne Uhrzeit bleibt die Deutung zu Venus, Mond und Mars nützlich.' },
      ],
    },
    carrière: {
      answer: 'Eine Karriere-Astrologieberatung deutet Ihr Geburtshoroskop, um Stärken, Arbeitsweise und günstige Phasen für Veränderungen zu zeigen. Im Mittelpunkt stehen das Medium Coeli, das 6. und 10. Haus, Saturn und Jupiter sowie die aktuellen Transite.',
      points: ['Bilanz ziehen vor einem Wechsel, einer Verhandlung oder einer neuen Stelle.', 'Günstige Zeiten für ein Projekt erkennen.', 'Eine wiederkehrende Spannung im Job verstehen.'],
      faqs: [
        { question: 'Kann Astrologie mir sagen, welchen Beruf ich wählen soll?', answer: 'Sie entscheidet nicht für Sie. Sie zeigt Fähigkeiten und Motivationen aus dem Horoskop, die Sie mit Ihrer Erfahrung abgleichen.' },
        { question: 'Ist das eine Berufsberatung?', answer: 'Nein. Es ist eine symbolische Deutung. Für wichtige Entscheidungen holen Sie zusätzlich fachlichen Rat ein.' },
      ],
    },
    compatibilité: {
      answer: 'Eine Partnerschaftsanalyse vergleicht zwei Geburtshoroskope (Synastrie) und zeigt, wo sich zwei Menschen ergänzen und wo sie aneinandergeraten. Betrachtet werden Sonne, Mond, Venus, Mars, Merkur und die Aspekte zwischen beiden Horoskopen; nötig sind die Geburtsdaten beider Personen.',
      points: ['Reibungspunkte verstehen und entschärfen.', 'Sehen, wie jeder Gefühle ausdrückt und kommuniziert.', 'Auch für Freundschaft, Familie oder Beruf.'],
      faqs: [
        { question: 'Reichen die Sonnenzeichen?', answer: 'Nein. Das Sonnenzeichen ist nur ein Punkt im Horoskop. Eine Synastrie vergleicht alle Planeten und ihre Aspekte.' },
        { question: 'Brauche ich das Einverständnis der anderen Person?', answer: 'Sie brauchen Datum, Uhrzeit und Ort ihrer Geburt. Teilen Sie diese nur mit ihrem Einverständnis: es sind personenbezogene Daten.' },
      ],
    },
    argent: {
      answer: 'Eine Astrologieberatung zum Thema Geld deutet Ihr Geburtshoroskop, um Ihr Verhältnis zu Geld, Sicherheit und Selbstwert zu beleuchten. Im Mittelpunkt stehen das 2. und 8. Haus, Venus, Jupiter und Saturn sowie die aktuellen Transite; sie ersetzt keine Finanzberatung.',
      points: ['Ausgabe- und Spargewohnheiten verstehen.', 'Eine Gehalts- oder Preisverhandlung vorbereiten.', 'Phasen erkennen, in denen eine Entscheidung mehr Vorsicht verdient.'],
      faqs: [
        { question: 'Kann Astrologie sagen, worin ich investieren soll?', answer: 'Nein. Die Berater geben keine Finanz- oder Anlageempfehlungen.' },
        { question: 'Welches Haus steht für Geld?', answer: 'Das 2. Haus beschreibt eigene Ressourcen und Selbstwert; das 8. Haus gemeinsame Ressourcen, Schulden und Erbschaften.' },
      ],
    },
  },
  it: {
    amour: {
      answer: 'Un consulto di astrologia dell’amore legge il tuo tema natale per chiarire come ami, di cosa hai bisogno in coppia e quali periodi favoriscono incontri o chiarimenti. Si basa su Venere, Luna, Marte e casa 7, e sui transiti attuali.',
      points: ['Capire uno schema amoroso che si ripete.', 'Sapere quali periodi dei prossimi mesi favoriscono incontri o dialoghi.', 'Dare un nome a ciò di cui hai bisogno in una relazione.'],
      faqs: [
        { question: 'L’astrologia può dirmi se il mio ex tornerà?', answer: 'Nessuna lettura garantisce un evento. Il consulente può chiarire la dinamica della relazione, i tuoi bisogni e i periodi più adatti per parlarsi.' },
        { question: 'Serve l’ora di nascita?', answer: 'Aiuta, perché casa 7 e Ascendente ne dipendono. Senza ora, la lettura resta utile su Venere, Luna e Marte.' },
      ],
    },
    carrière: {
      answer: 'Un consulto di astrologia professionale legge il tuo tema natale per evidenziare talenti, modo di lavorare e periodi propizi al cambiamento. Si basa su Medio Cielo, case 6 e 10, Saturno e Giove, e sui transiti attuali.',
      points: ['Fare il punto prima di un cambio, una trattativa o un nuovo ruolo.', 'Individuare periodi favorevoli per lanciare un progetto.', 'Capire una tensione ricorrente sul lavoro.'],
      faqs: [
        { question: 'L’astrologia può dirmi che lavoro scegliere?', answer: 'Non decide al posto tuo. Mette in luce attitudini e motivazioni del tema, da confrontare con la tua esperienza.' },
        { question: 'È orientamento professionale?', answer: 'No. È una lettura simbolica. Per decisioni importanti affiancala al parere di un professionista.' },
      ],
    },
    compatibilité: {
      answer: 'Un consulto di compatibilità confronta due temi natali (sinastria) per mostrare dove due persone si completano e dove si scontrano. Guarda Sole, Luna, Venere, Marte, Mercurio e gli aspetti tra i due temi; servono i dati di nascita di entrambi.',
      points: ['Capire gli attriti e come attenuarli.', 'Vedere come ciascuno esprime emozioni e comunica.', 'Vale anche per amicizia, famiglia o lavoro.'],
      faqs: [
        { question: 'Bastano i segni solari?', answer: 'No. Il segno solare è solo un punto del tema. Una sinastria confronta tutti i pianeti e i loro aspetti.' },
        { question: 'Serve il consenso dell’altra persona?', answer: 'Servono data, ora e luogo di nascita. Condividili solo se è d’accordo: sono dati personali.' },
      ],
    },
    argent: {
      answer: 'Un consulto di astrologia sul denaro legge il tuo tema natale per chiarire il rapporto con denaro, sicurezza e autostima. Si basa su case 2 e 8, Venere, Giove e Saturno, e sui transiti attuali; non sostituisce una consulenza finanziaria.',
      points: ['Capire abitudini di spesa e risparmio.', 'Preparare una trattativa su stipendio o tariffe.', 'Individuare periodi in cui una decisione richiede più prudenza.'],
      faqs: [
        { question: 'Può dirmi in cosa investire?', answer: 'No. I consulenti non danno raccomandazioni finanziarie o di investimento.' },
        { question: 'Quale casa parla del denaro?', answer: 'La casa 2 descrive risorse personali e autostima; la casa 8 risorse condivise, debiti ed eredità.' },
      ],
    },
  },
};

function commonFaqs(locale: Locale, p: PriceFacts): Faq[] {
  const n = p.introMinutes;
  switch (locale) {
    case 'en':
      return [
        { question: 'How much does a reading by phone cost?', answer: `Each advisor has their own rate, from ${p.floor} to ${p.ceiling} per minute in this market, with a reduced rate for the first ${n} minutes. The exact price for your country is shown before payment and that is the amount charged.` },
        { question: 'Are the advisors human?', answer: 'No. Callastral advisors are virtual advisors with a computer-generated voice; this is stated before and at the start of every call.' },
        { question: 'Can I get a refund?', answer: `Yes, once per account: if a paid call ends within the first ${n} billed minutes, request a refund from your account within 24 hours. Bookings cancelled more than 24 hours ahead are refunded; after that you get a 30-day credit.` },
      ];
    case 'es':
      return [
        { question: '¿Cuánto cuesta una consulta por teléfono?', answer: `Cada consejero tiene su tarifa, de ${p.floor} a ${p.ceiling} por minuto en este mercado, con tarifa reducida los ${n} primeros minutos. El precio exacto para tu país se muestra antes del pago y es el que se cobra.` },
        { question: '¿Los consejeros son humanos?', answer: 'No. Son consejeros virtuales con voz generada por ordenador; se indica antes y al inicio de cada llamada.' },
        { question: '¿Puedo pedir un reembolso?', answer: `Sí, una vez por cuenta: si una llamada pagada termina dentro de los ${n} primeros minutos facturados, pide el reembolso desde tu cuenta en 24 horas. Las reservas canceladas con más de 24 h se reembolsan; después, crédito válido 30 días.` },
      ];
    case 'de':
      return [
        { question: 'Was kostet eine telefonische Beratung?', answer: `Jeder Berater hat seinen eigenen Tarif, in diesem Markt von ${p.floor} bis ${p.ceiling} pro Minute, mit ermäßigtem Tarif in den ersten ${n} Minuten. Der genaue Preis für Ihr Land wird vor der Zahlung angezeigt und genau dieser wird berechnet.` },
        { question: 'Sind die Berater Menschen?', answer: 'Nein. Es sind virtuelle Berater mit computergenerierter Stimme; das wird vor und zu Beginn jedes Gesprächs angegeben.' },
        { question: 'Kann ich eine Erstattung erhalten?', answer: `Ja, einmal pro Konto: Endet ein bezahltes Gespräch innerhalb der ersten ${n} abgerechneten Minuten, beantragen Sie die Erstattung binnen 24 Stunden in Ihrem Konto. Buchungen, die mehr als 24 h vorher storniert werden, werden erstattet; danach gibt es ein 30 Tage gültiges Guthaben.` },
      ];
    case 'it':
      return [
        { question: 'Quanto costa un consulto telefonico?', answer: `Ogni consulente ha la sua tariffa, da ${p.floor} a ${p.ceiling} al minuto in questo mercato, con tariffa ridotta per i primi ${n} minuti. Il prezzo esatto per il tuo paese è indicato prima del pagamento ed è quello addebitato.` },
        { question: 'I consulenti sono persone?', answer: 'No. Sono consulenti virtuali con voce generata al computer; è indicato prima e all’inizio di ogni chiamata.' },
        { question: 'Posso essere rimborsato?', answer: `Sì, una volta per account: se una chiamata pagata finisce entro i primi ${n} minuti fatturati, chiedi il rimborso dal tuo account entro 24 ore. Le prenotazioni annullate con più di 24 h di anticipo sono rimborsate; dopo, credito valido 30 giorni.` },
      ];
    default:
      return [
        { question: 'Combien coûte une consultation par téléphone ?', answer: `Chaque conseiller a son tarif, de ${p.floor} à ${p.ceiling} la minute sur ce marché, avec un tarif réduit les ${n} premières minutes. Le prix exact pour votre pays est affiché avant le paiement, et c’est ce montant qui est encaissé.` },
        { question: 'Les conseillers sont-ils humains ?', answer: 'Non. Les conseillers Callastral sont des conseillers virtuels dont la voix est générée par ordinateur ; c’est indiqué avant et au début de chaque appel.' },
        { question: 'Puis-je être remboursé ?', answer: `Oui, une fois par compte : si un appel payé s’arrête dans les ${n} premières minutes facturées, demandez le remboursement depuis votre compte dans les 24 heures. Une réservation annulée plus de 24 h avant est remboursée ; ensuite, avoir valable 30 jours.` },
      ];
  }
}

export function answerContent(locale: Locale, topic: string, prices: PriceFacts): AnswerContent | null {
  if (!(ANSWER_TOPICS as string[]).includes(topic)) return null;
  const text = TOPICS[locale][topic as AnswerTopic];
  return { answer: text.answer, points: text.points, faqs: [...text.faqs, ...commonFaqs(locale, prices)] };
}

/** Page « consultation astrale » (FR) / « astrology reading by phone » (EN). */
export function consultationContent(locale: 'fr' | 'en', prices: PriceFacts) {
  const n = prices.introMinutes;
  if (locale === 'en') {
    return {
      title: 'Astrology reading by phone: how it works and what it costs',
      description: `An astrology reading by phone starts from your birth chart. At Callastral: ${prices.floor} to ${prices.ceiling}/min, reduced rate for the first ${n} minutes, virtual advisors, 24/7.`,
      answer: `An astrology reading by phone is a live conversation in which an advisor reads your birth chart (computed from your date, time and place of birth) and answers your questions on love, work, money or a period of change. At Callastral it costs ${prices.floor} to ${prices.ceiling} per minute depending on the advisor, with a reduced rate for the first ${n} minutes; advisors are virtual and available 24/7.`,
      stepsTitle: 'How it works',
      steps: [
        'Choose an advisor by topic, language and reading style.',
        `Call now or book a time slot; you pay upfront for the chosen length (the price for your country is shown first).`,
        'Join the call from your browser; your birth chart is passed to the advisor at the start.',
        'After the call, you can order a written summary and leave a review.',
      ],
      topicsTitle: 'Topics',
      faqs: [
        { question: 'What is the difference between an astrology reading and a horoscope?', answer: 'A horoscope is written for a whole Sun sign. A reading starts from your own birth chart, with the exact positions of the planets when you were born, and answers your questions.' },
        { question: 'What information do I need?', answer: 'Your date, time and place of birth. If you don’t know your time of birth, the reading is still possible, with more caution on houses and the Ascendant.' },
        ...commonFaqs('en', prices),
      ],
    };
  }
  return {
    title: 'Consultation astrale par téléphone : déroulement et prix',
    description: `Une consultation astrale part de votre thème natal. Chez Callastral : ${prices.floor} à ${prices.ceiling}/min, tarif réduit les ${n} premières minutes, conseillers virtuels, 24 h/24.`,
    answer: `Une consultation astrale est un échange en direct au cours duquel un conseiller lit votre thème natal (calculé à partir de votre date, heure et lieu de naissance) et répond à vos questions sur l’amour, le travail, l’argent ou une période de changement. Chez Callastral, elle coûte de ${prices.floor} à ${prices.ceiling} la minute selon le conseiller, avec un tarif réduit les ${n} premières minutes ; les conseillers sont virtuels et disponibles 24 h/24.`,
    stepsTitle: 'Comment ça marche',
    steps: [
      'Choisissez un conseiller selon le thème, la langue et le style de lecture.',
      'Appelez maintenant ou réservez un créneau ; vous payez d’avance la durée choisie (le prix pour votre pays est affiché avant).',
      'Rejoignez l’appel depuis votre navigateur ; votre thème natal est transmis au conseiller au début.',
      'Après l’appel, vous pouvez commander un résumé écrit et laisser un avis.',
    ],
    topicsTitle: 'Thématiques',
    faqs: [
      { question: 'Quelle différence entre une consultation astrale et un horoscope ?', answer: 'Un horoscope est écrit pour tout un signe solaire. Une consultation part de votre thème natal personnel, avec la position exacte des planètes à votre naissance, et répond à vos questions.' },
      { question: 'De quelles informations ai-je besoin ?', answer: 'Votre date, votre heure et votre lieu de naissance. Sans heure de naissance, la consultation reste possible, avec plus de prudence sur les maisons et l’Ascendant.' },
      ...commonFaqs('fr', prices),
    ],
  };
}
