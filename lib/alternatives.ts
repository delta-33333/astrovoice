/**
 * Fiches « alternative à [concurrent] ».
 * Faits concurrents : pages publiques consultées le 13 octobre 2026.
 * Un fait introuvable est écrit « non communiqué ». Aucun logo, aucun avis.
 */

export const ALT_CHECKED_ISO = '2026-10-13';

export type AltLocale = 'fr' | 'en';

/** Même libellé que homeLabel (lib/seo), sans importer ce module (tests Node). */
const HOME_LABEL: Record<AltLocale, string> = { fr: 'Accueil', en: 'Home' };

export interface AltSource {
  id: string;
  label: string;
  url: string;
}

export interface AltFaq {
  question: string;
  answer: string;
}

export interface CompetitorPage {
  id: string;
  market: AltLocale;
  name: string;
  path: string;
  /** Expression naturelle visée par le title, la meta et le H1. */
  keyword: string;
  h1: string;
  title: string;
  description: string;
  advisors: string;
  price: string;
  welcome: string;
  availability: string;
  format: string;
  freeTools: string;
  sources: AltSource[];
  whenChoose: string[];
  faqs: AltFaq[];
}

export const HUB_PATHS = {
  fr: '/fr/alternatives',
  en: '/en/alternatives',
} as const;

export function hubAlternates(): Record<string, string> {
  return { fr: HUB_PATHS.fr, en: HUB_PATHS.en, 'x-default': HUB_PATHS.fr };
}

export function checkedLabel(locale: AltLocale): string {
  return locale === 'fr' ? 'Relevé du 13 octobre 2026' : 'Checked on 13 October 2026';
}

const NOT = 'non communiqué';

