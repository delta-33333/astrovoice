import { BIG_THREE_PATHS, MOON_PATHS } from './free-tools.ts';
import { SIGN_IDS, signPath, weekPath, type SignId } from './zodiac/signs.ts';

/**
 * Pages « événement du ciel » (longue traîne, FR + EN), réponse d’abord.
 * Dates et heures calculées le 30/10/2026 avec l’éphéméride NASA JPL DE440 (Skyfield,
 * positions géocentriques apparentes), recoupées avec des tables publiées (astro-seek, otldr).
 */
export type SkyLocale = 'fr' | 'en';
export type SkyEventId = 'mercuryVenusDirect' | 'newMoonScorpio' | 'fullMoonGemini' | 'sagittariusSeason' | 'mercuryRetrograde2027' | 'eclipses2027' | 'marsRetrograde2027' | 'fullMoons2027';

export const SKY_EVENT_IDS: SkyEventId[] = ['mercuryVenusDirect', 'newMoonScorpio', 'fullMoonGemini', 'sagittariusSeason', 'mercuryRetrograde2027', 'eclipses2027', 'marsRetrograde2027', 'fullMoons2027'];
export const SKY_EVENTS_ORIGIN = 'https://callastral.com';
export const SKY_EVENTS_PUBLISHED = '2026-10-30';

/** Date de publication (et de dernière mise à jour) par page. */
export const SKY_EVENT_PUBLISHED: Record<SkyEventId, string> = {
  mercuryVenusDirect: '2026-10-30',
  newMoonScorpio: '2026-10-30',
  fullMoonGemini: '2026-11-02',
  sagittariusSeason: '2026-11-02',
  mercuryRetrograde2027: '2026-11-09',
  eclipses2027: '2026-11-09',
  marsRetrograde2027: '2026-11-11',
  fullMoons2027: '2026-11-11',
};

/** Dernière modification (titres et maillage revus le 02/11/2026). */
export const SKY_EVENT_MODIFIED: Record<SkyEventId, string> = {
  mercuryVenusDirect: '2026-11-02',
  newMoonScorpio: '2026-11-02',
  fullMoonGemini: '2026-11-02',
  sagittariusSeason: '2026-11-02',
  mercuryRetrograde2027: '2026-11-09',
  eclipses2027: '2026-11-09',
  marsRetrograde2027: '2026-11-11',
  fullMoons2027: '2026-11-11',
};

