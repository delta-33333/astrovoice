import type { FrenchSign, ToolLocale } from './ascendant-tool';

export interface SignCopy {
  name: string;
  element: string;
  modality: string;
  reading: string;
}

export interface HubNote {
  before: string;
  label: string;
  after: string;
}

export interface AscendantFormCopy {
  date: string;
  time: string;
  timeHint: string;
  place: string;
  placePlaceholder: string;
  submit: string;
  submitting: string;
  required: string;
  errors: { DATE: string; PLACE: string; RATE: string; EPHEMERIS: string; FAIL: string };
  resultKicker: string;
  sunIn: string;
  moonIn: string;
  localMean: string;
  disclaimer: string;
  empty: string;
  pending: string;
}

export interface AscendantCopy {
  keyword: string;
  h1: string;
  title: string;
  description: string;
  home: string;
  ctaFemme: string;
  ctaHomme: string;
  intro: string;
  bridge: (floor: string, ceiling: string) => string;
  methodTitle: string;
  method: readonly string[];
  signsTitle: string;
  signTitle: (name: string) => string;
  faqTitle: string;
  faqs: readonly { question: string; answer: string }[];
  advisorsTitle: string;
  advisorsIntro: string;
  advisorFemme: string;
  advisorHomme: string;
  linkLove: string;
  linkSpirit: string;
  linkCompat: string;
  linkPrices: string | null;
  pricesHref: string | null;
  linkOffers: string;
  footerAbout: string;
  aboutHref: string;
  footerFaq: string;
  footerTerms: string;
  footerPrivacy: string;
  breadcrumb: string;
  form: AscendantFormCopy;
  signs: Record<FrenchSign, SignCopy>;
  hubLove: HubNote;
  hubCompat: HubNote;
}

const FR_SIGNS: Record<FrenchSign, SignCopy> = {
  Bélier: { name: 'Bélier', element: 'Feu', modality: 'cardinal', reading: 'On vous voit souvent arriver sans détour. La tradition associe cet ascendant à un premier contact franc, parfois brusque, qui préfère lancer le mouvement plutôt que d’attendre.' },
  Taureau: { name: 'Taureau', element: 'Terre', modality: 'fixe', reading: 'L’allure est posée. On retient une présence stable, un rythme qui ne se presse pas, et un besoin de concret avant de s’engager.' },
  Gémeaux: { name: 'Gémeaux', element: 'Air', modality: 'mutable', reading: 'Le contact passe par la parole et la curiosité. L’impression change vite : une question, un trait d’esprit, puis déjà un autre sujet.' },
  Cancer: { name: 'Cancer', element: 'Eau', modality: 'cardinal', reading: 'La réserve protège. On sent une attention au climat émotionnel, et une tendance à tester la sécurité d’un lieu avant de s’y montrer.' },
  Lion: { name: 'Lion', element: 'Feu', modality: 'fixe', reading: 'La présence se remarque. La tradition y lit un goût de la scène, une chaleur visible, et le souci de ne pas entrer sans allure.' },
  Vierge: { name: 'Vierge', element: 'Terre', modality: 'mutable', reading: 'Le premier contact est précis, parfois prudent. On observe le détail, on met de l’ordre, on parle peu tant que ce n’est pas juste.' },
  Balance: { name: 'Balance', element: 'Air', modality: 'cardinal', reading: 'L’abord cherche l’équilibre et le regard de l’autre. La courtoisie vient en premier, le désaccord se dit plus tard.' },
  Scorpion: { name: 'Scorpion', element: 'Eau', modality: 'fixe', reading: 'Peu est donné d’emblée. Le regard est tenu, l’intensité se devine, et la confiance ne se place pas au premier échange.' },
  Sagittaire: { name: 'Sagittaire', element: 'Feu', modality: 'mutable', reading: 'L’entrée est ouverte, souvent directe. On perçoit un élan vers plus large : une idée, un déplacement, une franchise qui déborde le cadre.' },
  Capricorne: { name: 'Capricorne', element: 'Terre', modality: 'cardinal', reading: 'L’image est tenue, sérieuse. La tradition y voit une maîtrise affichée et le sens d’une responsabilité, même quand l’intérieur est moins raide.' },
  Verseau: { name: 'Verseau', element: 'Air', modality: 'fixe', reading: 'La distance reste amicale. On marque une différence, on tient à son angle, et l’on entre dans le groupe sans s’y fondre.' },
  Poissons: { name: 'Poissons', element: 'Eau', modality: 'mutable', reading: 'Le contour est plus souple. On capte l’ambiance avant de se définir, et l’abord peut sembler doux, rêveur ou difficile à cerner.' },
};

const EN_SIGNS: Record<FrenchSign, SignCopy> = {
  Bélier: { name: 'Aries', element: 'Fire', modality: 'cardinal', reading: 'People often meet you head-on. Tradition reads this rising sign as a direct first impression, sometimes blunt, that would rather start moving than wait.' },
  Taureau: { name: 'Taurus', element: 'Earth', modality: 'fixed', reading: 'The manner is unhurried. What stays is a steady presence, a pace that does not rush, and a wish for something concrete before committing.' },
  Gémeaux: { name: 'Gemini', element: 'Air', modality: 'mutable', reading: 'Contact happens through talk and curiosity. The impression shifts quickly: a question, a joke, then already another subject.' },
  Cancer: { name: 'Cancer', element: 'Water', modality: 'cardinal', reading: 'Reserve comes first. There is attention to the emotional weather, and a habit of testing whether a room feels safe before showing much.' },
  Lion: { name: 'Leo', element: 'Fire', modality: 'fixed', reading: 'The presence is noticed. Tradition reads a feel for the room, a visible warmth, and a dislike of entering without some style.' },
  Vierge: { name: 'Virgo', element: 'Earth', modality: 'mutable', reading: 'The first contact is precise, sometimes cautious. Details get sorted, and little is said until it feels accurate.' },
  Balance: { name: 'Libra', element: 'Air', modality: 'cardinal', reading: 'The approach looks for balance and for how the other person sees things. Courtesy comes first; disagreement can wait.' },
  Scorpion: { name: 'Scorpio', element: 'Water', modality: 'fixed', reading: 'Little is offered at once. The gaze holds, intensity shows, and trust is not placed in the first exchange.' },
  Sagittaire: { name: 'Sagittarius', element: 'Fire', modality: 'mutable', reading: 'The entrance is open and often plain-spoken. What comes across is a pull toward something wider: an idea, a trip, a frankness that spills the frame.' },
  Capricorne: { name: 'Capricorn', element: 'Earth', modality: 'cardinal', reading: 'The image is held and serious. Tradition reads a displayed self-control and a sense of duty, even when the inside is less strict.' },
  Verseau: { name: 'Aquarius', element: 'Air', modality: 'fixed', reading: 'The distance stays friendly. A difference is marked, an angle is kept, and joining a group does not mean blending in.' },
  Poissons: { name: 'Pisces', element: 'Water', modality: 'mutable', reading: 'The outline is softer. The mood of a place is caught before a firm definition, and the approach can seem gentle, dreamy, or hard to pin down.' },
};

