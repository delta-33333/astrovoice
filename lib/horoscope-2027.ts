/**
 * Horoscope 2027 — dates calculées (éphéméride JPL DE440s via Skyfield, longitudes
 * tropicales géocentriques apparentes), converties en heure de Paris.
 * Script de calcul : scripts/ephemeris-2027.py. Aucune date n'est inventée.
 */

export const H2027_BASE = '/fr/horoscope-2027';
export const H2027_ORIGIN = 'https://callastral.com';
export const H2027_UPDATED = '2026-10-25';
export const H2027_TRIAL = '/fr/essai';

export const H2027_SIGNS = [
  'belier', 'taureau', 'gemeaux', 'cancer', 'lion', 'vierge',
  'balance', 'scorpion', 'sagittaire', 'capricorne', 'verseau', 'poissons',
] as const;
export type H2027Sign = (typeof H2027_SIGNS)[number];

const NAMES: Record<H2027Sign, string> = {
  belier: 'Bélier', taureau: 'Taureau', gemeaux: 'Gémeaux', cancer: 'Cancer', lion: 'Lion', vierge: 'Vierge',
  balance: 'Balance', scorpion: 'Scorpion', sagittaire: 'Sagittaire', capricorne: 'Capricorne', verseau: 'Verseau', poissons: 'Poissons',
};

export function h2027Name(id: H2027Sign): string {
  return NAMES[id];
}

export function h2027Path(id?: H2027Sign): string {
  return id ? `${H2027_BASE}/${id}` : H2027_BASE;
}

export function isH2027Sign(value: string): value is H2027Sign {
  return (H2027_SIGNS as readonly string[]).includes(value);
}

export interface SkyEvent {
  date: string;
  event: string;
  detail: string;
}

/** Événements 2027 (heure de Paris), triés chronologiquement. */
export const SKY_2027: SkyEvent[] = [
  { date: '10 janvier 2027', event: 'Mars rétrograde', detail: 'à 10° Vierge' },
  { date: '6 février 2027', event: 'Éclipse solaire annulaire', detail: 'Nouvelle Lune à 17° Verseau' },
  { date: '8 février 2027', event: 'Uranus redevient direct', detail: 'à 1° Gémeaux' },
  { date: '9 février 2027', event: 'Mercure rétrograde', detail: 'à 6° Poissons, jusqu’au 3 mars (21° Verseau)' },
  { date: '21 février 2027', event: 'Éclipse lunaire pénombrale', detail: 'Pleine Lune en Vierge' },
  { date: '21 février 2027', event: 'Mars rétrograde regagne le Lion', detail: 'pendant sa rétrogradation' },
  { date: '1er avril 2027', event: 'Mars redevient direct', detail: 'à 21° Lion' },
  { date: '13 avril 2027', event: 'Jupiter redevient direct', detail: 'à 17° Lion' },
  { date: '8 mai 2027', event: 'Pluton rétrograde', detail: 'à 7° Verseau, jusqu’au 18 octobre (4° Verseau)' },
  { date: '14 mai 2027', event: 'Mars entre en Vierge', detail: 'jusqu’au 15 juillet' },
  { date: '10 juin 2027', event: 'Mercure rétrograde', detail: 'à 6° Cancer, jusqu’au 4 juillet (27° Gémeaux)' },
  { date: '10 juillet 2027', event: 'Neptune rétrograde', detail: 'à 6° Bélier, jusqu’au 15 décembre (3° Bélier)' },
  { date: '15 juillet 2027', event: 'Mars entre en Balance', detail: 'jusqu’au 2 septembre' },
  { date: '18 juillet 2027', event: 'Éclipse lunaire pénombrale', detail: 'Pleine Lune en Capricorne' },
  { date: '26 juillet 2027', event: 'Jupiter entre en Vierge', detail: 'après un an en Lion' },
  { date: '2 août 2027', event: 'Éclipse solaire totale', detail: 'Nouvelle Lune à 9° Lion' },
  { date: '9 août 2027', event: 'Saturne rétrograde', detail: 'à 27° Bélier, jusqu’au 24 décembre (21° Bélier)' },
  { date: '17 août 2027', event: 'Éclipse lunaire pénombrale', detail: 'Pleine Lune en Verseau' },
  { date: '2 septembre 2027', event: 'Mars entre en Scorpion', detail: 'jusqu’au 16 octobre' },
  { date: '15 septembre 2027', event: 'Uranus rétrograde', detail: 'à 10° Gémeaux' },
  { date: '7 octobre 2027', event: 'Mercure rétrograde', detail: 'à 4° Scorpion, jusqu’au 28 octobre (19° Balance)' },
  { date: '16 octobre 2027', event: 'Mars entre en Sagittaire', detail: 'jusqu’au 25 novembre' },
  { date: '15 décembre 2027', event: 'Neptune redevient direct', detail: 'à 3° Bélier' },
  { date: '24 décembre 2027', event: 'Saturne redevient direct', detail: 'à 21° Bélier' },
];

