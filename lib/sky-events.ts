import { BIG_THREE_PATHS, MOON_PATHS } from './free-tools.ts';
import { SIGN_IDS, signPath, weekPath, type SignId } from './zodiac/signs.ts';

/**
 * Pages « événement du ciel » (longue traîne, FR + EN), réponse d’abord.
 * Dates et heures calculées le 30/10/2026 avec l’éphéméride NASA JPL DE440 (Skyfield,
 * positions géocentriques apparentes), recoupées avec des tables publiées (astro-seek, otldr).
 */
export type SkyLocale = 'fr' | 'en';
export type SkyEventId = 'mercuryVenusDirect' | 'newMoonScorpio' | 'fullMoonGemini' | 'sagittariusSeason';

export const SKY_EVENT_IDS: SkyEventId[] = ['mercuryVenusDirect', 'newMoonScorpio', 'fullMoonGemini', 'sagittariusSeason'];
export const SKY_EVENTS_ORIGIN = 'https://callastral.com';
export const SKY_EVENTS_PUBLISHED = '2026-10-30';

/** Date de publication (et de dernière mise à jour) par page. */
export const SKY_EVENT_PUBLISHED: Record<SkyEventId, string> = {
  mercuryVenusDirect: '2026-10-30',
  newMoonScorpio: '2026-10-30',
  fullMoonGemini: '2026-11-02',
  sagittariusSeason: '2026-11-02',
};

/** Dernière modification (titres et maillage revus le 02/11/2026). */
export const SKY_EVENT_MODIFIED: Record<SkyEventId, string> = {
  mercuryVenusDirect: '2026-11-02',
  newMoonScorpio: '2026-11-02',
  fullMoonGemini: '2026-11-02',
  sagittariusSeason: '2026-11-02',
};

export const SKY_EVENT_PATHS: Record<SkyEventId, Record<SkyLocale, string>> = {
  mercuryVenusDirect: { en: '/en/mercury-venus-direct-november-2026', fr: '/fr/mercure-venus-direct-novembre-2026' },
  newMoonScorpio: { en: '/en/new-moon-scorpio-november-2026', fr: '/fr/nouvelle-lune-scorpion-novembre-2026' },
  fullMoonGemini: { en: '/en/full-moon-gemini-november-2026', fr: '/fr/pleine-lune-gemeaux-novembre-2026' },
  sagittariusSeason: { en: '/en/sagittarius-season-2026', fr: '/fr/saison-sagittaire-2026' },
};

/** Même convention que les pages GEO : x-default = FR. */
export function skyEventAlternates(id: SkyEventId): Record<string, string> {
  return { fr: SKY_EVENT_PATHS[id].fr, en: SKY_EVENT_PATHS[id].en, 'x-default': SKY_EVENT_PATHS[id].fr };
}

export const SKY_LINKS: Record<SkyLocale, { chart: string; moon: string; horoscope: string; daily: string; chat: string; trial: string }> = {
  en: { chart: BIG_THREE_PATHS.en, moon: MOON_PATHS.en, horoscope: weekPath('en'), daily: '/en/daily-horoscope', chat: '/en/chat', trial: '/en/free-trial' },
  fr: { chart: BIG_THREE_PATHS.fr, moon: MOON_PATHS.fr, horoscope: weekPath('fr'), daily: '/fr/horoscope-du-jour', chat: '/fr/chat', trial: '/fr/essai' },
};

/** Événements calculés (UTC). Paris = UTC+1 après le 25/10/2026, UTC+2 avant. */
export const SKY_FACTS = {
  venusStationRetro: { utc: '2026-10-03T07:16:00Z', degree: '8°29′', sign: 'scorpio' },
  mercuryStationRetro: { utc: '2026-10-24T07:13:00Z', degree: '20°59′', sign: 'scorpio' },
  venusIntoLibra: { utc: '2026-10-25T09:10:00Z' },
  newMoon: { utc: '2026-11-09T07:02:00Z', degree: '16°53′', sign: 'scorpio' },
  mercuryStationDirect: { utc: '2026-11-13T15:54:00Z', degree: '5°02′', sign: 'scorpio' },
  venusStationDirect: { utc: '2026-11-14T00:27:00Z', degree: '22°52′', sign: 'libra' },
  marsJupiter: { utc: '2026-11-16T06:24:00Z', degree: '25°53′', sign: 'leo' },
  sunSagittarius: { utc: '2026-11-22T07:23:00Z' },
  fullMoon: { utc: '2026-11-24T14:53:00Z', degree: '2°20′', sign: 'gemini' },
  moonrise24Paris: { utc: '2026-11-24T15:25:00Z' },
  marsVirgo: { utc: '2026-11-25T23:37:00Z' },
  perigee: { utc: '2026-11-25T21:08:00Z' },
  mercuryShadowEnd: { utc: '2026-11-30T06:21:00Z' },
  venusIntoScorpio: { utc: '2026-12-04T08:13:00Z' },
  mercuryIntoSagittarius: { utc: '2026-12-06T08:33:00Z' },
  venusShadowEnd: { utc: '2026-12-15T18:30:00Z' },
  newMoonSagittarius: { utc: '2026-12-09T00:51:00Z', degree: '16°57′', sign: 'sagittarius' },
  saturnStationDirect: { utc: '2026-12-10T23:31:00Z', degree: '7°56′', sign: 'aries' },
  jupiterStationRetro: { utc: '2026-12-13T00:57:00Z', degree: '27°01′', sign: 'leo' },
  sunCapricorn: { utc: '2026-12-21T20:50:00Z' },
  fullMoonCancer: { utc: '2026-12-24T01:28:00Z', degree: '2°14′', sign: 'cancer' },
} as const;

export type SkyFactId = keyof typeof SKY_FACTS;

export function formatUtc(iso: string, locale: SkyLocale): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(d);
  return locale === 'fr' ? `${date} à ${time.replace(':', ' h ').replace(/^0/, '')} UTC` : `${date}, ${time} UTC`;
}

export function formatParis(iso: string, locale: SkyLocale): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(d);
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Paris' }).format(d);
  return locale === 'fr' ? `${date} à ${time.replace(':', ' h ').replace(/^0/, '')} (heure de Paris)` : `${date}, ${time} Paris time`;
}

/** « 16 h 54 heure de Paris (15 h 54 UTC) » — format court pour les phrases. */
export function bothTimes(id: SkyFactId, locale: SkyLocale): string {
  const iso = SKY_FACTS[id].utc;
  const paris = formatParis(iso, locale);
  const utc = formatUtc(iso, locale);
  const sameDay = paris.split(locale === 'fr' ? ' à ' : ', ')[0] === utc.split(locale === 'fr' ? ' à ' : ', ')[0];
  const utcShort = sameDay ? utc.split(locale === 'fr' ? ' à ' : ', ')[1] : utc;
  return locale === 'fr' ? `${paris}, soit ${utcShort}` : `${paris} (${utcShort})`;
}

const SIGN_NAMES: Record<SkyLocale, string[]> = {
  en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  fr: ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'],
};

const FR_ARTICLE = ['le ', 'le ', 'les ', 'le ', 'le ', 'la ', 'la ', 'le ', 'le ', 'le ', 'le ', 'les '];

const GEMINI = 2;
const LIBRA = 6;
const SCORPIO = 7;
const SAGITTARIUS = 8;

/** Maison solaire (signe entier) occupée par un signe vu depuis le signe solaire. */
export function solarHouse(signIndex: number, eventSignIndex: number): number {
  return ((eventSignIndex - signIndex + 12) % 12) + 1;
}

function ordinal(n: number, locale: SkyLocale): string {
  if (locale === 'fr') return n === 1 ? '1re' : `${n}e`;
  const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
  return `${n}${suffix}`;
}

const MERCURY_HOUSE: Record<SkyLocale, string[]> = {
  en: [
    'how you present yourself: a decision about your image, health or personal direction that kept changing can now be stated clearly',
    'money and self-worth: hold off on big purchases until the dust settles, then reread quotes, bank details and invoices before paying',
    'conversations, siblings and short trips: messages that crossed or got lost can be resent, and stalled travel plans can be confirmed',
    'home and family: talks about moving, repairs or a family arrangement can resume, with facts checked twice',
    'romance, creativity and children: a creative project you reworked during the retrograde is ready to show, one step at a time',
    'daily work and health routines: fix the process that kept breaking and book the appointment you postponed',
    'partnerships and contracts: a negotiation or an agreement can move forward once both sides have reread the terms',
    'shared money, debts and intimacy: loans, taxes or a joint account can be settled, ideally after 30 November for anything final',
    'travel, studies and beliefs: applications, bookings and long-distance plans become easier to finalise',
    'career and reputation: a work decision or announcement that was on hold can go ahead, with the details confirmed in writing',
    'friends, groups and projects: a misunderstanding with a friend or a team can be cleared up by talking directly',
    'rest and what you keep private: insights from a quiet October become clear enough to act on, without rushing',
  ],
  fr: [
    'votre image et votre direction personnelle : une décision qui changeait sans cesse peut enfin être formulée clairement',
    'l’argent et l’estime de soi : attendez que les choses se posent avant un gros achat, puis relisez devis, RIB et factures avant de payer',
    'les échanges, la fratrie et les petits trajets : les messages perdus ou mal compris peuvent être renvoyés, les déplacements confirmés',
    'le foyer et la famille : les discussions sur un déménagement, des travaux ou une organisation familiale reprennent, faits vérifiés deux fois',
    'l’amour, la créativité et les enfants : un projet créatif retravaillé pendant la rétrogradation peut être montré, étape par étape',
    'le travail quotidien et la santé : réparez le processus qui coinçait et reprenez le rendez-vous reporté',
    'le couple, les associations et les contrats : une négociation avance dès que les deux parties ont relu les termes',
    'l’argent partagé, les dettes et l’intimité : prêt, impôts ou compte commun peuvent se régler, idéalement après le 30 novembre pour le définitif',
    'les voyages, les études et les convictions : candidatures, réservations et projets lointains se finalisent plus facilement',
    'la carrière et la réputation : une décision ou une annonce professionnelle en attente peut avancer, avec les détails confirmés par écrit',
    'les amis, les groupes et les projets collectifs : un malentendu avec un ami ou une équipe se dissipe en parlant directement',
    'le repos et la vie intérieure : ce que vous avez compris pendant un mois d’octobre plus calme devient assez clair pour agir, sans précipitation',
  ],
};

const VENUS_HOUSE: Record<SkyLocale, string[]> = {
  en: [
    'your appearance and how you want to be seen: wait for the post-shadow before a drastic makeover',
    'your income and spending: the budget you questioned since early October can be fixed with a clearer view of what you value',
    'your everyday relationships: a cooled-down exchange with a sibling, neighbour or colleague can warm up again',
    'home and family life: a relative or a home matter that needed patience starts to soften',
    'love and pleasure: a romance that stalled or an ex who resurfaced becomes easier to read; decide slowly',
    'work and wellbeing: tensions with colleagues ease and a healthier routine is easier to keep',
    'your committed relationships: a couple question raised in October can now get an honest answer',
    'shared finances and intimacy: money owed to or by you, and trust in a close bond, can be renegotiated',
    'distance, study and ideals: plans with someone far away, or a course you hesitated about, can move forward',
    'career and public image: a professional relationship or a salary conversation becomes more favourable',
    'friendships and community: a friend who drifted may come back, and group plans get easier',
    'what you keep to yourself: old feelings that came up in October can be let go of quietly',
  ],
  fr: [
    'votre apparence et votre image : attendez la fin de l’ombre avant un changement radical de look',
    'vos revenus et vos dépenses : le budget remis en question depuis début octobre se fixe, avec une idée plus claire de ce qui compte pour vous',
    'les relations du quotidien : un échange refroidi avec un frère, une sœur, un voisin ou un collègue se réchauffe',
    'le foyer et la famille : un proche ou une question de logement qui demandait de la patience s’adoucit',
    'l’amour et le plaisir : une histoire en suspens ou un ex qui réapparaît devient plus lisible ; décidez sans hâte',
    'le travail et le bien-être : les tensions avec les collègues retombent et une routine plus saine tient mieux',
    'le couple et les engagements : une question de couple ouverte en octobre peut maintenant recevoir une réponse honnête',
    'l’argent partagé et l’intimité : ce que l’on vous doit, ce que vous devez et la confiance dans un lien proche se renégocient',
    'les liens à distance, les études et les idéaux : un projet avec quelqu’un d’éloigné ou une formation hésitante avance',
    'la carrière et l’image publique : une relation professionnelle ou une discussion de salaire devient plus favorable',
    'les amitiés et les réseaux : un ami qui s’était éloigné peut revenir, les projets de groupe se simplifient',
    'ce que vous gardez pour vous : les vieux sentiments remontés en octobre peuvent être lâchés en douceur',
  ],
};