export const SKY_EVENT_PATHS: Record<SkyEventId, Record<SkyLocale, string>> = {
  mercuryVenusDirect: { en: '/en/mercury-venus-direct-november-2026', fr: '/fr/mercure-venus-direct-novembre-2026' },
  newMoonScorpio: { en: '/en/new-moon-scorpio-november-2026', fr: '/fr/nouvelle-lune-scorpion-novembre-2026' },
  fullMoonGemini: { en: '/en/full-moon-gemini-november-2026', fr: '/fr/pleine-lune-gemeaux-novembre-2026' },
  sagittariusSeason: { en: '/en/sagittarius-season-2026', fr: '/fr/saison-sagittaire-2026' },
  mercuryRetrograde2027: { en: '/en/mercury-retrograde-2027', fr: '/fr/mercure-retrograde-2027' },
  eclipses2027: { en: '/en/eclipses-2027-calendar', fr: '/fr/calendrier-eclipses-2027' },
  marsRetrograde2027: { en: '/en/mars-retrograde-2027', fr: '/fr/mars-retrograde-2027' },
  fullMoons2027: { en: '/en/full-moon-calendar-2027', fr: '/fr/calendrier-pleines-lunes-2027' },
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
    if (event === 'mercuryRetrograde2027' || event === 'eclipses2027') {
      text = signRows2027(event, locale, index);
    } else if (event === 'marsRetrograde2027' || event === 'fullMoons2027') {
      text = signRows2027b(event, locale, index);
    } else if (event === 'mercuryVenusDirect') {
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
  mercuryRetrograde2027: { en: 'Mercury retrograde 2027: dates and times of the 3 periods', fr: 'Mercure rétrograde 2027 : dates et heures des 3 périodes' },
  eclipses2027: { en: 'Eclipses 2027: dates, times and effects by sign', fr: 'Éclipses 2027 : dates, heures et effets par signe' },
  marsRetrograde2027: { en: 'Mars retrograde 2027: 10 January to 1 April', fr: 'Mars rétrograde 2027 : du 10 janvier au 1er avril' },
  fullMoons2027: { en: 'Full Moon calendar 2027: the 12 Full Moons', fr: 'Calendrier des Pleines Lunes 2027 : les 12 dates' },
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


/* ------------------------------------------------------------------ */
/* Pages 2027 : Mercure rétrograde et éclipses (publiées le 09/11/2026) */
/* Positions calculées avec l’éphéméride NASA JPL DE440 (Skyfield) ; heures et trajets */
/* des éclipses recoupés avec le catalogue NASA (eclipse.gsfc.nasa.gov/OH/OH2027.html). */
/* ------------------------------------------------------------------ */

export const T2027 = {
  m1Pre: '2027-01-25T19:12:00Z',
  m1Retro: '2027-02-09T17:36:00Z',
  m1Back: '2027-02-18T12:16:00Z',
  m1Direct: '2027-03-03T12:32:00Z',
  m1End: '2027-03-23T15:25:00Z',
  m2Pre: '2027-05-26T06:14:00Z',
  m2Retro: '2027-06-10T18:15:00Z',
  m2Back: '2027-06-26T07:19:00Z',
  m2Direct: '2027-07-04T19:39:00Z',
  m2End: '2027-07-19T09:05:00Z',
  m3Pre: '2027-09-17T07:41:00Z',
  m3Retro: '2027-10-07T14:37:00Z',
  m3Back: '2027-10-16T07:36:00Z',
  m3Direct: '2027-10-28T14:11:00Z',
  m3End: '2027-11-13T10:21:00Z',
  m4Retro: '2028-01-24T11:02:00Z',
  annular: '2027-02-06T16:00:00Z',
  lunarFeb: '2027-02-20T23:13:00Z',
  lunarJul: '2027-07-18T16:03:00Z',
  total: '2027-08-02T10:07:00Z',
  lunarAug: '2027-08-17T07:14:00Z',
} as const;

/** Format compact : « 9 février à 18 h 36, heure de Paris (17 h 36 UTC) ». */
function bothIso(iso: string, locale: SkyLocale): string {
  const d = new Date(iso);
  const loc = locale === 'fr' ? 'fr-FR' : 'en-GB';
  const dm = (tz: string) => new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', timeZone: tz }).format(d);
  const hm = (tz: string) => {
    const x = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(d);
    return locale === 'fr' ? x.replace(':', ' h ').replace(/^0(\d)/, '$1') : x;
  };
  const first = (x: string) => (locale === 'fr' ? x.replace(/^1 /, '1er ') : x);
  const pd = first(dm('Europe/Paris'));
  const ud = first(dm('UTC'));
  const utcPart = pd === ud ? `${hm('UTC')} UTC` : `${ud}, ${hm('UTC')} UTC`;
  return locale === 'fr' ? `${pd}, ${hm('Europe/Paris')} Paris (${utcPart})`.replace(/ h 00/g, ' h') : `${pd}, ${hm('Europe/Paris')} Paris (${utcPart})`;
}

function rowIso(iso: string, locale: SkyLocale, label: string, detail: string): SkyRow {
  return { label, paris: formatParis(iso, locale), utc: formatUtc(iso, locale), detail };
}

const HOUSE_TOPIC: Record<SkyLocale, string[]> = {
  en: [
    'yourself and your image',
    'money and self-worth',
    'messages, siblings and short trips',
    'home and family',
    'romance, creativity and children',
    'work routines and health',
    'partners and contracts',
    'shared money, debts and intimacy',
    'travel, study and beliefs',
    'career and reputation',
    'friends and group projects',
    'rest, solitude and what you keep private',
  ],
  fr: [
    'vous-même et votre image',
    'l’argent et l’estime de soi',
    'les messages, la fratrie et les petits trajets',
    'le foyer et la famille',
    'l’amour, la créativité et les enfants',
    'le travail quotidien et la santé',
    'le couple et les contrats',
    'l’argent partagé, les dettes et l’intimité',
    'les voyages, les études et les convictions',
    'la carrière et la réputation',
    'les amis et les projets collectifs',
    'le repos, la solitude et ce que vous gardez pour vous',
  ],
};

const SIGN_PISCES = 11;
const SIGN_AQUARIUS = 10;
const SIGN_CANCER = 3;
const SIGN_GEMINI = 2;
const SIGN_LIBRA = 6;
const SIGN_SCORPIO = 7;
const SIGN_LEO = 4;
const SIGN_VIRGO = 5;

const MERCURY_2027_EXTRA: Record<SkyLocale, Partial<Record<number, string>>> = {
  en: {
    11: 'Mercury turns retrograde inside your sign on 9 February, at 5°59′ Pisces, so the first period concerns you directly.',
    10: 'Mercury turns direct inside your sign on 3 March, at 20°55′ Aquarius.',
    3: 'Mercury turns retrograde inside your sign on 10 June, at 6°22′ Cancer, so the second period concerns you directly.',
    2: 'Mercury is your ruling planet and turns direct in your sign on 4 July, at 27°28′ Gemini: all three retrogrades touch your everyday decisions.',
    5: 'Mercury is your ruling planet, so every retrograde is felt in your habits, your lists and your health routines.',
    6: 'Mercury turns direct inside your sign on 28 October, at 19°19′ Libra.',
    7: 'Mercury turns retrograde inside your sign on 7 October, at 4°56′ Scorpio, so the third period concerns you directly.',
  },
  fr: {
    11: 'Mercure devient rétrograde dans votre signe le 9 février, à 5°59′ Poissons : la première période vous concerne directement.',
    10: 'Mercure redevient direct dans votre signe le 3 mars, à 20°55′ Verseau.',
    3: 'Mercure devient rétrograde dans votre signe le 10 juin, à 6°22′ Cancer : la deuxième période vous concerne directement.',
    2: 'Mercure gouverne votre signe et redevient direct chez vous le 4 juillet, à 27°28′ Gémeaux : les trois rétrogradations touchent vos décisions de tous les jours.',
    5: 'Mercure gouverne votre signe : chaque rétrogradation se ressent dans vos habitudes, vos listes et vos routines de santé.',
    6: 'Mercure redevient direct dans votre signe le 28 octobre, à 19°19′ Balance.',
    7: 'Mercure devient rétrograde dans votre signe le 7 octobre, à 4°56′ Scorpion : la troisième période vous concerne directement.',
  },
};

const ECLIPSE_2027_EXTRA: Record<SkyLocale, Partial<Record<number, string>>> = {
  en: {
    10: 'The 6 February eclipse is in your sign, at 17°38′ Aquarius, and the 17 August lunar eclipse is in your sign too: this is your eclipse year.',
    4: 'The 2 August total eclipse is in your sign, at 9°55′ Leo, the biggest eclipse of the year: this is your eclipse year.',
    1: 'Taurus is square to both solar eclipses (Aquarius and Leo), so you may feel pulled between two priorities in February and August.',
    7: 'Scorpio is square to both solar eclipses (Aquarius and Leo), so you may feel pulled between two priorities in February and August.',
    5: 'The 20 February lunar eclipse falls in your sign, at 1°59′ Virgo, a quiet penumbral one.',
    11: 'The 20 February lunar eclipse has the Sun in your sign, at 2°05′ Pisces.',
    9: 'The 18 July lunar eclipse falls in your sign, at 25°58′ Capricorn, a penumbral eclipse that is barely noticeable.',
    3: 'The 18 July lunar eclipse has the Sun in your sign, at 25°49′ Cancer.',
  },
  fr: {
    10: 'L’éclipse du 6 février est dans votre signe, à 17°38′ Verseau, et l’éclipse de Lune du 17 août l’est aussi : c’est votre année d’éclipses.',
    4: 'L’éclipse totale du 2 août est dans votre signe, à 9°55′ Lion, la plus grande éclipse de l’année : c’est votre année d’éclipses.',
    1: 'Le Taureau est au carré des deux éclipses de Soleil (Verseau et Lion) : vous pouvez vous sentir tiraillé entre deux priorités en février et en août.',
    7: 'Le Scorpion est au carré des deux éclipses de Soleil (Verseau et Lion) : vous pouvez vous sentir tiraillé entre deux priorités en février et en août.',
    5: 'L’éclipse de Lune du 20 février tombe dans votre signe, à 1°59′ Vierge, une éclipse pénombrale discrète.',
    11: 'Lors de l’éclipse de Lune du 20 février, le Soleil est dans votre signe, à 2°05′ Poissons.',
    9: 'L’éclipse de Lune du 18 juillet tombe dans votre signe, à 25°58′ Capricorne, une éclipse pénombrale presque imperceptible.',
    3: 'Lors de l’éclipse de Lune du 18 juillet, le Soleil est dans votre signe, à 25°49′ Cancer.',
  },
};

export function signRows2027(event: 'mercuryRetrograde2027' | 'eclipses2027', locale: SkyLocale, index: number): string {
  const name = SIGN_NAMES[locale][index];
  const topic = (h: number) => HOUSE_TOPIC[locale][h - 1];
  const o = (h: number) => ordinal(h, locale);
  if (event === 'mercuryRetrograde2027') {
    const p1a = solarHouse(index, SIGN_PISCES);
    const p1b = solarHouse(index, SIGN_AQUARIUS);
    const p2a = solarHouse(index, SIGN_CANCER);
    const p2b = solarHouse(index, SIGN_GEMINI);
    const p3a = solarHouse(index, SIGN_SCORPIO);
    const p3b = solarHouse(index, SIGN_LIBRA);
    const extra = MERCURY_2027_EXTRA[locale][index];
    return locale === 'fr'
      ? `Pour ${FR_ARTICLE[index]}${name}, du 9 février au 3 mars, Mercure recule de votre maison solaire ${p1a} (${topic(p1a)}) vers la ${p1b} (${topic(p1b)}). Du 10 juin au 4 juillet, il recule de la ${p2a} (${topic(p2a)}) vers la ${p2b} (${topic(p2b)}). Du 7 au 28 octobre, il recule de la ${p3a} (${topic(p3a)}) vers la ${p3b} (${topic(p3b)}).${extra ? ` ${extra}` : ''}`
      : `For ${name}, from 9 February to 3 March Mercury moves back from your ${o(p1a)} solar house (${topic(p1a)}) into your ${o(p1b)} (${topic(p1b)}). From 10 June to 4 July it moves back from your ${o(p2a)} (${topic(p2a)}) into your ${o(p2b)} (${topic(p2b)}). From 7 to 28 October it moves back from your ${o(p3a)} (${topic(p3a)}) into your ${o(p3b)} (${topic(p3b)}).${extra ? ` ${extra}` : ''}`;
  }
  const hs = solarHouse(index, SIGN_AQUARIUS);
  const ht = solarHouse(index, SIGN_LEO);
  const extra = ECLIPSE_2027_EXTRA[locale][index];
  return locale === 'fr'
    ? `Pour ${FR_ARTICLE[index]}${name}, l’éclipse de Soleil du 6 février tombe dans votre maison solaire ${hs} (${topic(hs)}) et l’éclipse totale du 2 août dans votre maison ${ht} (${topic(ht)}). Février ouvre un chapitre sur le premier thème et août en ouvre un sur le second, avec des effets qui se déploient sur plusieurs mois.${extra ? ` ${extra}` : ''}`
    : `For ${name}, the 6 February solar eclipse falls in your ${o(hs)} solar house (${topic(hs)}) and the 2 August total eclipse in your ${o(ht)} house (${topic(ht)}). February opens a chapter on the first theme and August opens one on the second, with effects that unfold over several months.${extra ? ` ${extra}` : ''}`;
}

const METHOD_2027: Record<SkyLocale, string> = {
  en: 'Method: planetary dates, times and degrees were computed by Callastral with the NASA JPL DE440 ephemeris (geocentric, apparent positions, tropical zodiac). Eclipse times, magnitudes and paths were cross-checked against the NASA eclipse catalogue (greatest eclipse in UT). Station times can differ by a few minutes between ephemerides. Paris time is UTC+1 until 28 March 2027, then UTC+2 until 31 October 2027.',
  fr: 'Méthode : dates, heures et degrés des planètes calculés par Callastral avec l’éphéméride NASA JPL DE440 (positions géocentriques apparentes, zodiaque tropical). Heures, magnitudes et trajets des éclipses recoupés avec le catalogue d’éclipses de la NASA (instant de l’éclipse maximale, en temps universel). L’heure d’une station peut varier de quelques minutes selon l’éphéméride. L’heure de Paris est UTC+1 jusqu’au 28 mars 2027, puis UTC+2 jusqu’au 31 octobre 2027.',
};

function link2027(locale: SkyLocale): { href: string; label: string } {
  return locale === 'fr'
    ? { href: '/fr/horoscope-2027', label: 'Lire l’horoscope 2027 pour les 12 signes (amour, travail, argent)' }
    : { href: '/fr/horoscope-2027', label: 'Horoscope 2027 for the 12 signs: love, work and money (in French)' };
}

function mercuryRetro2027Copy(locale: SkyLocale): SkyEventCopy {
  const t = (iso: string) => bothIso(iso, locale);
  const path = SKY_EVENT_PATHS.mercuryRetrograde2027[locale];
  const links = [link2027(locale), ...commonLinks(locale)];
  if (locale === 'fr') {
    return {
      id: 'mercuryRetrograde2027',
      locale,
      path,
      title: 'Mercure rétrograde 2027 : dates et heures des 3 périodes',
      description: 'Mercure rétrograde 2027 : du 9/02 au 3/03, du 10/06 au 4/07 et du 7 au 28/10. Heures de Paris et UTC, ombres et effets pour les 12 signes.',
      h1: 'Mercure rétrograde 2027 : les trois périodes, avec les heures',
      breadcrumb: 'Mercure rétrograde 2027',
      answer: [
        `Mercure est rétrograde trois fois en 2027 : du ${t(T2027.m1Retro)} au ${t(T2027.m1Direct)}, du ${t(T2027.m2Retro)} au ${t(T2027.m2Direct)}, puis du ${t(T2027.m3Retro)} au ${t(T2027.m3Direct)}.`,
        'Avec les périodes d’ombre avant et après, la zone de vigilance court du 25 janvier au 23 mars, du 26 mai au 19 juillet et du 17 septembre au 13 novembre 2027, avec une rétrogradation en Poissons et Verseau, puis en Cancer et Gémeaux, puis en Scorpion et Balance.',
      ],
      updated: 'Publié le 9 novembre 2026',
      tableTitle: 'Le calendrier de Mercure rétrograde en 2027',
      tableCaption: 'Calculé avec l’éphéméride NASA JPL DE440',
      cols: ['Événement', 'Heure de Paris', 'UTC', 'Position'],
      rows: [
        rowIso(T2027.m1Pre, 'fr', 'Début de l’ombre (1re période)', '20°55′ Verseau'),
        rowIso(T2027.m1Retro, 'fr', 'Mercure devient rétrograde', '5°59′ Poissons'),
        rowIso(T2027.m1Direct, 'fr', 'Mercure redevient direct', '20°55′ Verseau'),
        rowIso(T2027.m1End, 'fr', 'Fin de l’ombre', '5°59′ Poissons'),
        rowIso(T2027.m2Pre, 'fr', 'Début de l’ombre (2e période)', '27°28′ Gémeaux'),
        rowIso(T2027.m2Retro, 'fr', 'Mercure devient rétrograde', '6°22′ Cancer'),
        rowIso(T2027.m2Direct, 'fr', 'Mercure redevient direct', '27°28′ Gémeaux'),
        rowIso(T2027.m2End, 'fr', 'Fin de l’ombre', '6°22′ Cancer'),
        rowIso(T2027.m3Pre, 'fr', 'Début de l’ombre (3e période)', '19°19′ Balance'),
        rowIso(T2027.m3Retro, 'fr', 'Mercure devient rétrograde', '4°56′ Scorpion'),
        rowIso(T2027.m3Direct, 'fr', 'Mercure redevient direct', '19°19′ Balance'),
        rowIso(T2027.m3End, 'fr', 'Fin de l’ombre', '4°56′ Scorpion'),
      ],
      sections: [
        {
          h2: 'Les dates de Mercure rétrograde 2027 en un coup d’œil',
          paragraphs: [
            'La première période dure environ 22 jours (9 février au 3 mars), la deuxième environ 24 jours (10 juin au 4 juillet) et la troisième environ 21 jours (7 au 28 octobre). La rétrogradation suivante commence le 24 janvier 2028 à 11 h 02 UTC, à 19°42′ Verseau.',
            'Mercure est direct du 13 novembre 2026 au 9 février 2027, puis du 3 mars au 10 juin, puis du 4 juillet au 7 octobre, puis du 28 octobre jusqu’à la fin de l’année.',
          ],
        },
        {
          h2: 'Ce que signifie Mercure rétrograde',
          paragraphs: [
            'Mercure rétrograde est un mouvement apparent : vu de la Terre, la planète semble reculer quelques semaines, comme une voiture que l’on dépasse sur l’autoroute. Cela se produit environ trois à quatre fois par an et ne change rien au fonctionnement réel des téléphones ou des trains.',
            'En astrologie, Mercure gouverne la communication, les déplacements, les contrats et la pensée. Sa rétrogradation est lue comme une période pour relire, revoir, reprendre contact et finir ce qui traîne, plutôt que pour lancer des projets neufs.',
          ],
        },
        {
          h2: 'Du 9 février au 3 mars 2027 : Poissons puis Verseau',
          paragraphs: [
            `La première rétrogradation commence trois jours après l’éclipse solaire annulaire du 6 février à 17°38′ Verseau. Mercure recule en Verseau le ${t(T2027.m1Back)}, redevient direct à 20°55′ Verseau le ${t(T2027.m1Direct)} et sort de son ombre à 5°59′ Poissons le ${t(T2027.m1End)}.`,
            'Mars est lui aussi rétrograde du 10 janvier au 1er avril 2027 : pendant trois semaines, deux planètes qui reculent en même temps invitent à ralentir les décisions pressées, en particulier sur le travail et les échanges. Une éclipse de Lune pénombrale a lieu le 20 février, au milieu de la période.',
          ],
        },
        {
          h2: 'Du 10 juin au 4 juillet 2027 : Cancer puis Gémeaux',
          paragraphs: [
            `Mercure recule de 6°22′ Cancer et revient en Gémeaux le ${t(T2027.m2Back)}. Il redevient direct à 27°28′ Gémeaux le ${t(T2027.m2Direct)}, puis sort de son ombre le ${t(T2027.m2End)}.`,
            'Cette période touche la famille, la maison et les paroles échangées avec les proches (Cancer), puis les messages, les contrats et les déplacements (Gémeaux). Jupiter entre en Vierge le 26 juillet, une semaine après la fin de l’ombre.',
          ],
        },
        {
          h2: 'Du 7 au 28 octobre 2027 : Scorpion puis Balance',
          paragraphs: [
            `Mercure recule de 4°56′ Scorpion, retrouve la Balance le ${t(T2027.m3Back)} et redevient direct à 19°19′ Balance le ${t(T2027.m3Direct)}. L’ombre se termine le ${t(T2027.m3End)}.`,
            'Ce dernier passage parle d’argent partagé, de confiance et de non-dits (Scorpion), puis de couple et d’accords (Balance). Uranus est rétrograde en Gémeaux depuis le 15 septembre, ce qui ajoute un parfum d’imprévu aux plans de fin d’année.',
          ],
        },
      ],
      signsTitle: 'Mercure rétrograde 2027 pour chaque signe',
      signsIntro: 'Lecture par maisons solaires, à partir de votre signe solaire. Avec votre ascendant, calculé par notre thème astral gratuit, la lecture est plus précise.',
      adviceTitle: 'Conseils pratiques pour chaque période',
      advice: [
        'Relisez les contrats, devis, adresses et horaires avant de signer ou d’envoyer, surtout entre la station rétrograde et la station directe.',
        'Sauvegardez vos fichiers et confirmez vos réservations par écrit : le but est d’éviter les malentendus, pas de tout arrêter.',
        'Profitez de la rétrogradation pour reprendre contact avec quelqu’un, terminer un projet ou trier un dossier plutôt que pour démarrer quelque chose de neuf.',
        'Si une grosse décision peut attendre l’ombre de fin, laissez-lui quelques semaines : vous la prendrez avec plus de recul.',
      ],
      method: METHOD_2027.fr,
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'Quand Mercure est-il rétrograde en 2027 ?', answer: 'Du 9 février 2027 (18 h 36, heure de Paris) au 3 mars 2027 (13 h 32), du 10 juin (20 h 15) au 4 juillet (21 h 39) et du 7 octobre (16 h 37) au 28 octobre 2027 (16 h 11).' },
        { question: 'Combien de rétrogradations de Mercure y a-t-il en 2027 ?', answer: 'Trois, de 21 à 24 jours chacune. La suivante commence le 24 janvier 2028.' },
        { question: 'Qu’est-ce que l’ombre de Mercure rétrograde ?', answer: 'C’est la période, d’environ deux à trois semaines avant et après, où Mercure traverse les degrés qu’il parcourra deux fois. Les astrologues l’interprètent comme une phase de préparation puis de digestion.' },
        { question: 'Peut-on signer un contrat pendant Mercure rétrograde ?', answer: 'Oui. La tradition conseille surtout de relire chaque clause et de garder une trace écrite. Il n’existe pas de preuve scientifique qu’une signature soit moins valable pendant une rétrogradation.' },
        { question: 'Mercure rétrograde existe-t-il vraiment ?', answer: 'Le mouvement est une illusion d’optique causée par la vitesse relative de la Terre et de Mercure, mais ses dates sont des faits astronomiques. L’interprétation, elle, est symbolique.' },
        { question: 'La première rétrogradation de 2027 est-elle liée à une éclipse ?', answer: 'Elle commence trois jours après l’éclipse solaire annulaire du 6 février 2027 et se termine avant la fin de l’ombre le 23 mars. Une éclipse de Lune pénombrale a lieu le 20 février, pendant la période.' },
      ],
      ctaText: 'Un contrat à relire, une conversation à reprendre, un choix à poser ? Parlez-en à voix haute avec une Conseillère ou un Conseiller Callastral, à partir de votre vrai thème. Aucune date inventée. Aucun compteur caché. Ton vrai ciel.',
      ctaButton: '3 min offertes, sans carte',
      linksTitle: 'Aller plus loin',
      links,
      related: { href: SKY_EVENT_PATHS.eclipses2027.fr, label: SKY_EVENT_LABELS.eclipses2027.fr },
      home: 'Accueil',
      disclaimer: DISCLAIMER.fr,
    };
  }
  return {
    id: 'mercuryRetrograde2027',
    locale,
    path,
    title: 'Mercury Retrograde 2027: Dates and Times (3 Periods)',
    description: 'Mercury retrograde 2027: 9 Feb to 3 Mar, 10 Jun to 4 Jul and 7 to 28 Oct. Paris and UTC times, shadow dates and what each period means for 12 signs.',
    h1: 'Mercury retrograde 2027: the three periods, with times',
    breadcrumb: 'Mercury retrograde 2027',
    answer: [
      `Mercury is retrograde three times in 2027: from ${t(T2027.m1Retro)} to ${t(T2027.m1Direct)}, from ${t(T2027.m2Retro)} to ${t(T2027.m2Direct)}, and from ${t(T2027.m3Retro)} to ${t(T2027.m3Direct)}.`,
      'With the shadow periods before and after, the zone of caution runs from 25 January to 23 March, from 26 May to 19 July and from 17 September to 13 November 2027, with retrogrades in Pisces and Aquarius, then Cancer and Gemini, then Scorpio and Libra.',
    ],
    updated: 'Published on 9 November 2026',
    tableTitle: 'Mercury retrograde 2027 calendar',
    tableCaption: 'Calculated with the NASA JPL DE440 ephemeris',
    cols: ['Event', 'Paris time', 'UTC', 'Position'],
    rows: [
      rowIso(T2027.m1Pre, 'en', 'Shadow begins (1st period)', '20°55′ Aquarius'),
      rowIso(T2027.m1Retro, 'en', 'Mercury stations retrograde', '5°59′ Pisces'),
      rowIso(T2027.m1Direct, 'en', 'Mercury stations direct', '20°55′ Aquarius'),
      rowIso(T2027.m1End, 'en', 'Shadow ends', '5°59′ Pisces'),
      rowIso(T2027.m2Pre, 'en', 'Shadow begins (2nd period)', '27°28′ Gemini'),
      rowIso(T2027.m2Retro, 'en', 'Mercury stations retrograde', '6°22′ Cancer'),
      rowIso(T2027.m2Direct, 'en', 'Mercury stations direct', '27°28′ Gemini'),
      rowIso(T2027.m2End, 'en', 'Shadow ends', '6°22′ Cancer'),
      rowIso(T2027.m3Pre, 'en', 'Shadow begins (3rd period)', '19°19′ Libra'),
      rowIso(T2027.m3Retro, 'en', 'Mercury stations retrograde', '4°56′ Scorpio'),
      rowIso(T2027.m3Direct, 'en', 'Mercury stations direct', '19°19′ Libra'),
      rowIso(T2027.m3End, 'en', 'Shadow ends', '4°56′ Scorpio'),
    ],
    sections: [
      {
        h2: 'Mercury retrograde 2027 dates at a glance',
        paragraphs: [
          'The first period lasts about 22 days (9 February to 3 March), the second about 24 days (10 June to 4 July) and the third about 21 days (7 to 28 October). The next retrograde begins on 24 January 2028 at 11:02 UTC, at 19°42′ Aquarius.',
          'Mercury is direct from 13 November 2026 to 9 February 2027, then from 3 March to 10 June, then from 4 July to 7 October, then from 28 October to the end of the year.',
        ],
      },
      {
        h2: 'What Mercury retrograde means',
        paragraphs: [
          'Mercury retrograde is an apparent motion: seen from Earth, the planet seems to move backwards for a few weeks, like a car you overtake on a motorway. It happens about three to four times a year and does not change how phones or trains actually work.',
          'In astrology Mercury rules communication, travel, contracts and thinking. Its retrograde is read as a time to reread, review, reconnect and finish what is dragging, rather than to launch brand new projects.',
        ],
      },
      {
        h2: '9 February to 3 March 2027: Pisces, then Aquarius',
        paragraphs: [
          `The first retrograde begins three days after the annular solar eclipse of 6 February at 17°38′ Aquarius. Mercury moves back into Aquarius on ${t(T2027.m1Back)}, turns direct at 20°55′ Aquarius on ${t(T2027.m1Direct)} and leaves its shadow at 5°59′ Pisces on ${t(T2027.m1End)}.`,
          'Mars is also retrograde from 10 January to 1 April 2027: for three weeks, two planets moving backwards at the same time invite you to slow down hasty decisions, especially about work and conversations. A penumbral lunar eclipse falls on 20 February, in the middle of the period.',
        ],
      },
      {
        h2: '10 June to 4 July 2027: Cancer, then Gemini',
        paragraphs: [
          `Mercury moves back from 6°22′ Cancer into Gemini on ${t(T2027.m2Back)}. It turns direct at 27°28′ Gemini on ${t(T2027.m2Direct)} and leaves its shadow on ${t(T2027.m2End)}.`,
          'This period touches family, home and the words exchanged with close ones (Cancer), then messages, contracts and travel (Gemini). Jupiter enters Virgo on 26 July, a week after the shadow ends.',
        ],
      },
      {
        h2: '7 to 28 October 2027: Scorpio, then Libra',
        paragraphs: [
          `Mercury moves back from 4°56′ Scorpio, returns to Libra on ${t(T2027.m3Back)} and turns direct at 19°19′ Libra on ${t(T2027.m3Direct)}. The shadow ends on ${t(T2027.m3End)}.`,
          'This last passage is about shared money, trust and things left unsaid (Scorpio), then partnerships and agreements (Libra). Uranus has been retrograde in Gemini since 15 September, which adds a note of the unexpected to year-end plans.',
        ],
      },
    ],
    signsTitle: 'Mercury retrograde 2027 for each sign',
    signsIntro: 'Reading by solar houses, from your Sun sign. With your rising sign, calculated by our free birth chart, the reading is more precise.',
    adviceTitle: 'Practical tips for each period',
    advice: [
      'Reread contracts, quotes, addresses and schedules before you sign or send, especially between the retrograde station and the direct station.',
      'Back up your files and confirm bookings in writing: the aim is to avoid misunderstandings, not to stop everything.',
      'Use the retrograde to reconnect with someone, finish a project or sort a file rather than to start something new.',
      'If a big decision can wait until the shadow ends, give it a few weeks and you will take it with more perspective.',
    ],
    method: METHOD_2027.en,
    faqTitle: 'Frequently asked questions',
    faqs: [
      { question: 'When is Mercury retrograde in 2027?', answer: 'From 9 February 2027 (17:36 UTC, 18:36 Paris time) to 3 March (12:32 UTC), from 10 June (18:15 UTC) to 4 July (19:39 UTC), and from 7 October (14:37 UTC) to 28 October 2027 (14:11 UTC).' },
      { question: 'How many Mercury retrogrades are there in 2027?', answer: 'Three, each lasting 21 to 24 days. The next one begins on 24 January 2028.' },
      { question: 'What is the Mercury retrograde shadow?', answer: 'It is the period of roughly two to three weeks before and after, when Mercury crosses degrees it will travel twice. Astrologers read it as a phase of preparation and then of digestion.' },
      { question: 'Can I sign a contract during Mercury retrograde?', answer: 'Yes. Tradition mainly advises you to reread every clause and keep a written record. There is no scientific evidence that a signature is less valid during a retrograde.' },
      { question: 'Is Mercury retrograde real?', answer: 'The backward motion is an optical illusion caused by the relative speeds of Earth and Mercury, but the dates are astronomical facts. The interpretation is symbolic.' },
      { question: 'Is the first 2027 retrograde linked to an eclipse?', answer: 'It begins three days after the annular solar eclipse of 6 February 2027 and ends before the shadow ends on 23 March. A penumbral lunar eclipse falls on 20 February, during the period.' },
    ],
    ctaText: 'A contract to reread, a conversation to reopen, a choice to make? Talk it through out loud with a Callastral advisor, from your real birth chart. No invented dates. No hidden meter. Your real sky.',
    ctaButton: '3 free minutes, no card',
    linksTitle: 'Go further',
    links,
    related: { href: SKY_EVENT_PATHS.eclipses2027.en, label: SKY_EVENT_LABELS.eclipses2027.en },
    home: 'Home',
    disclaimer: DISCLAIMER.en,
  };
}

