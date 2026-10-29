import type { PhaseId, ToolLang } from './free-tools';

export interface Faq { q: string; a: string }

export interface CommonCopy {
  home: string;
  callCta: string;
  callNote: string;
  related: string;
  risingTool: string;
  bigThreeTool: string;
  moonTool: string;
  compatTool: string;
  affiliateLink: string;
}

export interface BigThreeCopy {
  title: string;
  description: string;
  h1: string;
  answer: string;
  form: { date: string; time: string; place: string; placePlaceholder: string; submit: string; submitting: string; timeHint: string };
  errors: { DATE: string; PLACE: string; RATE: string; EPHEMERIS: string; FAIL: string };
  sun: string;
  moon: string;
  rising: string;
  sunMeaning: string;
  moonMeaning: string;
  risingMeaning: string;
  element: string;
  modality: string;
  resultNext: string;
  privacy: string;
  howTitle: string;
  how: string[];
  faqTitle: string;
  faq: Faq[];
}

export interface MoonCopy {
  title: string;
  description: string;
  h1: string;
  answer: (sign: string, phase: string, illumination: number) => string;
  inSign: string;
  phase: string;
  illumination: string;
  nextSign: (hours: number, next: string) => string;
  computed: (when: string) => string;
  weekTitle: string;
  day: string;
  phases: Record<PhaseId, string>;
  phaseMeaning: Record<PhaseId, string>;
  meaningTitle: string;
  faqTitle: string;
  faq: Faq[];
}

export interface AffiliateCopy {
  title: string;
  description: string;
  h1: string;
  answer: string;
  points: string[];
  howTitle: string;
  how: string[];
  termsTitle: string;
  terms: string[];
  form: {
    title: string;
    name: string;
    email: string;
    social: string;
    socialPlaceholder: string;
    accept: string;
    submit: string;
    submitting: string;
    done: string;
    yourCode: string;
    yourLink: string;
    copy: string;
    errors: Record<'NAME' | 'EMAIL' | 'SOCIAL' | 'TERMS' | 'EXISTS' | 'RATE' | 'FAIL', string>;
  };
  faqTitle: string;
  faq: Faq[];
}

export const COMMON: Record<ToolLang, CommonCopy> = {
  fr: { home: 'Accueil', callCta: 'Appeler : 3 min offertes', callNote: 'Sans carte pour l’essai de 3 minutes. Ensuite, le tarif minute est affiché avant tout paiement.', related: 'Outils gratuits', risingTool: 'Calcul de l’ascendant', bigThreeTool: 'Thème astral gratuit (Soleil, Lune, ascendant)', moonTool: 'La Lune aujourd’hui', compatTool: 'Compatibilité amoureuse', affiliateLink: 'Programme d’affiliation créateurs' },
  en: { home: 'Home', callCta: 'Call: 3 free minutes', callNote: 'No card needed for the 3-minute trial. After that, the per-minute price is shown before any payment.', related: 'Free tools', risingTool: 'Rising sign calculator', bigThreeTool: 'Free birth chart (Sun, Moon, rising)', moonTool: 'Moon sign today', compatTool: 'Love compatibility', affiliateLink: 'Creator affiliate program' },
  es: { home: 'Inicio', callCta: 'Llamar: 3 min gratis', callNote: 'Sin tarjeta para la prueba de 3 minutos. Después, la tarifa por minuto se muestra antes de pagar.', related: 'Herramientas gratis', risingTool: 'Calcular el ascendente', bigThreeTool: 'Carta astral gratis (Sol, Luna, ascendente)', moonTool: 'La Luna hoy', compatTool: 'Compatibilidad de pareja', affiliateLink: 'Programa de afiliados' },
  de: { home: 'Startseite', callCta: 'Anrufen: 3 Min. gratis', callNote: 'Keine Karte für den 3-Minuten-Test. Danach wird der Minutenpreis vor jeder Zahlung angezeigt.', related: 'Kostenlose Tools', risingTool: 'Aszendent berechnen', bigThreeTool: 'Geburtshoroskop gratis (Sonne, Mond, Aszendent)', moonTool: 'Mond heute', compatTool: 'Partner-Kompatibilität', affiliateLink: 'Partnerprogramm für Creator' },
  it: { home: 'Home', callCta: 'Chiama: 3 min gratis', callNote: 'Nessuna carta per la prova di 3 minuti. Poi la tariffa al minuto è mostrata prima di pagare.', related: 'Strumenti gratuiti', risingTool: 'Calcolo dell’ascendente', bigThreeTool: 'Tema natale gratis (Sole, Luna, ascendente)', moonTool: 'La Luna oggi', compatTool: 'Compatibilità di coppia', affiliateLink: 'Programma di affiliazione' },
};