/** Indexé par signe (Bélier → Poissons) : maison solaire où tombe 16°53′ Scorpion. */
const NEW_MOON_BY_SIGN: Record<SkyLocale, string[]> = {
  en: [
    'it falls in your 8th solar house: shared money, intimacy and transformation. Intention idea: settle a debt, an inheritance question or a trust issue that keeps dragging on.',
    'it falls in your 7th solar house, opposite your sign: relationships and agreements are in focus. Intention idea: say plainly what you need from one partner, personal or professional.',
    'it falls in your 6th solar house: work routines and health. Intention idea: drop one habit that drains you and replace it with a small daily one.',
    'it falls in your 5th solar house: love, creativity and joy. Intention idea: start the creative project or the date you keep postponing.',
    'it falls in your 4th solar house: home, family and roots. Intention idea: clear one room or one family topic that has been weighing on you.',
    'it falls in your 3rd solar house: words, learning and your neighbourhood. Intention idea: start a course, a journal, or the conversation you have been rehearsing.',
    'it falls in your 2nd solar house: money and self-worth. Intention idea: one clear money goal for the next six months, with a figure attached.',
    'it falls in your own sign, your 1st solar house, during your birthday season: the most personal New Moon of your year. Intention idea: decide what you want people to see in you next year.',
    'it falls in your 12th solar house: rest, solitude and endings. Intention idea: let go of one thing before your birthday season, and protect your sleep.',
    'it falls in your 11th solar house: friends, networks and long-term hopes. Intention idea: reach out to one person or group linked to a goal for 2027.',
    'it falls in your 10th solar house: career and public life. Intention idea: write down the professional move you want, and the first step to take this month.',
    'it falls in your 9th solar house: travel, study and meaning. Intention idea: plan a trip, a training or a reading that widens your view.',
  ],
  fr: [
    'elle tombe dans votre maison solaire 8 : argent partagé, intimité et transformations. Idée d’intention : régler une dette, une question d’héritage ou de confiance qui traîne.',
    'elle tombe dans votre maison solaire 7, face à votre signe : couple et associations sont au premier plan. Idée d’intention : dire clairement ce dont vous avez besoin à un partenaire, privé ou professionnel.',
    'elle tombe dans votre maison solaire 6 : travail quotidien et santé. Idée d’intention : abandonner une habitude qui vous épuise et la remplacer par un petit rituel quotidien.',
    'elle tombe dans votre maison solaire 5 : amour, créativité et plaisir. Idée d’intention : lancer le projet créatif ou le rendez-vous que vous repoussez.',
    'elle tombe dans votre maison solaire 4 : foyer, famille et racines. Idée d’intention : désencombrer une pièce ou apaiser un sujet de famille qui pèse.',
    'elle tombe dans votre maison solaire 3 : la parole, l’apprentissage et l’entourage proche. Idée d’intention : commencer une formation, un journal ou la conversation que vous répétez dans votre tête.',
    'elle tombe dans votre maison solaire 2 : argent et estime de soi. Idée d’intention : un objectif financier clair pour les six prochains mois, chiffré.',
    'elle tombe dans votre propre signe, votre maison solaire 1, pendant votre saison d’anniversaire : la Nouvelle Lune la plus personnelle de votre année. Idée d’intention : décider de ce que vous voulez montrer de vous l’an prochain.',
    'elle tombe dans votre maison solaire 12 : repos, solitude et fins de cycle. Idée d’intention : lâcher une chose avant votre anniversaire et protéger votre sommeil.',
    'elle tombe dans votre maison solaire 11 : amis, réseaux et projets à long terme. Idée d’intention : contacter une personne ou un groupe lié à un objectif pour 2027.',
    'elle tombe dans votre maison solaire 10 : carrière et vie publique. Idée d’intention : écrire l’évolution professionnelle souhaitée et le premier pas à faire ce mois-ci.',
    'elle tombe dans votre maison solaire 9 : voyages, études et sens. Idée d’intention : prévoir un voyage, une formation ou une lecture qui élargit votre horizon.',
  ],
};

const MERCURY_RULED: Record<SkyLocale, Partial<Record<number, string>>> = {
  en: {
    2: 'Mercury is your ruling planet, so the end of its retrograde is felt more directly: expect plans and replies to unblock.',
    5: 'Mercury is your ruling planet, so the end of its retrograde is felt more directly: lists, schedules and paperwork start to flow again.',
    1: 'Venus is your ruling planet, so its return to direct motion matters more for you than for most signs.',
    6: 'Venus rules your sign and turns direct in it, at 22°52′ Libra: the clearest signal of the period for you.',
    7: 'Mercury turns direct in your sign, at 5°02′ Scorpio: your own words and decisions carry more weight again.',
  },
  fr: {
    2: 'Mercure gouverne votre signe : la fin de sa rétrogradation se ressent plus directement, projets et réponses se débloquent.',
    5: 'Mercure gouverne votre signe : listes, plannings et démarches administratives se remettent à circuler.',
    1: 'Vénus gouverne votre signe : son retour en mouvement direct compte davantage pour vous que pour la plupart des signes.',
    6: 'Vénus gouverne votre signe et repart directe chez vous, à 22°52′ Balance : c’est le signal le plus net de la période pour vous.',
    7: 'Mercure repart direct dans votre signe, à 5°02′ Scorpion : vos paroles et vos décisions reprennent du poids.',
  },
};

const NEW_MOON_ASPECT: Record<SkyLocale, Partial<Record<number, string>>> = {
  en: {
    1: 'As the opposite sign, you may feel this New Moon through other people first.',
    3: 'Water signs (Cancer, Scorpio, Pisces) usually find a Scorpio New Moon supportive.',
    4: 'Leo is square to Scorpio, and Mars and Jupiter are both in your sign: expect energy, and a few tests of patience around 18–19 November when the Sun squares them.',
    10: 'Aquarius is square to Scorpio: this New Moon can push a career question that needs a firm decision.',
    11: 'Water signs (Cancer, Scorpio, Pisces) usually find a Scorpio New Moon supportive.',
    5: 'Virgo is sextile to Scorpio: a helpful, practical New Moon for you.',
    9: 'Capricorn is sextile to Scorpio: a helpful, practical New Moon for you.',
  },
  fr: {
    1: 'Signe opposé : vous ressentirez peut-être cette Nouvelle Lune d’abord à travers les autres.',
    3: 'Les signes d’eau (Cancer, Scorpion, Poissons) vivent en général une Nouvelle Lune en Scorpion comme un soutien.',
    4: 'Le Lion est au carré du Scorpion, et Mars comme Jupiter sont dans votre signe : beaucoup d’énergie, et quelques tests de patience vers les 18 et 19 novembre, quand le Soleil forme un carré avec eux.',
    10: 'Le Verseau est au carré du Scorpion : cette Nouvelle Lune peut presser une décision de carrière.',
    11: 'Les signes d’eau (Cancer, Scorpion, Poissons) vivent en général une Nouvelle Lune en Scorpion comme un soutien.',
    5: 'La Vierge est en sextile au Scorpion : une Nouvelle Lune pratique et porteuse pour vous.',
    9: 'Le Capricorne est en sextile au Scorpion : une Nouvelle Lune pratique et porteuse pour vous.',
  },
};

/** Pleine Lune à 2°20′ Gémeaux : texte par maison solaire (1 à 12) où tombent les Gémeaux. */
const FULL_MOON_HOUSE: Record<SkyLocale, string[]> = {
  en: [
    'you, your body and how you come across. Something you have been building about yourself becomes visible; notice what people reflect back to you, and rest more than usual around the 24th.',
    'money, possessions and self-worth. A financial situation reaches a point where the numbers are clear; a good moment to review a budget, not to make a rushed purchase.',
    'conversations, messages, siblings and short trips. A discussion that has been building comes to a head; say what you mean simply, and reread before you send.',
    'home, family and your private base. A family matter or a housing question shows its real shape; you may need a quiet evening at home more than an outing.',
    'love, pleasure, creativity and children. A romance or a creative project reaches a visible stage; enjoy it, without forcing an answer from anyone that night.',
    'daily work, routines and health. Fatigue or an overloaded schedule becomes obvious; drop one task and look after sleep and food.',
    'partners and close one-to-one relationships. What a relationship needs becomes clear; listen as much as you speak, and avoid ultimatums decided on the night itself.',
    'shared money, debts, trust and intimacy. Questions about what you owe, what you are owed or who you can rely on come up; deal with facts, not suspicions.',
    'travel, study, beliefs and people far away. A plan to leave, learn or change your outlook reaches a decision point; check the practical details first.',
    'career, status and public life. Work efforts get seen, for better or worse; a good moment to take stock of where your career is going.',
    'friends, groups and long-term hopes. A friendship or a group project shows its true balance; keep the people who give as much as they take.',
    'rest, the unconscious and what you keep to yourself. Tiredness and old feelings surface; write them down, sleep, and give yourself time alone.',
  ],
  fr: [
    'vous-même, votre corps et l’image que vous renvoyez. Ce que vous construisez sur vous devient visible ; observez ce que les autres vous renvoient et reposez-vous davantage autour du 24.',
    'l’argent, les biens et l’estime de soi. Une situation financière arrive au point où les chiffres sont clairs : bon moment pour revoir un budget, pas pour un achat précipité.',
    'les échanges, les messages, la fratrie et les petits trajets. Une discussion qui couvait arrive à son point culminant : dites les choses simplement et relisez avant d’envoyer.',
    'le foyer, la famille et votre base intime. Une affaire de famille ou de logement montre sa vraie forme ; une soirée calme chez vous vaut peut-être mieux qu’une sortie.',
    'l’amour, le plaisir, la créativité et les enfants. Une histoire ou un projet créatif atteint une étape visible : profitez-en, sans exiger de réponse de qui que ce soit ce soir-là.',
    'le travail quotidien, les routines et la santé. La fatigue ou un agenda surchargé devient évident : supprimez une tâche, soignez sommeil et alimentation.',
    'le couple et les relations en face à face. Ce dont une relation a besoin devient clair : écoutez autant que vous parlez, et évitez les ultimatums décidés le soir même.',
    'l’argent partagé, les dettes, la confiance et l’intimité. Ce que vous devez, ce qu’on vous doit, sur qui vous pouvez compter : appuyez-vous sur des faits, pas sur des soupçons.',
    'les voyages, les études, les convictions et les gens loin de vous. Un projet de départ, de formation ou de changement de regard arrive à un point de décision : vérifiez d’abord le concret.',
    'la carrière, le statut et la vie publique. Vos efforts au travail se voient, en bien ou en moins bien : bon moment pour faire le point sur votre direction professionnelle.',
    'les amis, les groupes et les projets à long terme. Une amitié ou un projet collectif montre son vrai équilibre : gardez les personnes qui donnent autant qu’elles reçoivent.',
    'le repos, l’inconscient et ce que vous gardez pour vous. Fatigue et vieux sentiments remontent : écrivez-les, dormez, accordez-vous du temps seul.',
  ],
};

const FULL_MOON_ASPECT: Record<SkyLocale, Partial<Record<number, string>>> = {
  en: {
    0: 'Saturn and Neptune are both in your sign and in harmony with this Full Moon: a calm, constructive one for you.',
    2: 'It is your Full Moon, in your own sign and next to Uranus (3°44′ Gemini): expect a sudden insight or a surprise about yourself, and give it a few days before acting on it.',
    4: 'Mars and Jupiter are both in your sign, in harmony with the Moon; Mars leaves for Virgo just after (26 November): use the energy, then slow down.',
    5: 'Virgo is square to this Full Moon, and Mars enters your sign on 26 November: a busy, demanding week, so pace yourself.',
    6: 'As an air sign, you usually find a Gemini Full Moon easy: a good one for conversations and plans.',
    8: 'The Sun is in your sign, opposite the Moon: the first Full Moon of your birthday season shows you where a relationship stands.',
    10: 'As an air sign, you usually find a Gemini Full Moon easy, and Pluto in your sign is in harmony with it: a lucid, creative moment.',
    11: 'Pisces is square to this Full Moon: family and career may pull you in two directions for a day or two.',
  },
  fr: {
    0: 'Saturne et Neptune sont dans votre signe, en harmonie avec cette Pleine Lune : une lunaison calme et constructive pour vous.',
    2: 'C’est votre Pleine Lune, dans votre signe et tout près d’Uranus (3°44′ Gémeaux) : attendez-vous à une prise de conscience ou à une surprise sur vous-même, et laissez passer quelques jours avant d’agir.',
    4: 'Mars et Jupiter sont dans votre signe, en harmonie avec la Lune ; Mars part en Vierge juste après (26 novembre) : profitez de l’élan, puis ralentissez.',
    5: 'La Vierge est au carré de cette Pleine Lune, et Mars entre dans votre signe le 26 novembre : une semaine chargée, dosez vos efforts.',
    6: 'Signe d’air, vous vivez en général une Pleine Lune en Gémeaux avec facilité : bonne lunaison pour parler et faire des projets.',
    8: 'Le Soleil est dans votre signe, face à la Lune : la première Pleine Lune de votre saison d’anniversaire montre où en est une relation.',
    10: 'Signe d’air, vous vivez en général une Pleine Lune en Gémeaux avec facilité, et Pluton dans votre signe l’accompagne : un moment lucide et créatif.',
    11: 'Les Poissons sont au carré de cette Pleine Lune : famille et carrière peuvent vous tirer dans deux directions pendant un jour ou deux.',
  },
};