const ES_SIGNS: Record<FrenchSign, SignCopy> = {
  Bélier: { name: 'Aries', element: 'Fuego', modality: 'cardinal', reading: 'Sueles llegar de frente. La tradición lee este ascendente como un primer contacto directo, a veces brusco, que prefiere ponerse en marcha antes que esperar.' },
  Taureau: { name: 'Tauro', element: 'Tierra', modality: 'fijo', reading: 'El modo es pausado. Queda una presencia estable, un ritmo que no se apresura, y la necesidad de algo concreto antes de comprometerse.' },
  Gémeaux: { name: 'Géminis', element: 'Aire', modality: 'mutable', reading: 'El contacto pasa por la palabra y la curiosidad. La impresión cambia pronto: una pregunta, un comentario, y ya otro tema.' },
  Cancer: { name: 'Cáncer', element: 'Agua', modality: 'cardinal', reading: 'La reserva protege. Hay atención al clima emocional, y la costumbre de comprobar si un lugar es seguro antes de mostrarse.' },
  Lion: { name: 'Leo', element: 'Fuego', modality: 'fijo', reading: 'La presencia se nota. La tradición ve gusto por el escenario, una calidez visible, y el cuidado de no entrar sin cierto estilo.' },
  Vierge: { name: 'Virgo', element: 'Tierra', modality: 'mutable', reading: 'El primer contacto es preciso, a veces cauteloso. Se mira el detalle, se ordena, y se habla poco hasta que encaja.' },
  Balance: { name: 'Libra', element: 'Aire', modality: 'cardinal', reading: 'El trato busca el equilibrio y la mirada del otro. La cortesía va primero; el desacuerdo, después.' },
  Scorpion: { name: 'Escorpio', element: 'Agua', modality: 'fijo', reading: 'Poco se entrega de entrada. La mirada se sostiene, se intuye la intensidad, y la confianza no se coloca en el primer intercambio.' },
  Sagittaire: { name: 'Sagitario', element: 'Fuego', modality: 'mutable', reading: 'La entrada es abierta y a menudo directa. Se percibe un impulso hacia algo más amplio: una idea, un viaje, una franqueza que se sale del marco.' },
  Capricorne: { name: 'Capricornio', element: 'Tierra', modality: 'cardinal', reading: 'La imagen se mantiene seria. La tradición lee un control visible y sentido de la responsabilidad, aunque por dentro haya menos rigidez.' },
  Verseau: { name: 'Acuario', element: 'Aire', modality: 'fijo', reading: 'La distancia sigue siendo amable. Se marca una diferencia, se sostiene un ángulo propio, y se entra en el grupo sin fundirse en él.' },
  Poissons: { name: 'Piscis', element: 'Agua', modality: 'mutable', reading: 'El contorno es más flexible. Se capta el ambiente antes de definirse, y el trato puede parecer suave, soñador o difícil de situar.' },
};

const DE_SIGNS: Record<FrenchSign, SignCopy> = {
  Bélier: { name: 'Widder', element: 'Feuer', modality: 'kardinal', reading: 'Du kommst oft direkt an. Die Tradition liest diesen Aszendenten als einen klaren ersten Eindruck, manchmal schroff, der lieber losgeht als wartet.' },
  Taureau: { name: 'Stier', element: 'Erde', modality: 'fix', reading: 'Die Art ist ruhig. Hängen bleibt eine stetige Gegenwart, ein Tempo ohne Eile, und der Wunsch nach etwas Konkretem, bevor du dich festlegst.' },
  Gémeaux: { name: 'Zwillinge', element: 'Luft', modality: 'veränderlich', reading: 'Der Kontakt läuft über Rede und Neugier. Der Eindruck wechselt schnell: eine Frage, ein Einfall, schon das nächste Thema.' },
  Cancer: { name: 'Krebs', element: 'Wasser', modality: 'kardinal', reading: 'Zurückhaltung schützt. Es gibt ein Gespür für die Stimmung, und die Neigung, erst zu prüfen, ob ein Ort sicher wirkt.' },
  Lion: { name: 'Löwe', element: 'Feuer', modality: 'fix', reading: 'Die Gegenwart fällt auf. Die Tradition liest Sinn für Auftritt, sichtbare Wärme, und den Wunsch, nicht ohne Haltung hereinzukommen.' },
  Vierge: { name: 'Jungfrau', element: 'Erde', modality: 'veränderlich', reading: 'Der erste Kontakt ist genau, manchmal vorsichtig. Details werden geordnet, und es wird wenig gesagt, solange es nicht stimmt.' },
  Balance: { name: 'Waage', element: 'Luft', modality: 'kardinal', reading: 'Der Umgang sucht Ausgleich und den Blick des anderen. Höflichkeit kommt zuerst, Widerspruch später.' },
  Scorpion: { name: 'Skorpion', element: 'Wasser', modality: 'fix', reading: 'Wenig wird sofort gegeben. Der Blick hält, Intensität ist zu ahnen, und Vertrauen sitzt nicht im ersten Austausch.' },
  Sagittaire: { name: 'Schütze', element: 'Feuer', modality: 'veränderlich', reading: 'Der Auftritt ist offen und oft direkt. Spürbar ist ein Zug ins Weitere: eine Idee, eine Reise, eine Offenheit, die den Rahmen sprengt.' },
  Capricorne: { name: 'Steinbock', element: 'Erde', modality: 'kardinal', reading: 'Das Bild wirkt gehalten und ernst. Die Tradition liest sichtbare Beherrschung und Verantwortungsgefühl, auch wenn es innen weniger streng ist.' },
  Verseau: { name: 'Wassermann', element: 'Luft', modality: 'fix', reading: 'Der Abstand bleibt freundlich. Ein Unterschied wird markiert, ein eigener Winkel gehalten, und die Gruppe betreten heißt nicht, in ihr aufzugehen.' },
  Poissons: { name: 'Fische', element: 'Wasser', modality: 'veränderlich', reading: 'Die Kontur ist weicher. Die Stimmung eines Orts wird früher erfasst als eine feste Definition, und der Eindruck kann sanft, verträumt oder schwer zu fassen sein.' },
};