function eclipses2027Copy(locale: SkyLocale): SkyEventCopy {
  const t = (iso: string) => bothIso(iso, locale);
  const path = SKY_EVENT_PATHS.eclipses2027[locale];
  const links = [link2027(locale), ...commonLinks(locale)];
  if (locale === 'fr') {
    return {
      id: 'eclipses2027',
      locale,
      path,
      title: 'Éclipses 2027 : dates, heures et où les voir',
      description: 'Éclipses 2027 : annulaire le 6/02, totale le 2/08 (6 min 23 s, Espagne) et 3 éclipses de Lune pénombrales. Heures de Paris et UTC, effets par signe.',
      h1: 'Éclipses 2027 : calendrier, heures et effets par signe',
      breadcrumb: 'Éclipses 2027',
      answer: [
        `Il y a cinq éclipses en 2027 : une éclipse de Soleil annulaire le ${t(T2027.annular)}, une éclipse de Soleil totale le ${t(T2027.total)}, et trois éclipses de Lune pénombrales le ${t(T2027.lunarFeb)}, le ${t(T2027.lunarJul)} et le ${t(T2027.lunarAug)}.`,
        'L’éclipse totale du 2 août 2027 est l’événement de l’année : la totalité dure jusqu’à 6 min 23 s, traverse dix pays de l’Espagne à la Somalie, et une éclipse partielle est visible depuis la France.',
      ],
      updated: 'Publié le 9 novembre 2026',
      tableTitle: 'Le calendrier des éclipses 2027',
      tableCaption: 'Instant de l’éclipse maximale, recoupé avec le catalogue NASA',
      cols: ['Éclipse', 'Heure de Paris', 'UTC', 'Position'],
      rows: [
        rowIso(T2027.annular, 'fr', 'Éclipse de Soleil annulaire', '17°38′ Verseau'),
        rowIso(T2027.lunarFeb, 'fr', 'Éclipse de Lune pénombrale', '1°59′ Vierge'),
        rowIso(T2027.lunarJul, 'fr', 'Éclipse de Lune pénombrale', '25°58′ Capricorne'),
        rowIso(T2027.total, 'fr', 'Éclipse de Soleil totale', '9°55′ Lion'),
        rowIso(T2027.lunarAug, 'fr', 'Éclipse de Lune pénombrale', '24°05′ Verseau'),
      ],
      sections: [
        {
          h2: 'Le calendrier des éclipses 2027 en un coup d’œil',
          paragraphs: [
            'Les éclipses de 2027 forment deux saisons : février (une éclipse de Soleil, puis une éclipse de Lune deux semaines plus tard) et juillet-août (une éclipse de Lune le 18 juillet, l’éclipse de Soleil totale le 2 août, puis une éclipse de Lune le 17 août).',
            'Les deux éclipses de Soleil tombent sur l’axe Verseau-Lion, ce qui en fait le fil conducteur de l’année en astrologie. Pour la vue d’ensemble de l’année, voyez notre horoscope 2027.',
          ],
        },
        {
          h2: 'Éclipse de Soleil annulaire du 6 février 2027',
          paragraphs: [
            'Au maximum, vers 16 h UTC, la Lune cache 92,8 % du diamètre du Soleil et laisse un anneau de lumière pendant jusqu’à 7 min 51 s. La bande d’annularité traverse le Chili, l’Argentine, l’Uruguay et le Brésil, puis la Côte d’Ivoire, le Ghana, le Togo, le Bénin et le Nigeria. Elle n’est pas visible depuis la France.',
            'La Nouvelle Lune a lieu à 17°38′ Verseau : en astrologie, c’est un nouveau départ autour des projets collectifs, de l’indépendance et de la technologie, qui se déploie sur les mois suivants. Mercure devient rétrograde trois jours plus tard.',
          ],
        },
        {
          h2: 'Éclipse de Soleil totale du 2 août 2027',
          paragraphs: [
            'La totalité traverse l’Espagne, le Maroc, l’Algérie, la Tunisie, la Libye, l’Égypte, le Soudan, l’Arabie saoudite, le Yémen et la Somalie, avec un maximum de 6 min 23 s en Égypte. Depuis la France, l’éclipse est partielle : la Lune ne cache qu’une partie du Soleil, selon votre ville.',
            'Ne regardez jamais le Soleil sans lunettes d’éclipse certifiées, même lors d’une éclipse partielle. En astrologie, l’éclipse tombe à 9°55′ Lion, signe du Soleil, et ouvre un chapitre sur la visibilité, la créativité et le cœur ; Jupiter est entré en Vierge une semaine plus tôt, le 26 juillet.',
          ],
        },
        {
          h2: 'Les trois éclipses de Lune pénombrales',
          paragraphs: [
            'Lors d’une éclipse pénombrale, la Lune traverse seulement la zone d’ombre légère de la Terre : elle s’assombrit un peu, sans la morsure sombre d’une éclipse partielle ou totale. Celle du 20 février (00 h 13 à Paris, le 21) est la plus visible. Celle du 18 juillet est à peine pénombrale et pratiquement imperceptible, et celle du 17 août se voit surtout depuis l’Amérique, l’Océanie et certaines régions de l’ouest de l’Europe.',
            'Les astrologues leur donnent un poids plus léger : des moments de bilan, de tri et de lâcher-prise plutôt que de grands bouleversements.',
          ],
        },
        {
          h2: 'Ce que les éclipses signifient en astrologie',
          paragraphs: [
            'Une éclipse de Soleil est lue comme une Nouvelle Lune renforcée, un point de départ dont les effets se déploient sur plusieurs mois. Une éclipse de Lune est lue comme une Pleine Lune renforcée, un point d’aboutissement ou de fin de cycle.',
            'Ce sont des lectures symboliques, sans preuve scientifique d’un effet sur nos vies. Elles servent surtout à se poser des questions : qu’est-ce que je commence, qu’est-ce que je clos ?',
          ],
        },
      ],
      signsTitle: 'Les éclipses 2027 pour chaque signe',
      signsIntro: 'Lecture par maisons solaires, à partir de votre signe solaire. Avec votre ascendant, calculé par notre thème astral gratuit, la lecture est plus précise.',
      adviceTitle: 'Conseils pour la saison des éclipses',
      advice: [
        'Évitez de prendre une décision irréversible le jour exact d’une éclipse : laissez passer quelques jours.',
        'Notez, la veille, ce que vous voulez commencer (éclipse de Soleil) ou clore (éclipse de Lune) : l’écrire aide à y voir clair.',
        'Pour l’éclipse du 2 août, vérifiez que vos lunettes portent la norme ISO 12312-2 avant de lever les yeux.',
        'Réservez un voyage vers la bande de totalité dès que possible : hébergements et transports se remplissent des mois à l’avance.',
      ],
      method: METHOD_2027.fr,
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'Combien y a-t-il d’éclipses en 2027 ?', answer: 'Cinq : deux éclipses de Soleil (annulaire le 6 février, totale le 2 août) et trois éclipses de Lune pénombrales (20 février, 18 juillet, 17 août).' },
        { question: 'L’éclipse du 2 août 2027 est-elle visible en France ?', answer: 'Partiellement. La totalité passe par le sud de l’Espagne et l’Afrique du Nord, et la Lune cache seulement une partie du Soleil depuis la France. Il faut des lunettes d’éclipse certifiées.' },
        { question: 'Combien de temps dure l’éclipse totale du 2 août 2027 ?', answer: 'Jusqu’à 6 minutes et 23 secondes au point de durée maximale, en Égypte. Elle est plus courte ailleurs sur la bande de totalité.' },
        { question: 'À quelle heure a lieu l’éclipse du 2 août 2027 ?', answer: 'Le maximum est à 10 h 07 UTC, soit 12 h 07 à Paris. La Nouvelle Lune exacte tombe à 9°55′ Lion.' },
        { question: 'Dans quels signes tombent les éclipses 2027 ?', answer: 'Éclipse de Soleil en Verseau (6 février) et en Lion (2 août) ; éclipses de Lune en Vierge (20 février), Capricorne (18 juillet) et Verseau (17 août).' },
        { question: 'Les éclipses de Lune pénombrales sont-elles spectaculaires ?', answer: 'Non. La Lune s’assombrit à peine, et celle du 18 juillet 2027 est presque imperceptible. Elles ont surtout un intérêt astrologique.' },
      ],
      ctaText: 'Un chapitre qui s’ouvre ou se ferme ? Parlez-en à voix haute avec une Conseillère ou un Conseiller Callastral, à partir de votre vrai thème. Aucune date inventée. Aucun compteur caché. Ton vrai ciel.',
      ctaButton: '3 min offertes, sans carte',
      linksTitle: 'Aller plus loin',
      links,
      related: { href: SKY_EVENT_PATHS.mercuryRetrograde2027.fr, label: SKY_EVENT_LABELS.mercuryRetrograde2027.fr },
      home: 'Accueil',
      disclaimer: DISCLAIMER.fr,
    };
  }
  return {
    id: 'eclipses2027',
    locale,
    path,
    title: 'Eclipses 2027: Dates, Times and Where to See Them',
    description: 'Eclipses 2027: annular solar 6 Feb, total solar 2 Aug (6 min 23 s, Spain) and 3 penumbral lunar eclipses. Paris and UTC times, effects by sign.',
    h1: 'Eclipses 2027: calendar, times and effects by sign',
    breadcrumb: 'Eclipses 2027',
    answer: [
      `There are five eclipses in 2027: an annular solar eclipse on ${t(T2027.annular)}, a total solar eclipse on ${t(T2027.total)}, and three penumbral lunar eclipses on ${t(T2027.lunarFeb)}, ${t(T2027.lunarJul)} and ${t(T2027.lunarAug)}.`,
      'The total solar eclipse of 2 August 2027 is the event of the year: totality lasts up to 6 min 23 s, crosses ten countries from Spain to Somalia, and a partial eclipse is visible from France.',
    ],
    updated: 'Published on 9 November 2026',
    tableTitle: 'Eclipse calendar 2027',
    tableCaption: 'Time of greatest eclipse, cross-checked with the NASA catalogue',
    cols: ['Eclipse', 'Paris time', 'UTC', 'Position'],
    rows: [
      rowIso(T2027.annular, 'en', 'Annular solar eclipse', '17°38′ Aquarius'),
      rowIso(T2027.lunarFeb, 'en', 'Penumbral lunar eclipse', '1°59′ Virgo'),
      rowIso(T2027.lunarJul, 'en', 'Penumbral lunar eclipse', '25°58′ Capricorn'),
      rowIso(T2027.total, 'en', 'Total solar eclipse', '9°55′ Leo'),
      rowIso(T2027.lunarAug, 'en', 'Penumbral lunar eclipse', '24°05′ Aquarius'),
    ],
    sections: [
      {
        h2: 'The 2027 eclipse calendar at a glance',
        paragraphs: [
          'The 2027 eclipses form two seasons: February (a solar eclipse, then a lunar eclipse two weeks later) and July to August (a lunar eclipse on 18 July, the total solar eclipse on 2 August, then a lunar eclipse on 17 August).',
          'Both solar eclipses fall on the Aquarius and Leo axis, which makes it the theme of the year in astrology. For the full-year overview, see our 2027 horoscope.',
        ],
      },
      {
        h2: 'Annular solar eclipse of 6 February 2027',
        paragraphs: [
          'At its maximum, around 16:00 UTC, the Moon covers 92.8% of the Sun’s diameter and leaves a ring of light for up to 7 min 51 s. The annular path crosses Chile, Argentina, Uruguay and Brazil, then Ivory Coast, Ghana, Togo, Benin and Nigeria. It is not visible from France.',
          'The New Moon is at 17°38′ Aquarius: in astrology it is a fresh start around group projects, independence and technology, unfolding over the following months. Mercury turns retrograde three days later.',
        ],
      },
      {
        h2: 'Total solar eclipse of 2 August 2027',
        paragraphs: [
          'Totality crosses Spain, Morocco, Algeria, Tunisia, Libya, Egypt, Sudan, Saudi Arabia, Yemen and Somalia, with a maximum of 6 min 23 s in Egypt. From France the eclipse is partial: the Moon covers only part of the Sun, depending on your city.',
          'Never look at the Sun without certified eclipse glasses, even during a partial eclipse. In astrology the eclipse falls at 9°55′ Leo, the Sun’s own sign, and opens a chapter about visibility, creativity and the heart; Jupiter entered Virgo a week earlier, on 26 July.',
        ],
      },
      {
        h2: 'The three penumbral lunar eclipses',
        paragraphs: [
          'In a penumbral eclipse the Moon crosses only the Earth’s faint outer shadow: it dims slightly, without the dark bite of a partial or total eclipse. The one on 20 February (00:13 Paris time on the 21st) is the most visible. The one on 18 July is barely penumbral and almost impossible to notice, and the one on 17 August is best seen from the Americas, Oceania and parts of western Europe.',
          'Astrologers give them a lighter weight: moments for review, sorting and letting go rather than big upheavals.',
        ],
      },
      {
        h2: 'What eclipses mean in astrology',
        paragraphs: [
          'A solar eclipse is read as a boosted New Moon, a starting point whose effects unfold over several months. A lunar eclipse is read as a boosted Full Moon, a point of completion or the end of a cycle.',
          'These are symbolic readings, with no scientific evidence of an effect on our lives. They mostly help you ask questions: what am I starting, and what am I closing?',
        ],
      },
    ],
    signsTitle: 'The 2027 eclipses for each sign',
    signsIntro: 'Reading by solar houses, from your Sun sign. With your rising sign, calculated by our free birth chart, the reading is more precise.',
    adviceTitle: 'Tips for eclipse season',
    advice: [
      'Avoid an irreversible decision on the exact day of an eclipse: let a few days pass.',
      'The day before, write down what you want to start (solar eclipse) or close (lunar eclipse): putting it on paper brings clarity.',
      'For the 2 August eclipse, check that your glasses carry the ISO 12312-2 standard before you look up.',
      'Book a trip to the totality path as early as you can: hotels and transport fill up months ahead.',
    ],
    method: METHOD_2027.en,
    faqTitle: 'Frequently asked questions',
    faqs: [
      { question: 'How many eclipses are there in 2027?', answer: 'Five: two solar eclipses (annular on 6 February, total on 2 August) and three penumbral lunar eclipses (20 February, 18 July, 17 August).' },
      { question: 'Can I see the 2 August 2027 eclipse from France?', answer: 'Partially. Totality passes over southern Spain and North Africa, and from France the Moon covers only part of the Sun. You need certified eclipse glasses.' },
      { question: 'How long does the 2 August 2027 total eclipse last?', answer: 'Up to 6 minutes and 23 seconds at the point of longest duration, in Egypt. It is shorter elsewhere along the totality path.' },
      { question: 'What time is the 2 August 2027 eclipse?', answer: 'Greatest eclipse is at 10:07 UTC, which is 12:07 Paris time. The exact New Moon is at 9°55′ Leo.' },
      { question: 'Which signs do the 2027 eclipses fall in?', answer: 'Solar eclipses in Aquarius (6 February) and Leo (2 August); lunar eclipses in Virgo (20 February), Capricorn (18 July) and Aquarius (17 August).' },
      { question: 'Are penumbral lunar eclipses spectacular?', answer: 'No. The Moon barely darkens, and the one on 18 July 2027 is almost imperceptible. Their interest is mostly astrological.' },
    ],
    ctaText: 'A chapter opening or closing? Talk it through out loud with a Callastral advisor, from your real birth chart. No invented dates. No hidden meter. Your real sky.',
    ctaButton: '3 free minutes, no card',
    linksTitle: 'Go further',
    links,
    related: { href: SKY_EVENT_PATHS.mercuryRetrograde2027.en, label: SKY_EVENT_LABELS.mercuryRetrograde2027.en },
    home: 'Home',
    disclaimer: DISCLAIMER.en,
  };
}