/** Saison du Sagittaire : texte par maison solaire (1 à 12) traversée par le Soleil. */
const SAG_SEASON_HOUSE: Record<SkyLocale, string[]> = {
  en: [
    'your own sign. It is your birthday season and your solar new year: more energy, more visibility, and a good time to set personal goals for the year ahead.',
    'money, possessions and self-worth. Look at what you earn, what you spend over the holidays and what you are really worth; negotiate calmly.',
    'conversations, learning and your neighbourhood. Messages, short trips and paperwork multiply; a good month to learn something or to write.',
    'home and family. Attention turns to your home, your relatives and your roots; sort out a family matter before the holidays.',
    'love, fun and creativity. A more playful, romantic month: go out, create, flirt, and say yes to what gives you joy.',
    'work routines and health. A month to reorganise your days, clear your to-do list and look after your body before the end of the year.',
    'relationships and partnerships. Others take centre stage: a partner, an associate or a contract asks for your attention and honest dialogue.',
    'shared money, trust and intimacy. Joint finances, debts and deep bonds are in focus; a good time to clarify who owes what and what you share.',
    'travel, study and meaning. You want to see further: plan a trip, a course or a project that gives your year more meaning.',
    'career and reputation. Your work is more visible; good timing for a professional step, a request or a year-end review with your manager.',
    'friends, groups and long-term plans. Your social life fills up; reconnect with a network or a friend linked to your plans for 2027.',
    'rest and what you keep private. The month before your birthday season: slow down, sleep, close a chapter quietly before the solstice.',
  ],
  fr: [
    'votre propre signe. C’est votre saison d’anniversaire et votre nouvelle année solaire : plus d’énergie, plus de visibilité, et le bon moment pour fixer vos objectifs personnels.',
    'l’argent, les biens et l’estime de soi. Regardez ce que vous gagnez, ce que vous dépensez pour les fêtes et ce que vous valez vraiment ; négociez au calme.',
    'les échanges, l’apprentissage et l’entourage proche. Messages, petits trajets et démarches se multiplient : un bon mois pour apprendre ou écrire.',
    'le foyer et la famille. L’attention se tourne vers la maison, les proches et les racines : réglez une question familiale avant les fêtes.',
    'l’amour, le plaisir et la créativité. Un mois plus léger et plus romantique : sortez, créez, séduisez, dites oui à ce qui vous fait du bien.',
    'le travail quotidien et la santé. Un mois pour réorganiser vos journées, vider votre liste de tâches et prendre soin de votre corps avant la fin de l’année.',
    'le couple et les associations. Les autres passent au premier plan : un partenaire, un associé ou un contrat demande votre attention et un dialogue honnête.',
    'l’argent partagé, la confiance et l’intimité. Finances communes, dettes et liens profonds sont au centre : clarifiez qui doit quoi et ce que vous partagez.',
    'les voyages, les études et le sens. Vous voulez voir plus loin : prévoyez un voyage, une formation ou un projet qui donne du sens à votre année.',
    'la carrière et la réputation. Votre travail est plus visible : bon moment pour une démarche professionnelle, une demande ou un bilan de fin d’année.',
    'les amis, les groupes et les projets à long terme. Votre vie sociale se remplit : renouez avec un réseau ou un ami lié à vos projets pour 2027.',
    'le repos et la vie intérieure. C’est le mois qui précède votre anniversaire : ralentissez, dormez, refermez un chapitre en douceur avant le solstice.',
  ],
};

const SAG_SEASON_ASPECT: Record<SkyLocale, Partial<Record<number, string>>> = {
  en: {
    0: 'As a fellow fire sign, you usually enjoy Sagittarius season, and Saturn turns direct in your sign on 10–11 December: a stalled personal project can restart.',
    2: 'Sagittarius is your opposite sign: you feel this season through other people, and the Full Moon of 24 November falls in your own sign.',
    4: 'As a fellow fire sign, you usually enjoy Sagittarius season; Jupiter, in your sign, turns retrograde on 13 December: time to review your plans rather than add new ones.',
    5: 'Sagittarius squares your sign: home and ambitions compete for your time, and Mars spends the whole season in your sign from 26 November.',
    7: 'Mercury is back in your sign until 6 December, now direct: finish what the October retrograde slowed down.',
    11: 'Sagittarius squares your sign: career and private life ask for balance, with the New Moon of 9 December falling in your career sector.',
  },
  fr: {
    0: 'Signe de feu comme le Sagittaire, vous aimez en général cette saison, et Saturne repart direct dans votre signe les 10 et 11 décembre : un projet personnel bloqué peut redémarrer.',
    2: 'Le Sagittaire est votre signe opposé : vous vivez cette saison à travers les autres, et la Pleine Lune du 24 novembre tombe dans votre propre signe.',
    4: 'Signe de feu comme le Sagittaire, vous aimez en général cette saison ; Jupiter, dans votre signe, devient rétrograde le 13 décembre : revoyez vos projets plutôt que d’en ajouter.',
    5: 'Le Sagittaire est au carré de votre signe : foyer et ambitions se disputent votre temps, et Mars passe toute la saison dans votre signe à partir du 26 novembre.',
    7: 'Mercure, de nouveau direct, reste dans votre signe jusqu’au 6 décembre : terminez ce que la rétrogradation d’octobre avait ralenti.',
    11: 'Le Sagittaire est au carré de votre signe : carrière et vie privée demandent un équilibre, et la Nouvelle Lune du 9 décembre tombe dans votre secteur professionnel.',
  },
};

export interface SkySignRow {
  id: SignId;
  name: string;
  href: string;
  text: string;
}

export function signRows(event: SkyEventId, locale: SkyLocale): SkySignRow[] {
  return SIGN_IDS.map((id, index) => {
    const name = SIGN_NAMES[locale][index];
    let text: string;
    if (event === 'mercuryVenusDirect') {
      const hm = solarHouse(index, SCORPIO);
      const hv = solarHouse(index, LIBRA);
      const extra = MERCURY_RULED[locale][index];
      text = locale === 'fr'
        ? `Mercure repart direct dans votre maison solaire ${hm}, celle de ${MERCURY_HOUSE.fr[hm - 1]}. Vénus repart directe dans votre maison solaire ${hv}, qui touche ${VENUS_HOUSE.fr[hv - 1]}.${extra ? ` ${extra}` : ''}`
        : `Mercury turns direct in your ${ordinal(hm, 'en')} solar house, the area of ${MERCURY_HOUSE.en[hm - 1]}. Venus turns direct in your ${ordinal(hv, 'en')} solar house, linked to ${VENUS_HOUSE.en[hv - 1]}.${extra ? ` ${extra}` : ''}`;
    } else if (event === 'fullMoonGemini') {
      const h = solarHouse(index, GEMINI);
      const hs = solarHouse(index, SAGITTARIUS);
      const extra = FULL_MOON_ASPECT[locale][index];
      text = locale === 'fr'
        ? `Pour ${FR_ARTICLE[index]}${name}, la Pleine Lune éclaire votre maison solaire ${h} : ${FULL_MOON_HOUSE.fr[h - 1]} Le Soleil, en face, est dans votre maison ${hs}.${extra ? ` ${extra}` : ''}`
        : `For ${name}, the Full Moon lights up your ${ordinal(h, 'en')} solar house: ${FULL_MOON_HOUSE.en[h - 1]} The Sun, opposite, is in your ${ordinal(hs, 'en')} house.${extra ? ` ${extra}` : ''}`;
    } else if (event === 'sagittariusSeason') {
      const h = solarHouse(index, SAGITTARIUS);
      const extra = SAG_SEASON_ASPECT[locale][index];
      text = locale === 'fr'
        ? `Pour ${FR_ARTICLE[index]}${name}, le Soleil traverse votre maison solaire ${h} : ${SAG_SEASON_HOUSE.fr[h - 1]}${extra ? ` ${extra}` : ''}`
        : `For ${name}, the Sun moves through your ${ordinal(h, 'en')} solar house: ${SAG_SEASON_HOUSE.en[h - 1]}${extra ? ` ${extra}` : ''}`;
    } else {
      const base = NEW_MOON_BY_SIGN[locale][index];
      const extra = NEW_MOON_ASPECT[locale][index];
      text = locale === 'fr'
        ? `Pour ${FR_ARTICLE[index]}${name}, ${base}${extra ? ` ${extra}` : ''}`
        : `For ${name}, ${base}${extra ? ` ${extra}` : ''}`;
    }
    return { id, name, href: signPath(locale, id), text };
  });
}

export interface SkyRow {
  label: string;
  paris: string;
  utc: string;
  detail: string;
}

export interface SkyFaq {
  question: string;
  answer: string;
}

export interface SkySection {
  h2: string;
  paragraphs: string[];
}

export interface SkyEventCopy {
  id: SkyEventId;
  locale: SkyLocale;
  path: string;
  title: string;
  description: string;
  h1: string;
  breadcrumb: string;
  answer: [string, string];
  updated: string;
  tableTitle: string;
  tableCaption: string;
  cols: [string, string, string, string];
  rows: SkyRow[];
  sections: SkySection[];
  signsTitle: string;
  signsIntro: string;
  adviceTitle: string;
  advice: string[];
  method: string;
  faqTitle: string;
  faqs: SkyFaq[];
  ctaText: string;
  ctaButton: string;
  linksTitle: string;
  links: { href: string; label: string }[];
  related: { href: string; label: string };
  home: string;
  disclaimer: string;
}

function row(id: SkyFactId, locale: SkyLocale, label: string, detail: string): SkyRow {
  return { label, paris: formatParis(SKY_FACTS[id].utc, locale), utc: formatUtc(SKY_FACTS[id].utc, locale), detail };
}

function commonLinks(locale: SkyLocale): { href: string; label: string }[] {
  const l = SKY_LINKS[locale];
  return locale === 'fr'
    ? [
        { href: l.chart, label: 'Calculer votre thème astral gratuit (Soleil, Lune, ascendant)' },
        { href: l.moon, label: 'Voir la Lune aujourd’hui : signe et phase en direct' },
        { href: l.daily, label: 'Lire l’horoscope du jour, calculé sur le ciel réel' },
        { href: l.horoscope, label: 'Lire l’horoscope de la semaine pour les 12 signes' },
        { href: l.chat, label: 'Poser votre question par message (1re réponse offerte)' },
        { href: l.trial, label: 'Parler 3 minutes gratuitement avec une Conseillère ou un Conseiller Callastral' },
      ]
    : [
        { href: l.chart, label: 'Get your free birth chart (Sun, Moon and rising sign)' },
        { href: l.moon, label: 'Check the Moon today: live sign and phase' },
        { href: l.daily, label: 'Read today’s horoscope, based on the real sky' },
        { href: l.horoscope, label: 'Read this week’s horoscope for all 12 signs' },
        { href: l.chat, label: 'Ask your question by message (first answer free)' },
        { href: l.trial, label: 'Talk to a Callastral advisor for 3 free minutes' },
      ];
}

const DISCLAIMER: Record<SkyLocale, string> = {
  en: 'Astrology here is offered for reflection and entertainment. The dates and positions are real astronomical calculations; the interpretations are general, based on your Sun sign, and do not replace medical, legal or financial advice.',
  fr: 'L’astrologie est proposée ici pour la réflexion et le divertissement. Les dates et positions sont des calculs astronomiques réels ; les interprétations sont générales, fondées sur le signe solaire, et ne remplacent pas un avis médical, juridique ou financier.',
};