export const COMPETITORS: CompetitorPage[] = [
  {
    id: 'voyance-fr',
    market: 'fr',
    name: 'Voyance.fr',
    path: '/fr/alternative-a-voyance-fr',
    keyword: 'alternative à Voyance.fr',
    h1: 'Alternative à Voyance.fr pour une astrologie par téléphone',
    title: 'Alternative à Voyance.fr : astrologie par téléphone',
    description:
      'Alternative à Voyance.fr : Callastral affiche 0,50 € à 1,99 €/min avec des personas virtuels. Voyants humains, audiotel et offre 15 € chez Voyance.fr.',
    advisors: 'Voyants humains, salariés du cabinet (près de 300, selon la page d’accueil).',
    price:
      'Audiotel : 0,80 €/min + prix de l’appel (30 minutes maximum). Après l’offre carte : 3,50 € à 9,50 € TTC/min selon le voyant. SMS : 0,99 € par SMS + coût du SMS.',
    welcome:
      '10 minutes de voyance privée à 15 € TTC, après validation d’un compte et d’une carte. L’audiotel n’inclut pas ces 10 minutes.',
    availability: 'Téléphone privé indiqué de 7 h à 3 h, 365 jours par an.',
    format: 'Téléphone privé, audiotel, SMS, tchat et tirages en ligne.',
    freeTools: 'Tirages en ligne gratuits (tarot), indiqués sur la page d’accueil.',
    sources: [
      { id: 'V1', label: 'Voyance.fr — accueil', url: 'https://www.voyance.fr/' },
      { id: 'V2', label: 'Voyance.fr — voyance par téléphone', url: 'https://www.voyance.fr/voyance-par-telephone.html' },
    ],
    whenChoose: [
      'Vous voulez parler à un voyant humain, salarié du cabinet.',
      'Vous voulez payer sans carte bancaire, via l’audiotel à 0,80 €/min + prix de l’appel.',
      'Vous cherchez un tirage de tarot gratuit, du SMS ou de la médiumnité, plutôt qu’une lecture de thème natal.',
    ],
    faqs: [
      {
        question: 'Quelle est une alternative à Voyance.fr pour de l’astrologie ?',
        answer:
          'Callastral est une alternative quand vous voulez une consultation par téléphone fondée sur le thème natal, à toute heure, entre 0,50 € et 1,99 €/min. Voyance.fr reste adapté si vous voulez un voyant humain, l’audiotel ou un tirage gratuit.',
      },
      {
        question: 'Les conseillers Callastral sont-ils des personnes ?',
        answer:
          'Non. Ce sont des personas virtuels créés par Callastral. Leur voix est générée par IA, ce qui est indiqué avant l’appel et dit au début de l’appel. Voyance.fr présente des voyants humains salariés.',
      },
      {
        question: 'Combien coûte Voyance.fr par rapport à Callastral ?',
        answer:
          'Le 13 octobre 2026, Voyance.fr affiche 15 € TTC les 10 premières minutes privées, puis 3,50 € à 9,50 € TTC/min, et un audiotel à 0,80 €/min + prix de l’appel. Callastral affiche un tarif par conseiller entre 0,50 € et 1,99 €/min, avec les 3 premières minutes à tarif réduit.',
      },
      {
        question: 'Voyance.fr est-il ouvert la nuit ?',
        answer:
          'La page d’accueil indique un téléphone privé de 7 h à 3 h, 365 jours par an. Ce n’est pas une ouverture 24 h/24 : la plage 3 h–7 h n’est pas couverte par cet horaire. Callastral indique un service 24 h/24.',
      },
      {
        question: 'Cette comparaison est-elle une publicité ?',
        answer:
          'Oui. Callastral est notre service, ce qui est indiqué. Les mêmes critères sont appliqués aux deux offres, avec les pages sources et la date du relevé. Le nom Voyance.fr sert seulement à identifier le service.',
      },
    ],
  },
  {
    id: 'wengo',
    market: 'fr',
    name: 'Wengo',
    path: '/fr/alternative-a-wengo',
    keyword: 'alternative à Wengo',
    h1: 'Alternative à Wengo pour consulter en astrologie',
    title: 'Alternative à Wengo : astrologie par téléphone',
    description:
      'Alternative à Wengo : forfaits et experts humains d’un côté, personas virtuels Callastral de 0,50 € à 1,99 €/min de l’autre. Relevé du 13 octobre 2026.',
    advisors: 'Experts humains, présentés sur des fiches, qui rappellent au téléphone.',
    price:
      'Selon l’expert. La page forfaits affiche 10 min à 30 € ou 20 min à 59 €. Sur la page des petits prix consultée le 13 octobre 2026, des fiches affichent un prix à la minute (exemples relevés : 2,25 € à 3,58 €/min). Ce n’est pas une fourchette officielle exhaustive.',
    welcome: 'Plusieurs fiches de cette page affichent 5 € pour 10 min puis 2,50 €/min.',
    availability: 'La page voyance par téléphone indique un accompagnement 24 h/24 et 7 j/7.',
    format: 'Téléphone, chat et visio.',
    freeTools: 'Le pied de page de la page téléphone cite « Demande à la Boule » et « Tarot Oui-Non ».',
    sources: [
      { id: 'W1', label: 'Wengo — forfaits', url: 'https://www.wengo.fr/voyance-astrologie-1270/forfait' },
      { id: 'W2', label: 'Wengo — voyants par prix', url: 'https://www.wengo.fr/voyance-astrologie-1270/thema/all-voyants-by-price' },
      { id: 'W3', label: 'Wengo — voyance par téléphone', url: 'https://www.wengo.fr/voyance-astrologie-1270/thema/voyance-telephone' },
    ],
    whenChoose: [
      'Vous voulez choisir un expert humain, et garder le téléphone, le chat ou la visio.',
      'Vous voulez un forfait à durée fixe : 10 min à 30 € ou 20 min à 59 €.',
      'Vous voulez un catalogue large, au-delà de l’astrologie du thème natal.',
    ],
    faqs: [
      {
        question: 'Quelle alternative à Wengo si je veux surtout de l’astrologie ?',
        answer:
          'Callastral se limite à une consultation téléphonique à partir du thème natal, avec un persona virtuel. Wengo convient mieux si vous voulez un expert humain, la visio, ou un forfait 10 ou 20 minutes.',
      },
      {
        question: 'Wengo est-il moins cher que Callastral ?',
        answer:
          'Pas de façon générale. Le 13 octobre 2026, Wengo publie des forfaits à 30 € les 10 min et 59 € les 20 min, et des fiches autour de 2,25 € à 3,58 €/min sur la page consultée. Callastral reste dans une fourchette affichée de 0,50 € à 1,99 €/min. Le bon choix dépend du mode (humain ou virtuel) autant que du prix.',
      },
      {
        question: 'Les conseillers Callastral ont-ils une voix humaine ?',
        answer:
          'Non. La voix est générée par IA, pour un persona virtuel. Ce n’est pas un expert Wengo qui rappelle. L’information est donnée avant le paiement et au début de l’appel.',
      },
      {
        question: 'Puis-je voir l’expert chez Wengo ?',
        answer:
          'Oui. La page voyance par téléphone de Wengo indique le chat, la visio et le téléphone. Callastral ne propose que le téléphone.',
      },
      {
        question: 'D’où viennent les prix Wengo cités ici ?',
        answer:
          'De trois pages wengo.fr consultées le 13 octobre 2026 : les forfaits, la page des petits prix et la page voyance par téléphone. Les exemples à la minute ne décrivent pas tout le catalogue.',
      },
    ],
  },
  {
    id: 'spiriteo',
    market: 'fr',
    name: 'Spiriteo',
    path: '/fr/alternative-a-spiriteo',
    keyword: 'alternative à Spiriteo',
    h1: 'Alternative à Spiriteo : consultation d’astrologie par téléphone',
    title: 'Alternative à Spiriteo : prix et format comparés',
    description:
      'Alternative à Spiriteo : téléphone dès 1,65 €/min avec un voyant humain, ou Callastral de 0,50 € à 1,99 €/min avec une voix générée par IA.',
    advisors: 'Voyants humains : la page tarifs indique que l’expert décroche.',
    price:
      'Téléphone à partir de 1,65 €/min selon le voyant, sur compte prépayé. Chat facturé à la seconde. E-mail : 900 crédits, soit 30,90 €.',
    welcome: 'La page tarifs annonce des offres de bienvenue et des minutes gratuites, sans montant chiffré.',
    availability: 'Horaire chiffré : non communiqué. La page invite à consulter quand on le souhaite.',
    format: 'Téléphone, chat et e-mail. Paiement par carte, PayPal ou virement.',
    freeTools: NOT,
    sources: [
      {
        id: 'SP1',
        label: 'Spiriteo — tarifs téléphone, e-mail et chat',
        url: 'https://www.spiriteo.com/fr-fr/tarifs-et-modalites/tarifs-par-telephone-email-ou-chat',
      },
    ],
    whenChoose: [
      'Vous voulez un voyant humain et un compte prépayé qui plafonne la dépense.',
      'Vous voulez aussi écrire : le chat à la seconde ou un e-mail à 30,90 €.',
      'Un départ à 1,65 €/min, selon le voyant, vous convient mieux qu’un persona virtuel.',
    ],
    faqs: [
      {
        question: 'Spiriteo est-il une consultation humaine ?',
        answer:
          'Oui, d’après sa page tarifs : le débit téléphone commence quand l’expert décroche, et le prix dépend du voyant choisi. Callastral, à l’inverse, n’emploie pas de voyant humain au téléphone.',
      },
      {
        question: 'Quel est le prix d’une alternative à Spiriteo ?',
        answer:
          'Spiriteo affiche le téléphone à partir de 1,65 €/min et l’e-mail à 30,90 €, relevé le 13 octobre 2026. Callastral affiche 0,50 € à 1,99 €/min selon le conseiller virtuel, avant l’appel.',
      },
      {
        question: 'Spiriteo a-t-il un outil gratuit comme un calcul d’ascendant ?',
        answer:
          'Non communiqué sur la page tarifs consultée. Callastral propose un calcul d’ascendant gratuit, sans compte, à partir de la même base d’éphémérides que les consultations.',
      },
      {
        question: 'Le compte prépayé Spiriteo évite-t-il les dépassements ?',
        answer:
          'La page tarifs le présente ainsi : vous créditez un montant, et la consultation s’arrête avec le solde. Callastral affiche le tarif minute avant le paiement et facture le temps passé, avec 3 minutes d’introduction à tarif réduit.',
      },
      {
        question: 'Pourquoi citer Spiriteo ?',
        answer:
          'Pour identifier un service de voyance par téléphone souvent comparé en France. Le nom n’est pas utilisé comme une marque de Callastral, et aucun logo n’est repris.',
      },
    ],
  },
  {
    id: 'cosmospace',
    market: 'fr',
    name: 'Cosmospace',
    path: '/fr/alternative-a-cosmospace',
    keyword: 'alternative à Cosmospace',
    h1: 'Alternative à Cosmospace pour une lecture par téléphone',
    title: 'Alternative à Cosmospace : tarifs de voyance comparés',
    description:
      'Alternative à Cosmospace : 10 minutes offertes puis 3,50 € à 9,50 €/min avec un voyant humain, ou Callastral, personas virtuels, 0,50 € à 1,99 €/min.',
    advisors: 'Voyants humains (fiches de médiums, tarologues et astrologues).',
    price: 'Après l’offre : 3,50 € à 9,50 € TTC la minute supplémentaire, selon le voyant.',
    welcome:
      '10 minutes de voyance privée offertes, après validation du compte (identité, téléphone, adresse, e-mail) et d’une carte.',
    availability: 'Horaire chiffré : non communiqué. La page téléphone affiche le 01 77 77 77 77.',
    format: 'Téléphone, tchat et SMS. L’audiotel figure au menu ; son prix sur cette page : non communiqué.',
    freeTools: NOT,
    sources: [
      { id: 'C1', label: 'Cosmospace — voyance par téléphone', url: 'https://www.cosmospace.com/voyance/telephone' },
    ],
    whenChoose: [
      'Vous voulez 10 minutes privées avec un voyant humain, carte bancaire à l’appui.',
      'Vous acceptez ensuite un tarif de 3,50 € à 9,50 € TTC/min selon la fiche.',
      'Vous voulez le tchat ou le SMS en plus du téléphone.',
    ],
    faqs: [
      {
        question: 'Cosmospace est-il moins cher qu’une alternative comme Callastral ?',
        answer:
          'Les 10 premières minutes privées sont offertes, ce que Callastral ne fait pas. Ensuite, Cosmospace affiche 3,50 € à 9,50 € TTC/min. Callastral reste entre 0,50 € et 1,99 €/min, y compris après les 3 minutes à tarif réduit. Le coût réel dépend donc de la durée.',
      },
      {
        question: 'L’offre de 10 minutes Cosmospace est-elle sans carte ?',
        answer:
          'Non. La page téléphone conditionne les 10 minutes offertes à un compte validé et à une carte de paiement. L’audiotel est un autre mode, dont le prix n’est pas chiffré sur cette page.',
      },
      {
        question: 'Callastral remplace-t-il un voyant Cosmospace ?',
        answer:
          'Non, si vous voulez une personne humaine. Callastral propose un persona virtuel dont la voix est générée par IA, pour une lecture du thème natal.',
      },
      {
        question: 'Cosmospace consulte-t-il 24 h/24 ?',
        answer:
          'Non communiqué sur la page téléphone relevée le 13 octobre 2026. Le numéro 01 77 77 77 77 y est affiché, sans plage horaire chiffrée.',
      },
      {
        question: 'Les notes affichées sur Cosmospace sont-elles reprises ici ?',
        answer:
          'Non. Cette fiche ne reprend ni étoiles, ni avis, ni note. Seuls le prix, le format, la disponibilité et la nature des voyants sont comparés.',
      },
    ],
  },
  {
    id: 'temporel',
    market: 'fr',
    name: 'Temporel Voyance',
    path: '/fr/alternative-a-temporel-voyance',
    keyword: 'alternative à Temporel',
    h1: 'Alternative à Temporel Voyance, avec le thème natal',
    title: 'Alternative à Temporel Voyance : téléphone et horoscope',
    description:
      'Alternative à Temporel Voyance : médiums humains de 2 € à 7 €/min, audiotel et horoscope gratuit, ou Callastral en personas virtuels.',
    advisors: 'Professionnels humains des arts divinatoires (médiums, selon les CGV).',
    price:
      'Téléphone privé : 2 € à 7 € TTC/min selon le médium. Sans carte : 0,60 € ou 0,80 €/min + prix de l’appel. SMS : 0,50 € par question, hors coût du SMS.',
    welcome: NOT,
    availability: 'Horaire chiffré : non communiqué. Numéros affichés : 01 78 41 99 39 (privé) et 08 99 86 48 48 (sans CB).',
    format: 'Téléphone privé, téléphone sans carte, e-mail, chat et SMS.',
    freeTools: 'Horoscope gratuit du jour, publié sur le site.',
    sources: [
      { id: 'T1', label: 'Temporel Voyance — CGV', url: 'https://www.temporel-voyance.com/cgv' },
      {
        id: 'T2',
        label: 'Temporel Voyance — horoscope gratuit du jour',
        url: 'https://www.temporel-voyance.com/horoscopes/horoscope-du-jour',
      },
    ],
    whenChoose: [
      'Vous voulez un médium humain, au téléphone ou par écrit.',
      'Vous voulez un audiotel à 0,60 € ou 0,80 €/min + prix de l’appel, sans carte.',
      'Vous voulez d’abord un horoscope du jour gratuit, signe solaire, avant toute consultation.',
    ],
    faqs: [
      {
        question: 'Temporel Voyance propose-t-il un horoscope gratuit ?',
        answer:
          'Oui. La page « Horoscope gratuit du jour » est publique. Callastral ne publie pas d’horoscope de signe : l’outil gratuit est un calcul d’ascendant, puis la consultation payante part du thème natal complet.',
      },
      {
        question: 'Quel est le tarif minute de Temporel ?',
        answer:
          'Les CGV, lues le 13 octobre 2026, indiquent 2 € à 7 € TTC/min en consultation privée selon le médium, et 0,60 € ou 0,80 €/min + prix de l’appel sans carte. Callastral affiche 0,50 € à 1,99 €/min pour un persona virtuel.',
      },
      {
        question: 'Une alternative à Temporel peut-elle être un voyant humain ?',
        answer:
          'Callastral ne l’est pas. Si le critère est la personne humaine, Temporel correspond mieux. Callastral correspond si vous acceptez une voix générée par IA.',
      },
      {
        question: 'Les forfaits minute de Temporel sont-ils des abonnements ?',
        answer:
          'Les CGV décrivent des forfaits de minutes (60 à 420 minutes) qui ouvrent une réduction de 8 % à 25 % sur le tarif du prestataire, valables un an. Le détail du prix de chaque forfait en euros : non communiqué sur la page lue, au-delà de ces pourcentages.',
      },
      {
        question: 'Callastral garantit-il une prédiction ?',
        answer:
          'Non. La lecture est proposée comme un divertissement et une réflexion personnelle, pas comme une prédiction certaine. Temporel indique aussi, dans ses CGV, un contenu de divertissement.',
      },
    ],
  },
  {
    id: 'kang',
    market: 'fr',
    name: 'Kang',
    path: '/fr/alternative-a-kang',
    keyword: 'alternative à Kang',
    h1: 'Alternative à Kang pour une voyance ou une astrologie',
    title: 'Alternative à Kang : 5 minutes et tarif minute',
    description:
      'Alternative à Kang : 5 minutes offertes et masters humains 24 h/24, ou Callastral, voix générée par IA, de 0,50 € à 1,99 €/min.',
    advisors: 'Professionnels humains, appelés Masters sur la page d’aide.',
    price:
      'Tarif promotionnel annoncé : 1,90 €/min après la première consultation gratuite. Le tarif de chaque master est le sien. Le paiement à la minute est décrit avec une préautorisation de 99 €, présentée comme plafond.',
    welcome: '10 € de crédits à l’inscription, présentés comme 5 minutes de consultation téléphonique gratuite.',
    availability: 'La page d’aide indique une mise en relation 24 heures sur 24 et 7 jours sur 7.',
    format: 'Téléphone et chat. L’inscription est gratuite.',
    freeTools: NOT,
    sources: [
      { id: 'K1', label: 'Kang — foire aux questions', url: 'https://www.kang.fr/foire-aux-questions' },
    ],
    whenChoose: [
      'Vous voulez tester un professionnel humain pendant 5 minutes offertes à l’inscription.',
      'Vous voulez le téléphone ou le chat, sur une plateforme annoncée 24 h/24.',
      'Le tarif promotionnel de 1,90 €/min, puis le tarif propre au master, vous convient.',
    ],
    faqs: [
      {
        question: 'Kang offre-t-il vraiment 5 minutes ?',
        answer:
          'La foire aux questions l’écrit ainsi : 10 € de crédits à l’inscription, correspondant à 5 minutes téléphoniques, sans frais sur cet appel. Ce n’est pas le modèle de Callastral, qui réduit les 3 premières minutes sans les offrir.',
      },
      {
        question: 'Quelle alternative à Kang coûte moins de 1,90 €/min ?',
        answer:
          'Callastral affiche une fourchette de 0,50 € à 1,99 €/min selon le conseiller virtuel. Une partie des tarifs est donc sous 1,90 €, une partie au-dessus. Kang annonce 1,90 €/min en promotionnel après les 5 minutes, puis le tarif du master.',
      },
      {
        question: 'Kang ne fait-il que de la voyance ?',
        answer:
          'Non. La page d’aide présente aussi du conseil juridique, du coaching et de l’astrologie. Callastral ne propose que l’astrologie par téléphone à partir du thème natal.',
      },
      {
        question: 'Les Masters Kang sont-ils des intelligences artificielles ?',
        answer:
          'La page d’aide les présente comme des spécialistes et des professionnels qui rappellent. Callastral est le service dont les personas sont virtuels et dont la voix est générée par IA.',
      },
      {
        question: 'Le plafond de 99 € est-il un prix de séance ?',
        answer:
          'La foire aux questions le décrit comme une préautorisation et comme le montant maximum d’une consultation facturée à la minute, libéré ensuite pour ne facturer que le temps passé. Ce n’est pas un forfait de 99 €.',
      },
    ],
  },
  {
    id: 'esmeralda',
    market: 'fr',
    name: 'Esmeralda',
    path: '/fr/alternative-a-esmeralda',
    keyword: 'alternative à Esmeralda',
    h1: 'Alternative à Esmeralda (Esméralda) en voyance par téléphone',
    title: 'Alternative à Esmeralda : audiotel et chat',
    description:
      'Alternative à Esmeralda : audiotel à 0,40 €/min + prix de l’appel, consultants humains de 7 h à 3 h, ou Callastral 24 h/24 en voix générée par IA.',
    advisors: 'Consultants humains, recrutés par le cabinet Esméralda.',
    price: 'Audiotel : 0,40 €/min + prix de l’appel (08 92 46 16 00). Consultation privée par carte : non communiqué sur la page d’accueil.',
    welcome: NOT,
    availability: 'De 7 h à 3 h du matin, 7 jours sur 7.',
    format: 'Téléphone audiotel, chat, SMS et application iVoyance (tchat).',
    freeTools: NOT,
    sources: [
      { id: 'E1', label: 'Esmeralda — accueil', url: 'https://www.esmeralda.fr/' },
    ],
    whenChoose: [
      'Vous voulez un consultant humain, joignable de 7 h à 3 h.',
      'Vous voulez un audiotel affiché à 0,40 €/min + prix de l’appel, sans passer par une carte sur cette ligne.',
      'Vous préférez le chat, le SMS ou l’application iVoyance.',
    ],
    faqs: [
      {
        question: 'Esmeralda et Esméralda, c’est le même service ?',
        answer:
          'Le site esmeralda.fr titre « Voyance avec Esmeralda » et parle du cabinet Esméralda. Cette page utilise les deux graphies seulement pour identifier ce cabinet.',
      },
      {
        question: 'L’audiotel Esmeralda est-il à 0,40 € tout compris ?',
        answer:
          'Non. La page d’accueil écrit « Service 0,40 € / min + prix appel ». Le prix de l’appel, facturé par l’opérateur, s’ajoute. Callastral ne passe pas par un numéro surtaxé : le tarif minute est celui du conseiller, payé par carte.',
      },
      {
        question: 'Quelle alternative à Esmeralda est ouverte entre 3 h et 7 h ?',
        answer:
          'L’horaire publié par Esmeralda s’arrête à 3 h et reprend à 7 h. Callastral indique un service 24 h/24, avec des personas virtuels plutôt que des consultants de cabinet.',
      },
      {
        question: 'Le prix de la consultation privée Esmeralda est-il connu ?',
        answer:
          'Non communiqué sur la page d’accueil consultée le 13 octobre 2026. Seul l’audiotel y est chiffré. Nous ne complétons pas ce trou par une estimation.',
      },
      {
        question: 'Callastral fait-il du tchat comme iVoyance ?',
        answer:
          'Non. Le format Callastral est l’appel téléphonique. Esmeralda indique le chat, le SMS, le téléphone et l’application iVoyance.',
      },
    ],
  },
  {
    id: 'kasamba',
    market: 'en',
    name: 'Kasamba',
    path: '/en/kasamba-alternative',
    keyword: 'Kasamba alternative',
    h1: 'Kasamba alternative for a birth-chart phone reading',
    title: 'Kasamba alternative: astrology by phone',
    description:
      'Kasamba alternative: human psychics, 3 free minutes and 70% off, or Callastral virtual advisors with an AI-generated voice.',
    advisors: 'Human psychics. The page states they are not employees or representatives of Kasamba.',
    price: `Standard per-minute rate: ${NOT} on the page checked.`,
    welcome:
      '3 free minutes on the first voice or chat reading; then 3 free chat minutes with each new advisor (not voice). Also 70% off the first session, up to $50, new clients, card required.',
    availability: NOT,
    format: 'Chat, voice call, email, and an app described as including free horoscopes.',
    freeTools: 'The Kasamba app is described as featuring free horoscopes.',
    sources: [
      { id: 'KA1', label: 'Kasamba — introductory offer', url: 'https://www.kasamba.com/lp/best-online-psychic-readings/' },
    ],
    whenChoose: [
      'You want a human psychic in English, by chat, voice or email.',
      'You want to try someone with 3 free minutes and 70% off the first session (up to $50), with a card on file.',
      'You want free horoscopes in an app as well as a live reading.',
    ],
    faqs: [
      {
        question: 'What is a Kasamba alternative if I want astrology from a birth chart?',
        answer:
          'Callastral is built for a phone reading from the natal chart, with a virtual advisor and an AI-generated voice, at a published €0.50 to €1.99 per minute. Kasamba is a better fit when you want a human psychic and the new-client minutes.',
      },
      {
        question: 'How much is a minute on Kasamba?',
        answer:
          'Non communiqué on the offer page checked on 13 October 2026. That page prices the introduction (3 free minutes and 70% off, $50 maximum) and says later minutes are billed per minute, without a public range.',
      },
      {
        question: 'Are the 3 free minutes valid for every phone call?',
        answer:
          'The page’s FAQ says the first reading can be voice or chat. After that, the 3 free minutes with each new advisor are for online chat only, not voice.',
      },
      {
        question: 'Are Callastral advisors human like Kasamba psychics?',
        answer:
          'No. Callastral advisors are virtual personas. The voice is AI-generated and disclosed before and at the start of the call. Kasamba describes gifted, real psychics.',
      },
      {
        question: 'Does this page use Kasamba’s logo or reviews?',
        answer:
          'No. The name identifies the service. There is no logo, no star rating and no review count.',
      },
    ],
  },
  {
    id: 'california-psychics',
    market: 'en',
    name: 'California Psychics',
    path: '/en/california-psychics-alternative',
    keyword: 'California Psychics alternative',
    h1: 'California Psychics alternative for a phone astrology reading',
    title: 'California Psychics alternative: rates compared',
    description:
      'California Psychics alternative: human psychics at $5 to $23/min, or Callastral virtual advisors with an AI-generated voice.',
    advisors: 'Human psychics (the pricing page presents “real psychic readings”).',
    price: '$5 to $23 per minute, as stated on the pricing page.',
    welcome:
      'New customers can start from $25: a 5-minute purchase is described as providing up to 20 minutes in total.',
    availability: `Advisor hours: ${NOT}. The pricing page says the support line 1-800-573-4784 can be reached anytime.`,
    format: 'Phone and chat, as described on the pricing and new-customer pages.',
    freeTools: NOT,
    sources: [
      { id: 'CP1', label: 'California Psychics — pricing', url: 'https://www.californiapsychics.com/pricing' },
      {
        id: 'CP2',
        label: 'California Psychics — new-customer minutes',
        url: 'https://help.californiapsychics.com/hc/en-us/articles/54624227577107-New-Customer-15-FREE-Minutes-Offer',
      },
    ],
    whenChoose: [
      'You want a human psychic by phone or chat, with a published range of $5 to $23 per minute.',
      'You want the new-customer offer that starts at $25 for up to 20 minutes.',
      'You want their published satisfaction policy. Their pricing page also says they do not guarantee that predictions will come true.',
    ],
    faqs: [
      {
        question: 'Is there a California Psychics alternative that publishes a per-minute price?',
        answer:
          'Both do. California Psychics publishes $5 to $23 per minute for human psychics. Callastral publishes €0.50 to €1.99 per minute for a virtual advisor with an AI-generated voice. They are different products at different prices.',
      },
      {
        question: 'Does California Psychics guarantee a prediction?',
        answer:
          'Their pricing page says they do not guarantee that predictions will come true. They describe a satisfaction policy if a reading is not what you hoped. Callastral does not promise a prediction either.',
      },
      {
        question: 'Are Callastral advisors the same as California Psychics advisors?',
        answer:
          'No. California Psychics works with human psychics. Callastral uses virtual personas and an AI-generated voice, disclosed before the call.',
      },
      {
        question: 'Can I call California Psychics at any hour?',
        answer:
          'Advisor hours are non communiqué on the pages checked. The support number is described as reachable anytime. Callastral states that the phone service itself runs 24/7.',
      },
      {
        question: 'Why is the name California Psychics on this page?',
        answer:
          'Only to identify the service being compared. The name and any trademarks stay theirs. No logo is shown.',
      },
    ],
  },
  {
    id: 'keen',
    market: 'en',
    name: 'Keen',
    path: '/en/keen-alternative',
    keyword: 'Keen alternative',
    h1: 'Keen alternative for a birth-chart phone consultation',
    title: 'Keen alternative: first minutes and per-minute rate',
    description:
      'Keen alternative: human advisors, often $1 for 5 minutes, then their own rate. Callastral uses virtual advisors and an AI-generated voice.',
    advisors: 'Human advisors, chosen from listings.',
    price: `After the introduction, the advisor’s own per-minute rate applies. A single published range: ${NOT}.`,
    welcome:
      'New customers typically receive $1 for the first 5 minutes with select advisors. No membership fee: you pay when you have a reading.',
    availability:
      'Advisor hours: non communiqué. Customer support is listed Monday to Friday, 6 a.m. to 4 p.m. Pacific, at 877-533-6435.',
    format: 'Call or chat, started from an advisor listing.',
    freeTools: NOT,
    sources: [
      {
        id: 'KE1',
        label: 'Keen Help — first reading and billing',
        url: 'https://help.keen.com/hc/en-us/articles/50919969977747-Getting-Started-on-Keen-Your-First-Reading-What-to-Expect',
      },
    ],
    whenChoose: [
      'You want a human advisor by phone or chat, and no membership fee.',
      'You want the typical new-customer offer of $1 for 5 minutes with select advisors.',
      'You want to pick an advisor from reviews and listings. This page does not repeat those reviews.',
    ],
    faqs: [
      {
        question: 'What is a Keen alternative that shows the price before the call?',
        answer:
          'Callastral shows each advisor’s per-minute price before payment, between €0.50 and €1.99, with the first 3 minutes at a reduced rate. Keen bills the advisor’s own rate after the promotional minutes; that rate is not published as one range on the help page we checked.',
      },
      {
        question: 'Is Keen’s $1 offer the full reading?',
        answer:
          'No. The help article says new customers typically get $1 for the first 5 minutes with select advisors, then the advisor’s per-minute rate. Unused promotional minutes stay on the account, according to a related help page, but the rate after that is the advisor’s.',
      },
      {
        question: 'Does Keen use a computer-generated voice?',
        answer:
          'The help page describes human advisors you call or chat with. Callastral is the service that uses virtual personas and an AI-generated voice, and says so.',
      },
      {
        question: 'Is there a Keen membership?',
        answer:
          'The getting-started article says there are no membership fees or recurring costs, and that you pay when you choose a reading. Callastral also offers a monthly plan, shown separately on the offers page, which Keen’s help page does not match.',
      },
      {
        question: 'Are psychic predictions guaranteed on either service?',
        answer:
          'No prediction is guaranteed here. A Callastral reading is entertainment and personal reflection, not a certain forecast. Keen’s listed facts in this table are price, format and who answers, not an accuracy claim.',
      },
    ],
  },
];