export const BIG_THREE: Record<ToolLang, BigThreeCopy> = {
  fr: {
    title: 'Thème astral gratuit : Soleil, Lune et ascendant en 1 minute',
    description: 'Calculez gratuitement et sans inscription votre signe solaire, votre signe lunaire et votre ascendant à partir de la date, l’heure et le lieu de naissance.',
    h1: 'Thème astral gratuit : Soleil, Lune, ascendant',
    answer: 'Entrez votre date, votre heure et votre ville de naissance : le calcul donne immédiatement vos trois repères principaux. Le Soleil décrit votre élan de fond, la Lune vos besoins émotionnels, l’ascendant la façon dont on vous perçoit. Gratuit, sans compte, et vos données de naissance ne sont pas enregistrées.',
    form: { date: 'Date de naissance', time: 'Heure de naissance', place: 'Ville de naissance', placePlaceholder: 'Lyon, France', submit: 'Calculer mon thème', submitting: 'Calcul…', timeHint: 'L’heure exacte change l’ascendant (il tourne d’environ un signe toutes les 2 heures).' },
    errors: { DATE: 'Vérifiez la date et l’heure.', PLACE: 'Ville introuvable. Essayez « ville, pays ».', RATE: 'Trop de calculs à la suite. Réessayez dans une minute.', EPHEMERIS: 'Calcul momentanément indisponible.', FAIL: 'Le calcul a échoué. Réessayez.' },
    sun: 'Soleil', moon: 'Lune', rising: 'Ascendant',
    sunMeaning: 'Votre identité profonde, ce qui vous donne de l’énergie.',
    moonMeaning: 'Vos émotions, vos besoins de sécurité, vos réactions spontanées.',
    risingMeaning: 'Votre première impression, votre style, la porte d’entrée du thème.',
    element: 'Élément', modality: 'Mode',
    resultNext: 'Pour relier ces trois signes à votre situation (amour, travail, décision), parlez-en avec une Conseillère ou un Conseiller Callastral.',
    privacy: 'La date, l’heure et le lieu servent uniquement au calcul et ne sont pas conservés.',
    howTitle: 'Comment le calcul fonctionne',
    how: [
      'L’heure locale est convertie en temps universel avec l’heure d’été historique du lieu.',
      'Les positions du Soleil et de la Lune sont calculées avec les éphémérides suisses (zodiaque tropical).',
      'L’ascendant est le degré du zodiaque qui se levait à l’horizon est, à vos coordonnées de naissance.',
    ],
    faqTitle: 'Questions fréquentes',
    faq: [
      { q: 'Le thème astral est-il vraiment gratuit ?', a: 'Oui. Le calcul du Soleil, de la Lune et de l’ascendant est gratuit, sans compte et sans e-mail.' },
      { q: 'Que faire si je ne connais pas mon heure de naissance ?', a: 'Le signe solaire reste fiable, et le signe lunaire l’est la plupart du temps. L’ascendant, lui, demande l’heure : demandez votre acte de naissance intégral en mairie.' },
      { q: 'Pourquoi mon signe solaire diffère-t-il d’un horoscope de magazine ?', a: 'Si vous êtes né à la limite de deux signes, seule la position calculée à la minute près tranche. C’est ce que fait cet outil.' },
    ],
  },
  en: {
    title: 'Free Birth Chart Calculator: Sun, Moon and Rising Sign',
    description: 'Get your Sun sign, Moon sign and rising sign free, with no sign-up, from your birth date, time and place. Instant result, nothing stored.',
    h1: 'Free birth chart: your Sun, Moon and rising sign',
    answer: 'Enter your birth date, time and city and you instantly get your "big three". Your Sun sign is your core drive, your Moon sign is your emotional needs, and your rising sign is how others first see you. Free, no account, and your birth details are not stored.',
    form: { date: 'Birth date', time: 'Birth time', place: 'Birth city', placePlaceholder: 'London, United Kingdom', submit: 'Calculate my chart', submitting: 'Calculating…', timeHint: 'The exact time changes the rising sign (it moves about one sign every 2 hours).' },
    errors: { DATE: 'Check the date and time.', PLACE: 'City not found. Try "city, country".', RATE: 'Too many calculations in a row. Try again in a minute.', EPHEMERIS: 'Calculation temporarily unavailable.', FAIL: 'Calculation failed. Please try again.' },
    sun: 'Sun', moon: 'Moon', rising: 'Rising',
    sunMeaning: 'Your core identity and what energises you.',
    moonMeaning: 'Your emotions, need for safety and instinctive reactions.',
    risingMeaning: 'Your first impression, your style, the doorway to the chart.',
    element: 'Element', modality: 'Mode',
    resultNext: 'To connect these three signs to your situation (love, work, a decision), talk it through with a Callastral advisor.',
    privacy: 'Your date, time and place are only used for the calculation and are not kept.',
    howTitle: 'How the calculation works',
    how: [
      'Your local time is converted to Universal Time using the historical daylight-saving rules of the place.',
      'Sun and Moon positions come from the Swiss Ephemeris (tropical zodiac).',
      'The rising sign is the zodiac degree rising on the eastern horizon at your birth coordinates.',
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'Is this birth chart really free?', a: 'Yes. Sun, Moon and rising sign are calculated free, with no account and no email.' },
      { q: 'What if I do not know my birth time?', a: 'Your Sun sign stays reliable and your Moon sign usually does too. The rising sign needs the time: check your full birth certificate.' },
      { q: 'Why is my Sun sign different from a magazine horoscope?', a: 'If you were born on the cusp of two signs, only the position calculated to the minute decides. That is what this tool does.' },
    ],
  },
  es: {
    title: 'Carta astral gratis: Sol, Luna y ascendente en 1 minuto',
    description: 'Calcula gratis y sin registro tu signo solar, tu signo lunar y tu ascendente con la fecha, hora y lugar de nacimiento.',
    h1: 'Carta astral gratis: Sol, Luna y ascendente',
    answer: 'Introduce tu fecha, hora y ciudad de nacimiento y obtendrás al instante tus tres claves. El Sol describe tu impulso de fondo, la Luna tus necesidades emocionales y el ascendente cómo te perciben. Gratis, sin cuenta, y tus datos de nacimiento no se guardan.',
    form: { date: 'Fecha de nacimiento', time: 'Hora de nacimiento', place: 'Ciudad de nacimiento', placePlaceholder: 'Madrid, España', submit: 'Calcular mi carta', submitting: 'Calculando…', timeHint: 'La hora exacta cambia el ascendente (avanza un signo cada 2 horas aprox.).' },
    errors: { DATE: 'Revisa la fecha y la hora.', PLACE: 'Ciudad no encontrada. Prueba «ciudad, país».', RATE: 'Demasiados cálculos seguidos. Inténtalo en un minuto.', EPHEMERIS: 'Cálculo no disponible por el momento.', FAIL: 'El cálculo falló. Inténtalo de nuevo.' },
    sun: 'Sol', moon: 'Luna', rising: 'Ascendente',
    sunMeaning: 'Tu identidad profunda y lo que te da energía.',
    moonMeaning: 'Tus emociones, tu necesidad de seguridad y tus reacciones espontáneas.',
    risingMeaning: 'Tu primera impresión, tu estilo, la puerta de entrada de la carta.',
    element: 'Elemento', modality: 'Modo',
    resultNext: 'Para relacionar estos tres signos con tu situación (amor, trabajo, una decisión), háblalo con una Consejera o un Consejero de Callastral.',
    privacy: 'La fecha, la hora y el lugar solo sirven para el cálculo y no se conservan.',
    howTitle: 'Cómo funciona el cálculo',
    how: [
      'La hora local se convierte a tiempo universal con el horario de verano histórico del lugar.',
      'Las posiciones del Sol y la Luna se calculan con las efemérides suizas (zodiaco tropical).',
      'El ascendente es el grado del zodiaco que salía por el horizonte este en tus coordenadas de nacimiento.',
    ],
    faqTitle: 'Preguntas frecuentes',
    faq: [
      { q: '¿La carta astral es realmente gratis?', a: 'Sí. El cálculo del Sol, la Luna y el ascendente es gratis, sin cuenta y sin correo.' },
      { q: '¿Y si no sé mi hora de nacimiento?', a: 'El signo solar sigue siendo fiable y el lunar casi siempre. El ascendente necesita la hora: consulta tu partida de nacimiento literal.' },
      { q: '¿Por qué mi signo solar no coincide con el de una revista?', a: 'Si naciste en el límite entre dos signos, solo la posición calculada al minuto decide. Es lo que hace esta herramienta.' },
    ],
  },
  de: {
    title: 'Geburtshoroskop gratis: Sonne, Mond und Aszendent in 1 Minute',
    description: 'Berechne kostenlos und ohne Anmeldung Sonnenzeichen, Mondzeichen und Aszendent aus Geburtsdatum, Uhrzeit und Ort.',
    h1: 'Geburtshoroskop gratis: Sonne, Mond, Aszendent',
    answer: 'Gib Geburtsdatum, Uhrzeit und Geburtsort ein und du erhältst sofort deine drei Hauptzeichen. Die Sonne beschreibt deinen inneren Antrieb, der Mond deine emotionalen Bedürfnisse, der Aszendent, wie andere dich wahrnehmen. Kostenlos, ohne Konto, deine Geburtsdaten werden nicht gespeichert.',
    form: { date: 'Geburtsdatum', time: 'Geburtszeit', place: 'Geburtsort', placePlaceholder: 'Berlin, Deutschland', submit: 'Horoskop berechnen', submitting: 'Berechnung…', timeHint: 'Die genaue Uhrzeit ändert den Aszendenten (etwa ein Zeichen alle 2 Stunden).' },
    errors: { DATE: 'Bitte Datum und Uhrzeit prüfen.', PLACE: 'Ort nicht gefunden. Versuche „Stadt, Land“.', RATE: 'Zu viele Berechnungen hintereinander. In einer Minute erneut versuchen.', EPHEMERIS: 'Berechnung gerade nicht verfügbar.', FAIL: 'Berechnung fehlgeschlagen. Bitte erneut versuchen.' },
    sun: 'Sonne', moon: 'Mond', rising: 'Aszendent',
    sunMeaning: 'Deine innere Identität und was dir Energie gibt.',
    moonMeaning: 'Deine Gefühle, dein Sicherheitsbedürfnis, deine spontanen Reaktionen.',
    risingMeaning: 'Dein erster Eindruck, dein Stil, die Eingangstür des Horoskops.',
    element: 'Element', modality: 'Qualität',
    resultNext: 'Um diese drei Zeichen mit deiner Situation (Liebe, Beruf, Entscheidung) zu verbinden, sprich mit einer Callastral-Beraterin oder einem Callastral-Berater.',
    privacy: 'Datum, Uhrzeit und Ort dienen nur der Berechnung und werden nicht gespeichert.',
    howTitle: 'So funktioniert die Berechnung',
    how: [
      'Die Ortszeit wird mit den historischen Sommerzeitregeln des Ortes in Weltzeit umgerechnet.',
      'Sonnen- und Mondposition stammen aus der Swiss Ephemeris (tropischer Tierkreis).',
      'Der Aszendent ist der Tierkreisgrad, der an deinen Geburtskoordinaten am Osthorizont aufging.',
    ],
    faqTitle: 'Häufige Fragen',
    faq: [
      { q: 'Ist das Geburtshoroskop wirklich kostenlos?', a: 'Ja. Sonne, Mond und Aszendent werden kostenlos berechnet, ohne Konto und ohne E-Mail.' },
      { q: 'Was, wenn ich meine Geburtszeit nicht kenne?', a: 'Das Sonnenzeichen bleibt verlässlich, das Mondzeichen meistens auch. Für den Aszendenten brauchst du die Uhrzeit: Sie steht in der Geburtsurkunde.' },
      { q: 'Warum weicht mein Sonnenzeichen von einer Zeitschrift ab?', a: 'Wer an der Grenze zweier Zeichen geboren ist, braucht die minutengenaue Position. Genau die berechnet dieses Tool.' },
    ],
  },
  it: {
    title: 'Tema natale gratis: Sole, Luna e ascendente in 1 minuto',
    description: 'Calcola gratis e senza registrazione il segno solare, il segno lunare e l’ascendente da data, ora e luogo di nascita.',
    h1: 'Tema natale gratis: Sole, Luna, ascendente',
    answer: 'Inserisci data, ora e città di nascita e ottieni subito i tuoi tre segni principali. Il Sole descrive la tua spinta di fondo, la Luna i bisogni emotivi, l’ascendente come ti vedono gli altri. Gratis, senza account, e i dati di nascita non vengono salvati.',
    form: { date: 'Data di nascita', time: 'Ora di nascita', place: 'Città di nascita', placePlaceholder: 'Roma, Italia', submit: 'Calcola il mio tema', submitting: 'Calcolo…', timeHint: 'L’ora esatta cambia l’ascendente (circa un segno ogni 2 ore).' },
    errors: { DATE: 'Controlla data e ora.', PLACE: 'Città non trovata. Prova «città, paese».', RATE: 'Troppi calcoli di fila. Riprova tra un minuto.', EPHEMERIS: 'Calcolo momentaneamente non disponibile.', FAIL: 'Calcolo non riuscito. Riprova.' },
    sun: 'Sole', moon: 'Luna', rising: 'Ascendente',
    sunMeaning: 'La tua identità profonda e ciò che ti dà energia.',
    moonMeaning: 'Le tue emozioni, il bisogno di sicurezza, le reazioni spontanee.',
    risingMeaning: 'La prima impressione, il tuo stile, la porta d’ingresso del tema.',
    element: 'Elemento', modality: 'Modalità',
    resultNext: 'Per collegare questi tre segni alla tua situazione (amore, lavoro, una scelta), parlane con una o un Consulente Callastral.',
    privacy: 'Data, ora e luogo servono solo al calcolo e non vengono conservati.',
    howTitle: 'Come funziona il calcolo',
    how: [
      'L’ora locale è convertita in tempo universale con l’ora legale storica del luogo.',
      'Le posizioni di Sole e Luna sono calcolate con le effemeridi svizzere (zodiaco tropicale).',
      'L’ascendente è il grado dello zodiaco che sorgeva all’orizzonte est alle tue coordinate di nascita.',
    ],
    faqTitle: 'Domande frequenti',
    faq: [
      { q: 'Il tema natale è davvero gratis?', a: 'Sì. Sole, Luna e ascendente sono calcolati gratis, senza account e senza e-mail.' },
      { q: 'E se non conosco l’ora di nascita?', a: 'Il segno solare resta affidabile e quello lunare quasi sempre. L’ascendente richiede l’ora: controlla l’estratto di nascita integrale.' },
      { q: 'Perché il mio segno solare è diverso da quello di una rivista?', a: 'Se sei nato a cavallo tra due segni, decide solo la posizione calcolata al minuto. È ciò che fa questo strumento.' },
    ],
  },
};