/* ------------------------------------------------------------------ */
/* Pages 2027 : Mars rétrograde et calendrier des Pleines Lunes (publiées le 11/11/2026) */
/* Calculées avec l’éphéméride NASA JPL DE440 (Skyfield), positions géocentriques apparentes. */
/* ------------------------------------------------------------------ */

export const M2027 = {
  preShadow: '2026-11-05T15:34:00Z',
  retro: '2027-01-10T12:59:00Z',
  opposition: '2027-02-19T15:51:00Z',
  closest: '2027-02-20T00:14:00Z',
  intoLeo: '2027-02-21T14:13:00Z',
  direct: '2027-04-01T14:08:00Z',
  intoVirgo: '2027-05-14T14:47:00Z',
  postShadow: '2027-06-08T01:58:00Z',
  intoLibra: '2027-07-15T05:40:00Z',
  nextRetro: '2029-02-14T08:16:00Z',
  venusNextRetro: '2028-05-10T23:03:00Z',
} as const;

/** Pleines Lunes 2027 : instant UTC, degré, index du signe, distance Terre-Lune (km). */
export const FULL_MOONS_2027 = [
  { utc: '2027-01-22T12:17:00Z', deg: '2°14′', sign: 4, km: 357644 },
  { utc: '2027-02-20T23:24:00Z', deg: '2°06′', sign: 5, km: 363305 },
  { utc: '2027-03-22T10:44:00Z', deg: '1°35′', sign: 6, km: 372526 },
  { utc: '2027-04-20T22:27:00Z', deg: '0°37′', sign: 7, km: 383429 },
  { utc: '2027-05-20T10:59:00Z', deg: '29°14′', sign: 7, km: 393901 },
  { utc: '2027-06-19T00:44:00Z', deg: '27°33′', sign: 8, km: 401951 },
  { utc: '2027-07-18T15:45:00Z', deg: '25°49′', sign: 9, km: 405978 },
  { utc: '2027-08-17T07:29:00Z', deg: '24°12′', sign: 10, km: 405080 },
  { utc: '2027-09-15T23:04:00Z', deg: '22°53′', sign: 11, km: 399353 },
  { utc: '2027-10-15T13:47:00Z', deg: '21°59′', sign: 0, km: 389938 },
  { utc: '2027-11-14T03:26:00Z', deg: '21°31′', sign: 1, km: 378766 },
  { utc: '2027-12-13T16:09:00Z', deg: '21°25′', sign: 2, km: 368141 },
] as const;

