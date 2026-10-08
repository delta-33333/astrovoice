/** Mot-clé principal, tel qu’il est cherché (minuscules). */
export const ASCENDANT_KEYWORD = 'calcul ascendant gratuit';
export const ASCENDANT_PATH = '/fr/calcul-ascendant-gratuit';
export const ASCENDANT_H1 = 'Calcul ascendant gratuit';
export const ASCENDANT_TITLE = 'Calcul ascendant gratuit — résultat immédiat | Callastral';
export const ASCENDANT_DESCRIPTION =
  'Calcul ascendant gratuit : date, heure et lieu de naissance. Résultat immédiat, sans inscription. Tradition astrologique, sans prédiction garantie.';
export const ASCENDANT_CTA = 'Parler à une conseillère IA Callastral';

export interface FaqItem {
  question: string;
  answer: string;
}

export const ASCENDANT_FAQS: FaqItem[] = [
  {
    question: 'Comment calculer son ascendant gratuitement ?',
    answer:
      'Indiquez la date de naissance, l’heure locale telle qu’elle figure sur l’acte, et la commune avec le pays. L’outil convertit cette heure avec le fuseau du lieu, puis situe le degré du zodiaque tropical qui se levait à l’horizon est. Le résultat s’affiche tout de suite. Aucun compte n’est demandé.',
  },
  {
    question: 'Pourquoi l’heure et le lieu sont-ils indispensables ?',
    answer:
      'L’ascendant change de signe environ toutes les deux heures, et la latitude incline l’horizon. Quelques minutes d’écart déplacent le degré. Sans heure précise, le calcul n’est pas fiable : cette page ne le remplace pas par midi. L’heure se trouve sur la copie intégrale de l’acte de naissance.',
  },
  {
    question: 'L’heure d’été de l’époque est-elle prise en compte ?',
    answer:
      'Oui. L’heure saisie est l’heure civile du lieu de naissance. Le fuseau historique, y compris l’heure d’été lorsqu’elle existait, est appliqué avant le calcul astronomique. Pour une naissance très ancienne, avant les fuseaux modernes, le calcul peut recourir au temps moyen local.',
  },
  {
    question: 'Quelle différence entre le signe solaire et l’ascendant ?',
    answer:
      'Le signe solaire dépend surtout de la date : c’est le signe du zodiaque le plus cité. L’ascendant dépend de l’heure et du lieu. Dans la tradition, le Soleil décrit une orientation de fond, et l’ascendant la manière d’entrer en contact. Les deux peuvent différer.',
  },
  {
    question: 'Ce calcul est-il gratuit, et que deviennent les données de naissance ?',
    answer:
      'Il est gratuit, sans inscription et sans paiement. La date, l’heure et le lieu saisis ici ne sont pas enregistrés dans un compte. Ils servent uniquement à répondre. Le nom de la commune peut être converti en coordonnées, sans être relié à une identité. Une naissance n’est conservée que si vous créez ensuite un compte pour une consultation, dans le parcours habituel.',
  },
  {
    question: 'Ce résultat prédit-il ce qui va arriver ?',
    answer:
      'Non. Il situe un point du ciel selon la tradition astrologique, à titre de divertissement et de réflexion personnelle. Ce n’est pas une prédiction garantie, ni un avis médical, psychologique, juridique ou financier.',
  },
  {
    question: 'Qui peut commenter cet ascendant chez Callastral ?',
    answer:
      'Une conseillère IA Callastral peut en parler par téléphone à partir du thème natal (Soleil, Lune, ascendant). Les conseillères sont des personas virtuels créés par Callastral, pas des personnes humaines. Leur voix est générée par intelligence artificielle. Le tarif est affiché avant le paiement.',
  },
];

export interface SignProfile {
  sign: string;
  element: string;
  modality: string;
  reading: string;
}