const METHOD: Record<SkyLocale, string> = {
  en: 'Method: dates, times and degrees were computed by Callastral with the NASA JPL DE440 ephemeris (geocentric, apparent positions, tropical zodiac) and cross-checked against published astrological calendars. Station times can differ by a few minutes between ephemerides, because the planet is barely moving at that moment. Paris is on UTC+1 (winter time) from 25 October 2026.',
  fr: 'Méthode : dates, heures et degrés calculés par Callastral avec l’éphéméride NASA JPL DE440 (positions géocentriques apparentes, zodiaque tropical) et recoupés avec des calendriers astrologiques publiés. L’heure d’une station peut varier de quelques minutes selon l’éphéméride, car la planète est alors presque immobile. Paris est à UTC+1 (heure d’hiver) depuis le 25 octobre 2026.',
};

function mercuryVenusCopy(locale: SkyLocale): SkyEventCopy {
  const t = (id: SkyFactId) => bothTimes(id, locale);
  const path = SKY_EVENT_PATHS.mercuryVenusDirect[locale];
  if (locale === 'fr') {
    return {
      id: 'mercuryVenusDirect',
      locale,
      path,
      title: 'Fin de Mercure rétrograde : le 13 novembre 2026',
      description: 'Mercure rétrograde finit le 13 novembre 2026 à 16 h 54 (Paris), Vénus le 14 vers 1 h 27. Fin de l’ombre le 30/11 et le 15/12, effets pour chaque signe.',
      h1: 'Mercure et Vénus redeviennent directs les 13 et 14 novembre 2026',
      breadcrumb: 'Mercure et Vénus directs, novembre 2026',
      answer: [
        `Mercure rétrograde se termine le 13 novembre 2026 à 16 h 54, heure de Paris (15 h 54 UTC), quand Mercure redevient direct à 5°02′ Scorpion ; Vénus rétrograde se termine environ 8 h 30 plus tard, le 14 novembre 2026 vers 1 h 27 à Paris (0 h 27 UTC), à 22°52′ Balance.`,
        'Les retards de communication, de déplacements et de papiers s’atténuent d’abord, puis les décisions d’amour et d’argent suspendues depuis le 3 octobre peuvent avancer, progressivement, jusqu’à la fin des périodes d’ombre le 30 novembre (Mercure) et le 15 décembre (Vénus).',
      ],
      updated: 'Publié le 30 octobre 2026, mis à jour le 2 novembre 2026',
      tableTitle: 'Les dates clés, heure de Paris et UTC',
      tableCaption: 'Calculées avec l’éphéméride NASA JPL DE440',
      cols: ['Événement', 'Heure de Paris', 'UTC', 'Position'],
      rows: [
        row('venusStationRetro', 'fr', 'Vénus devient rétrograde', '8°29′ Scorpion'),
        row('mercuryStationRetro', 'fr', 'Mercure devient rétrograde', '20°59′ Scorpion'),
        row('venusIntoLibra', 'fr', 'Vénus rétrograde revient en Balance', '0° Balance'),
        row('mercuryStationDirect', 'fr', 'Mercure redevient direct', '5°02′ Scorpion'),
        row('venusStationDirect', 'fr', 'Vénus redevient directe', '22°52′ Balance'),
        row('mercuryShadowEnd', 'fr', 'Fin de l’ombre de Mercure', 'retour à 20°59′ Scorpion'),
        row('venusIntoScorpio', 'fr', 'Vénus directe entre en Scorpion', '0° Scorpion'),
        row('venusShadowEnd', 'fr', 'Fin de l’ombre de Vénus', 'retour à 8°29′ Scorpion'),
      ],
      sections: [
        {
          h2: 'Ce qui se passe les 13 et 14 novembre 2026',
          paragraphs: [
            `Vénus est rétrograde depuis le ${t('venusStationRetro')}, à 8°29′ Scorpion. Elle a reculé jusqu’en Balance le 25 octobre et s’y arrête : elle redevient directe le ${t('venusStationDirect')}, à 22°52′ Balance.`,
            `Mercure est rétrograde depuis le ${t('mercuryStationRetro')}, à 20°59′ Scorpion. Il redevient direct le ${t('mercuryStationDirect')}, à 5°02′ Scorpion, à moins de 2° d’un carré avec Pluton en Verseau.`,
            'Deux planètes personnelles qui redeviennent directes à moins de 9 heures d’écart, c’est rare : dans notre calcul sur 1951–2050, c’est la seule fois où Mercure et Vénus redeviennent directs à moins de 24 heures l’un de l’autre. Le cas le plus proche ensuite date de février 1982, avec environ 59 heures d’écart.',
          ],
        },
        {
          h2: 'La période d’ombre : quand c’est vraiment fini',
          paragraphs: [
            `Une planète qui redevient directe repasse d’abord sur les degrés parcourus à reculons. Mercure sort de son ombre le ${t('mercuryShadowEnd')}, quand il retrouve 20°59′ Scorpion ; il entre ensuite en Sagittaire le 6 décembre.`,
            `Vénus revient en Scorpion le ${t('venusIntoScorpio')} et sort de son ombre le ${t('venusShadowEnd')}, en repassant à 8°29′ Scorpion. Pour une signature, un achat important ou un engagement amoureux, ces deux dates sont les repères les plus prudents.`,
          ],
        },
        {
          h2: 'Le même week-end dans le ciel',
          paragraphs: [
            `Le ${t('marsJupiter')}, Mars rejoint Jupiter à 25°53′ Lion : une conjonction d’élan et d’ambition, juste après les deux stations. Elle est précédée par la Nouvelle Lune en Scorpion du 9 novembre et suivie par l’entrée du Soleil en Sagittaire le ${t('sunSagittarius')}.`,
          ],
        },
        {
          h2: 'Les prochaines rétrogradations',
          paragraphs: [
            'Prochaine rétrogradation de Mercure : du 9 février 2027 à 18 h 36 (Paris, 17 h 36 UTC), à 5°59′ Poissons, au 3 mars 2027 à 13 h 32 (Paris, 12 h 32 UTC), à 20°55′ Verseau.',
            'Prochaine rétrogradation de Vénus : du 11 mai 2028 à 1 h 03 (Paris ; 10 mai à 23 h 03 UTC), à 19°41′ Gémeaux, au 23 juin 2028 à 0 h 13 (Paris ; 22 juin à 22 h 13 UTC), à 3°11′ Gémeaux.',
          ],
        },
      ],
      signsTitle: 'Ce que Mercure et Vénus directs changent pour votre signe',
      signsIntro: 'Lecture par maisons solaires, à partir de votre signe solaire. Pour une lecture précise, utilisez votre ascendant : notre thème astral gratuit le calcule en une minute.',
      adviceTitle: 'Conseils pratiques',
      advice: [
        'Le 13 et le 14 novembre, laissez passer les stations : relisez, mais ne signez pas dans l’heure si vous pouvez attendre un jour ou deux.',
        'Reprenez les dossiers mis en pause en octobre : vérifiez les dates, les montants et les adresses avant de renvoyer quoi que ce soit.',
        'Pour un achat coûteux, un contrat ou un engagement amoureux, visez après le 30 novembre (Mercure), et idéalement après le 15 décembre (Vénus).',
        'Notez ce que la rétrogradation vous a appris sur l’argent et les relations : c’est la matière à utiliser maintenant.',
      ],
      method: METHOD.fr,
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'Quand finit Mercure rétrograde en novembre 2026 ?', answer: 'Le 13 novembre 2026 à 16 h 54, heure de Paris (15 h 54 UTC), quand Mercure redevient direct à 5°02′ Scorpion. L’ombre se termine le 30 novembre 2026.' },
        { question: 'Quand finit Vénus rétrograde en 2026 ?', answer: 'Le 14 novembre 2026 vers 1 h 27, heure de Paris (0 h 27 UTC), à 22°52′ Balance. Elle avait commencé le 3 octobre 2026 à 8°29′ Scorpion. Vénus sort de son ombre le 15 décembre 2026.' },
        { question: 'Est-il rare que Mercure et Vénus redeviennent directs en même temps ?', answer: 'Oui. Selon notre calcul sur 1951–2050, novembre 2026 est la seule fois où leurs stations directes ont lieu à moins de 24 heures d’écart (environ 8 h 30). Le cas le plus proche ensuite date de février 1982.' },
        { question: 'Peut-on signer un contrat le 13 novembre 2026 ?', answer: 'Rien ne l’interdit. En astrologie, on conseille simplement d’éviter le jour même de la station et de préférer la fin de l’ombre (30 novembre pour Mercure) pour les engagements importants, après avoir relu les termes.' },
        { question: 'Quand a lieu la prochaine rétrogradation de Mercure ?', answer: 'Du 9 février 2027 (5°59′ Poissons) au 3 mars 2027 (20°55′ Verseau).' },
        { question: 'Comment savoir dans quelle maison tombent Mercure et Vénus pour moi ?', answer: 'Cette page utilise votre signe solaire. Avec votre heure de naissance, notre thème astral gratuit donne votre ascendant, qui permet une lecture plus précise des maisons.' },
      ],
      ctaText: 'Une décision d’amour, d’argent ou de travail mise en pause pendant la rétrogradation ? Parlez-en à voix haute avec une Conseillère ou un Conseiller Callastral.',
      ctaButton: '3 min offertes, sans carte',
      linksTitle: 'Aller plus loin',
      links: commonLinks('fr'),
      related: { href: SKY_EVENT_PATHS.newMoonScorpio.fr, label: 'Nouvelle Lune en Scorpion du 9 novembre 2026' },
      home: 'Accueil',
      disclaimer: DISCLAIMER.fr,
    };
  }
  return {
    id: 'mercuryVenusDirect',
    locale,
    path,
    title: 'When Does Mercury Retrograde End? 13 Nov 2026',
    description: 'Mercury retrograde ends 13 Nov 2026 at 15:54 UTC, Venus retrograde on 14 Nov near 00:27 UTC. Shadow ends 30 Nov and 15 Dec; what it changes for your sign.',
    h1: 'Mercury and Venus station direct on 13–14 November 2026',
    breadcrumb: 'Mercury and Venus direct, November 2026',
    answer: [
      'Mercury retrograde ends on 13 November 2026 at 15:54 UTC (16:54 Paris time), when Mercury stations direct at 5°02′ Scorpio; Venus retrograde ends about 8.5 hours later, on 14 November 2026 at about 00:27 UTC (01:27 Paris time), at 22°52′ Libra.',
      'Communication, travel and paperwork delays ease first, then love and money decisions put on hold since 3 October can move forward, gradually, until the shadow periods end on 30 November (Mercury) and 15 December (Venus).',
    ],
    updated: 'Published on 30 October 2026, updated on 2 November 2026',
    tableTitle: 'Key dates, Paris time and UTC',
    tableCaption: 'Calculated with the NASA JPL DE440 ephemeris',
    cols: ['Event', 'Paris time', 'UTC', 'Position'],
    rows: [
      row('venusStationRetro', 'en', 'Venus stations retrograde', '8°29′ Scorpio'),
      row('mercuryStationRetro', 'en', 'Mercury stations retrograde', '20°59′ Scorpio'),
      row('venusIntoLibra', 'en', 'Venus retrograde moves back into Libra', '0° Libra'),
      row('mercuryStationDirect', 'en', 'Mercury stations direct', '5°02′ Scorpio'),
      row('venusStationDirect', 'en', 'Venus stations direct', '22°52′ Libra'),
      row('mercuryShadowEnd', 'en', 'Mercury leaves its shadow', 'back at 20°59′ Scorpio'),
      row('venusIntoScorpio', 'en', 'Venus (direct) enters Scorpio', '0° Scorpio'),
      row('venusShadowEnd', 'en', 'Venus leaves its shadow', 'back at 8°29′ Scorpio'),
    ],
    sections: [
      {
        h2: 'What happens on 13 and 14 November 2026',
        paragraphs: [
          `Venus has been retrograde since ${t('venusStationRetro')}, at 8°29′ Scorpio. It moved back into Libra on 25 October and stops there: it stations direct on ${t('venusStationDirect')}, at 22°52′ Libra.`,
          `Mercury has been retrograde since ${t('mercuryStationRetro')}, at 20°59′ Scorpio. It stations direct on ${t('mercuryStationDirect')}, at 5°02′ Scorpio, within 2° of a square to Pluto in Aquarius.`,
          'Two personal planets turning direct less than 9 hours apart is rare: in our calculation for 1951–2050, this is the only time Mercury and Venus station direct within 24 hours of each other. The next closest case was in February 1982, about 59 hours apart.',
        ],
      },
      {
        h2: 'The shadow period: when it is really over',
        paragraphs: [
          `After a station, a planet first moves back over the degrees it covered in reverse. Mercury leaves its shadow on ${t('mercuryShadowEnd')}, when it returns to 20°59′ Scorpio; it then enters Sagittarius on 6 December.`,
          `Venus re-enters Scorpio on ${t('venusIntoScorpio')} and leaves its shadow on ${t('venusShadowEnd')}, passing 8°29′ Scorpio again. For a signature, a big purchase or a relationship commitment, these two dates are the most cautious markers.`,
        ],
      },
      {
        h2: 'Also in the sky that weekend',
        paragraphs: [
          `On ${t('marsJupiter')}, Mars meets Jupiter at 25°53′ Leo: a conjunction of drive and ambition, right after the two stations. It comes after the New Moon in Scorpio on 9 November and before the Sun enters Sagittarius on ${t('sunSagittarius')}.`,
        ],
      },
      {
        h2: 'The next retrogrades',
        paragraphs: [
          'Next Mercury retrograde: from 9 February 2027 at 17:36 UTC (18:36 Paris time), at 5°59′ Pisces, to 3 March 2027 at 12:32 UTC (13:32 Paris time), at 20°55′ Aquarius.',
          'Next Venus retrograde: from 10 May 2028 at 23:03 UTC (11 May, 01:03 Paris time), at 19°41′ Gemini, to 22 June 2028 at 22:13 UTC (23 June, 00:13 Paris time), at 3°11′ Gemini.',
        ],
      },
    ],
    signsTitle: 'What Mercury and Venus direct change for your sign',
    signsIntro: 'Reading by solar houses, from your Sun sign. For a more precise reading, use your rising sign: our free birth chart calculates it in a minute.',
    adviceTitle: 'Practical advice',
    advice: [
      'On 13 and 14 November, let the stations pass: reread, but do not sign within the hour if you can wait a day or two.',
      'Pick up the files you paused in October: check dates, amounts and addresses before resending anything.',
      'For an expensive purchase, a contract or a relationship commitment, aim for after 30 November (Mercury), and ideally after 15 December (Venus).',
      'Write down what the retrograde taught you about money and relationships: that is the material to use now.',
    ],
    method: METHOD.en,
    faqTitle: 'Frequently asked questions',
    faqs: [
      { question: 'When does Mercury retrograde end in November 2026?', answer: 'On 13 November 2026 at 15:54 UTC (16:54 Paris time), when Mercury stations direct at 5°02′ Scorpio. The shadow period ends on 30 November 2026.' },
      { question: 'When does Venus retrograde end in 2026?', answer: 'On 14 November 2026 at about 00:27 UTC (01:27 Paris time; the evening of 13 November in the Americas), at 22°52′ Libra. It began on 3 October 2026 at 8°29′ Scorpio. Venus leaves its shadow on 15 December 2026.' },
      { question: 'Is it rare for Mercury and Venus to turn direct together?', answer: 'Yes. In our calculation for 1951–2050, November 2026 is the only time their direct stations fall less than 24 hours apart (about 8.5 hours). The next closest case was in February 1982.' },
      { question: 'Can I sign a contract on 13 November 2026?', answer: 'Nothing stops you. Astrologers simply suggest avoiding the station day itself and preferring the end of the shadow (30 November for Mercury) for important commitments, after rereading the terms.' },
      { question: 'When is the next Mercury retrograde?', answer: 'From 9 February 2027 (5°59′ Pisces) to 3 March 2027 (20°55′ Aquarius).' },
      { question: 'How do I know which houses Mercury and Venus fall in for me?', answer: 'This page uses your Sun sign. With your birth time, our free birth chart gives your rising sign, which allows a more precise house reading.' },
    ],
    ctaText: 'A love, money or work decision paused during the retrograde? Talk it through out loud with a Callastral advisor.',
    ctaButton: '3 free minutes, no card',
    linksTitle: 'Go further',
    links: commonLinks('en'),
    related: { href: SKY_EVENT_PATHS.newMoonScorpio.en, label: 'New Moon in Scorpio on 9 November 2026' },
    home: 'Home',
    disclaimer: DISCLAIMER.en,
  };
}