const IT_SIGNS: Record<FrenchSign, SignCopy> = {
  Bélier: { name: 'Ariete', element: 'Fuoco', modality: 'cardinale', reading: 'Arrivi spesso di fronte. La tradizione legge questo ascendente come un primo contatto diretto, a volte brusco, che preferisce muoversi piuttosto che aspettare.' },
  Taureau: { name: 'Toro', element: 'Terra', modality: 'fisso', reading: 'Il modo è posato. Resta una presenza stabile, un ritmo che non ha fretta, e il bisogno di qualcosa di concreto prima di impegnarsi.' },
  Gémeaux: { name: 'Gemelli', element: 'Aria', modality: 'mutevole', reading: 'Il contatto passa dalla parola e dalla curiosità. L’impressione cambia in fretta: una domanda, una battuta, poi già un altro argomento.' },
  Cancer: { name: 'Cancro', element: 'Acqua', modality: 'cardinale', reading: 'La riserva protegge. C’è attenzione al clima emotivo, e l’abitudine di verificare se un luogo è sicuro prima di mostrarsi.' },
  Lion: { name: 'Leone', element: 'Fuoco', modality: 'fisso', reading: 'La presenza si nota. La tradizione vi legge gusto della scena, un calore visibile, e la cura di non entrare senza un certo stile.' },
  Vierge: { name: 'Vergine', element: 'Terra', modality: 'mutevole', reading: 'Il primo contatto è preciso, a volte cauto. Si guarda il dettaglio, si mette ordine, si parla poco finché non torna.' },
  Balance: { name: 'Bilancia', element: 'Aria', modality: 'cardinale', reading: 'L’approccio cerca equilibrio e lo sguardo dell’altro. La cortesia viene prima; il disaccordo, dopo.' },
  Scorpion: { name: 'Scorpione', element: 'Acqua', modality: 'fisso', reading: 'Poco viene dato subito. Lo sguardo resta, l’intensità si intuisce, e la fiducia non si mette al primo scambio.' },
  Sagittaire: { name: 'Sagittario', element: 'Fuoco', modality: 'mutevole', reading: 'L’ingresso è aperto e spesso diretto. Si sente uno slancio verso qualcosa di più largo: un’idea, un viaggio, una franchezza che esce dal quadro.' },
  Capricorne: { name: 'Capricorno', element: 'Terra', modality: 'cardinale', reading: 'L’immagine è tenuta, seria. La tradizione vi legge un controllo visibile e senso di responsabilità, anche quando dentro c’è meno rigidità.' },
  Verseau: { name: 'Acquario', element: 'Aria', modality: 'fisso', reading: 'La distanza resta amichevole. Si segna una differenza, si tiene un angolo proprio, e si entra nel gruppo senza fondersi.' },
  Poissons: { name: 'Pesci', element: 'Acqua', modality: 'mutevole', reading: 'Il contorno è più morbido. Si coglie l’atmosfera prima di definirsi, e l’approccio può sembrare dolce, sognante o difficile da collocare.' },
};

function formBase(partial: AscendantFormCopy): AscendantFormCopy {
  return partial;
}