export const MOON: Record<ToolLang, MoonCopy> = {
  fr: {
    title: 'Lune aujourd’hui : signe lunaire et phase de la Lune du jour',
    description: 'Dans quel signe est la Lune aujourd’hui ? Signe lunaire, phase, pourcentage d’illumination et prochain changement de signe, mis à jour toutes les 30 minutes.',
    h1: 'La Lune aujourd’hui : signe et phase',
    answer: (sign, phase, pct) => `Aujourd’hui, la Lune est en ${sign}, en phase ${phase.toLowerCase()} (${pct} % éclairée).`,
    inSign: 'Signe lunaire', phase: 'Phase', illumination: 'Illumination',
    nextSign: (h, next) => `Entrée en ${next} dans environ ${Math.round(h)} h.`,
    computed: (when) => `Calculé le ${when} (heure de Paris), zodiaque tropical.`,
    weekTitle: 'Les 7 prochains jours (à midi, heure de Paris)', day: 'Jour',
    phases: { new: 'Nouvelle lune', waxingCrescent: 'Premier croissant', firstQuarter: 'Premier quartier', waxingGibbous: 'Lune gibbeuse croissante', full: 'Pleine lune', waningGibbous: 'Lune gibbeuse décroissante', lastQuarter: 'Dernier quartier', waningCrescent: 'Dernier croissant' },
    phaseMeaning: { new: 'Temps des intentions : on sème, on choisit une direction.', waxingCrescent: 'On lance les premiers pas, l’élan grandit.', firstQuarter: 'Premier obstacle : on ajuste et on décide.', waxingGibbous: 'On peaufine avant l’aboutissement.', full: 'Point culminant : émotions vives, résultats visibles.', waningGibbous: 'On partage ce qu’on a compris.', lastQuarter: 'On trie, on lâche ce qui ne sert plus.', waningCrescent: 'Repos et bilan avant le nouveau cycle.' },
    meaningTitle: 'Ce que la phase du jour suggère',
    faqTitle: 'Questions fréquentes',
    faq: [
      { q: 'Combien de temps la Lune reste-t-elle dans un signe ?', a: 'Environ deux jours et demi. Elle fait le tour du zodiaque en un peu plus de 27 jours.' },
      { q: 'Quelle différence entre signe lunaire du jour et signe lunaire natal ?', a: 'Le signe du jour est la position actuelle de la Lune. Votre Lune natale est sa position à votre naissance : calculez-la avec le thème astral gratuit.' },
      { q: 'Comment la phase est-elle calculée ?', a: 'Par l’écart entre la Lune et le Soleil : 0° nouvelle lune, 90° premier quartier, 180° pleine lune, 270° dernier quartier.' },
    ],
  },
  en: {
    title: 'Moon Sign Today: Today’s Moon Phase and Zodiac Sign',
    description: 'What sign is the Moon in today? Live Moon sign, Moon phase, illumination and next sign change, updated every 30 minutes.',
    h1: 'Moon sign today and current Moon phase',
    answer: (sign, phase, pct) => `Today the Moon is in ${sign}, in its ${phase.toLowerCase()} phase (${pct}% illuminated).`,
    inSign: 'Moon sign', phase: 'Phase', illumination: 'Illumination',
    nextSign: (h, next) => `Enters ${next} in about ${Math.round(h)} h.`,
    computed: (when) => `Calculated ${when} (UTC), tropical zodiac.`,
    weekTitle: 'Next 7 days (at 12:00 UTC)', day: 'Day',
    phases: { new: 'New Moon', waxingCrescent: 'Waxing crescent', firstQuarter: 'First quarter', waxingGibbous: 'Waxing gibbous', full: 'Full Moon', waningGibbous: 'Waning gibbous', lastQuarter: 'Last quarter', waningCrescent: 'Waning crescent' },
    phaseMeaning: { new: 'Time for intentions: plant seeds, pick a direction.', waxingCrescent: 'First steps, momentum builds.', firstQuarter: 'First obstacle: adjust and commit.', waxingGibbous: 'Refine before things come together.', full: 'Peak: strong emotions, visible results.', waningGibbous: 'Share what you have learned.', lastQuarter: 'Sort and release what no longer serves.', waningCrescent: 'Rest and review before the next cycle.' },
    meaningTitle: 'What today’s phase suggests',
    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'How long does the Moon stay in one sign?', a: 'About two and a half days. It travels the whole zodiac in just over 27 days.' },
      { q: 'What is the difference between today’s Moon sign and my natal Moon?', a: 'Today’s sign is where the Moon is now. Your natal Moon is where it was when you were born: find it with the free birth chart.' },
      { q: 'How is the Moon phase calculated?', a: 'From the angle between Moon and Sun: 0° New Moon, 90° first quarter, 180° Full Moon, 270° last quarter.' },
    ],
  },
  es: {
    title: 'La Luna hoy: signo lunar y fase lunar del día',
    description: '¿En qué signo está la Luna hoy? Signo lunar, fase, porcentaje de iluminación y próximo cambio de signo, actualizado cada 30 minutos.',
    h1: 'La Luna hoy: signo y fase',
    answer: (sign, phase, pct) => `Hoy la Luna está en ${sign}, en fase ${phase.toLowerCase()} (${pct} % iluminada).`,
    inSign: 'Signo lunar', phase: 'Fase', illumination: 'Iluminación',
    nextSign: (h, next) => `Entra en ${next} en unas ${Math.round(h)} h.`,
    computed: (when) => `Calculado el ${when} (hora de Madrid), zodiaco tropical.`,
    weekTitle: 'Próximos 7 días (a mediodía, hora de Madrid)', day: 'Día',
    phases: { new: 'Luna nueva', waxingCrescent: 'Luna creciente', firstQuarter: 'Cuarto creciente', waxingGibbous: 'Gibosa creciente', full: 'Luna llena', waningGibbous: 'Gibosa menguante', lastQuarter: 'Cuarto menguante', waningCrescent: 'Luna menguante' },
    phaseMeaning: { new: 'Momento de intenciones: sembrar y elegir un rumbo.', waxingCrescent: 'Primeros pasos, el impulso crece.', firstQuarter: 'Primer obstáculo: ajustar y decidir.', waxingGibbous: 'Pulir antes del resultado.', full: 'Punto álgido: emociones intensas, resultados visibles.', waningGibbous: 'Compartir lo aprendido.', lastQuarter: 'Ordenar y soltar lo que ya no sirve.', waningCrescent: 'Descanso y balance antes del nuevo ciclo.' },
    meaningTitle: 'Lo que sugiere la fase de hoy',
    faqTitle: 'Preguntas frecuentes',
    faq: [
      { q: '¿Cuánto tiempo pasa la Luna en un signo?', a: 'Unos dos días y medio. Recorre todo el zodiaco en algo más de 27 días.' },
      { q: '¿Qué diferencia hay entre el signo lunar de hoy y mi Luna natal?', a: 'El de hoy es la posición actual de la Luna. Tu Luna natal es su posición al nacer: calcúlala con la carta astral gratis.' },
      { q: '¿Cómo se calcula la fase lunar?', a: 'Con el ángulo entre la Luna y el Sol: 0° luna nueva, 90° cuarto creciente, 180° luna llena, 270° cuarto menguante.' },
    ],
  },
  de: {
    title: 'Mond heute: Mondzeichen und Mondphase des Tages',
    description: 'In welchem Zeichen steht der Mond heute? Mondzeichen, Mondphase, Beleuchtung und nächster Zeichenwechsel, alle 30 Minuten aktualisiert.',
    h1: 'Mond heute: Zeichen und Phase',
    answer: (sign, phase, pct) => `Mondzeichen heute: ${sign}. Mondphase: ${phase} (${pct} % beleuchtet).`,
    inSign: 'Mondzeichen', phase: 'Phase', illumination: 'Beleuchtung',
    nextSign: (h, next) => `Wechselt in etwa ${Math.round(h)} Std. in ${next}.`,
    computed: (when) => `Berechnet am ${when} (Berliner Zeit), tropischer Tierkreis.`,
    weekTitle: 'Die nächsten 7 Tage (12:00 Uhr Berliner Zeit)', day: 'Tag',
    phases: { new: 'Neumond', waxingCrescent: 'Zunehmende Sichel', firstQuarter: 'Erstes Viertel', waxingGibbous: 'Zunehmender Mond', full: 'Vollmond', waningGibbous: 'Abnehmender Mond', lastQuarter: 'Letztes Viertel', waningCrescent: 'Abnehmende Sichel' },
    phaseMeaning: { new: 'Zeit für Absichten: säen und eine Richtung wählen.', waxingCrescent: 'Erste Schritte, der Schwung wächst.', firstQuarter: 'Erstes Hindernis: anpassen und entscheiden.', waxingGibbous: 'Feinschliff vor dem Ergebnis.', full: 'Höhepunkt: starke Gefühle, sichtbare Ergebnisse.', waningGibbous: 'Weitergeben, was man gelernt hat.', lastQuarter: 'Aussortieren und loslassen.', waningCrescent: 'Ruhe und Bilanz vor dem neuen Zyklus.' },
    meaningTitle: 'Was die heutige Phase nahelegt',
    faqTitle: 'Häufige Fragen',
    faq: [
      { q: 'Wie lange bleibt der Mond in einem Zeichen?', a: 'Etwa zweieinhalb Tage. Er durchläuft den Tierkreis in gut 27 Tagen.' },
      { q: 'Was ist der Unterschied zwischen Mondzeichen heute und Geburtsmond?', a: 'Das heutige Zeichen ist die aktuelle Mondposition. Dein Geburtsmond ist die Position bei deiner Geburt: berechne ihn mit dem kostenlosen Geburtshoroskop.' },
      { q: 'Wie wird die Mondphase berechnet?', a: 'Über den Winkel zwischen Mond und Sonne: 0° Neumond, 90° erstes Viertel, 180° Vollmond, 270° letztes Viertel.' },
    ],
  },
  it: {
    title: 'La Luna oggi: segno lunare e fase lunare del giorno',
    description: 'In che segno è la Luna oggi? Segno lunare, fase, percentuale di illuminazione e prossimo cambio di segno, aggiornati ogni 30 minuti.',
    h1: 'La Luna oggi: segno e fase',
    answer: (sign, phase, pct) => `Oggi la Luna è in ${sign}, in fase di ${phase.toLowerCase()} (${pct}% illuminata).`,
    inSign: 'Segno lunare', phase: 'Fase', illumination: 'Illuminazione',
    nextSign: (h, next) => `Entra in ${next} tra circa ${Math.round(h)} h.`,
    computed: (when) => `Calcolato il ${when} (ora di Roma), zodiaco tropicale.`,
    weekTitle: 'Prossimi 7 giorni (a mezzogiorno, ora di Roma)', day: 'Giorno',
    phases: { new: 'Luna nuova', waxingCrescent: 'Luna crescente', firstQuarter: 'Primo quarto', waxingGibbous: 'Gibbosa crescente', full: 'Luna piena', waningGibbous: 'Gibbosa calante', lastQuarter: 'Ultimo quarto', waningCrescent: 'Luna calante' },
    phaseMeaning: { new: 'Tempo di intenzioni: seminare e scegliere una direzione.', waxingCrescent: 'Primi passi, lo slancio cresce.', firstQuarter: 'Primo ostacolo: aggiustare e decidere.', waxingGibbous: 'Rifinire prima del risultato.', full: 'Culmine: emozioni forti, risultati visibili.', waningGibbous: 'Condividere ciò che si è capito.', lastQuarter: 'Fare ordine e lasciar andare.', waningCrescent: 'Riposo e bilancio prima del nuovo ciclo.' },
    meaningTitle: 'Cosa suggerisce la fase di oggi',
    faqTitle: 'Domande frequenti',
    faq: [
      { q: 'Quanto resta la Luna in un segno?', a: 'Circa due giorni e mezzo. Percorre tutto lo zodiaco in poco più di 27 giorni.' },
      { q: 'Che differenza c’è tra il segno lunare di oggi e la Luna natale?', a: 'Il segno di oggi è la posizione attuale della Luna. La Luna natale è la sua posizione alla nascita: calcolala con il tema natale gratis.' },
      { q: 'Come si calcola la fase lunare?', a: 'Dall’angolo tra Luna e Sole: 0° luna nuova, 90° primo quarto, 180° luna piena, 270° ultimo quarto.' },
    ],
  },
};