function newMoonCopy(locale: SkyLocale): SkyEventCopy {
  const t = (id: SkyFactId) => bothTimes(id, locale);
  const path = SKY_EVENT_PATHS.newMoonScorpio[locale];
  if (locale === 'fr') {
    return {
      id: 'newMoonScorpio',
      locale,
      path,
      title: 'Nouvelle Lune en Scorpion du 9/11/2026 : heure',
      description: 'Nouvelle Lune de novembre 2026 : en Scorpion le 9 novembre à 8 h 02 (Paris), 7 h 02 UTC. Heure exacte, intentions à poser et effets pour les 12 signes.',
      h1: 'Nouvelle Lune en Scorpion du 9 novembre 2026',
      breadcrumb: 'Nouvelle Lune en Scorpion, 9 novembre 2026',
      answer: [
        'La Nouvelle Lune en Scorpion a lieu le lundi 9 novembre 2026 à 8 h 02, heure de Paris (7 h 02 UTC), à 16°53′ Scorpion.',
        'C’est une Lune de recommencement en profondeur : on y pose des intentions sur ce qu’on veut transformer, lâcher ou regarder en face, avec une particularité cette année : Mercure et Vénus sont encore rétrogrades, donc mieux vaut préparer que lancer, puis agir après leurs stations des 13 et 14 novembre.',
      ],
      updated: 'Publié le 30 octobre 2026, mis à jour le 2 novembre 2026',
      tableTitle: 'Le ciel autour de la Nouvelle Lune',
      tableCaption: 'Calculé avec l’éphéméride NASA JPL DE440',
      cols: ['Événement', 'Heure de Paris', 'UTC', 'Position'],
      rows: [
        row('newMoon', 'fr', 'Nouvelle Lune en Scorpion', '16°53′ Scorpion'),
        row('mercuryStationDirect', 'fr', 'Mercure redevient direct', '5°02′ Scorpion'),
        row('venusStationDirect', 'fr', 'Vénus redevient directe', '22°52′ Balance'),
        row('marsJupiter', 'fr', 'Conjonction Mars–Jupiter', '25°53′ Lion'),
        row('sunSagittarius', 'fr', 'Le Soleil entre en Sagittaire', '0° Sagittaire'),
        row('fullMoon', 'fr', 'Pleine Lune en Gémeaux', '2°20′ Gémeaux'),
      ],
      sections: [
        {
          h2: 'Le ciel de la Nouvelle Lune du 9 novembre 2026',
          paragraphs: [
            `Le Soleil et la Lune se rejoignent le ${t('newMoon')}, à 16°53′ Scorpion. La Lune est alors invisible : c’est le début du cycle lunaire de novembre.`,
            'Au même moment, Mercure est rétrograde à 6°52′ Scorpion, dans le même signe que la lunaison, et Vénus est rétrograde à 23°19′ Balance. Mars (22°41′ Lion) et Jupiter (25°15′ Lion) se rapprochent de leur conjonction du 16 novembre.',
            'Le Scorpion est un signe d’eau fixe, associé en astrologie à l’intimité, à l’argent partagé, aux secrets et aux transformations. Une Nouvelle Lune dans ce signe invite à aller au fond d’une question plutôt qu’à s’éparpiller.',
          ],
        },
        {
          h2: 'Que faire de cette Nouvelle Lune avec Mercure et Vénus rétrogrades ?',
          paragraphs: [
            `Avec deux planètes personnelles rétrogrades, cette lunaison favorise la préparation : écrire ses intentions, faire le tri, relire, réparer. Mercure redevient direct le ${t('mercuryStationDirect')} et Vénus le ${t('venusStationDirect')} : c’est à partir de là que les décisions concrètes deviennent plus faciles.`,
            `La Pleine Lune qui suit a lieu le ${t('fullMoon')}, à 2°20′ Gémeaux : c’est le moment où l’on voit ce que les intentions du 9 novembre ont commencé à produire.`,
          ],
        },
      ],
      signsTitle: 'La Nouvelle Lune en Scorpion pour chaque signe',
      signsIntro: 'Lecture par maisons solaires, à partir de votre signe solaire. Avec votre ascendant (calculé par notre thème astral gratuit), la lecture des maisons est plus précise.',
      adviceTitle: 'Rituel simple pour le 9 novembre',
      advice: [
        'Dans les 48 heures qui suivent 8 h 02, écrivez trois intentions au présent, précises et à votre portée.',
        'Choisissez une chose à lâcher : une habitude, une dépense, une relation qui vous coûte. Le Scorpion aime les décisions nettes.',
        'Ne lancez pas tout de suite ce qui demande une signature : attendez les stations des 13 et 14 novembre, voire la fin de l’ombre de Mercure le 30 novembre.',
        'Relisez vos intentions à la Pleine Lune du 24 novembre et notez ce qui a bougé.',
      ],
      method: METHOD.fr,
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'À quelle heure est la Nouvelle Lune du 9 novembre 2026 ?', answer: 'À 8 h 02, heure de Paris, soit 7 h 02 UTC, le lundi 9 novembre 2026, à 16°53′ Scorpion.' },
        { question: 'Que signifie une Nouvelle Lune en Scorpion ?', answer: 'En astrologie, c’est un nouveau départ tourné vers la profondeur : intimité, confiance, argent partagé, ce qu’on accepte de transformer ou de laisser partir.' },
        { question: 'La Nouvelle Lune de novembre 2026 est-elle une éclipse ?', answer: 'Non. Il n’y a pas d’éclipse en novembre 2026 ; c’est une Nouvelle Lune classique.' },
        { question: 'Peut-on lancer un projet pendant Mercure rétrograde ?', answer: 'On peut le préparer. La tradition astrologique conseille d’attendre que Mercure redevienne direct (13 novembre 2026) pour signer ou lancer officiellement, et la fin de l’ombre (30 novembre) pour le plus important.' },
        { question: 'Quand est la prochaine Pleine Lune ?', answer: 'Le 24 novembre 2026 à 15 h 53, heure de Paris (14 h 53 UTC), à 2°20′ Gémeaux. C’est une super Lune, la première de trois d’affilée.' },
        { question: 'Quel signe est le plus concerné par cette Nouvelle Lune ?', answer: 'Le Scorpion en premier, puis le Taureau (signe opposé), le Lion et le Verseau (carrés). Les autres signes la vivent dans un domaine précis de leur vie, détaillé plus haut.' },
      ],
      ctaText: 'Envie de formuler vos intentions avec quelqu’un ? Parlez de votre thème à voix haute avec une Conseillère ou un Conseiller Callastral.',
      ctaButton: '3 min offertes, sans carte',
      linksTitle: 'Aller plus loin',
      links: commonLinks('fr'),
      related: { href: SKY_EVENT_PATHS.mercuryVenusDirect.fr, label: 'Mercure et Vénus directs les 13 et 14 novembre 2026' },
      home: 'Accueil',
      disclaimer: DISCLAIMER.fr,
    };
  }
  return {
    id: 'newMoonScorpio',
    locale,
    path,
    title: 'New Moon in Scorpio, 9 Nov 2026: Time and Ritual',
    description: 'The November 2026 New Moon is in Scorpio on 9 Nov at 07:02 UTC (08:02 Paris time). Exact time, intentions to set and what it means for all 12 signs.',
    h1: 'New Moon in Scorpio on 9 November 2026',
    breadcrumb: 'New Moon in Scorpio, 9 November 2026',
    answer: [
      'The New Moon in Scorpio takes place on Monday 9 November 2026 at 07:02 UTC (08:02 Paris time, 02:02 New York time), at 16°53′ Scorpio.',
      'It is a New Moon for deep fresh starts: set intentions about what you want to transform, release or face honestly, with one twist this year: Mercury and Venus are still retrograde, so prepare rather than launch, then act after their stations on 13 and 14 November.',
    ],
    updated: 'Published on 30 October 2026, updated on 2 November 2026',
    tableTitle: 'The sky around the New Moon',
    tableCaption: 'Calculated with the NASA JPL DE440 ephemeris',
    cols: ['Event', 'Paris time', 'UTC', 'Position'],
    rows: [
      row('newMoon', 'en', 'New Moon in Scorpio', '16°53′ Scorpio'),
      row('mercuryStationDirect', 'en', 'Mercury stations direct', '5°02′ Scorpio'),
      row('venusStationDirect', 'en', 'Venus stations direct', '22°52′ Libra'),
      row('marsJupiter', 'en', 'Mars–Jupiter conjunction', '25°53′ Leo'),
      row('sunSagittarius', 'en', 'Sun enters Sagittarius', '0° Sagittarius'),
      row('fullMoon', 'en', 'Full Moon in Gemini', '2°20′ Gemini'),
    ],
    sections: [
      {
        h2: 'The sky of the 9 November 2026 New Moon',
        paragraphs: [
          `The Sun and Moon meet on ${t('newMoon')}, at 16°53′ Scorpio. The Moon is invisible: this is the start of November’s lunar cycle.`,
          'At the same moment, Mercury is retrograde at 6°52′ Scorpio, in the same sign as the New Moon, and Venus is retrograde at 23°19′ Libra. Mars (22°41′ Leo) and Jupiter (25°15′ Leo) are closing in on their 16 November conjunction.',
          'Scorpio is a fixed water sign, linked in astrology with intimacy, shared money, secrets and transformation. A New Moon in this sign asks you to go to the bottom of one question rather than spread yourself thin.',
        ],
      },
      {
        h2: 'How to work with this New Moon while Mercury and Venus are retrograde',
        paragraphs: [
          `With two personal planets retrograde, this New Moon favours preparation: write intentions, sort, reread, repair. Mercury stations direct on ${t('mercuryStationDirect')} and Venus on ${t('venusStationDirect')}: from then on, concrete decisions get easier.`,
          `The following Full Moon is on ${t('fullMoon')}, at 2°20′ Gemini: that is when you see what the 9 November intentions have started to produce.`,
        ],
      },
    ],
    signsTitle: 'The Scorpio New Moon for each sign',
    signsIntro: 'Reading by solar houses, from your Sun sign. With your rising sign (calculated by our free birth chart), the house reading is more precise.',
    adviceTitle: 'A simple New Moon ritual for 9 November',
    advice: [
      'Within 48 hours after 07:02 UTC, write three intentions in the present tense, specific and within your reach.',
      'Pick one thing to release: a habit, an expense, a relationship that costs you. Scorpio likes clear decisions.',
      'Do not launch anything that needs a signature straight away: wait for the 13–14 November stations, or even the end of Mercury’s shadow on 30 November.',
      'Reread your intentions at the Full Moon on 24 November and note what has moved.',
    ],
    method: METHOD.en,
    faqTitle: 'Frequently asked questions',
    faqs: [
      { question: 'What time is the New Moon on 9 November 2026?', answer: 'At 07:02 UTC, which is 08:02 Paris time and 02:02 New York time, on Monday 9 November 2026, at 16°53′ Scorpio.' },
      { question: 'What does a New Moon in Scorpio mean?', answer: 'In astrology, it is a fresh start focused on depth: intimacy, trust, shared money, and what you are ready to transform or let go of.' },
      { question: 'Is the November 2026 New Moon an eclipse?', answer: 'No. There is no eclipse in November 2026; it is a regular New Moon.' },
      { question: 'Can I start a project during Mercury retrograde?', answer: 'You can prepare it. Astrological tradition suggests waiting until Mercury stations direct (13 November 2026) to sign or officially launch, and the end of the shadow (30 November) for the most important things.' },
      { question: 'When is the next Full Moon?', answer: 'On 24 November 2026 at 14:53 UTC (15:53 Paris time), at 2°20′ Gemini. It is a supermoon, the first of three in a row.' },
      { question: 'Which signs feel this New Moon most?', answer: 'Scorpio first, then Taurus (the opposite sign), Leo and Aquarius (square). The other signs feel it in one specific area of life, detailed above.' },
    ],
    ctaText: 'Want to put your intentions into words with someone? Talk about your chart out loud with a Callastral advisor.',
    ctaButton: '3 free minutes, no card',
    linksTitle: 'Go further',
    links: commonLinks('en'),
    related: { href: SKY_EVENT_PATHS.mercuryVenusDirect.en, label: 'Mercury and Venus direct on 13–14 November 2026' },
    home: 'Home',
    disclaimer: DISCLAIMER.en,
  };
}