const MOON_NAMES: Record<SkyLocale, string[]> = {
  en: ['Wolf Moon', 'Snow Moon', 'Worm Moon', 'Pink Moon', 'Flower Moon', 'Strawberry Moon', 'Buck Moon', 'Sturgeon Moon', 'Harvest Moon', 'Hunter’s Moon', 'Beaver Moon', 'Cold Moon'],
  fr: ['Lune du loup', 'Lune des neiges', 'Lune des vers', 'Lune rose', 'Lune des fleurs', 'Lune des fraises', 'Lune du cerf', 'Lune de l’esturgeon', 'Lune des moissons', 'Lune du chasseur', 'Lune du castor', 'Lune froide'],
};

const FM_NOTE: Record<SkyLocale, Partial<Record<number, string>>> = {
  en: { 0: 'supermoon, closest of the year', 1: 'penumbral lunar eclipse', 6: 'penumbral eclipse, farthest of the year', 7: 'penumbral lunar eclipse' },
  fr: { 0: 'super Lune, la plus proche de l’année', 1: 'éclipse de Lune pénombrale', 6: 'éclipse pénombrale, la plus lointaine de l’année', 7: 'éclipse de Lune pénombrale' },
};

const MARS_2027_EXTRA: Record<SkyLocale, Partial<Record<number, string>>> = {
  en: {
    5: 'Mars turns retrograde inside your sign on 10 January, at 10°26′ Virgo, and comes back to your sign from 14 May to 15 July: your energy and your body ask for pacing, not pushing.',
    4: 'Mars backs into your sign on 21 February and turns direct there on 1 April, at 20°56′ Leo: an old ambition or an old anger comes back to be handled more calmly.',
    0: 'Mars rules your sign, so the whole retrograde is felt in your drive: restart, repair and finish rather than charge ahead.',
    7: 'Mars is your traditional ruler, so the retrograde touches how you defend yourself and what you want: choose your battles.',
    11: 'On 19 February Mars is exactly opposite the Sun in Pisces, at 0°46′: a peak of tension or clarity in your relationships.',
  },
  fr: {
    5: 'Mars devient rétrograde dans votre signe le 10 janvier, à 10°26′ Vierge, et y revient du 14 mai au 15 juillet : votre énergie et votre corps demandent du rythme, pas de la force.',
    4: 'Mars recule dans votre signe le 21 février et y redevient direct le 1er avril, à 20°56′ Lion : une ambition ou une colère ancienne revient pour être reprise plus calmement.',
    0: 'Mars gouverne votre signe : toute la rétrogradation se ressent dans votre élan. Reprenez, réparez et terminez plutôt que de foncer.',
    7: 'Mars est votre maître traditionnel : la rétrogradation touche votre façon de vous défendre et ce que vous désirez. Choisissez vos combats.',
    11: 'Le 19 février, Mars est exactement opposé au Soleil en Poissons, à 0°46′ : un pic de tension ou de clarté dans vos relations.',
  },
};