const COPY: Record<ToolLocale, AscendantCopy> = {
  fr: {
    keyword: 'calcul ascendant gratuit',
    h1: 'Calcul ascendant gratuit',
    title: 'Calcul ascendant gratuit — résultat immédiat | Callastral',
    description: 'Calcul ascendant gratuit : date, heure et lieu de naissance. Résultat immédiat, sans inscription. Tradition astrologique, sans prédiction garantie.',
    home: 'Accueil',
    ctaFemme: 'Parler à une conseillère IA Callastral',
    ctaHomme: 'Parler à un conseiller IA Callastral',
    intro: 'Le calcul ascendant gratuit utilise la date, l’heure et le lieu de naissance pour trouver le signe qui se levait à l’horizon est. Le résultat est immédiat, sans inscription. C’est une lecture de tradition astrologique, pas une prédiction.',
    bridge: (floor, ceiling) => `L’ascendant ouvre le thème. Une conseillère IA Callastral peut le relier à votre Soleil et à votre Lune, par téléphone. Le tarif de chaque conseiller est affiché avant le paiement, entre ${floor} et ${ceiling} la minute.`,
    methodTitle: 'Comment l’ascendant est calculé',
    method: [
      'L’heure civile est convertie en temps universel avec le fuseau historique du lieu, heure d’été comprise. Le calcul astronomique, le même Swiss Ephemeris que pour les consultations Callastral, situe ensuite le degré de l’écliptique qui coupait l’horizon est.',
      'Le zodiaque utilisé est le zodiaque tropical. Le signe solaire et le signe lunaire sont affichés à côté, pour situer l’ascendant. Ils ne remplacent pas une carte du ciel complète.',
      'La précision dépend surtout de l’heure déclarée et de la commune choisie. Quatre minutes environ déplacent l’ascendant d’un degré.',
    ],
    signsTitle: 'Les douze ascendants',
    signTitle: (name) => `Ascendant ${name}`,
    faqTitle: 'Questions fréquentes',
    faqs: [
      { question: 'Comment calculer son ascendant gratuitement ?', answer: 'Indiquez la date de naissance, l’heure locale telle qu’elle figure sur l’acte, et la commune avec le pays. L’outil convertit cette heure avec le fuseau du lieu, puis situe le degré du zodiaque tropical qui se levait à l’horizon est. Le résultat s’affiche tout de suite. Aucun compte n’est demandé.' },
      { question: 'Pourquoi l’heure et le lieu sont-ils indispensables ?', answer: 'L’ascendant change de signe environ toutes les deux heures, et la latitude incline l’horizon. Quelques minutes d’écart déplacent le degré. Sans heure précise, le calcul n’est pas fiable : cette page ne le remplace pas par midi. L’heure se trouve sur la copie intégrale de l’acte de naissance.' },
      { question: 'L’heure d’été de l’époque est-elle prise en compte ?', answer: 'Oui. L’heure saisie est l’heure civile du lieu de naissance. Le fuseau historique, y compris l’heure d’été lorsqu’elle existait, est appliqué avant le calcul astronomique. Pour une naissance très ancienne, avant les fuseaux modernes, le calcul peut recourir au temps moyen local.' },
      { question: 'Quelle différence entre le signe solaire et l’ascendant ?', answer: 'Le signe solaire dépend surtout de la date : c’est le signe du zodiaque le plus cité. L’ascendant dépend de l’heure et du lieu. Dans la tradition, le Soleil décrit une orientation de fond, et l’ascendant la manière d’entrer en contact. Les deux peuvent différer.' },
      { question: 'Ce calcul est-il gratuit, et que deviennent les données de naissance ?', answer: 'Il est gratuit, sans inscription et sans paiement. La date, l’heure et le lieu saisis ici ne sont pas enregistrés dans un compte. Ils servent uniquement à répondre. Le nom de la commune peut être converti en coordonnées, sans être relié à une identité. Une naissance n’est conservée que si vous créez ensuite un compte pour une consultation, dans le parcours habituel.' },
      { question: 'Ce résultat prédit-il ce qui va arriver ?', answer: 'Non. Il situe un point du ciel selon la tradition astrologique, à titre de divertissement et de réflexion personnelle. Ce n’est pas une prédiction garantie, ni un avis médical, psychologique, juridique ou financier.' },
      { question: 'Qui peut commenter cet ascendant chez Callastral ?', answer: 'Une conseillère IA Callastral peut en parler par téléphone à partir du thème natal (Soleil, Lune, ascendant). Les conseillères sont des personas virtuels créés par Callastral, pas des personnes humaines. Leur voix est générée par intelligence artificielle. Le tarif est affiché avant le paiement.' },
    ],
    advisorsTitle: 'Conseillères IA Callastral',
    advisorsIntro: 'Ce sont des personas virtuels, pas des personnes humaines. La voix de l’appel est générée par intelligence artificielle.',
    advisorFemme: 'Conseillère IA Callastral',
    advisorHomme: 'Conseiller IA Callastral',
    linkLove: 'Astrologie amour',
    linkSpirit: 'Astrologie spiritualité',
    linkCompat: 'Compatibilité',
    linkPrices: 'Tarifs 2026',
    pricesHref: '/fr/tarifs-voyance-telephone-2026',
    linkOffers: 'Offres',
    footerAbout: 'À propos',
    aboutHref: '/a-propos',
    footerFaq: 'FAQ',
    footerTerms: 'CGU',
    footerPrivacy: 'Confidentialité',
    breadcrumb: 'Fil d’Ariane',
    form: formBase({
      date: 'Date de naissance',
      time: 'Heure de naissance',
      timeHint: 'Heure locale du lieu, telle que sur l’acte. L’heure d’été est appliquée.',
      place: 'Lieu de naissance',
      placePlaceholder: 'Lyon, France',
      submit: 'Calculer l’ascendant',
      submitting: 'Calcul…',
      required: 'La date, l’heure et le lieu de naissance sont requis.',
      errors: {
        DATE: 'Indiquez une date et une heure de naissance.',
        PLACE: 'Indiquez une commune et un pays, par exemple « Lyon, France ».',
        RATE: 'Trop de calculs d’affilée. Réessayez dans une minute.',
        EPHEMERIS: 'Le calcul n’a pas abouti. Réessayez dans un instant.',
        FAIL: 'Le calcul n’a pas abouti. Vérifiez le lieu, par exemple « Lyon, France ».',
      },
      resultKicker: 'Ascendant',
      sunIn: 'Soleil en',
      moonIn: 'Lune en',
      localMean: 'temps moyen local',
      disclaimer: 'Lecture de tradition astrologique, à titre de divertissement. Aucune prédiction n’est garantie.',
      empty: 'Le signe, le degré et une lecture courte s’afficheront ici. Rien n’est enregistré dans un compte.',
      pending: 'Calcul en cours, à partir de l’heure locale et du lieu.',
    }),
    signs: FR_SIGNS,
    hubLove: { before: 'Avant une consultation : ', label: 'calcul ascendant gratuit', after: ' (date, heure et lieu, sans inscription).' },
    hubCompat: { before: 'Cette page liste les conseillers IA de ce thème. Pour le signe qui se levait à la naissance : ', label: 'calcul ascendant gratuit', after: '.' },
  },
  en: {
    keyword: 'rising sign calculator',
    h1: 'Rising sign calculator',
    title: 'Rising sign calculator — free, instant result | Callastral',
    description: 'Rising sign calculator: birth date, exact time and place. Instant and free, no account. Astrology tradition, not a guaranteed prediction.',
    home: 'Home',
    ctaFemme: 'Talk to a Callastral AI advisor',
    ctaHomme: 'Talk to a Callastral AI advisor',
    intro: 'This rising sign calculator uses your birth date, exact time and place to find the sign that was rising on the eastern horizon. The result is instant, with no account. It is an astrology tradition, not a prediction.',
    bridge: (floor, ceiling) => `The rising sign opens the chart. A Callastral AI advisor can relate it to your Sun and Moon by phone. Each advisor’s rate is shown before payment, between ${floor} and ${ceiling} per minute.`,
    methodTitle: 'How the rising sign is calculated',
    method: [
      'Civil time is converted to universal time with the historical time zone of the place, including daylight saving when it applied. The same Swiss Ephemeris used for Callastral consultations then finds the ecliptic degree that crossed the eastern horizon.',
      'The zodiac is tropical. Sun sign and Moon sign are shown beside the rising sign, to place it. They are not a full birth chart.',
      'Accuracy depends mostly on the time you enter and the town you choose. About four minutes moves the ascendant by one degree.',
    ],
    signsTitle: 'The twelve rising signs',
    signTitle: (name) => `${name} rising`,
    faqTitle: 'Common questions',
    faqs: [
      { question: 'How do I use this rising sign calculator?', answer: 'Enter your birth date, the local time as it would appear on the birth record, and the town with the country. The tool converts that time with the place’s time zone, then finds the tropical degree that was rising in the east. The result shows at once. No account is required.' },
      { question: 'Why are the time and place required?', answer: 'The rising sign changes about every two hours, and latitude tilts the horizon. A few minutes shift the degree. Without an exact time the result is not reliable, so this page does not substitute noon. The time is often on the long-form birth certificate.' },
      { question: 'Is daylight saving from that year included?', answer: 'Yes. You enter the civil clock time at the birthplace. The historical zone, including daylight saving when it existed, is applied before the astronomy. For a very early birth, before modern zones, the calculation may use local mean time.' },
      { question: 'What is the difference between the Sun sign and the rising sign?', answer: 'The Sun sign depends mostly on the date: it is the zodiac sign people usually mean. The rising sign depends on the time and place. In the tradition, the Sun describes a longer orientation, and the rising sign the way you come across. They can differ.' },
      { question: 'Is it free, and is my birth data stored?', answer: 'It is free, with no signup and no payment. The date, time and place entered here are not saved to an account. They are used only to answer. The town name may be turned into coordinates, without being tied to an identity. Birth data is kept only if you later create an account for a consultation, in the usual flow.' },
      { question: 'Does the result predict what will happen?', answer: 'No. It locates a point in the sky according to astrology tradition, for entertainment and personal reflection. It is not a guaranteed prediction, and not medical, psychological, legal or financial advice.' },
      { question: 'Who can talk about this rising sign at Callastral?', answer: 'A Callastral AI advisor can discuss it by phone from the birth chart (Sun, Moon, rising sign). Advisors are virtual personas created by Callastral, not human people. The voice is generated by artificial intelligence. The rate is shown before payment.' },
    ],
    advisorsTitle: 'Callastral AI advisors',
    advisorsIntro: 'They are virtual personas, not human people. The voice on the call is generated by artificial intelligence.',
    advisorFemme: 'Callastral AI advisor',
    advisorHomme: 'Callastral AI advisor',
    linkLove: 'Love astrology',
    linkSpirit: 'Spirituality',
    linkCompat: 'Compatibility',
    linkPrices: 'Prices 2026',
    pricesHref: '/en/phone-psychic-prices-2026',
    linkOffers: 'Offers',
    footerAbout: 'About',
    aboutHref: '/about',
    footerFaq: 'FAQ',
    footerTerms: 'Terms of use',
    footerPrivacy: 'Privacy',
    breadcrumb: 'Breadcrumb',
    form: formBase({
      date: 'Birth date',
      time: 'Birth time',
      timeHint: 'Local clock time at the birthplace, as on the record. Daylight saving is applied.',
      place: 'Birthplace',
      placePlaceholder: 'Chicago, United States',
      submit: 'Calculate my rising sign',
      submitting: 'Calculating…',
      required: 'Birth date, time and place are required.',
      errors: {
        DATE: 'Enter a birth date and time.',
        PLACE: 'Enter a town and country, for example “Chicago, United States”.',
        RATE: 'Too many calculations in a row. Try again in a minute.',
        EPHEMERIS: 'The calculation did not finish. Try again in a moment.',
        FAIL: 'The calculation did not finish. Check the place, for example “Chicago, United States”.',
      },
      resultKicker: 'Rising sign',
      sunIn: 'Sun in',
      moonIn: 'Moon in',
      localMean: 'local mean time',
      disclaimer: 'An astrology tradition, for entertainment. No prediction is guaranteed.',
      empty: 'The sign, the degree and a short reading will appear here. Nothing is saved to an account.',
      pending: 'Calculating from the local time and the place.',
    }),
    signs: EN_SIGNS,
    hubLove: { before: 'Before a consultation: the free ', label: 'rising sign calculator', after: ' (date, time and place, no account).' },
    hubCompat: { before: 'This page lists the AI advisors for this topic. For the sign that was rising at birth: ', label: 'rising sign calculator', after: '.' },
  },
  es: {
    keyword: 'calcular ascendente',
    h1: 'Calcular ascendente',
    title: 'Calcular ascendente gratis — resultado al momento | Callastral',
    description: 'Calcular ascendente gratis con fecha, hora y lugar de nacimiento. Resultado al momento, sin cuenta. Tradición astrológica, sin predicción garantizada.',
    home: 'Inicio',
    ctaFemme: 'Hablar con una consejera IA de Callastral',
    ctaHomme: 'Hablar con un consejero IA de Callastral',
    intro: 'Calcular el ascendente pide la fecha, la hora y el lugar de nacimiento para hallar el signo que salía por el horizonte este. El resultado es inmediato, sin cuenta. Es una lectura de la tradición astrológica, no una predicción.',
    bridge: (floor, ceiling) => `El ascendente abre el tema. Una consejera IA de Callastral puede relacionarlo con tu Sol y tu Luna, por teléfono. La tarifa de cada consejero se muestra antes del pago, entre ${floor} y ${ceiling} por minuto.`,
    methodTitle: 'Cómo se calcula el ascendente',
    method: [
      'La hora civil se convierte a tiempo universal con el huso histórico del lugar, horario de verano incluido. El mismo Swiss Ephemeris de las consultas Callastral sitúa después el grado de la eclíptica que cruzaba el horizonte este.',
      'El zodiaco es el tropical. El signo solar y el lunar aparecen al lado, para situar el ascendente. No sustituyen una carta completa.',
      'La precisión depende sobre todo de la hora indicada y de la localidad elegida. Unos cuatro minutos desplazan el ascendente un grado.',
    ],
    signsTitle: 'Los doce ascendentes',
    signTitle: (name) => `Ascendente ${name}`,
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      { question: '¿Cómo calcular el ascendente gratis?', answer: 'Indica la fecha de nacimiento, la hora local tal como figura en el acta, y la localidad con el país. La herramienta convierte esa hora con el huso del lugar y sitúa el grado del zodiaco tropical que salía por el este. El resultado aparece al momento. No hace falta una cuenta.' },
      { question: '¿Por qué hacen falta la hora y el lugar?', answer: 'El ascendente cambia de signo más o menos cada dos horas, y la latitud inclina el horizonte. Unos minutos mueven el grado. Sin una hora precisa el resultado no es fiable: esta página no lo sustituye por el mediodía. La hora suele constar en la partida literal de nacimiento.' },
      { question: '¿Se tiene en cuenta el horario de verano de entonces?', answer: 'Sí. La hora que escribes es la hora civil del lugar de nacimiento. El huso histórico, incluido el horario de verano cuando existía, se aplica antes del cálculo. En un nacimiento muy antiguo, anterior a los husos modernos, el cálculo puede usar el tiempo medio local.' },
      { question: '¿Qué diferencia hay entre el signo solar y el ascendente?', answer: 'El signo solar depende sobre todo de la fecha: es el signo del zodiaco más citado. El ascendente depende de la hora y del lugar. En la tradición, el Sol describe una orientación de fondo, y el ascendente la manera de presentarse. Pueden no coincidir.' },
      { question: '¿Es gratis, y se guardan los datos de nacimiento?', answer: 'Es gratis, sin registro y sin pago. La fecha, la hora y el lugar escritos aquí no se guardan en una cuenta. Sirven solo para responder. El nombre de la localidad puede convertirse en coordenadas, sin ligarse a una identidad. El nacimiento solo se conserva si después creas una cuenta para una consulta, en el recorrido habitual.' },
      { question: '¿Este resultado predice lo que va a pasar?', answer: 'No. Sitúa un punto del cielo según la tradición astrológica, como entretenimiento y reflexión personal. No es una predicción garantizada, ni un consejo médico, psicológico, jurídico o financiero.' },
      { question: '¿Quién puede comentar este ascendente en Callastral?', answer: 'Una consejera IA de Callastral puede hablar de él por teléfono a partir del tema natal (Sol, Luna, ascendente). Las consejeras son personajes virtuales creados por Callastral, no personas humanas. La voz la genera la inteligencia artificial. La tarifa se muestra antes del pago.' },
    ],
    advisorsTitle: 'Consejeras IA de Callastral',
    advisorsIntro: 'Son personajes virtuales, no personas humanas. La voz de la llamada la genera la inteligencia artificial.',
    advisorFemme: 'Consejera IA de Callastral',
    advisorHomme: 'Consejero IA de Callastral',
    linkLove: 'Astrología amor',
    linkSpirit: 'Espiritualidad',
    linkCompat: 'Compatibilidad',
    linkPrices: null,
    pricesHref: null,
    linkOffers: 'Ofertas',
    footerAbout: 'Acerca de',
    aboutHref: '/about',
    footerFaq: 'FAQ',
    footerTerms: 'Condiciones de uso',
    footerPrivacy: 'Privacidad',
    breadcrumb: 'Ruta',
    form: formBase({
      date: 'Fecha de nacimiento',
      time: 'Hora de nacimiento',
      timeHint: 'Hora local del lugar, como en el acta. El horario de verano se aplica.',
      place: 'Lugar de nacimiento',
      placePlaceholder: 'Madrid, España',
      submit: 'Calcular el ascendente',
      submitting: 'Calculando…',
      required: 'Hacen falta la fecha, la hora y el lugar de nacimiento.',
      errors: {
        DATE: 'Indica una fecha y una hora de nacimiento.',
        PLACE: 'Indica una localidad y un país, por ejemplo « Madrid, España ».',
        RATE: 'Demasiados cálculos seguidos. Prueba de nuevo en un minuto.',
        EPHEMERIS: 'El cálculo no ha terminado. Prueba de nuevo en un momento.',
        FAIL: 'El cálculo no ha terminado. Revisa el lugar, por ejemplo « Madrid, España ».',
      },
      resultKicker: 'Ascendente',
      sunIn: 'Sol en',
      moonIn: 'Luna en',
      localMean: 'tiempo medio local',
      disclaimer: 'Lectura de la tradición astrológica, como entretenimiento. Ninguna predicción está garantizada.',
      empty: 'El signo, el grado y una lectura breve aparecerán aquí. No se guarda nada en una cuenta.',
      pending: 'Calculando a partir de la hora local y del lugar.',
    }),
    signs: ES_SIGNS,
    hubLove: { before: 'Antes de una consulta: ', label: 'calcular ascendente', after: ' (fecha, hora y lugar, sin cuenta).' },
    hubCompat: { before: 'Esta página lista a los consejeros IA de este tema. Para el signo que salía al nacer: ', label: 'calcular ascendente', after: '.' },
  },
  de: {
    keyword: 'aszendent berechnen',
    h1: 'Aszendent berechnen',
    title: 'Aszendent berechnen — kostenlos und sofort | Callastral',
    description: 'Aszendent berechnen: Geburtsdatum, Uhrzeit und Ort. Sofort und kostenlos, ohne Konto. Astrologische Tradition, keine garantierte Vorhersage.',
    home: 'Start',
    ctaFemme: 'Mit einer KI-Beraterin von Callastral sprechen',
    ctaHomme: 'Mit einem KI-Berater von Callastral sprechen',
    intro: 'Aszendent berechnen heißt: Geburtsdatum, genaue Uhrzeit und Ort ergeben das Tierkreiszeichen, das am Osthorizont aufging. Das Ergebnis kommt sofort, ohne Konto. Es ist eine Lesart der astrologischen Tradition, keine Vorhersage.',
    bridge: (floor, ceiling) => `Der Aszendent eröffnet das Horoskop. Eine KI-Beraterin von Callastral kann ihn mit Sonne und Mond am Telefon verbinden. Der Tarif jedes Beraters steht vor der Zahlung, zwischen ${floor} und ${ceiling} pro Minute.`,
    methodTitle: 'Wie der Aszendent berechnet wird',
    method: [
      'Die bürgerliche Uhrzeit wird mit der historischen Zeitzone des Orts in Weltzeit umgerechnet, Sommerzeit eingeschlossen. Dieselbe Swiss Ephemeris wie bei den Callastral-Beratungen bestimmt dann den Ekliptikgrad, der den Osthorizont schnitt.',
      'Verwendet wird der tropische Tierkreis. Sonnen- und Mondzeichen stehen daneben, um den Aszendenten einzuordnen. Sie ersetzen kein vollständiges Geburtshoroskop.',
      'Die Genauigkeit hängt vor allem von der angegebenen Uhrzeit und vom gewählten Ort ab. Etwa vier Minuten verschieben den Aszendenten um ein Grad.',
    ],
    signsTitle: 'Die zwölf Aszendenten',
    signTitle: (name) => `Aszendent ${name}`,
    faqTitle: 'Häufige Fragen',
    faqs: [
      { question: 'Wie kann ich meinen Aszendenten kostenlos berechnen?', answer: 'Gib Geburtsdatum, die Ortszeit so wie in der Urkunde, und den Ort mit Land ein. Das Werkzeug rechnet diese Zeit mit der Zeitzone des Orts um und bestimmt den tropischen Grad, der im Osten aufging. Das Ergebnis erscheint sofort. Ein Konto ist nicht nötig.' },
      { question: 'Warum sind Uhrzeit und Ort nötig?', answer: 'Der Aszendent wechselt etwa alle zwei Stunden das Zeichen, und die Breite neigt den Horizont. Ein paar Minuten verschieben den Grad. Ohne genaue Uhrzeit ist das Ergebnis nicht verlässlich: diese Seite setzt nicht einfach Mittag ein. Die Uhrzeit steht oft in der beglaubigten Geburtsurkunde.' },
      { question: 'Wird die Sommerzeit von damals berücksichtigt?', answer: 'Ja. Du gibst die bürgerliche Uhrzeit am Geburtsort ein. Die historische Zone, einschließlich der Sommerzeit, wenn es sie gab, wird vor der Rechnung angewendet. Bei einer sehr frühen Geburt, vor den modernen Zonen, kann die Rechnung die mittlere Ortszeit nutzen.' },
      { question: 'Was unterscheidet Sternzeichen und Aszendent?', answer: 'Das Sternzeichen hängt vor allem vom Datum ab: es ist das meistgenannte Tierkreiszeichen. Der Aszendent hängt von Uhrzeit und Ort ab. In der Tradition beschreibt die Sonne eine längere Ausrichtung, der Aszendent die Art des ersten Eindrucks. Beides kann auseinanderfallen.' },
      { question: 'Ist die Berechnung kostenlos, und werden die Geburtsdaten gespeichert?', answer: 'Sie ist kostenlos, ohne Anmeldung und ohne Zahlung. Datum, Uhrzeit und Ort, die du hier eingibst, werden nicht in einem Konto gespeichert. Sie dienen nur der Antwort. Der Ortsname kann in Koordinaten umgewandelt werden, ohne an eine Identität gebunden zu sein. Geburtsdaten bleiben nur erhalten, wenn du später ein Konto für eine Beratung anlegst, im üblichen Ablauf.' },
      { question: 'Sagt das Ergebnis voraus, was geschieht?', answer: 'Nein. Es verortet einen Himmelspunkt nach astrologischer Tradition, zur Unterhaltung und zum eigenen Nachdenken. Es ist keine garantierte Vorhersage und kein medizinischer, psychologischer, rechtlicher oder finanzieller Rat.' },
      { question: 'Wer kann diesen Aszendenten bei Callastral besprechen?', answer: 'Eine KI-Beraterin von Callastral kann ihn am Telefon anhand des Geburtshoroskops besprechen (Sonne, Mond, Aszendent). Die Beraterinnen sind virtuelle Personas von Callastral, keine menschlichen Personen. Die Stimme wird von künstlicher Intelligenz erzeugt. Der Tarif steht vor der Zahlung.' },
    ],
    advisorsTitle: 'KI-Beraterinnen von Callastral',
    advisorsIntro: 'Es sind virtuelle Personas, keine menschlichen Personen. Die Stimme im Gespräch wird von künstlicher Intelligenz erzeugt.',
    advisorFemme: 'KI-Beraterin von Callastral',
    advisorHomme: 'KI-Berater von Callastral',
    linkLove: 'Astrologie Liebe',
    linkSpirit: 'Spiritualität',
    linkCompat: 'Kompatibilität',
    linkPrices: null,
    pricesHref: null,
    linkOffers: 'Angebote',
    footerAbout: 'Über uns',
    aboutHref: '/about',
    footerFaq: 'FAQ',
    footerTerms: 'Nutzungsbedingungen',
    footerPrivacy: 'Datenschutz',
    breadcrumb: 'Pfad',
    form: formBase({
      date: 'Geburtsdatum',
      time: 'Geburtszeit',
      timeHint: 'Ortszeit am Geburtsort, wie in der Urkunde. Die Sommerzeit wird angewendet.',
      place: 'Geburtsort',
      placePlaceholder: 'Berlin, Deutschland',
      submit: 'Aszendent berechnen',
      submitting: 'Berechnung…',
      required: 'Geburtsdatum, Uhrzeit und Ort sind nötig.',
      errors: {
        DATE: 'Gib ein Geburtsdatum und eine Uhrzeit ein.',
        PLACE: 'Gib einen Ort und ein Land ein, zum Beispiel « Berlin, Deutschland ».',
        RATE: 'Zu viele Berechnungen hintereinander. Versuch es in einer Minute noch einmal.',
        EPHEMERIS: 'Die Berechnung ist nicht durchgelaufen. Versuch es gleich noch einmal.',
        FAIL: 'Die Berechnung ist nicht durchgelaufen. Prüf den Ort, zum Beispiel « Berlin, Deutschland ».',
      },
      resultKicker: 'Aszendent',
      sunIn: 'Sonne in',
      moonIn: 'Mond in',
      localMean: 'mittlere Ortszeit',
      disclaimer: 'Lesart der astrologischen Tradition, zur Unterhaltung. Keine Vorhersage ist garantiert.',
      empty: 'Zeichen, Grad und eine kurze Lesart erscheinen hier. Nichts wird in einem Konto gespeichert.',
      pending: 'Berechnung aus Ortszeit und Ort.',
    }),
    signs: DE_SIGNS,
    hubLove: { before: 'Vor einer Beratung: ', label: 'Aszendent berechnen', after: ' (Datum, Uhrzeit und Ort, ohne Konto).' },
    hubCompat: { before: 'Diese Seite listet die KI-Berater zu diesem Thema. Für das Zeichen, das bei der Geburt aufging: ', label: 'Aszendent berechnen', after: '.' },
  },
  it: {
    keyword: 'calcolo ascendente',
    h1: 'Calcolo ascendente',
    title: 'Calcolo ascendente gratis — risultato immediato | Callastral',
    description: 'Calcolo ascendente con data, ora e luogo di nascita. Risultato subito, gratis e senza account. Tradizione astrologica, nessuna previsione garantita.',
    home: 'Home',
    ctaFemme: 'Parla con una consulente IA Callastral',
    ctaHomme: 'Parla con un consulente IA Callastral',
    intro: 'Il calcolo dell’ascendente usa data, ora e luogo di nascita per trovare il segno che sorgeva all’orizzonte est. Il risultato è immediato, senza account. È una lettura della tradizione astrologica, non una previsione.',
    bridge: (floor, ceiling) => `L’ascendente apre il tema. Una consulente IA Callastral può collegarlo al Sole e alla Luna, al telefono. La tariffa di ogni consulente è indicata prima del pagamento, tra ${floor} e ${ceiling} al minuto.`,
    methodTitle: 'Come si calcola l’ascendente',
    method: [
      'L’ora civile è convertita in tempo universale con il fuso storico del luogo, ora legale compresa. Lo stesso Swiss Ephemeris delle consultazioni Callastral trova poi il grado dell’eclittica che tagliava l’orizzonte est.',
      'Lo zodiaco è quello tropicale. Segno solare e segno lunare compaiono accanto, per situare l’ascendente. Non sostituiscono un tema completo.',
      'La precisione dipende soprattutto dall’ora indicata e dal comune scelto. Circa quattro minuti spostano l’ascendente di un grado.',
    ],
    signsTitle: 'I dodici ascendenti',
    signTitle: (name) => `Ascendente ${name}`,
    faqTitle: 'Domande frequenti',
    faqs: [
      { question: 'Come si fa il calcolo dell’ascendente gratis?', answer: 'Indica la data di nascita, l’ora locale come risulta dall’atto, e il comune con il paese. Lo strumento converte quell’ora con il fuso del luogo e situa il grado dello zodiaco tropicale che sorgeva a est. Il risultato compare subito. Non serve un account.' },
      { question: 'Perché servono ora e luogo?', answer: 'L’ascendente cambia segno circa ogni due ore, e la latitudine inclina l’orizzonte. Qualche minuto sposta il grado. Senza un’ora precisa il risultato non è affidabile: questa pagina non lo sostituisce con mezzogiorno. L’ora si trova spesso sull’atto di nascita integrale.' },
      { question: 'L’ora legale di allora è considerata?', answer: 'Sì. L’ora che inserisci è l’ora civile del luogo di nascita. Il fuso storico, compresa l’ora legale quando c’era, si applica prima del calcolo. Per una nascita molto antica, prima dei fusi moderni, il calcolo può usare il tempo medio locale.' },
      { question: 'Che differenza c’è tra segno solare e ascendente?', answer: 'Il segno solare dipende soprattutto dalla data: è il segno zodiacale più citato. L’ascendente dipende da ora e luogo. Nella tradizione il Sole descrive un orientamento di fondo, l’ascendente il modo di presentarsi. I due possono non coincidere.' },
      { question: 'Il calcolo è gratis, e i dati di nascita vengono conservati?', answer: 'È gratis, senza iscrizione e senza pagamento. Data, ora e luogo inseriti qui non sono registrati in un account. Servono solo a rispondere. Il nome del comune può essere convertito in coordinate, senza essere legato a un’identità. La nascita si conserva solo se poi crei un account per un consulto, nel percorso abituale.' },
      { question: 'Questo risultato prevede quello che accadrà?', answer: 'No. Situa un punto del cielo secondo la tradizione astrologica, per intrattenimento e riflessione personale. Non è una previsione garantita, né un parere medico, psicologico, legale o finanziario.' },
      { question: 'Chi può commentare questo ascendente su Callastral?', answer: 'Una consulente IA Callastral può parlarne al telefono a partire dal tema natale (Sole, Luna, ascendente). Le consulenti sono personaggi virtuali creati da Callastral, non persone umane. La voce è generata dall’intelligenza artificiale. La tariffa è indicata prima del pagamento.' },
    ],
    advisorsTitle: 'Consulenti IA Callastral',
    advisorsIntro: 'Sono personaggi virtuali, non persone umane. La voce della chiamata è generata dall’intelligenza artificiale.',
    advisorFemme: 'Consulente IA Callastral',
    advisorHomme: 'Consulente IA Callastral',
    linkLove: 'Astrologia amore',
    linkSpirit: 'Spiritualità',
    linkCompat: 'Compatibilità',
    linkPrices: null,
    pricesHref: null,
    linkOffers: 'Offerte',
    footerAbout: 'Chi siamo',
    aboutHref: '/about',
    footerFaq: 'FAQ',
    footerTerms: 'Condizioni d’uso',
    footerPrivacy: 'Privacy',
    breadcrumb: 'Percorso',
    form: formBase({
      date: 'Data di nascita',
      time: 'Ora di nascita',
      timeHint: 'Ora locale del luogo, come sull’atto. L’ora legale è applicata.',
      place: 'Luogo di nascita',
      placePlaceholder: 'Roma, Italia',
      submit: 'Calcola l’ascendente',
      submitting: 'Calcolo…',
      required: 'Servono data, ora e luogo di nascita.',
      errors: {
        DATE: 'Indica una data e un’ora di nascita.',
        PLACE: 'Indica un comune e un paese, per esempio « Roma, Italia ».',
        RATE: 'Troppi calcoli di seguito. Riprova tra un minuto.',
        EPHEMERIS: 'Il calcolo non è andato a buon fine. Riprova tra un momento.',
        FAIL: 'Il calcolo non è andato a buon fine. Controlla il luogo, per esempio « Roma, Italia ».',
      },
      resultKicker: 'Ascendente',
      sunIn: 'Sole in',
      moonIn: 'Luna in',
      localMean: 'tempo medio locale',
      disclaimer: 'Lettura della tradizione astrologica, per intrattenimento. Nessuna previsione è garantita.',
      empty: 'Segno, grado e una lettura breve compariranno qui. Nulla viene salvato in un account.',
      pending: 'Calcolo in corso, a partire dall’ora locale e dal luogo.',
    }),
    signs: IT_SIGNS,
    hubLove: { before: 'Prima di un consulto: ', label: 'calcolo ascendente', after: ' (data, ora e luogo, senza account).' },
    hubCompat: { before: 'Questa pagina elenca i consulenti IA di questo tema. Per il segno che sorgeva alla nascita: ', label: 'calcolo ascendente', after: '.' },
  },
};

export function getCopy(locale: ToolLocale): AscendantCopy {
  return COPY[locale];
}

export function signProfile(sign: string): SignCopy & { sign: string } {
  const found = FR_SIGNS[sign as FrenchSign];
  if (!found) {
    return {
      sign,
      name: sign,
      element: '',
      modality: '',
      reading: 'Le degré est calculé. La tradition associe l’ascendant à la manière d’entrer en relation, sans en faire une prédiction.',
    };
  }
  return { sign: found.name, ...found };
}

export function ascendantHubNote(locale: ToolLocale, specialty: string): HubNote | null {
  const copy = COPY[locale];
  if (specialty === 'amour' || specialty === 'spiritualité') return copy.hubLove;
  if (specialty === 'compatibilité') return copy.hubCompat;
  return null;
}