/** Libellés courts pour le maillage entre pages événement. */
export const SKY_EVENT_LABELS: Record<SkyEventId, Record<SkyLocale, string>> = {
  mercuryVenusDirect: { en: 'Mercury and Venus direct on 13–14 November 2026', fr: 'Mercure et Vénus directs les 13 et 14 novembre 2026' },
  newMoonScorpio: { en: 'New Moon in Scorpio on 9 November 2026', fr: 'Nouvelle Lune en Scorpion du 9 novembre 2026' },
  fullMoonGemini: { en: 'Full Moon in Gemini (Beaver supermoon) on 24 November 2026', fr: 'Pleine Lune en Gémeaux (super Lune) du 24 novembre 2026' },
  sagittariusSeason: { en: 'Sagittarius season 2026: 22 November to 21 December', fr: 'Saison du Sagittaire 2026 : du 22 novembre au 21 décembre' },
};

function fullMoonCopy(locale: SkyLocale): SkyEventCopy {
  const t = (id: SkyFactId) => bothTimes(id, locale);
  const path = SKY_EVENT_PATHS.fullMoonGemini[locale];
  if (locale === 'fr') {
    return {
      id: 'fullMoonGemini',
      locale,
      path,
      title: 'Pleine Lune en Gémeaux du 24/11/2026 : heure',
      description: 'Pleine Lune en Gémeaux le 24 novembre 2026 à 15 h 53 (Paris), 14 h 53 UTC : une super Lune, sans éclipse. Heure exacte, sens et effets par signe.',
      h1: 'Pleine Lune en Gémeaux du 24 novembre 2026',
      breadcrumb: 'Pleine Lune en Gémeaux, 24 novembre 2026',
      answer: [
        'La Pleine Lune de novembre 2026 a lieu le mardi 24 novembre 2026 à 15 h 53, heure de Paris (14 h 53 UTC), à 2°20′ Gémeaux, face au Soleil à 2°20′ Sagittaire.',
        'C’est une super Lune (la Lune passe au plus près de la Terre le lendemain), la première de trois d’affilée, mais pas une éclipse : en astrologie, c’est un moment de clarté sur les échanges, les décisions en cours et ce que vous vous racontez, à vivre en observant plutôt qu’en tranchant dans l’urgence.',
      ],
      updated: 'Publié le 2 novembre 2026',
      tableTitle: 'Le ciel autour de la Pleine Lune',
      tableCaption: 'Calculé avec l’éphéméride NASA JPL DE440',
      cols: ['Événement', 'Heure de Paris', 'UTC', 'Position'],
      rows: [
        row('newMoon', 'fr', 'Nouvelle Lune en Scorpion (début du cycle)', '16°53′ Scorpion'),
        row('sunSagittarius', 'fr', 'Le Soleil entre en Sagittaire', '0° Sagittaire'),
        row('fullMoon', 'fr', 'Pleine Lune en Gémeaux', '2°20′ Gémeaux'),
        row('moonrise24Paris', 'fr', 'Lever de la Lune à Paris', 'horizon est'),
        row('perigee', 'fr', 'Périgée (Lune au plus près)', '359 336 km'),
        row('marsVirgo', 'fr', 'Mars entre en Vierge', '0° Vierge'),
        row('newMoonSagittarius', 'fr', 'Nouvelle Lune suivante, en Sagittaire', '16°57′ Sagittaire'),
      ],
      sections: [
        {
          h2: 'Le ciel de la Pleine Lune du 24 novembre 2026',
          paragraphs: [
            `La Lune s’oppose exactement au Soleil le ${t('fullMoon')}, à 2°20′ Gémeaux. Le Soleil vient d’entrer en Sagittaire, le ${t('sunSagittarius')} : c’est la première Pleine Lune de la saison du Sagittaire.`,
            'La Lune est à 1°24′ d’Uranus (3°44′ Gémeaux), en trigone avec Pluton (3°26′ Verseau) et en sextile avec Neptune (1°42′ Bélier). Mercure, redevenu direct le 13 novembre, est à 13°19′ Scorpion ; Vénus, directe depuis le 14, à 24°59′ Balance ; Mars (29°27′ Lion) et Jupiter (26°29′ Lion) sont encore ensemble en Lion.',
            'Les Gémeaux sont un signe d’air mutable, associé en astrologie à la parole, aux échanges, à la curiosité et aux choix multiples. Une Pleine Lune dans ce signe met en lumière ce qui a été dit, ou tu, depuis la Nouvelle Lune du 9 novembre.',
          ],
        },
        {
          h2: 'Est-ce une super Lune ? Une éclipse ?',
          paragraphs: [
            `Oui, c’est une super Lune : au moment de la Pleine Lune, la Lune est à environ 360 770 km de la Terre (centre à centre), et elle atteint son périgée le ${t('perigee')}, à 359 336 km. Elle paraît un peu plus grande et plus lumineuse qu’une Pleine Lune moyenne, une différence subtile à l’œil nu. C’est la première d’une série de trois super Lunes : novembre, décembre (Pleine Lune du ${t('fullMoonCancer')}, en Cancer) et janvier 2027.`,
            'Ce n’est pas une éclipse : la Lune passe environ 5° au nord de l’écliptique, trop loin de l’ombre de la Terre. Il n’y a aucune éclipse en novembre 2026.',
            'En Amérique du Nord, la Pleine Lune de novembre est surnommée « Lune du castor » (Beaver Moon), et parfois « Lune de givre ».',
          ],
        },
        {
          h2: 'Quand la voir depuis Paris',
          paragraphs: [
            `À l’heure exacte, 15 h 53, la Lune est encore sous l’horizon à Paris. Elle se lève le ${t('moonrise24Paris')}, peu avant le coucher du Soleil, et reste visible toute la nuit. La veille au soir, le 23 novembre, elle paraît déjà pleine à l’œil nu.`,
            'Le meilleur moment pour la regarder est juste après son lever, bas sur l’horizon est : l’illusion lunaire la fait paraître plus grande.',
          ],
        },
      ],
      signsTitle: 'La Pleine Lune en Gémeaux pour chaque signe',
      signsIntro: 'Lecture par maisons solaires, à partir de votre signe solaire. Avec votre ascendant, calculé par notre thème astral gratuit, la lecture des maisons est plus précise.',
      adviceTitle: 'Que faire pendant cette Pleine Lune',
      advice: [
        'Relisez les intentions posées à la Nouvelle Lune du 9 novembre : notez ce qui a avancé, ce qui bloque, ce qui ne vous concerne plus.',
        'Gémeaux oblige, faites le tri dans vos échanges : un message à envoyer, une conversation à clarifier, un fil à couper.',
        'Évitez les décisions irréversibles prises sur le coup de l’émotion le 24 au soir : une Pleine Lune éclaire, elle ne tranche pas à votre place.',
        'Regardez la Lune se lever vers 16 h 25 à Paris, puis accordez-vous une soirée plus calme et un vrai temps de sommeil.',
      ],
      method: METHOD.fr,
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'À quelle heure est la Pleine Lune du 24 novembre 2026 ?', answer: 'À 15 h 53, heure de Paris, soit 14 h 53 UTC (9 h 53 à New York), le mardi 24 novembre 2026, à 2°20′ Gémeaux.' },
        { question: 'La Pleine Lune de novembre 2026 est-elle une super Lune ?', answer: 'Oui. La Lune est à environ 360 770 km de la Terre au moment de la Pleine Lune et passe au périgée le lendemain. C’est la première de trois super Lunes consécutives (novembre, décembre, janvier 2027).' },
        { question: 'Y a-t-il une éclipse le 24 novembre 2026 ?', answer: 'Non. La Lune passe environ 5° au nord de l’écliptique : il n’y a pas d’éclipse en novembre 2026.' },
        { question: 'Que signifie une Pleine Lune en Gémeaux ?', answer: 'En astrologie, c’est un moment de clarté sur la communication : ce qui a été dit ou tu, les choix multiples, les informations qui manquaient. On y fait le tri plutôt que de lancer quelque chose de nouveau.' },
        { question: 'Pourquoi l’appelle-t-on Lune du castor ?', answer: 'C’est un nom nord-américain traditionnel de la Pleine Lune de novembre, la saison où les castors finissent leurs abris avant l’hiver. On l’appelle aussi Lune de givre.' },
        { question: 'Quels signes ressentent le plus cette Pleine Lune ?', answer: 'Les Gémeaux (Lune dans leur signe, près d’Uranus) et le Sagittaire (Soleil dans leur signe), puis la Vierge et les Poissons (carrés). La Balance et le Verseau, signes d’air, la vivent en général plus facilement.' },
        { question: 'Quand est la prochaine Pleine Lune ?', answer: 'Le 24 décembre 2026 à 2 h 28, heure de Paris (1 h 28 UTC), à 2°14′ Cancer. C’est aussi une super Lune.' },
      ],
      ctaText: 'Une conversation que vous repoussez, une décision qui tourne en boucle ? Parlez-en à voix haute avec une Conseillère ou un Conseiller Callastral, à partir de votre vrai thème. Aucune date inventée. Aucun compteur caché. Ton vrai ciel.',
      ctaButton: '3 min offertes, sans carte',
      linksTitle: 'Aller plus loin',
      links: commonLinks('fr'),
      related: { href: SKY_EVENT_PATHS.sagittariusSeason.fr, label: SKY_EVENT_LABELS.sagittariusSeason.fr },
      home: 'Accueil',
      disclaimer: DISCLAIMER.fr,
    };
  }
  return {
    id: 'fullMoonGemini',
    locale,
    path,
    title: 'Full Moon in Gemini, 24 Nov 2026: Supermoon Time',
    description: 'The November 2026 Full Moon is in Gemini on 24 Nov at 14:53 UTC (15:53 Paris): a supermoon, not an eclipse. Exact time, meaning and effects by sign.',
    h1: 'Full Moon in Gemini on 24 November 2026',
    breadcrumb: 'Full Moon in Gemini, 24 November 2026',
    answer: [
      'The November 2026 Full Moon takes place on Tuesday 24 November 2026 at 14:53 UTC (15:53 Paris time, 09:53 New York time), at 2°20′ Gemini, opposite the Sun at 2°20′ Sagittarius.',
      'It is a supermoon (the Moon reaches its closest point to Earth the next day), the first of three in a row, but not an eclipse: in astrology it is a moment of clarity about conversations, pending choices and the stories you tell yourself, best used to observe rather than to decide in a rush.',
    ],
    updated: 'Published on 2 November 2026',
    tableTitle: 'The sky around the Full Moon',
    tableCaption: 'Calculated with the NASA JPL DE440 ephemeris',
    cols: ['Event', 'Paris time', 'UTC', 'Position'],
    rows: [
      row('newMoon', 'en', 'New Moon in Scorpio (start of the cycle)', '16°53′ Scorpio'),
      row('sunSagittarius', 'en', 'Sun enters Sagittarius', '0° Sagittarius'),
      row('fullMoon', 'en', 'Full Moon in Gemini', '2°20′ Gemini'),
      row('moonrise24Paris', 'en', 'Moonrise in Paris', 'eastern horizon'),
      row('perigee', 'en', 'Perigee (Moon closest)', '359,336 km'),
      row('marsVirgo', 'en', 'Mars enters Virgo', '0° Virgo'),
      row('newMoonSagittarius', 'en', 'Next New Moon, in Sagittarius', '16°57′ Sagittarius'),
    ],
    sections: [
      {
        h2: 'The sky of the 24 November 2026 Full Moon',
        paragraphs: [
          `The Moon exactly opposes the Sun on ${t('fullMoon')}, at 2°20′ Gemini. The Sun has just entered Sagittarius, on ${t('sunSagittarius')}: this is the first Full Moon of Sagittarius season.`,
          'The Moon is 1°24′ from Uranus (3°44′ Gemini), trine Pluto (3°26′ Aquarius) and sextile Neptune (1°42′ Aries). Mercury, direct again since 13 November, is at 13°19′ Scorpio; Venus, direct since the 14th, at 24°59′ Libra; Mars (29°27′ Leo) and Jupiter (26°29′ Leo) are still together in Leo.',
          'Gemini is a mutable air sign, linked in astrology with speech, exchanges, curiosity and multiple choices. A Full Moon in this sign shows what has been said, or left unsaid, since the New Moon of 9 November.',
        ],
      },
      {
        h2: 'Is it a supermoon? An eclipse?',
        paragraphs: [
          `Yes, it is a supermoon: at the moment of Full Moon the Moon is about 360,770 km from Earth (centre to centre), and it reaches perigee on ${t('perigee')}, at 359,336 km. It looks slightly larger and brighter than an average Full Moon, a subtle difference to the naked eye. It is the first of three supermoons in a row: November, December (Full Moon on ${t('fullMoonCancer')}, in Cancer) and January 2027.`,
          'It is not an eclipse: the Moon passes about 5° north of the ecliptic, too far from Earth’s shadow. There is no eclipse in November 2026.',
          'In North America, the November Full Moon is known as the Beaver Moon, and sometimes the Frost Moon.',
        ],
      },
      {
        h2: 'When to see it',
        paragraphs: [
          `At the exact time, 14:53 UTC, the Moon is still below the horizon in Paris and in North America. In Paris it rises on ${t('moonrise24Paris')}, shortly before sunset, and stays up all night. On the evening before, 23 November, it already looks full to the naked eye.`,
          'The best moment to look is just after moonrise, low on the eastern horizon: the Moon illusion makes it look bigger.',
        ],
      },
    ],
    signsTitle: 'The Gemini Full Moon for each sign',
    signsIntro: 'Reading by solar houses, from your Sun sign. With your rising sign, calculated by our free birth chart, the house reading is more precise.',
    adviceTitle: 'What to do during this Full Moon',
    advice: [
      'Reread the intentions you set at the 9 November New Moon: note what has moved, what is stuck and what no longer concerns you.',
      'Gemini asks you to sort your conversations: one message to send, one discussion to clarify, one thread to cut.',
      'Avoid irreversible decisions made in the heat of the moment on the evening of the 24th: a Full Moon shows you things, it does not decide for you.',
      'Watch the Moon rise (around 16:25 in Paris), then give yourself a quieter evening and real sleep.',
    ],
    method: METHOD.en,
    faqTitle: 'Frequently asked questions',
    faqs: [
      { question: 'What time is the Full Moon on 24 November 2026?', answer: 'At 14:53 UTC, which is 15:53 Paris time and 09:53 New York time, on Tuesday 24 November 2026, at 2°20′ Gemini.' },
      { question: 'Is the November 2026 Full Moon a supermoon?', answer: 'Yes. The Moon is about 360,770 km from Earth at Full Moon and reaches perigee the next day. It is the first of three consecutive supermoons (November, December, January 2027).' },
      { question: 'Is there an eclipse on 24 November 2026?', answer: 'No. The Moon passes about 5° north of the ecliptic: there is no eclipse in November 2026.' },
      { question: 'What does a Full Moon in Gemini mean?', answer: 'In astrology, it is a moment of clarity about communication: what was said or left unsaid, multiple options, missing information. It is a time to sort things out rather than launch something new.' },
      { question: 'Why is it called the Beaver Moon?', answer: 'It is a traditional North American name for the November Full Moon, the season when beavers finish their lodges before winter. It is also called the Frost Moon.' },
      { question: 'Which signs feel this Full Moon most?', answer: 'Gemini (Moon in their sign, near Uranus) and Sagittarius (Sun in their sign), then Virgo and Pisces (squares). Libra and Aquarius, the other air signs, usually find it easier.' },
      { question: 'When is the next Full Moon?', answer: 'On 24 December 2026 at 01:28 UTC (02:28 Paris time; the evening of 23 December in the Americas), at 2°14′ Cancer. It is also a supermoon.' },
    ],
    ctaText: 'A conversation you keep postponing, a decision going round in circles? Talk it through out loud with a Callastral advisor, from your real birth chart. No invented dates. No hidden meter. Your real sky.',
    ctaButton: '3 free minutes, no card',
    linksTitle: 'Go further',
    links: commonLinks('en'),
    related: { href: SKY_EVENT_PATHS.sagittariusSeason.en, label: SKY_EVENT_LABELS.sagittariusSeason.en },
    home: 'Home',
    disclaimer: DISCLAIMER.en,
  };
}