export function signRows2027b(event: 'marsRetrograde2027' | 'fullMoons2027', locale: SkyLocale, index: number): string {
  const name = SIGN_NAMES[locale][index];
  const topic = (h: number) => HOUSE_TOPIC[locale][h - 1];
  const o = (h: number) => ordinal(h, locale);
  if (event === 'marsRetrograde2027') {
    const hv = solarHouse(index, SIGN_VIRGO);
    const hl = solarHouse(index, SIGN_LEO);
    const extra = MARS_2027_EXTRA[locale][index];
    return locale === 'fr'
      ? `Pour ${FR_ARTICLE[index]}${name}, Mars recule d’abord dans votre maison solaire ${hv} (${topic(hv)}) du 10 janvier au 21 février, puis dans votre maison ${hl} (${topic(hl)}) jusqu’au 1er avril. C’est là que les efforts demandent à être repris plutôt que forcés.${extra ? ` ${extra}` : ''}`
      : `For ${name}, Mars moves back first through your ${o(hv)} solar house (${topic(hv)}) from 10 January to 21 February, then through your ${o(hl)} house (${topic(hl)}) until 1 April. That is where efforts ask to be resumed rather than forced.${extra ? ` ${extra}` : ''}`;
  }
  const own = FULL_MOONS_2027.map((fm, i) => ({ fm, i })).filter((x) => x.fm.sign === index);
  const dateOf = (iso: string) => new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', timeZone: locale === 'fr' ? 'Europe/Paris' : 'UTC' }).format(new Date(iso));
  const opposite = (index + 6) % 12;
  const opp = FULL_MOONS_2027.filter((fm) => fm.sign === opposite).map((fm) => dateOf(fm.utc));
  let base: string;
  if (own.length === 0) {
    base = locale === 'fr'
      ? `Pour ${FR_ARTICLE[index]}${name}, aucune Pleine Lune de 2027 ne tombe dans votre signe : la précédente a lieu le 24 décembre 2026 et la suivante en janvier 2028.`
      : `For ${name}, no 2027 Full Moon falls in your sign: the previous one is on 24 December 2026 and the next one in January 2028.`;
  } else if (own.length === 2) {
    base = locale === 'fr'
      ? `Pour ${FR_ARTICLE[index]}${name}, deux Pleines Lunes tombent dans votre signe en 2027, le ${dateOf(own[0].fm.utc)} (${own[0].fm.deg}) et le ${dateOf(own[1].fm.utc)} (${own[1].fm.deg}) : deux moments de bilan personnel à un mois d’écart.`
      : `For ${name}, two 2027 Full Moons fall in your sign, on ${dateOf(own[0].fm.utc)} (${own[0].fm.deg}) and ${dateOf(own[1].fm.utc)} (${own[1].fm.deg}): two moments of personal review one month apart.`;
  } else {
    const x = own[0];
    base = locale === 'fr'
      ? `Pour ${FR_ARTICLE[index]}${name}, votre Pleine Lune de l’année est celle du ${dateOf(x.fm.utc)}, à ${x.fm.deg} ${name} (${MOON_NAMES.fr[x.i]}) : un moment pour voir où vous en êtes et ce qui est arrivé à maturité.`
      : `For ${name}, your Full Moon of the year is on ${dateOf(x.fm.utc)}, at ${x.fm.deg} ${name} (the ${MOON_NAMES.en[x.i]}): a moment to see where you stand and what has ripened.`;
  }
  const oppText = opp.length
    ? locale === 'fr'
      ? ` La Pleine Lune dans le signe opposé (${opp.join(' et ')}) met en lumière votre maison 7, celle du couple et des contrats.`
      : ` The Full Moon in your opposite sign (${opp.join(' and ')}) lights up your 7th house, partners and contracts.`
    : '';
  return `${base}${oppText}`;
}

function marsRetro2027Copy(locale: SkyLocale): SkyEventCopy {
  const t = (iso: string) => bothIso(iso, locale);
  const path = SKY_EVENT_PATHS.marsRetrograde2027[locale];
  const links = [link2027(locale), ...commonLinks(locale)];
  if (locale === 'fr') {
    return {
      id: 'marsRetrograde2027',
      locale,
      path,
      title: 'Mars rétrograde 2027 : dates, heures et ombre',
      description: 'Mars rétrograde du 10 janvier au 1er avril 2027, de 10°26′ Vierge à 20°56′ Lion. Heures de Paris et UTC, ombre, opposition du 19/02 et 12 signes.',
      h1: 'Mars rétrograde 2027 : dates, heures et effets par signe',
      breadcrumb: 'Mars rétrograde 2027',
      answer: [
        `Mars est rétrograde une seule fois en 2027, du ${t(M2027.retro)} au ${t(M2027.direct)}, en reculant de 10°26′ Vierge à 20°56′ Lion.`,
        'Avec l’ombre, la période complète court du 5 novembre 2026 au 8 juin 2027, et Vénus n’est pas rétrograde du tout en 2027 : sa prochaine rétrogradation commence le 10 mai 2028.',
      ],
      updated: 'Publié le 11 novembre 2026',
      tableTitle: 'Le calendrier de Mars rétrograde 2026-2027',
      tableCaption: 'Calculé avec l’éphéméride NASA JPL DE440',
      cols: ['Événement', 'Heure de Paris', 'UTC', 'Position'],
      rows: [
        rowIso(M2027.preShadow, 'fr', 'Début de l’ombre', '20°56′ Lion'),
        rowIso(M2027.retro, 'fr', 'Mars devient rétrograde', '10°26′ Vierge'),
        rowIso(M2027.opposition, 'fr', 'Opposition au Soleil', '0°46′ Vierge'),
        rowIso(M2027.intoLeo, 'fr', 'Mars rétrograde regagne le Lion', '0° Lion'),
        rowIso(M2027.direct, 'fr', 'Mars redevient direct', '20°56′ Lion'),
        rowIso(M2027.intoVirgo, 'fr', 'Mars revient en Vierge', '0° Vierge'),
        rowIso(M2027.postShadow, 'fr', 'Fin de l’ombre', '10°26′ Vierge'),
        rowIso(M2027.intoLibra, 'fr', 'Mars entre en Balance', '0° Balance'),
      ],
      sections: [
        {
          h2: 'Les dates de Mars rétrograde 2027 en un coup d’œil',
          paragraphs: [
            'La rétrogradation dure 81 jours, du 10 janvier au 1er avril 2027. Mars recule d’abord en Vierge, regagne le Lion le 21 février, redevient direct à 20°56′ Lion, puis revient en Vierge le 14 mai et sort de son ombre le 8 juin.',
            'L’ombre d’avant a déjà commencé : depuis le 5 novembre 2026, Mars parcourt les degrés (20°56′ Lion à 10°26′ Vierge) qu’il traversera trois fois. La rétrogradation suivante commence le 14 février 2029, à 13°55′ Balance.',
          ],
        },
        {
          h2: 'Ce que signifie Mars rétrograde',
          paragraphs: [
            'Vue de la Terre, Mars semble reculer environ tous les deux ans, quand la Terre la dépasse sur son orbite. C’est un mouvement apparent, et c’est aussi le moment où la planète est la plus brillante dans le ciel de la nuit.',
            'En astrologie, Mars gouverne l’énergie, le désir, le courage et la colère. Sa rétrogradation est lue comme une période pour reprendre un effort interrompu, réparer, s’entraîner et régler une tension ancienne, plutôt que pour déclencher un conflit ou lancer une offensive.',
          ],
        },
        {
          h2: 'Du 10 janvier au 21 février 2027 : Mars rétrograde en Vierge',
          paragraphs: [
            `Mars s’arrête à 10°26′ Vierge le ${t(M2027.retro)}. La Vierge parle de travail quotidien, de santé et de méthode : c’est le moment de revoir une routine, un planning ou une façon de travailler qui épuise.`,
            `Le ${t(M2027.opposition)}, Mars est à l’opposition du Soleil : la Terre passe entre les deux. La planète est alors au plus près de nous (environ 101 millions de km la nuit du 19 au 20 février) et visible toute la nuit. Mercure devient lui aussi rétrograde du 9 février au 3 mars.`,
          ],
        },
        {
          h2: 'Du 21 février au 1er avril 2027 : Mars rétrograde en Lion',
          paragraphs: [
            `Mars regagne le Lion le ${t(M2027.intoLeo)} et y redevient direct le ${t(M2027.direct)}. Le Lion parle de fierté, de créativité, d’amour et de visibilité : un projet personnel ou une histoire de cœur mise en pause peut revenir sur la table.`,
            'Après la station directe, Mars repasse en Vierge le 14 mai et sort de l’ombre le 8 juin : c’est à partir de là que les projets relancés gagnent vraiment de la vitesse.',
          ],
        },
        {
          h2: 'Et Vénus rétrograde en 2027 ?',
          paragraphs: [
            'Il n’y a pas de Vénus rétrograde en 2027. La dernière a eu lieu du 3 octobre au 14 novembre 2026 en Scorpion et Balance, et la prochaine commence le 10 mai 2028 à 19°41′ Gémeaux.',
            'En 2027, les planètes personnelles qui reculent sont donc Mars (une fois) et Mercure (trois fois). Les dates de Mercure sont sur notre page Mercure rétrograde 2027.',
          ],
        },
      ],
      signsTitle: 'Mars rétrograde 2027 pour chaque signe',
      signsIntro: 'Lecture par maisons solaires, à partir de votre signe solaire. Avec votre ascendant, calculé par notre thème astral gratuit, la lecture est plus précise.',
      adviceTitle: 'Conseils pratiques pendant Mars rétrograde',
      advice: [
        'Reprenez un sport, un chantier ou un projet abandonné plutôt que d’en commencer un nouveau.',
        'Avant une dispute, attendez le lendemain : Mars rétrograde est lu comme une période où la colère part vite et se regrette.',
        'Faites réviser votre voiture et vos outils, et prenez votre temps pour les travaux manuels : c’est du bon sens, pas une prédiction.',
        'Si un lancement peut attendre, visez après le 1er avril, et idéalement après le 8 juin, fin de l’ombre.',
      ],
      method: METHOD_2027.fr,
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'Quand Mars est-il rétrograde en 2027 ?', answer: 'Du 10 janvier 2027 à 13 h 59 (heure de Paris) au 1er avril 2027 à 16 h 08, soit de 12 h 59 UTC à 14 h 08 UTC.' },
        { question: 'Dans quel signe Mars est-il rétrograde en 2027 ?', answer: 'En Vierge du 10 janvier au 21 février, puis en Lion jusqu’au 1er avril. La station rétrograde est à 10°26′ Vierge et la station directe à 20°56′ Lion.' },
        { question: 'Quand se termine l’ombre de Mars rétrograde ?', answer: 'Le 8 juin 2027, quand Mars repasse à 10°26′ Vierge. L’ombre d’avant a commencé le 5 novembre 2026.' },
        { question: 'Vénus est-elle rétrograde en 2027 ?', answer: 'Non. Aucune rétrogradation de Vénus en 2027 ; la prochaine commence le 10 mai 2028 en Gémeaux.' },
        { question: 'Quand voir Mars au mieux en 2027 ?', answer: 'Autour de l’opposition du 19 février 2027 : Mars est alors visible toute la nuit et à son plus brillant de l’année, à environ 101 millions de km de la Terre.' },
        { question: 'Mars rétrograde est-il dangereux ?', answer: 'Non. C’est un mouvement apparent sans effet physique prouvé. En astrologie, on y voit surtout une invitation à ralentir et à reprendre ce qui a été interrompu.' },
      ],
      ctaText: 'Une colère qui revient, un projet à relancer, une histoire à reprendre ? Parlez-en à voix haute avec une Conseillère ou un Conseiller Callastral, à partir de votre vrai thème. Aucune date inventée. Aucun compteur caché. Ton vrai ciel.',
      ctaButton: '3 min offertes, sans carte',
      linksTitle: 'Aller plus loin',
      links,
      related: { href: SKY_EVENT_PATHS.mercuryRetrograde2027.fr, label: SKY_EVENT_LABELS.mercuryRetrograde2027.fr },
      home: 'Accueil',
      disclaimer: DISCLAIMER.fr,
    };
  }
  return {
    id: 'marsRetrograde2027',
    locale,
    path,
    title: 'Mars Retrograde 2027: Dates, Times and Shadow',
    description: 'Mars retrograde runs 10 January to 1 April 2027, from 10°26′ Virgo to 20°56′ Leo. Paris and UTC times, shadow dates, 19 Feb opposition and 12 signs.',
    h1: 'Mars retrograde 2027: dates, times and effects by sign',
    breadcrumb: 'Mars retrograde 2027',
    answer: [
      `Mars is retrograde once in 2027, from ${t(M2027.retro)} to ${t(M2027.direct)}, moving back from 10°26′ Virgo to 20°56′ Leo.`,
      'With its shadow the full cycle runs from 5 November 2026 to 8 June 2027, and Venus is not retrograde at all in 2027: its next retrograde begins on 10 May 2028.',
    ],
    updated: 'Published on 11 November 2026',
    tableTitle: 'Mars retrograde 2026–2027 calendar',
    tableCaption: 'Calculated with the NASA JPL DE440 ephemeris',
    cols: ['Event', 'Paris time', 'UTC', 'Position'],
    rows: [
      rowIso(M2027.preShadow, 'en', 'Shadow begins', '20°56′ Leo'),
      rowIso(M2027.retro, 'en', 'Mars stations retrograde', '10°26′ Virgo'),
      rowIso(M2027.opposition, 'en', 'Opposition to the Sun', '0°46′ Virgo'),
      rowIso(M2027.intoLeo, 'en', 'Retrograde Mars re-enters Leo', '0° Leo'),
      rowIso(M2027.direct, 'en', 'Mars stations direct', '20°56′ Leo'),
      rowIso(M2027.intoVirgo, 'en', 'Mars returns to Virgo', '0° Virgo'),
      rowIso(M2027.postShadow, 'en', 'Shadow ends', '10°26′ Virgo'),
      rowIso(M2027.intoLibra, 'en', 'Mars enters Libra', '0° Libra'),
    ],
    sections: [
      {
        h2: 'Mars retrograde 2027 dates at a glance',
        paragraphs: [
          'The retrograde lasts 81 days, from 10 January to 1 April 2027. Mars first moves back through Virgo, re-enters Leo on 21 February, turns direct at 20°56′ Leo, then returns to Virgo on 14 May and leaves its shadow on 8 June.',
          'The pre-shadow has already begun: since 5 November 2026 Mars has been crossing the degrees (20°56′ Leo to 10°26′ Virgo) it will travel three times. The next Mars retrograde begins on 14 February 2029, at 13°55′ Libra.',
        ],
      },
      {
        h2: 'What Mars retrograde means',
        paragraphs: [
          'Seen from Earth, Mars appears to move backwards about every two years, when Earth overtakes it on its orbit. It is an apparent motion, and it is also when the planet shines brightest in the night sky.',
          'In astrology Mars rules energy, desire, courage and anger. Its retrograde is read as a time to resume an interrupted effort, repair, train and settle an old tension, rather than to start a fight or launch an offensive.',
        ],
      },
      {
        h2: '10 January to 21 February 2027: Mars retrograde in Virgo',
        paragraphs: [
          `Mars stations at 10°26′ Virgo on ${t(M2027.retro)}. Virgo is about daily work, health and method: a good time to review a routine, a schedule or a way of working that drains you.`,
          `On ${t(M2027.opposition)} Mars is opposite the Sun, with Earth passing between them. The planet is then at its closest to us (about 101 million km on the night of 19 to 20 February) and visible all night. Mercury is also retrograde from 9 February to 3 March.`,
        ],
      },
      {
        h2: '21 February to 1 April 2027: Mars retrograde in Leo',
        paragraphs: [
          `Mars re-enters Leo on ${t(M2027.intoLeo)} and turns direct there on ${t(M2027.direct)}. Leo is about pride, creativity, love and visibility: a personal project or a romance put on hold can come back on the table.`,
          'After the direct station, Mars moves back into Virgo on 14 May and leaves its shadow on 8 June: from then on, the projects you restarted really pick up speed.',
        ],
      },
      {
        h2: 'Is Venus retrograde in 2027?',
        paragraphs: [
          'There is no Venus retrograde in 2027. The last one ran from 3 October to 14 November 2026 in Scorpio and Libra, and the next one begins on 10 May 2028 at 19°41′ Gemini.',
          'So in 2027 the personal planets that turn retrograde are Mars (once) and Mercury (three times). The Mercury dates are on our Mercury retrograde 2027 page.',
        ],
      },
    ],
    signsTitle: 'Mars retrograde 2027 for each sign',
    signsIntro: 'Reading by solar houses, from your Sun sign. With your rising sign, calculated by our free birth chart, the reading is more precise.',
    adviceTitle: 'Practical tips during Mars retrograde',
    advice: [
      'Pick up a sport, a renovation or a dropped project rather than starting a new one.',
      'Before an argument, wait until the next day: Mars retrograde is read as a time when anger flares fast and is regretted.',
      'Get your car and tools checked and take your time with manual jobs: common sense, not a prediction.',
      'If a launch can wait, aim for after 1 April, ideally after 8 June when the shadow ends.',
    ],
    method: METHOD_2027.en,
    faqTitle: 'Frequently asked questions',
    faqs: [
      { question: 'When is Mars retrograde in 2027?', answer: 'From 10 January 2027 at 12:59 UTC (13:59 Paris time) to 1 April 2027 at 14:08 UTC (16:08 Paris time).' },
      { question: 'What sign is Mars retrograde in during 2027?', answer: 'Virgo from 10 January to 21 February, then Leo until 1 April. The retrograde station is at 10°26′ Virgo and the direct station at 20°56′ Leo.' },
      { question: 'When does the Mars retrograde shadow end?', answer: 'On 8 June 2027, when Mars returns to 10°26′ Virgo. The pre-shadow began on 5 November 2026.' },
      { question: 'Is Venus retrograde in 2027?', answer: 'No. There is no Venus retrograde in 2027; the next one begins on 10 May 2028 in Gemini.' },
      { question: 'When is the best time to see Mars in 2027?', answer: 'Around the opposition of 19 February 2027, when Mars is visible all night and at its brightest of the year, about 101 million km from Earth.' },
      { question: 'Is Mars retrograde dangerous?', answer: 'No. It is an apparent motion with no proven physical effect. In astrology it is mostly read as an invitation to slow down and resume what was interrupted.' },
    ],
    ctaText: 'An anger coming back, a project to restart, a story to pick up again? Talk it through out loud with a Callastral advisor, from your real birth chart. No invented dates. No hidden meter. Your real sky.',
    ctaButton: '3 free minutes, no card',
    linksTitle: 'Go further',
    links,
    related: { href: SKY_EVENT_PATHS.mercuryRetrograde2027.en, label: SKY_EVENT_LABELS.mercuryRetrograde2027.en },
    home: 'Home',
    disclaimer: DISCLAIMER.en,
  };
}