const PROFILES: Record<string, Omit<SignProfile, 'sign'>> = {
  Bélier: {
    element: 'Feu',
    modality: 'cardinal',
    reading:
      'On vous voit souvent arriver sans détour. La tradition associe cet ascendant à un premier contact franc, parfois brusque, qui préfère lancer le mouvement plutôt que d’attendre.',
  },
  Taureau: {
    element: 'Terre',
    modality: 'fixe',
    reading:
      'L’allure est posée. On retient une présence stable, un rythme qui ne se presse pas, et un besoin de concret avant de s’engager.',
  },
  Gémeaux: {
    element: 'Air',
    modality: 'mutable',
    reading:
      'Le contact passe par la parole et la curiosité. L’impression change vite : une question, un trait d’esprit, puis déjà un autre sujet.',
  },
  Cancer: {
    element: 'Eau',
    modality: 'cardinal',
    reading:
      'La réserve protège. On sent une attention au climat émotionnel, et une tendance à tester la sécurité d’un lieu avant de s’y montrer.',
  },
  Lion: {
    element: 'Feu',
    modality: 'fixe',
    reading:
      'La présence se remarque. La tradition y lit un goût de la scène, une chaleur visible, et le souci de ne pas entrer sans allure.',
  },
  Vierge: {
    element: 'Terre',
    modality: 'mutable',
    reading:
      'Le premier contact est précis, parfois prudent. On observe le détail, on met de l’ordre, on parle peu tant que ce n’est pas juste.',
  },
  Balance: {
    element: 'Air',
    modality: 'cardinal',
    reading:
      'L’abord cherche l’équilibre et le regard de l’autre. La courtoisie vient en premier, le désaccord se dit plus tard.',
  },
  Scorpion: {
    element: 'Eau',
    modality: 'fixe',
    reading:
      'Peu est donné d’emblée. Le regard est tenu, l’intensité se devine, et la confiance ne se place pas au premier échange.',
  },
  Sagittaire: {
    element: 'Feu',
    modality: 'mutable',
    reading:
      'L’entrée est ouverte, souvent directe. On perçoit un élan vers plus large : une idée, un déplacement, une franchise qui déborde le cadre.',
  },
  Capricorne: {
    element: 'Terre',
    modality: 'cardinal',
    reading:
      'L’image est tenue, sérieuse. La tradition y voit une maîtrise affichée et le sens d’une responsabilité, même quand l’intérieur est moins raide.',
  },
  Verseau: {
    element: 'Air',
    modality: 'fixe',
    reading:
      'La distance reste amicale. On marque une différence, on tient à son angle, et l’on entre dans le groupe sans s’y fondre.',
  },
  Poissons: {
    element: 'Eau',
    modality: 'mutable',
    reading:
      'Le contour est plus souple. On capte l’ambiance avant de se définir, et l’abord peut sembler doux, rêveur ou difficile à cerner.',
  },
};

export const ASCENDANT_SIGNS = Object.keys(PROFILES);

export function signProfile(sign: string): SignProfile {
  const found = PROFILES[sign];
  if (!found) {
    return {
      sign,
      element: '',
      modality: '',
      reading:
        'Le degré est calculé. La tradition associe l’ascendant à la manière d’entrer en relation, sans en faire une prédiction.',
    };
  }
  return { sign, ...found };
}

export interface AscendantResult {
  sign: string;
  position: string;
  element: string;
  modality: string;
  reading: string;
  sunSign: string;
  moonSign: string;
  placeLabel: string;
  timeZone: string;
  localMeanTime: boolean;
}

export function presentAscendant(input: {
  sign: string;
  position: string;
  sunSign: string;
  moonSign: string;
  placeLabel: string;
  timeZone: string;
  localMeanTime: boolean;
}): AscendantResult {
  const profile = signProfile(input.sign);
  return {
    sign: profile.sign,
    position: input.position,
    element: profile.element,
    modality: profile.modality,
    reading: profile.reading,
    sunSign: input.sunSign,
    moonSign: input.moonSign,
    placeLabel: input.placeLabel,
    timeZone: input.timeZone,
    localMeanTime: input.localMeanTime,
  };
}

export interface ConsultCandidate {
  id: string;
  slug: string;
  gender: 'femme' | 'homme';
  languages: readonly string[];
  immediateSlotId: string | null;
  immediateStartsAt: string | null;
}

export interface ConsultChoice {
  href: string;
  gender: 'femme' | 'homme';
}

/** Une seule destination produit : réservation immédiate, sinon la fiche, sinon l’annuaire. */
export function consultChoice(advisors: readonly ConsultCandidate[]): ConsultChoice {
  const french = advisors.filter((advisor) => advisor.languages.includes('fr'));
  const women = french.filter((advisor) => advisor.gender === 'femme');
  const pool = women.length > 0 ? women : french;
  const immediate = pool.find((advisor) => advisor.immediateSlotId && advisor.immediateStartsAt);
  if (immediate?.immediateSlotId && immediate.immediateStartsAt) {
    const params = new URLSearchParams({
      slot: immediate.immediateSlotId,
      at: immediate.immediateStartsAt,
      advisor: immediate.id,
    });
    return {
      href: `/book?${params.toString()}`,
      gender: immediate.gender,
    };
  }
  if (pool[0]) return { href: `/fr/astrologue/${pool[0].slug}`, gender: pool[0].gender };
  return { href: '/fr#annuaire', gender: 'femme' };
}

export function ascendantJsonLd(origin: string): Record<string, unknown> {
  const url = `${origin}${ASCENDANT_PATH}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${origin}/fr` },
          { '@type': 'ListItem', position: 2, name: ASCENDANT_H1, item: url },
        ],
      },
      {
        '@type': 'WebApplication',
        name: ASCENDANT_H1,
        url,
        description: ASCENDANT_DESCRIPTION,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        inLanguage: 'fr-FR',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
        provider: { '@id': `${origin}/#organization` },
      },
      {
        '@type': 'FAQPage',
        url,
        inLanguage: 'fr-FR',
        mainEntity: ASCENDANT_FAQS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}