export const AFFILIATE: Record<ToolLang, AffiliateCopy> = {
  fr: {
    title: 'Programme d’affiliation Callastral : 30 % pour les créateurs astro',
    description: 'Créateurs astrologie, tarot, spiritualité : gagnez 30 % du premier paiement de chaque client que vous envoyez à Callastral. Inscription gratuite, lien personnel immédiat.',
    h1: 'Programme d’affiliation : 30 % pour les créateurs astro',
    answer: 'Vous parlez d’astrologie à une communauté ? Recevez 30 % du premier paiement de chaque nouveau client arrivé par votre lien Callastral. L’inscription est gratuite et votre lien est créé tout de suite. Les commissions sont versées manuellement, une fois par mois.',
    points: ['30 % du premier paiement de chaque nouveau client', 'Suivi 30 jours par cookie après le clic', 'Votre audience peut essayer 3 minutes d’appel offertes et poser une première question par message offerte', 'Versement manuel mensuel, sans plateforme tierce'],
    howTitle: 'Comment ça marche',
    how: ['Inscrivez-vous ci-dessous : nom, e-mail, compte social.', 'Partagez votre lien personnel (bio, story, description de vidéo, newsletter).', 'Quand une personne arrivée par votre lien paie pour la première fois, 30 % de ce paiement vous est attribué.'],
    termsTitle: 'Conditions du programme',
    terms: [
      'Commission : 30 % du montant effectivement payé lors du premier paiement d’un nouveau client (pack de minutes, rapport, semaine Découverte ou premier mois d’abonnement chat). Les paiements suivants du même client ne donnent pas lieu à commission.',
      'Suivi : un cookie de 30 jours est déposé lors du clic sur votre lien ; le dernier lien d’affiliation cliqué l’emporte.',
      'Aucun versement automatique : les commissions sont vérifiées puis payées manuellement par Callastral, une fois par mois, par virement bancaire ou PayPal, après un délai de 30 jours couvrant les remboursements et contestations.',
      'Pas de commission sur un paiement remboursé, contesté, frauduleux, ou sur vos propres achats.',
      'Promotion honnête : pas de faux avis, pas de témoignages inventés, pas de fausse urgence, pas de promesse de prédiction garantie. Présentez les conseillers comme « Conseillère / Conseiller Callastral » et indiquez qu’il s’agit de conseillers virtuels.',
      'Interdits : spam, achat de mots-clés sur la marque Callastral, publicité trompeuse, contenus visant des mineurs.',
      'Vous déclarez vous-même vos revenus selon votre statut. Callastral peut modifier ou arrêter le programme avec 30 jours de préavis ; les commissions déjà acquises restent dues.',
    ],
    form: { title: 'Rejoindre le programme', name: 'Nom ou nom de créateur', email: 'E-mail', social: 'Compte principal (TikTok, Instagram, YouTube, X…)', socialPlaceholder: '@moncompte sur TikTok', accept: 'J’accepte les conditions du programme ci-dessus.', submit: 'Créer mon lien', submitting: 'Création…', done: 'C’est fait. Votre lien est actif.', yourCode: 'Votre code', yourLink: 'Votre lien', copy: 'Copier',
      errors: { NAME: 'Indiquez un nom (2 à 80 caractères).', EMAIL: 'Adresse e-mail invalide.', SOCIAL: 'Indiquez votre compte social.', TERMS: 'Acceptez les conditions pour continuer.', EXISTS: 'Cette adresse est déjà inscrite. Écrivez-nous depuis cette adresse pour récupérer votre lien.', RATE: 'Trop d’essais. Réessayez plus tard.', FAIL: 'Inscription impossible pour le moment. Réessayez.' } },
    faqTitle: 'Questions fréquentes',
    faq: [
      { q: 'Combien coûte l’inscription ?', a: 'Rien. Le programme est gratuit et sans engagement.' },
      { q: 'Quand suis-je payé ?', a: 'Une fois par mois, manuellement, pour les commissions de plus de 30 jours. Il n’y a pas de versement automatique.' },
      { q: 'Que peut tester mon audience gratuitement ?', a: '3 minutes d’appel offertes avec une Conseillère ou un Conseiller Callastral, une première réponse par message offerte, et les outils gratuits : thème astral, ascendant, Lune du jour.' },
    ],
  },
  en: {
    title: 'Callastral Affiliate Program: 30% for Astrology Creators',
    description: 'Astrology, tarot and spirituality creators: earn 30% of the first payment of every customer you send to Callastral. Free to join, personal link in seconds.',
    h1: 'Affiliate program: 30% for astrology creators',
    answer: 'Do you talk about astrology to an audience? Earn 30% of the first payment of every new customer who comes through your Callastral link. Joining is free and your link is created instantly. Commissions are paid manually once a month.',
    points: ['30% of every new customer’s first payment', '30-day cookie tracking after the click', 'Your audience can try 3 free call minutes and a free first message answer', 'Manual monthly payout, no third-party platform'],
    howTitle: 'How it works',
    how: ['Sign up below: name, email, social handle.', 'Share your personal link (bio, story, video description, newsletter).', 'When someone who arrived through your link pays for the first time, 30% of that payment is credited to you.'],
    termsTitle: 'Program terms',
    terms: [
      'Commission: 30% of the amount actually paid on a new customer’s first payment (minute pack, report, Discovery week or first month of chat subscription). Later payments by the same customer earn no commission.',
      'Tracking: a 30-day cookie is set when your link is clicked; the last affiliate link clicked wins.',
      'No automatic payouts: commissions are reviewed and paid manually by Callastral once a month, by bank transfer or PayPal, after a 30-day period covering refunds and disputes.',
      'No commission on refunded, disputed or fraudulent payments, or on your own purchases.',
      'Honest promotion: no fake reviews, no invented testimonials, no false urgency, no promise of guaranteed predictions. Present advisors as “Callastral advisors” and say they are virtual advisors.',
      'Not allowed: spam, bidding on the Callastral brand in search ads, misleading ads, content aimed at minors.',
      'You declare your own income according to your status. Callastral may change or end the program with 30 days’ notice; commissions already earned remain payable.',
    ],
    form: { title: 'Join the program', name: 'Name or creator name', email: 'Email', social: 'Main account (TikTok, Instagram, YouTube, X…)', socialPlaceholder: '@myhandle on TikTok', accept: 'I accept the program terms above.', submit: 'Create my link', submitting: 'Creating…', done: 'Done. Your link is live.', yourCode: 'Your code', yourLink: 'Your link', copy: 'Copy',
      errors: { NAME: 'Enter a name (2 to 80 characters).', EMAIL: 'Invalid email address.', SOCIAL: 'Enter your social handle.', TERMS: 'Accept the terms to continue.', EXISTS: 'This email is already registered. Write to us from that address to get your link again.', RATE: 'Too many attempts. Try again later.', FAIL: 'Sign-up is unavailable right now. Please try again.' } },
    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'How much does it cost to join?', a: 'Nothing. The program is free with no commitment.' },
      { q: 'When do I get paid?', a: 'Once a month, manually, for commissions older than 30 days. There are no automatic payouts.' },
      { q: 'What can my audience try for free?', a: '3 free call minutes with a Callastral advisor, a free first answer by message, and the free tools: birth chart, rising sign, Moon today.' },
    ],
  },
  es: {
    title: 'Programa de afiliados Callastral: 30 % para creadores de astrología',
    description: 'Creadores de astrología, tarot y espiritualidad: gana el 30 % del primer pago de cada cliente que envíes a Callastral. Registro gratis y enlace inmediato.',
    h1: 'Programa de afiliados: 30 % para creadores de astrología',
    answer: '¿Hablas de astrología a una comunidad? Recibe el 30 % del primer pago de cada nuevo cliente que llegue por tu enlace de Callastral. El registro es gratis y tu enlace se crea al instante. Las comisiones se pagan manualmente una vez al mes.',
    points: ['30 % del primer pago de cada nuevo cliente', 'Seguimiento de 30 días por cookie tras el clic', 'Tu audiencia puede probar 3 minutos de llamada gratis y una primera respuesta por mensaje gratis', 'Pago manual mensual, sin plataforma externa'],
    howTitle: 'Cómo funciona',
    how: ['Regístrate abajo: nombre, correo y cuenta social.', 'Comparte tu enlace personal (bio, historia, descripción de vídeo, newsletter).', 'Cuando alguien que llegó por tu enlace paga por primera vez, se te atribuye el 30 % de ese pago.'],
    termsTitle: 'Condiciones del programa',
    terms: [
      'Comisión: 30 % del importe realmente pagado en el primer pago de un nuevo cliente (pack de minutos, informe, semana Descubrimiento o primer mes de suscripción al chat). Los pagos posteriores del mismo cliente no generan comisión.',
      'Seguimiento: se instala una cookie de 30 días al hacer clic en tu enlace; gana el último enlace de afiliado pulsado.',
      'Sin pagos automáticos: Callastral revisa y paga las comisiones manualmente una vez al mes, por transferencia o PayPal, tras un plazo de 30 días que cubre reembolsos y disputas.',
      'Sin comisión en pagos reembolsados, disputados o fraudulentos, ni en tus propias compras.',
      'Promoción honesta: sin reseñas falsas, sin testimonios inventados, sin falsa urgencia, sin prometer predicciones garantizadas. Presenta a los consejeros como «Consejera / Consejero de Callastral» e indica que son consejeros virtuales.',
      'Prohibido: spam, pujar por la marca Callastral en anuncios de búsqueda, publicidad engañosa, contenidos dirigidos a menores.',
      'Declaras tus ingresos según tu situación. Callastral puede modificar o cerrar el programa con 30 días de aviso; las comisiones ya generadas siguen siendo debidas.',
    ],
    form: { title: 'Unirme al programa', name: 'Nombre o nombre de creador', email: 'Correo', social: 'Cuenta principal (TikTok, Instagram, YouTube, X…)', socialPlaceholder: '@micuenta en TikTok', accept: 'Acepto las condiciones del programa.', submit: 'Crear mi enlace', submitting: 'Creando…', done: 'Listo. Tu enlace está activo.', yourCode: 'Tu código', yourLink: 'Tu enlace', copy: 'Copiar',
      errors: { NAME: 'Indica un nombre (2 a 80 caracteres).', EMAIL: 'Correo no válido.', SOCIAL: 'Indica tu cuenta social.', TERMS: 'Acepta las condiciones para continuar.', EXISTS: 'Este correo ya está registrado. Escríbenos desde esa dirección para recuperar tu enlace.', RATE: 'Demasiados intentos. Inténtalo más tarde.', FAIL: 'Registro no disponible ahora. Inténtalo de nuevo.' } },
    faqTitle: 'Preguntas frecuentes',
    faq: [
      { q: '¿Cuánto cuesta unirse?', a: 'Nada. El programa es gratis y sin compromiso.' },
      { q: '¿Cuándo cobro?', a: 'Una vez al mes, manualmente, por las comisiones de más de 30 días. No hay pagos automáticos.' },
      { q: '¿Qué puede probar gratis mi audiencia?', a: '3 minutos de llamada gratis con una Consejera o un Consejero de Callastral, una primera respuesta por mensaje gratis y las herramientas gratuitas: carta astral, ascendente, Luna de hoy.' },
    ],
  },
  de: {
    title: 'Callastral Partnerprogramm: 30 % für Astro-Creator',
    description: 'Creator für Astrologie, Tarot und Spiritualität: Verdiene 30 % der ersten Zahlung jedes Kunden, den du zu Callastral bringst. Kostenlos, Link sofort.',
    h1: 'Partnerprogramm: 30 % für Astro-Creator',
    answer: 'Du sprichst mit einer Community über Astrologie? Erhalte 30 % der ersten Zahlung jedes neuen Kunden, der über deinen Callastral-Link kommt. Die Anmeldung ist kostenlos und dein Link wird sofort erstellt. Provisionen werden einmal im Monat manuell ausgezahlt.',
    points: ['30 % der ersten Zahlung jedes neuen Kunden', '30 Tage Cookie-Tracking nach dem Klick', 'Deine Community kann 3 Gratis-Anrufminuten und eine erste Antwort per Nachricht gratis testen', 'Manuelle monatliche Auszahlung, ohne Drittplattform'],
    howTitle: 'So funktioniert es',
    how: ['Melde dich unten an: Name, E-Mail, Social-Account.', 'Teile deinen persönlichen Link (Bio, Story, Videobeschreibung, Newsletter).', 'Wenn jemand über deinen Link zum ersten Mal zahlt, werden dir 30 % dieser Zahlung gutgeschrieben.'],
    termsTitle: 'Programmbedingungen',
    terms: [
      'Provision: 30 % des tatsächlich gezahlten Betrags der ersten Zahlung eines neuen Kunden (Minutenpaket, Report, Entdeckungswoche oder erster Monat Chat-Abo). Spätere Zahlungen desselben Kunden sind nicht provisionsberechtigt.',
      'Tracking: Beim Klick auf deinen Link wird ein 30-Tage-Cookie gesetzt; der zuletzt geklickte Partnerlink zählt.',
      'Keine automatische Auszahlung: Callastral prüft die Provisionen und zahlt sie einmal im Monat manuell per Überweisung oder PayPal aus, nach einer Frist von 30 Tagen für Erstattungen und Rückbuchungen.',
      'Keine Provision bei erstatteten, angefochtenen oder betrügerischen Zahlungen sowie bei eigenen Käufen.',
      'Ehrliche Werbung: keine falschen Bewertungen, keine erfundenen Erfahrungsberichte, keine künstliche Dringlichkeit, keine garantierten Vorhersagen. Stelle die Berater als „Callastral-Beraterin / Callastral-Berater“ vor und sage, dass es virtuelle Berater sind.',
      'Verboten: Spam, Gebote auf die Marke Callastral in Suchanzeigen, irreführende Werbung, Inhalte für Minderjährige.',
      'Du versteuerst deine Einnahmen selbst. Callastral kann das Programm mit 30 Tagen Vorlauf ändern oder beenden; bereits verdiente Provisionen bleiben fällig.',
    ],
    form: { title: 'Am Programm teilnehmen', name: 'Name oder Creator-Name', email: 'E-Mail', social: 'Hauptaccount (TikTok, Instagram, YouTube, X…)', socialPlaceholder: '@meinaccount auf TikTok', accept: 'Ich akzeptiere die Programmbedingungen.', submit: 'Meinen Link erstellen', submitting: 'Wird erstellt…', done: 'Fertig. Dein Link ist aktiv.', yourCode: 'Dein Code', yourLink: 'Dein Link', copy: 'Kopieren',
      errors: { NAME: 'Bitte einen Namen angeben (2 bis 80 Zeichen).', EMAIL: 'Ungültige E-Mail-Adresse.', SOCIAL: 'Bitte deinen Social-Account angeben.', TERMS: 'Bitte die Bedingungen akzeptieren.', EXISTS: 'Diese E-Mail ist bereits registriert. Schreib uns von dieser Adresse, um deinen Link zu erhalten.', RATE: 'Zu viele Versuche. Bitte später erneut.', FAIL: 'Anmeldung gerade nicht möglich. Bitte erneut versuchen.' } },
    faqTitle: 'Häufige Fragen',
    faq: [
      { q: 'Was kostet die Teilnahme?', a: 'Nichts. Das Programm ist kostenlos und unverbindlich.' },
      { q: 'Wann werde ich bezahlt?', a: 'Einmal im Monat, manuell, für Provisionen, die älter als 30 Tage sind. Es gibt keine automatische Auszahlung.' },
      { q: 'Was kann meine Community gratis testen?', a: '3 Gratis-Anrufminuten mit einer Callastral-Beraterin oder einem Callastral-Berater, eine erste Antwort per Nachricht gratis und die kostenlosen Tools: Geburtshoroskop, Aszendent, Mond heute.' },
    ],
  },
  it: {
    title: 'Programma di affiliazione Callastral: 30% per i creator di astrologia',
    description: 'Creator di astrologia, tarocchi e spiritualità: guadagna il 30% del primo pagamento di ogni cliente che porti a Callastral. Iscrizione gratuita, link subito.',
    h1: 'Programma di affiliazione: 30% per i creator di astrologia',
    answer: 'Parli di astrologia a una community? Ricevi il 30% del primo pagamento di ogni nuovo cliente arrivato dal tuo link Callastral. L’iscrizione è gratuita e il link viene creato subito. Le commissioni sono pagate manualmente una volta al mese.',
    points: ['30% del primo pagamento di ogni nuovo cliente', 'Tracciamento con cookie di 30 giorni dopo il clic', 'La tua community può provare 3 minuti di chiamata gratis e una prima risposta per messaggio gratis', 'Pagamento manuale mensile, senza piattaforme terze'],
    howTitle: 'Come funziona',
    how: ['Iscriviti qui sotto: nome, e-mail, account social.', 'Condividi il tuo link personale (bio, storie, descrizione video, newsletter).', 'Quando chi è arrivato dal tuo link paga per la prima volta, ti viene attribuito il 30% di quel pagamento.'],
    termsTitle: 'Condizioni del programma',
    terms: [
      'Commissione: 30% dell’importo effettivamente pagato al primo pagamento di un nuovo cliente (pacchetto minuti, report, settimana Scoperta o primo mese di abbonamento chat). I pagamenti successivi dello stesso cliente non danno commissione.',
      'Tracciamento: al clic sul tuo link viene impostato un cookie di 30 giorni; vale l’ultimo link di affiliazione cliccato.',
      'Nessun pagamento automatico: Callastral verifica e paga manualmente le commissioni una volta al mese, con bonifico o PayPal, dopo 30 giorni che coprono rimborsi e contestazioni.',
      'Nessuna commissione su pagamenti rimborsati, contestati o fraudolenti, né sui tuoi acquisti.',
      'Promozione onesta: niente recensioni false, testimonianze inventate, falsa urgenza o previsioni garantite. Presenta i consulenti come «Consulente Callastral» e indica che sono consulenti virtuali.',
      'Vietato: spam, offerte sul marchio Callastral negli annunci di ricerca, pubblicità ingannevole, contenuti rivolti a minori.',
      'Dichiari tu i tuoi redditi secondo il tuo regime. Callastral può modificare o chiudere il programma con 30 giorni di preavviso; le commissioni già maturate restano dovute.',
    ],
    form: { title: 'Unisciti al programma', name: 'Nome o nome da creator', email: 'E-mail', social: 'Account principale (TikTok, Instagram, YouTube, X…)', socialPlaceholder: '@mioaccount su TikTok', accept: 'Accetto le condizioni del programma.', submit: 'Crea il mio link', submitting: 'Creazione…', done: 'Fatto. Il tuo link è attivo.', yourCode: 'Il tuo codice', yourLink: 'Il tuo link', copy: 'Copia',
      errors: { NAME: 'Inserisci un nome (da 2 a 80 caratteri).', EMAIL: 'E-mail non valida.', SOCIAL: 'Inserisci il tuo account social.', TERMS: 'Accetta le condizioni per continuare.', EXISTS: 'Questa e-mail è già iscritta. Scrivici da quell’indirizzo per recuperare il link.', RATE: 'Troppi tentativi. Riprova più tardi.', FAIL: 'Iscrizione non disponibile ora. Riprova.' } },
    faqTitle: 'Domande frequenti',
    faq: [
      { q: 'Quanto costa iscriversi?', a: 'Niente. Il programma è gratuito e senza impegno.' },
      { q: 'Quando vengo pagato?', a: 'Una volta al mese, manualmente, per le commissioni con più di 30 giorni. Non ci sono pagamenti automatici.' },
      { q: 'Cosa può provare gratis la mia community?', a: '3 minuti di chiamata gratis con una o un Consulente Callastral, una prima risposta per messaggio gratis e gli strumenti gratuiti: tema natale, ascendente, Luna di oggi.' },
    ],
  },
};