function fullMoons2027Copy(locale: SkyLocale): SkyEventCopy {
  const path = SKY_EVENT_PATHS.fullMoons2027[locale];
  const links = [link2027(locale), ...commonLinks(locale)];
  const signs = SIGN_NAMES[locale];
  const rows = FULL_MOONS_2027.map((fm, i) => {
    const note = FM_NOTE[locale][i];
    const km = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB').format(fm.km);
    return rowIso(fm.utc, locale, MOON_NAMES[locale][i], `${fm.deg} ${signs[fm.sign]}, ${km} km${note ? ` (${note})` : ''}`);
  });
  if (locale === 'fr') {
    return {
      id: 'fullMoons2027',
      locale,
      path,
      title: 'Pleines Lunes 2027 : calendrier, heures et signes',
      description: 'Les 12 Pleines Lunes de 2027 : du 22 janvier (super Lune en Lion) au 13 décembre (Gémeaux). Heures de Paris et UTC, signes, éclipses et effets par signe.',
      h1: 'Calendrier des Pleines Lunes 2027 : dates, heures et signes',
      breadcrumb: 'Pleines Lunes 2027',
      answer: [
        'Il y a 12 Pleines Lunes en 2027, une par mois : la première le 22 janvier à 13 h 17 (heure de Paris) en Lion, la dernière le 13 décembre à 17 h 09 en Gémeaux.',
        'La super Lune de l’année est celle du 22 janvier (357 644 km), trois Pleines Lunes coïncident avec une éclipse de Lune pénombrale (20 février, 18 juillet, 17 août), et il n’y a pas de Lune bleue en 2027.',
      ],
      updated: 'Publié le 11 novembre 2026',
      tableTitle: 'Les Pleines Lunes de 2027',
      tableCaption: 'Instant de la Pleine Lune exacte, éphéméride NASA JPL DE440, distance Terre-Lune au centre',
      cols: ['Pleine Lune', 'Heure de Paris', 'UTC', 'Position et distance'],
      rows,
      sections: [
        {
          h2: 'Les Pleines Lunes 2027 mois par mois',
          paragraphs: [
            'Janvier (22) en Lion, février (20-21) en Vierge, mars (22) en Balance, avril (20) et mai (20) en Scorpion, juin (19) en Sagittaire, juillet (18) en Capricorne, août (17) en Verseau, septembre (16, heure de Paris) en Poissons, octobre (15) en Bélier, novembre (14) en Taureau et décembre (13) en Gémeaux.',
            'Le Scorpion reçoit deux Pleines Lunes de suite (0°37′ le 20 avril, 29°14′ le 20 mai) et aucune ne tombe en Cancer en 2027 : la précédente est celle du 24 décembre 2026, la suivante arrive en janvier 2028.',
          ],
        },
        {
          h2: 'Super Lune et « micro Lune » de 2027',
          paragraphs: [
            'La Pleine Lune du 22 janvier 2027 est la plus proche de l’année, à 357 644 km : c’est la super Lune de 2027, un peu plus grande et plus lumineuse qu’à l’ordinaire. Celle du 20 février, à 363 305 km, est encore assez proche.',
            'À l’inverse, la Pleine Lune du 18 juillet est la plus lointaine (405 978 km), suivie de près par celle du 17 août. La différence de taille apparente est réelle mais difficile à remarquer à l’œil nu.',
          ],
        },
        {
          h2: 'Les Pleines Lunes éclipsées',
          paragraphs: [
            'Trois Pleines Lunes de 2027 tombent pendant une éclipse de Lune pénombrale : le 20 février (Vierge), le 18 juillet (Capricorne) et le 17 août (Verseau). La Lune s’assombrit à peine ; celle de juillet est presque imperceptible.',
            'Les heures et la visibilité de ces éclipses sont détaillées sur notre calendrier des éclipses 2027.',
          ],
        },
        {
          h2: 'D’où viennent les noms des Pleines Lunes ?',
          paragraphs: [
            'Les noms comme Lune du loup ou Lune des moissons viennent surtout des almanachs nord-américains, qui les ont empruntés à des traditions amérindiennes et européennes. Ce sont des noms populaires, pas des termes d’astronomie.',
            'La Lune des moissons est la Pleine Lune la plus proche de l’équinoxe d’automne : en 2027, celle du 15 septembre (16 septembre à Paris), une semaine environ avant l’équinoxe du 23 septembre.',
          ],
        },
        {
          h2: 'Ce que signifie une Pleine Lune en astrologie',
          paragraphs: [
            'À la Pleine Lune, le Soleil et la Lune sont face à face, dans deux signes opposés. Les astrologues y voient un point culminant : ce qui a été semé à la Nouvelle Lune précédente arrive à maturité, et les émotions sont plus visibles.',
            'C’est une lecture symbolique. Il n’existe pas de preuve solide d’un effet de la Pleine Lune sur le sommeil ou l’humeur de tout le monde, mais beaucoup s’en servent comme d’un rendez-vous mensuel pour faire le point.',
          ],
        },
      ],
      signsTitle: 'Les Pleines Lunes 2027 pour chaque signe',
      signsIntro: 'Lecture à partir de votre signe solaire : la Pleine Lune dans votre signe, puis celle dans le signe opposé. Avec votre thème astral gratuit, vous voyez la maison exacte touchée.',
      adviceTitle: 'Comment utiliser les Pleines Lunes de 2027',
      advice: [
        'Notez chaque date dans votre agenda et prenez dix minutes ce soir-là pour écrire ce qui s’est accompli depuis la Nouvelle Lune.',
        'Pour observer, regardez le lever de Lune à l’est, au coucher du soleil : c’est là qu’elle paraît la plus grande.',
        'Évitez de trancher une dispute le soir même : attendez un jour ou deux que les émotions retombent.',
        'Suivez le signe et la phase au jour le jour sur notre page la Lune aujourd’hui.',
      ],
      method: 'Méthode : instants des Pleines Lunes (opposition exacte en longitude du Soleil et de la Lune), degrés et distances calculés par Callastral avec l’éphéméride NASA JPL DE440 (positions géocentriques apparentes, zodiaque tropical). L’heure de Paris est UTC+1 jusqu’au 28 mars 2027, puis UTC+2 jusqu’au 31 octobre 2027. Le seuil de « super Lune » varie selon les sources ; nous retenons la plus proche de l’année.',
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'Combien y a-t-il de Pleines Lunes en 2027 ?', answer: 'Douze, une par mois, du 22 janvier au 13 décembre 2027. Il n’y a pas de Lune bleue en 2027.' },
        { question: 'Quelle est la date de la super Lune 2027 ?', answer: 'Le 22 janvier 2027 à 13 h 17, heure de Paris (12 h 17 UTC), en Lion, à 357 644 km de la Terre.' },
        { question: 'Quand est la Pleine Lune de janvier 2027 ?', answer: 'Le 22 janvier 2027 à 13 h 17 (heure de Paris), à 2°14′ Lion. C’est la Lune du loup.' },
        { question: 'Y a-t-il une Pleine Lune en Cancer en 2027 ?', answer: 'Non. La dernière est celle du 24 décembre 2026 et la suivante tombe en janvier 2028. Le Scorpion, lui, en reçoit deux (20 avril et 20 mai).' },
        { question: 'Quelles Pleines Lunes de 2027 sont des éclipses ?', answer: 'Celles du 20 février, du 18 juillet et du 17 août 2027, toutes trois des éclipses de Lune pénombrales, peu visibles.' },
        { question: 'Quelle est la Lune des moissons 2027 ?', answer: 'La Pleine Lune du 15 septembre 2027 à 23 h 04 UTC (16 septembre à 1 h 04 à Paris), en Poissons.' },
      ],
      ctaText: 'Une Pleine Lune qui remue tout, un cœur qui s’emmêle ? Parlez-en à voix haute avec une Conseillère ou un Conseiller Callastral, à partir de votre vrai thème. Aucune date inventée. Aucun compteur caché. Ton vrai ciel.',
      ctaButton: '3 min offertes, sans carte',
      linksTitle: 'Aller plus loin',
      links,
      related: { href: SKY_EVENT_PATHS.eclipses2027.fr, label: SKY_EVENT_LABELS.eclipses2027.fr },
      home: 'Accueil',
      disclaimer: DISCLAIMER.fr,
    };
  }
  return {
    id: 'fullMoons2027',
    locale,
    path,
    title: 'Full Moon Calendar 2027: Dates, Times and Signs',
    description: 'All 12 Full Moons of 2027, from 22 January (supermoon in Leo) to 13 December (Gemini). Paris and UTC times, signs, Moon names, eclipses and effects by sign.',
    h1: 'Full Moon calendar 2027: dates, times and signs',
    breadcrumb: 'Full Moons 2027',
    answer: [
      'There are 12 Full Moons in 2027, one each month: the first on 22 January at 12:17 UTC in Leo, the last on 13 December at 16:09 UTC in Gemini.',
      'The supermoon of the year is on 22 January (357,644 km), three Full Moons coincide with a penumbral lunar eclipse (20 February, 18 July, 17 August), and there is no Blue Moon in 2027.',
    ],
    updated: 'Published on 11 November 2026',
    tableTitle: 'Full Moons of 2027',
    tableCaption: 'Time of exact Full Moon, NASA JPL DE440 ephemeris, centre-to-centre Earth–Moon distance',
    cols: ['Full Moon', 'Paris time', 'UTC', 'Position and distance'],
    rows,
    sections: [
      {
        h2: '2027 Full Moons month by month',
        paragraphs: [
          'January (22) in Leo, February (20) in Virgo, March (22) in Libra, April (20) and May (20) in Scorpio, June (19) in Sagittarius, July (18) in Capricorn, August (17) in Aquarius, September (15) in Pisces, October (15) in Aries, November (14) in Taurus and December (13) in Gemini.',
          'Scorpio gets two Full Moons in a row (0°37′ on 20 April, 29°14′ on 20 May) and none falls in Cancer in 2027: the previous one is on 24 December 2026 and the next arrives in January 2028.',
        ],
      },
      {
        h2: 'Supermoon and micromoon of 2027',
        paragraphs: [
          'The Full Moon of 22 January 2027 is the closest of the year, at 357,644 km: the 2027 supermoon, slightly larger and brighter than usual. The one on 20 February, at 363,305 km, is still fairly close.',
          'At the other end, the 18 July Full Moon is the farthest (405,978 km), closely followed by 17 August. The difference in apparent size is real but hard to notice with the naked eye.',
        ],
      },
      {
        h2: 'Eclipsed Full Moons',
        paragraphs: [
          'Three 2027 Full Moons fall during a penumbral lunar eclipse: 20 February (Virgo), 18 July (Capricorn) and 17 August (Aquarius). The Moon dims only slightly, and the July one is almost impossible to notice.',
          'Times and visibility for these eclipses are on our 2027 eclipse calendar.',
        ],
      },
      {
        h2: 'Where do Full Moon names come from?',
        paragraphs: [
          'Names such as Wolf Moon or Harvest Moon mostly come from North American almanacs, which borrowed them from Native American and European traditions. They are folk names, not astronomical terms.',
          'The Harvest Moon is the Full Moon closest to the September equinox: in 2027 it is the 15 September Full Moon, about a week before the equinox on 23 September.',
        ],
      },
      {
        h2: 'What a Full Moon means in astrology',
        paragraphs: [
          'At a Full Moon the Sun and Moon face each other in opposite signs. Astrologers read it as a peak: what was planted at the previous New Moon comes to fruition, and emotions are more visible.',
          'This is a symbolic reading. There is no solid evidence that the Full Moon affects everyone’s sleep or mood, but many people use it as a monthly check-in.',
        ],
      },
    ],
    signsTitle: 'The 2027 Full Moons for each sign',
    signsIntro: 'Reading from your Sun sign: the Full Moon in your sign, then the one in your opposite sign. With your free birth chart you see the exact house it touches.',
    adviceTitle: 'How to use the 2027 Full Moons',
    advice: [
      'Put each date in your calendar and take ten minutes that evening to write down what has come together since the New Moon.',
      'To watch it, look for moonrise in the east around sunset: that is when it looks biggest.',
      'Avoid settling an argument that same night: give it a day or two for emotions to cool.',
      'Follow the sign and phase day by day on our Moon today page.',
    ],
    method: 'Method: Full Moon times (exact opposition in longitude of Sun and Moon), degrees and distances computed by Callastral with the NASA JPL DE440 ephemeris (geocentric, apparent positions, tropical zodiac). Paris time is UTC+1 until 28 March 2027, then UTC+2 until 31 October 2027. The supermoon threshold varies between sources; we use the closest Full Moon of the year.',
    faqTitle: 'Frequently asked questions',
    faqs: [
      { question: 'How many Full Moons are there in 2027?', answer: 'Twelve, one per month, from 22 January to 13 December 2027. There is no Blue Moon in 2027.' },
      { question: 'When is the 2027 supermoon?', answer: 'On 22 January 2027 at 12:17 UTC (13:17 Paris time), in Leo, 357,644 km from Earth.' },
      { question: 'When is the January 2027 Full Moon?', answer: 'On 22 January 2027 at 12:17 UTC, at 2°14′ Leo. It is the Wolf Moon.' },
      { question: 'Is there a Full Moon in Cancer in 2027?', answer: 'No. The last one is on 24 December 2026 and the next falls in January 2028. Scorpio, on the other hand, gets two (20 April and 20 May).' },
      { question: 'Which 2027 Full Moons are eclipses?', answer: 'Those of 20 February, 18 July and 17 August 2027, all three penumbral lunar eclipses that are hard to see.' },
      { question: 'When is the Harvest Moon 2027?', answer: 'On 15 September 2027 at 23:04 UTC (01:04 Paris time on 16 September), in Pisces.' },
    ],
    ctaText: 'A Full Moon that stirs everything up, a heart in knots? Talk it through out loud with a Callastral advisor, from your real birth chart. No invented dates. No hidden meter. Your real sky.',
    ctaButton: '3 free minutes, no card',
    linksTitle: 'Go further',
    links,
    related: { href: SKY_EVENT_PATHS.eclipses2027.en, label: SKY_EVENT_LABELS.eclipses2027.en },
    home: 'Home',
    disclaimer: DISCLAIMER.en,
  };
}

export function skyEventCopy(id: SkyEventId, locale: SkyLocale): SkyEventCopy {
  let copy: SkyEventCopy;
  if (id === 'mercuryVenusDirect') copy = mercuryVenusCopy(locale);
  else if (id === 'newMoonScorpio') copy = newMoonCopy(locale);
  else if (id === 'fullMoonGemini') copy = fullMoonCopy(locale);
  else if (id === 'mercuryRetrograde2027') copy = mercuryRetro2027Copy(locale);
  else if (id === 'eclipses2027') copy = eclipses2027Copy(locale);
  else if (id === 'marsRetrograde2027') copy = marsRetro2027Copy(locale);
  else if (id === 'fullMoons2027') copy = fullMoons2027Copy(locale);
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