/** Index de signe (0 = Bélier) des placements de 2027. */
const SKY_SIGN = {
  jupiterA: 4, // Lion jusqu'au 26 juillet
  jupiterB: 5, // Vierge ensuite
  saturn: 0, // Bélier toute l'année
  neptune: 0, // Bélier toute l'année
  uranus: 2, // Gémeaux toute l'année
  pluto: 10, // Verseau toute l'année
  marsRetro: 4, // Lion (rétrogradation de janvier à avril, finit en Lion)
  eclipseFeb: 10, // Verseau
  eclipseAug: 4, // Lion
  mercuryJun: 3, // Cancer
  mercuryOct: 7, // Scorpion
};

interface House {
  dom: string;
  love: string;
  work: string;
  money: string;
}

const HOUSES: House[] = [
  {
    dom: 'votre image et votre élan personnel',
    love: 'on vous remarque davantage, et l’attirance passe d’abord par la façon dont vous vous montrez',
    work: 'vous êtes attendu en première ligne, avec vos initiatives plus qu’avec les consignes des autres',
    money: 'les dépenses liées à votre image ou à votre santé méritent un budget clair plutôt que des achats impulsifs',
  },
  {
    dom: 'vos revenus et votre sentiment de valeur',
    love: 'vous voulez une relation qui rassure et qui se prouve par des gestes concrets',
    work: 'la question du salaire, des tarifs ou d’une renégociation devient un vrai sujet',
    money: 'c’est le secteur des revenus lui-même qui est activé : bon moment pour revoir vos prix, votre épargne et vos abonnements',
  },
  {
    dom: 'vos échanges, vos trajets et votre entourage proche',
    love: 'les mots comptent : messages, appels et conversations longues font avancer les sentiments',
    work: 'écrire, vendre, former ou négocier : tout ce qui passe par la parole est favorisé',
    money: 'les petites rentrées liées à un savoir-faire de communication peuvent s’additionner',
  },
  {
    dom: 'votre foyer, votre famille et vos racines',
    love: 'le couple se construit à la maison, autour d’un lieu de vie ou d’un projet familial',
    work: 'le télétravail, un déménagement ou une base plus stable changent votre rythme professionnel',
    money: 'un achat immobilier, des travaux ou une aide familiale peuvent peser dans le budget',
  },
  {
    dom: 'vos amours, votre créativité et vos plaisirs',
    love: 'c’est le secteur des coups de cœur : rencontres, séduction et envie de légèreté',
    work: 'un projet créatif ou personnel prend de la place et peut devenir une activité visible',
    money: 'les loisirs coûtent plus cher, mais un talent créatif peut aussi rapporter',
  },
  {
    dom: 'votre quotidien, votre santé et vos méthodes de travail',
    love: 'l’amour se joue dans le concret du quotidien, dans l’attention et les petits services rendus',
    work: 'votre organisation, vos outils et votre charge de travail sont à revoir en profondeur',
    money: 'des économies sont possibles en rationalisant vos dépenses courantes',
  },
  {
    dom: 'vos relations de couple et vos associations',
    love: 'le couple et l’engagement passent au premier plan, pour officialiser ou pour clarifier',
    work: 'les partenariats, contrats et collaborations à deux décident de beaucoup de choses',
    money: 'l’argent d’un associé ou d’un conjoint influence vos décisions financières',
  },
  {
    dom: 'l’intimité, les ressources partagées et les transformations profondes',
    love: 'la relation gagne en intensité ; la confiance et la vulnérabilité sont au centre',
    work: 'vous travaillez sur des sujets de fond, parfois en coulisses, avec un enjeu de pouvoir',
    money: 'crédits, impôts, héritages ou comptes communs demandent une mise à plat',
  },
  {
    dom: 'les études, les voyages lointains et votre vision du monde',
    love: 'vous êtes attiré par ce qui vous dépayse : une personne d’ailleurs, un voyage à deux',
    work: 'formation, publication ou projet à l’international ouvrent des perspectives',
    money: 'investir dans une formation ou un voyage peut se révéler rentable à moyen terme',
  },
  {
    dom: 'votre carrière et votre place publique',
    love: 'votre vie professionnelle laisse moins de temps au couple ; il faudra le protéger',
    work: 'c’est le secteur de la carrière : responsabilités, promotion ou changement de cap sont possibles',
    money: 'une évolution de poste peut se traduire par une évolution de revenus',
  },
  {
    dom: 'vos amitiés, vos réseaux et vos projets collectifs',
    love: 'une rencontre peut venir d’un cercle d’amis, d’une association ou d’un réseau',
    work: 'votre réseau devient votre meilleur levier : recommandations, collectifs, communautés',
    money: 'des gains peuvent venir d’un projet à plusieurs, à condition de bien cadrer qui fait quoi',
  },
  {
    dom: 'votre vie intérieure, le repos et ce qui se joue en coulisses',
    love: 'les sentiments se vivent plus discrètement ; un amour secret ou un besoin de solitude peut surgir',
    work: 'vous préparez la suite loin des regards ; c’est un temps de bilan plus que de vitrine',
    money: 'gardez une marge de sécurité : des dépenses discrètes peuvent s’accumuler',
  },
];