function sagittariusSeasonCopy(locale: SkyLocale): SkyEventCopy {
  const t = (id: SkyFactId) => bothTimes(id, locale);
  const path = SKY_EVENT_PATHS.sagittariusSeason[locale];
  if (locale === 'fr') {
    return {
      id: 'sagittariusSeason',
      locale,
      path,
      title: 'Saison du Sagittaire 2026 : 22 nov – 21 déc',
      description: 'La saison du Sagittaire 2026 va du 22 novembre (8 h 23, Paris) au 21 décembre (21 h 50), au solstice. Dates du ciel du mois et effets pour les 12 signes.',
      h1: 'Saison du Sagittaire 2026 : du 22 novembre au 21 décembre',
      breadcrumb: 'Saison du Sagittaire 2026',
      answer: [
        'La saison du Sagittaire 2026 commence le dimanche 22 novembre 2026 à 8 h 23, heure de Paris (7 h 23 UTC), quand le Soleil entre en Sagittaire, et se termine le lundi 21 décembre 2026 à 21 h 50, heure de Paris (20 h 50 UTC), au solstice d’hiver, quand il entre en Capricorne.',
        'Pendant ces 29 jours, le ciel met l’accent sur l’horizon, le sens, les voyages et la franchise, avec une super Lune en Gémeaux le 24 novembre, une Nouvelle Lune en Sagittaire le 9 décembre, Saturne qui repart direct et Jupiter, maître du signe, qui devient rétrograde le 13 décembre.',
      ],
      updated: 'Publié le 2 novembre 2026',
      tableTitle: 'Le calendrier de la saison du Sagittaire 2026',
      tableCaption: 'Calculé avec l’éphéméride NASA JPL DE440',
      cols: ['Événement', 'Heure de Paris', 'UTC', 'Position'],
      rows: [
        row('sunSagittarius', 'fr', 'Le Soleil entre en Sagittaire', '0° Sagittaire'),
        row('fullMoon', 'fr', 'Pleine Lune (super Lune) en Gémeaux', '2°20′ Gémeaux'),
        row('marsVirgo', 'fr', 'Mars entre en Vierge', '0° Vierge'),
        row('mercuryShadowEnd', 'fr', 'Fin de l’ombre de Mercure', '20°59′ Scorpion'),
        row('venusIntoScorpio', 'fr', 'Vénus entre en Scorpion', '0° Scorpion'),
        row('mercuryIntoSagittarius', 'fr', 'Mercure entre en Sagittaire', '0° Sagittaire'),
        row('newMoonSagittarius', 'fr', 'Nouvelle Lune en Sagittaire', '16°57′ Sagittaire'),
        row('saturnStationDirect', 'fr', 'Saturne redevient direct', '7°56′ Bélier'),
        row('jupiterStationRetro', 'fr', 'Jupiter devient rétrograde', '27°01′ Lion'),
        row('venusShadowEnd', 'fr', 'Fin de l’ombre de Vénus', '8°29′ Scorpion'),
        row('sunCapricorn', 'fr', 'Solstice : le Soleil entre en Capricorne', '0° Capricorne'),
      ],
      sections: [
        {
          h2: 'Les dates exactes de la saison du Sagittaire 2026',
          paragraphs: [
            `Le Soleil entre en Sagittaire le ${t('sunSagittarius')}, et en sort le ${t('sunCapricorn')}, moment exact du solstice d’hiver dans l’hémisphère nord.`,
            'Si vous êtes né un 22 novembre ou un 21 décembre, votre signe dépend de l’heure et de l’année de naissance : la date d’entrée du Soleil varie d’un jour selon les années. Notre thème astral gratuit tranche à la minute près.',
          ],
        },
        {
          h2: 'Ce que représente le Sagittaire en astrologie',
          paragraphs: [
            'Le Sagittaire est un signe de feu mutable, gouverné traditionnellement par Jupiter. Il est associé aux voyages, aux études, aux convictions, à l’optimisme et à la franchise : la saison invite à voir plus loin que le quotidien et à donner du sens à ce qu’on fait.',
            'Son revers : promettre trop, s’éparpiller, ou dire une vérité sans y mettre la forme. Pendant cette saison, tout le monde gagne à viser large, mais à vérifier les détails.',
          ],
        },
        {
          h2: 'Le ciel pendant la saison du Sagittaire 2026',
          paragraphs: [
            `Deux jours après l’entrée du Soleil, la Pleine Lune du ${t('fullMoon')}, à 2°20′ Gémeaux, est une super Lune. Mars quitte le Lion pour la Vierge le ${t('marsVirgo')} : l’énergie devient plus méthodique.`,
            `Mercure sort de son ombre le ${t('mercuryShadowEnd')} : la rétrogradation d’octobre est vraiment derrière nous. Vénus revient en Scorpion le ${t('venusIntoScorpio')}, et Mercure entre en Sagittaire le ${t('mercuryIntoSagittarius')}.`,
            `La Nouvelle Lune en Sagittaire a lieu le ${t('newMoonSagittarius')}, à 16°57′ Sagittaire : c’est le meilleur moment de la saison pour poser une intention liée à un voyage, une formation ou un projet de sens. Saturne redevient direct le ${t('saturnStationDirect')}, à 7°56′ Bélier, et Jupiter, maître du Sagittaire, devient rétrograde le ${t('jupiterStationRetro')}, à 27°01′ Lion.`,
          ],
        },
      ],
      signsTitle: 'La saison du Sagittaire pour chaque signe',
      signsIntro: 'Lecture par maisons solaires, à partir de votre signe solaire. Avec votre ascendant, calculé par notre thème astral gratuit, la lecture est plus précise.',
      adviceTitle: 'Conseils pour la saison du Sagittaire',
      advice: [
        'Choisissez un projet qui élargit votre horizon (voyage, formation, lecture, nouvelle compétence) et posez-en le premier pas à la Nouvelle Lune du 9 décembre.',
        'Dites les choses franchement, mais avec tact : la saison pousse à la vérité, pas à la brutalité.',
        'Avant les fêtes, fixez un budget : l’optimisme du Sagittaire rend les dépenses faciles.',
        'Après le 13 décembre (Jupiter rétrograde), revoyez vos grands projets plutôt que d’en ajouter de nouveaux.',
      ],
      method: METHOD.fr,
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'Quand commence la saison du Sagittaire 2026 ?', answer: 'Le dimanche 22 novembre 2026 à 8 h 23, heure de Paris (7 h 23 UTC), quand le Soleil entre en Sagittaire.' },
        { question: 'Quand finit la saison du Sagittaire 2026 ?', answer: 'Le lundi 21 décembre 2026 à 21 h 50, heure de Paris (20 h 50 UTC), au solstice d’hiver, quand le Soleil entre en Capricorne.' },
        { question: 'Je suis né le 22 novembre : suis-je Scorpion ou Sagittaire ?', answer: 'Cela dépend de l’heure et de l’année : le Soleil change de signe à une heure différente chaque année. Le thème astral gratuit de Callastral calcule la position exacte du Soleil à votre naissance.' },
        { question: 'Mercure est-il rétrograde pendant la saison du Sagittaire 2026 ?', answer: 'Non. Mercure est redevenu direct le 13 novembre 2026 et sort de son ombre le 30 novembre. La prochaine rétrogradation commence le 9 février 2027.' },
        { question: 'Quand est la Nouvelle Lune en Sagittaire 2026 ?', answer: 'Le 9 décembre 2026 à 1 h 51, heure de Paris (8 décembre à 19 h 51 à New York ; 0 h 51 UTC), à 16°57′ Sagittaire.' },
        { question: 'Que change Jupiter rétrograde le 13 décembre 2026 ?', answer: 'Jupiter, maître traditionnel du Sagittaire, devient rétrograde à 27°01′ Lion. En astrologie, c’est une période pour revoir et consolider ses projets d’expansion plutôt que d’en lancer de nouveaux.' },
      ],
      ctaText: 'Un projet, un départ, une relation à remettre en perspective ? Parlez-en à voix haute avec une Conseillère ou un Conseiller Callastral, à partir de votre vrai thème. Aucune date inventée. Aucun compteur caché. Ton vrai ciel.',
      ctaButton: '3 min offertes, sans carte',
      linksTitle: 'Aller plus loin',
      links: commonLinks('fr'),
      related: { href: SKY_EVENT_PATHS.fullMoonGemini.fr, label: SKY_EVENT_LABELS.fullMoonGemini.fr },
      home: 'Accueil',
      disclaimer: DISCLAIMER.fr,
    };
  }
  return {
    id: 'sagittariusSeason',
    locale,
    path,
    title: 'Sagittarius Season 2026: Dates (22 Nov – 21 Dec)',
    description: 'Sagittarius season 2026 runs from 22 Nov (07:23 UTC) to 21 Dec (20:50 UTC, the solstice). Key sky dates of the month and what it means for all 12 signs.',
    h1: 'Sagittarius season 2026: 22 November to 21 December',
    breadcrumb: 'Sagittarius season 2026',
    answer: [
      'Sagittarius season 2026 begins on Sunday 22 November 2026 at 07:23 UTC (08:23 Paris time, 02:23 New York time), when the Sun enters Sagittarius, and ends on Monday 21 December 2026 at 20:50 UTC (21:50 Paris time), at the December solstice, when the Sun enters Capricorn.',
      'During these 29 days the sky puts the accent on horizons, meaning, travel and honesty, with a Gemini supermoon on 24 November, a New Moon in Sagittarius on 9 December, Saturn turning direct, and Jupiter, the sign’s ruler, turning retrograde on 13 December.',
    ],
    updated: 'Published on 2 November 2026',
    tableTitle: 'Sagittarius season 2026 calendar',
    tableCaption: 'Calculated with the NASA JPL DE440 ephemeris',
    cols: ['Event', 'Paris time', 'UTC', 'Position'],
    rows: [
      row('sunSagittarius', 'en', 'Sun enters Sagittarius', '0° Sagittarius'),
      row('fullMoon', 'en', 'Full Moon (supermoon) in Gemini', '2°20′ Gemini'),
      row('marsVirgo', 'en', 'Mars enters Virgo', '0° Virgo'),
      row('mercuryShadowEnd', 'en', 'Mercury leaves its shadow', '20°59′ Scorpio'),
      row('venusIntoScorpio', 'en', 'Venus enters Scorpio', '0° Scorpio'),
      row('mercuryIntoSagittarius', 'en', 'Mercury enters Sagittarius', '0° Sagittarius'),
      row('newMoonSagittarius', 'en', 'New Moon in Sagittarius', '16°57′ Sagittarius'),
      row('saturnStationDirect', 'en', 'Saturn stations direct', '7°56′ Aries'),
      row('jupiterStationRetro', 'en', 'Jupiter stations retrograde', '27°01′ Leo'),
      row('venusShadowEnd', 'en', 'Venus leaves its shadow', '8°29′ Scorpio'),
      row('sunCapricorn', 'en', 'Solstice: Sun enters Capricorn', '0° Capricorn'),
    ],
    sections: [
      {
        h2: 'The exact dates of Sagittarius season 2026',
        paragraphs: [
          `The Sun enters Sagittarius on ${t('sunSagittarius')} and leaves it on ${t('sunCapricorn')}, the exact moment of the December solstice (winter in the northern hemisphere).`,
          'If you were born on 22 November or 21 December, your sign depends on your birth time and year: the date the Sun changes sign shifts by a day from year to year. Our free birth chart settles it to the minute.',
        ],
      },
      {
        h2: 'What Sagittarius stands for in astrology',
        paragraphs: [
          'Sagittarius is a mutable fire sign, traditionally ruled by Jupiter. It is linked with travel, study, beliefs, optimism and frankness: the season invites you to look beyond daily routine and give meaning to what you do.',
          'Its downside: promising too much, scattering your energy, or telling a truth without care. During this season everyone benefits from aiming wide, but checking the details.',
        ],
      },
      {
        h2: 'The sky during Sagittarius season 2026',
        paragraphs: [
          `Two days after the Sun’s ingress, the Full Moon on ${t('fullMoon')}, at 2°20′ Gemini, is a supermoon. Mars leaves Leo for Virgo on ${t('marsVirgo')}: energy becomes more methodical.`,
          `Mercury leaves its shadow on ${t('mercuryShadowEnd')}: the October retrograde is truly behind us. Venus returns to Scorpio on ${t('venusIntoScorpio')}, and Mercury enters Sagittarius on ${t('mercuryIntoSagittarius')}.`,
          `The New Moon in Sagittarius falls on ${t('newMoonSagittarius')}, at 16°57′ Sagittarius: the best moment of the season to set an intention about travel, study or a meaningful project. Saturn stations direct on ${t('saturnStationDirect')}, at 7°56′ Aries, and Jupiter, ruler of Sagittarius, stations retrograde on ${t('jupiterStationRetro')}, at 27°01′ Leo.`,
        ],
      },
    ],
    signsTitle: 'Sagittarius season for each sign',
    signsIntro: 'Reading by solar houses, from your Sun sign. With your rising sign, calculated by our free birth chart, the reading is more precise.',
    adviceTitle: 'Tips for Sagittarius season',
    advice: [
      'Pick one project that widens your horizon (a trip, a course, a book, a new skill) and take the first step at the 9 December New Moon.',
      'Be frank, but kind: the season pushes towards truth, not bluntness.',
      'Set a budget before the holidays: Sagittarius optimism makes spending easy.',
      'After 13 December (Jupiter retrograde), review your big plans rather than adding new ones.',
    ],
    method: METHOD.en,
    faqTitle: 'Frequently asked questions',
    faqs: [
      { question: 'When does Sagittarius season start in 2026?', answer: 'On Sunday 22 November 2026 at 07:23 UTC (08:23 Paris time, 02:23 New York time), when the Sun enters Sagittarius.' },
      { question: 'When does Sagittarius season end in 2026?', answer: 'On Monday 21 December 2026 at 20:50 UTC (21:50 Paris time, 15:50 New York time), at the December solstice, when the Sun enters Capricorn.' },
      { question: 'I was born on 22 November: am I a Scorpio or a Sagittarius?', answer: 'It depends on your birth time and year: the Sun changes sign at a different time each year. Callastral’s free birth chart calculates the exact position of the Sun when you were born.' },
      { question: 'Is Mercury retrograde during Sagittarius season 2026?', answer: 'No. Mercury stationed direct on 13 November 2026 and leaves its shadow on 30 November. The next retrograde begins on 9 February 2027.' },
      { question: 'When is the New Moon in Sagittarius 2026?', answer: 'On 9 December 2026 at 00:51 UTC (01:51 Paris time; 19:51 on 8 December in New York), at 16°57′ Sagittarius.' },
      { question: 'What does Jupiter retrograde on 13 December 2026 change?', answer: 'Jupiter, the traditional ruler of Sagittarius, stations retrograde at 27°01′ Leo. In astrology it is a period to review and consolidate growth plans rather than launch new ones.' },
    ],
    ctaText: 'A project, a move or a relationship to put in perspective? Talk it through out loud with a Callastral advisor, from your real birth chart. No invented dates. No hidden meter. Your real sky.',
    ctaButton: '3 free minutes, no card',
    linksTitle: 'Go further',
    links: commonLinks('en'),
    related: { href: SKY_EVENT_PATHS.fullMoonGemini.en, label: SKY_EVENT_LABELS.fullMoonGemini.en },
    home: 'Home',
    disclaimer: DISCLAIMER.en,
  };
}