export function competitorById(id: string): CompetitorPage | undefined {
  return COMPETITORS.find((item) => item.id === id);
}

export function competitorsFor(market: AltLocale): CompetitorPage[] {
  return COMPETITORS.filter((item) => item.market === market);
}

export function alternativeJsonLd(origin: string, locale: AltLocale, page: CompetitorPage) {
  const url = `${origin}${page.path}`;
  const hub = `${origin}${HUB_PATHS[locale]}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: HOME_LABEL[locale], item: `${origin}/${locale}` },
          { '@type': 'ListItem', position: 2, name: hubCopy(locale).h1, item: hub },
          { '@type': 'ListItem', position: 3, name: page.h1, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}

export function hubJsonLd(origin: string, locale: AltLocale) {
  const copy = hubCopy(locale);
  const url = `${origin}${HUB_PATHS[locale]}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: HOME_LABEL[locale], item: `${origin}/${locale}` },
          { '@type': 'ListItem', position: 2, name: copy.h1, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: copy.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}

export function hubCopy(locale: AltLocale): {
  title: string;
  description: string;
  h1: string;
  keyword: string;
  faqs: AltFaq[];
} {
  if (locale === 'fr') {
    return {
      keyword: 'alternatives à la voyance par téléphone',
      h1: 'Alternatives à la voyance par téléphone',
      title: 'Alternatives à la voyance par téléphone',
      description:
        'Alternatives à la voyance par téléphone : dix fiches sourcées (Voyance.fr, Wengo, Kasamba…). Prix, format et humain ou virtuel, relevés le 13 octobre 2026.',
      faqs: [
        {
          question: 'Quelle alternative à la voyance par téléphone correspond à de l’astrologie ?',
          answer:
            'Callastral, notre service, si vous voulez une lecture du thème natal par téléphone, à toute heure, entre 0,50 € et 1,99 €/min, avec un persona virtuel. Les autres fiches décrivent des voyants ou des experts humains.',
        },
        {
          question: 'Ces pages copient-elles les sites concurrents ?',
          answer:
            'Non. Chaque fiche ne reprend que des faits lus sur une page publique, avec l’URL et la date. Le nom sert à identifier le service. Il n’y a ni logo, ni avis, ni note.',
        },
        {
          question: 'Pourquoi un service humain peut-il être le meilleur choix ?',
          answer:
            'Si vous voulez parler à une personne, un médium ou un voyant qui exerce, Callastral ne convient pas. Les sections « Quand choisir » le disent pour chaque fiche.',
        },
        {
          question: 'Les prix peuvent-ils avoir changé ?',
          answer:
            'Oui. Le relevé date du 13 octobre 2026. Le tableau renvoie vers la page source pour vérifier le tarif du jour.',
        },
        {
          question: 'Où sont les services en anglais ?',
          answer:
            'Kasamba, California Psychics et Keen ont une fiche en anglais. Les sept autres fiches visent le marché français de la voyance par téléphone.',
        },
      ],
    };
  }
  return {
    keyword: 'phone psychic alternatives',
    h1: 'Phone psychic alternatives',
    title: 'Phone psychic alternatives',
    description:
      'Phone psychic alternatives with sourced prices: Kasamba, California Psychics, Keen, and French phone-reading brands. Checked on 13 October 2026.',
    faqs: [
      {
        question: 'Which phone psychic alternative is an astrology reading?',
        answer:
          'Callastral, our service, if you want a natal-chart phone reading at any hour, from €0.50 to €1.99 per minute, with a virtual advisor and an AI-generated voice. The other pages describe human psychics or French phone services.',
      },
      {
        question: 'Do these pages copy competitor websites?',
        answer:
          'No. Each page uses facts read on a public page, with the URL and the date. The name only identifies the service. There is no logo, review or score.',
      },
      {
        question: 'When is a human psychic the better choice?',
        answer:
          'When you want to speak to a person. Callastral does not offer that. Each page has a section on when the other service fits better.',
      },
      {
        question: 'Can these prices change?',
        answer:
          'Yes. They were checked on 13 October 2026. Each table links to the public page so you can confirm the current rate.',
      },
      {
        question: 'Which pages are in French?',
        answer:
          'Voyance.fr, Wengo, Spiriteo, Cosmospace, Temporel Voyance, Kang and Esmeralda. The English pages are Kasamba, California Psychics and Keen.',
      },
    ],
  };
}