const INTROS: Record<H2027Sign, string> = {
  belier: 'Pour le Bélier, 2027 a un goût de chantier personnel. Saturne et Neptune traversent tous deux votre signe toute l’année, ce qui place votre identité au centre du jeu : qui êtes-vous devenu, et qu’avez-vous envie de bâtir pour les années à venir ? L’année demande moins de vitesse et plus de constance, deux mots qui ne vous sont pas toujours naturels.',
  taureau: 'Pour le Taureau, 2027 se joue en deux temps. Pendant que Saturne et Neptune travaillent dans l’ombre de votre douzième secteur, Jupiter passe du Lion à la Vierge en juillet, un signe de terre comme le vôtre. Après un premier semestre de réglages, la seconde moitié de l’année vous paraît plus fluide et plus joyeuse.',
  gemeaux: 'Pour les Gémeaux, 2027 est une année de réinvention. Uranus séjourne dans votre signe toute l’année : envies de changement, idées neuves, besoin d’air. Saturne et Neptune en Bélier activent vos réseaux, et Jupiter éclaire d’abord vos échanges avant de se tourner vers votre foyer à partir de l’été.',
  cancer: 'Pour le Cancer, 2027 met la carrière sous les projecteurs. Saturne et Neptune en Bélier traversent le sommet de votre ciel solaire : vous êtes attendu sur vos responsabilités. Jupiter soutient d’abord vos finances, puis vos échanges à partir de l’été. Une année exigeante, mais structurante.',
  lion: 'Pour le Lion, 2027 commence avec Jupiter dans votre signe et culmine avec une éclipse solaire totale dans votre signe le 2 août. C’est votre année de visibilité, à condition de savoir ce que vous voulez montrer. L’entrée de Jupiter en Vierge fin juillet déplace ensuite la chance vers vos revenus.',
  vierge: 'Pour la Vierge, 2027 démarre discrètement et s’ouvre à l’été. Mars rétrograde commence dans votre signe en janvier, puis Jupiter entre en Vierge le 26 juillet pour une période de croissance personnelle. Le premier semestre prépare ; le second récolte.',
  balance: 'Pour la Balance, 2027 parle d’abord de l’autre. Saturne et Neptune en Bélier, votre signe opposé, mettent vos relations de couple et vos associations au centre. Jupiter soutient vos amitiés jusqu’en juillet, puis vous invite au recul. Mars traverse votre signe de mi-juillet à début septembre.',
  scorpion: 'Pour le Scorpion, 2027 est une année de travail sur le quotidien. Saturne et Neptune en Bélier réorganisent votre hygiène de vie et vos méthodes, tandis que Jupiter en Lion booste votre carrière jusqu’en juillet. Mars dans votre signe en septembre et Mercure rétrograde chez vous en octobre animent la rentrée.',
  sagittaire: 'Pour le Sagittaire, 2027 a des airs de renouveau sentimental et créatif. Saturne et Neptune en Bélier traversent votre secteur des amours et des plaisirs, et Jupiter, votre planète, voyage d’abord dans un signe de feu ami avant de rejoindre votre secteur de carrière. Mars rentre dans votre signe le 16 octobre.',
  capricorne: 'Pour le Capricorne, 2027 parle de racines. Saturne, votre planète, passe l’année en Bélier, dans votre secteur du foyer : maison, famille et base de vie se consolident. Jupiter rejoint la Vierge, un signe de terre comme le vôtre, en juillet, ce qui élargit votre horizon pour la fin de l’année.',
  verseau: 'Pour le Verseau, 2027 est une année forte. Pluton poursuit sa traversée de votre signe, l’éclipse solaire du 6 février tombe chez vous, et Uranus, votre planète moderne, stimule votre secteur des amours depuis les Gémeaux. Saturne et Neptune en Bélier sollicitent vos échanges et vos apprentissages.',
  poissons: 'Pour les Poissons, 2027 est une année de remise à plat financière et de travail sur l’estime de soi. Neptune, votre planète moderne, et Saturne traversent votre secteur des revenus. Mercure rétrograde démarre dans votre signe en février, et Jupiter rejoint votre secteur du couple à partir du 26 juillet.',
};