export function skyEventCopy(id: SkyEventId, locale: SkyLocale): SkyEventCopy {
  let copy: SkyEventCopy;
  if (id === 'mercuryVenusDirect') copy = mercuryVenusCopy(locale);
  else if (id === 'newMoonScorpio') copy = newMoonCopy(locale);
  else if (id === 'fullMoonGemini') copy = fullMoonCopy(locale);
  else copy = sagittariusSeasonCopy(locale);
  // Maillage : chaque page événement renvoie vers les autres pages du ciel de la saison.
  const others = SKY_EVENT_IDS.filter((other) => other !== id && SKY_EVENT_PATHS[other][locale] !== copy.related.href);
  return { ...copy, links: [...copy.links, ...others.map((other) => ({ href: SKY_EVENT_PATHS[other][locale], label: SKY_EVENT_LABELS[other][locale] }))] };
}

/** FAQPage + Article + BreadcrumbList (jamais d’AggregateRating). */
export function skyEventJsonLd(copy: SkyEventCopy): Record<string, unknown> {
  const url = `${SKY_EVENTS_ORIGIN}${copy.path}`;
  const lang = copy.locale === 'fr' ? 'fr-FR' : 'en';
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: copy.home, item: `${SKY_EVENTS_ORIGIN}/${copy.locale}` },
          { '@type': 'ListItem', position: 2, name: copy.breadcrumb, item: url },
        ],
      },
      {
        '@type': 'Article',
        headline: copy.h1,
        description: copy.description,
        url,
        mainEntityOfPage: url,
        inLanguage: lang,
        datePublished: SKY_EVENT_PUBLISHED[copy.id],
        dateModified: SKY_EVENT_MODIFIED[copy.id],
        author: { '@type': 'Organization', name: 'Callastral', url: SKY_EVENTS_ORIGIN },
        publisher: { '@type': 'Organization', name: 'Callastral', url: SKY_EVENTS_ORIGIN },
      },
      {
        '@type': 'FAQPage',
        inLanguage: lang,
        mainEntity: copy.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}