function house(sign: number, planet: number): number {
  return ((planet - sign + 12) % 12) + 1;
}

function hd(n: number): House {
  return HOUSES[n - 1];
}

function ord(n: number): string {
  return n === 1 ? '1er' : `${n}e`;
}

export interface H2027Section {
  h2: string;
  paragraphs: string[];
}

export interface H2027Model {
  id: H2027Sign;
  name: string;
  path: string;
  title: string;
  description: string;
  h1: string;
  sections: H2027Section[];
}

const DISCLAIMER = 'Ce texte est un horoscope général, établi d’après le signe solaire et des positions planétaires réellement calculées. Il est proposé à titre de divertissement et de réflexion personnelle : il ne remplace ni un avis médical, juridique ou financier, ni votre propre jugement.';

export const H2027_DISCLAIMER = DISCLAIMER;

export function h2027Model(id: H2027Sign): H2027Model {
  const s = H2027_SIGNS.indexOf(id);
  const name = NAMES[id];
  const jA = house(s, SKY_SIGN.jupiterA);
  const jB = house(s, SKY_SIGN.jupiterB);
  const sat = house(s, SKY_SIGN.saturn);
  const ura = house(s, SKY_SIGN.uranus);
  const plu = house(s, SKY_SIGN.pluto);
  const eF = house(s, SKY_SIGN.eclipseFeb);
  const eA = house(s, SKY_SIGN.eclipseAug);
  const mr = house(s, SKY_SIGN.marsRetro);
  const mJ = house(s, SKY_SIGN.mercuryJun);
  const mO = house(s, SKY_SIGN.mercuryOct);

  const overview = [
    INTROS[id],
    `En lecture par signe solaire, Jupiter occupe votre ${ord(jA)} secteur, celui de ${hd(jA).dom}, jusqu’au 26 juillet 2027, puis votre ${ord(jB)} secteur, celui de ${hd(jB).dom}. Saturne et Neptune restent en Bélier toute l’année, dans votre ${ord(sat)} secteur (${hd(sat).dom}). Uranus en Gémeaux active ${hd(ura).dom}, et Pluton en Verseau continue de transformer ${hd(plu).dom}.`,
  ];

  const love = [
    `Côté cœur, le premier semestre est porté par Jupiter : ${hd(jA).love}. Ce climat dure jusqu’à la fin juillet, avec un second souffle après le 13 avril, quand Jupiter redevient direct. À partir du 26 juillet, le ton change : ${hd(jB).love}.`,
    `Les deux éclipses solaires de l’année dessinent vos tournants affectifs. Celle du 6 février touche ${hd(eF).dom} ; celle du 2 août, totale, touche ${hd(eA).dom}. ${eA === 5 || eA === 7 || eF === 5 || eF === 7 ? 'Comme l’une d’elles tombe dans un secteur relationnel, une rencontre, une décision de couple ou une clarification sentimentale est plausible autour de ces dates.' : 'Ces dates servent davantage de révélateur : elles montrent ce qui nourrit vraiment votre vie affective.'} Avec Neptune dans votre ${ord(sat)} secteur, gardez les pieds sur terre : ${hd(sat).love}, mais l’idéalisation guette.`,
  ];

  const work = [
    `Au travail, Saturne en Bélier est le fil rouge de 2027 : ${hd(sat).work}. C’est une planète lente, qui récompense la méthode. Sa rétrogradation du 9 août au 24 décembre est le moment de consolider ce qui a été lancé plutôt que d’ouvrir de nouveaux fronts.`,
    `Le début d’année est plus lent qu’il n’y paraît : Mars est rétrograde du 10 janvier au 1er avril et termine sa course dans votre ${ord(mr)} secteur. ${hd(mr).work.charAt(0).toUpperCase()}${hd(mr).work.slice(1)}, mais mieux vaut reprendre un dossier existant que forcer un démarrage. Uranus, de son côté, peut provoquer des surprises dans ${hd(ura).dom}, surtout après sa station rétrograde du 15 septembre.`,
    `Les trois rétrogradations de Mercure (9 février - 3 mars, 10 juin - 4 juillet, 7 - 28 octobre) invitent à relire les contrats et à confirmer les rendez-vous. Celle de juin concerne votre ${ord(mJ)} secteur, celle d’octobre votre ${ord(mO)} secteur.`,
  ];

  const money = [
    `Pour l’argent, l’entrée de Jupiter en Vierge le 26 juillet est la date à retenir : ${hd(jB).money}. Avant cela, Jupiter en Lion suggère que ${hd(jA).money}.`,
    `Pluton, qui rétrograde du 8 mai au 18 octobre en Verseau, agit sur la durée dans votre ${ord(plu)} secteur : ${hd(plu).money}. Aucune date de 2027 n’impose une décision financière, mais les périodes de Mercure rétrograde sont mieux adaptées à la vérification qu’à la signature.`,
  ];

  const months = [
    `Janvier à mars : Mars rétrograde (à partir du 10 janvier), éclipse du 6 février et Mercure rétrograde du 9 février au 3 mars forment un trimestre de réglages. Ralentissez, relisez, réparez.`,
    `Avril : Mars (1er avril) puis Jupiter (13 avril) redeviennent directs. C’est l’un des meilleurs moments de l’année pour relancer ce qui s’était figé, en particulier dans ${hd(jA).dom}.`,
    `Juillet-août : le grand virage. Jupiter entre en Vierge le 26 juillet, l’éclipse totale du 2 août frappe votre ${ord(eA)} secteur et Saturne rétrograde le 9 août. Trois signaux en deux semaines, à vivre comme un changement de saison personnel.`,
    `Octobre : Mercure rétrograde du 7 au 28 octobre et Pluton redevient direct le 18 octobre. Bilan, ajustements, puis reprise de l’élan avant la fin d’année, quand Neptune (15 décembre) et Saturne (24 décembre) repartent en mouvement direct.`,
  ];

  const cta = `Envie d’aller plus loin que le signe solaire ? Un thème natal tient compte de votre heure et de votre lieu de naissance. Sur Callastral, vous pouvez en parler avec un conseiller vocal (une intelligence artificielle, toujours présentée comme telle) : 3 min offertes, sans carte.`;

  const title = `Horoscope 2027 ${name} : amour, travail, argent mois par mois | Callastral`;
  return {
    id,
    name,
    path: h2027Path(id),
    title,
    description: `Horoscope 2027 ${name} : amour, travail et argent, avec les vraies dates de 2027 (Jupiter en Vierge le 26 juillet, éclipses, rétrogrades) et les mois clés.`,
    h1: `Horoscope 2027 ${name}`,
    sections: [
      { h2: `L’année 2027 du ${name} en bref`, paragraphs: overview },
      { h2: `Amour en 2027`, paragraphs: love },
      { h2: `Travail et carrière en 2027`, paragraphs: work },
      { h2: `Argent en 2027`, paragraphs: money },
      { h2: `Les mois clés de 2027`, paragraphs: months },
      { h2: `Aller plus loin`, paragraphs: [cta] },
    ],
  };
}

export function h2027Prose(model: H2027Model): string {
  return model.sections.flatMap((section) => section.paragraphs).join(' ');
}

export function h2027JsonLd(input: { path: string; h1: string; description: string; signName?: string }): Record<string, unknown> {
  const url = `${H2027_ORIGIN}${input.path}`;
  const crumbs = [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${H2027_ORIGIN}/fr` },
    { '@type': 'ListItem', position: 2, name: 'Horoscope 2027', item: `${H2027_ORIGIN}${H2027_BASE}` },
  ];
  if (input.signName) crumbs.push({ '@type': 'ListItem', position: 3, name: input.signName, item: url });
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: crumbs },
      {
        '@type': 'Article',
        headline: input.h1,
        description: input.description,
        url,
        mainEntityOfPage: url,
        inLanguage: 'fr-FR',
        datePublished: H2027_UPDATED,
        dateModified: H2027_UPDATED,
        author: { '@type': 'Organization', name: 'Callastral', url: H2027_ORIGIN },
        publisher: { '@type': 'Organization', name: 'Callastral', url: H2027_ORIGIN },
      },
    ],
  };
}
