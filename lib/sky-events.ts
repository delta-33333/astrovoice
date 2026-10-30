import { BIG_THREE_PATHS, MOON_PATHS } from './free-tools.ts';
import { SIGN_IDS, signPath, weekPath, type SignId } from './zodiac/signs.ts';

/**
 * Pages « événement du ciel » (longue traîne, FR + EN), réponse d’abord.
 * Dates et heures calculées le 30/10/2026 avec l’éphéméride NASA JPL DE440 (Skyfield,
 * positions géocentriques apparentes), recoupées avec des tables publiées (astro-seek, otldr).
 */
export type SkyLocale = 'fr' | 'en';
export type SkyEventId = 'mercuryVenusDirect' | 'newMoonScorpio';

export const SKY_EVENT_IDS: SkyEventId[] = ['mercuryVenusDirect', 'newMoonScorpio'];
export const SKY_EVENTS_ORIGIN = 'https://callastral.com';
export const SKY_EVENTS_PUBLISHED = '2026-10-30';

export const SKY_EVENT_PATHS: Record<SkyEventId, Record<SkyLocale, string>> = {
  mercuryVenusDirect: { en: '/en/mercury-venus-direct-november-2026', fr: '/fr/mercure-venus-direct-novembre-2026' },
  newMoonScorpio: { en: '/en/new-moon-scorpio-november-2026', fr: '/fr/nouvelle-lune-scorpion-novembre-2026' },
};

/** Même convention que les pages GEO : x-default = FR. */
export function skyEventAlternates(id: SkyEventId): Record<string, string> {
  return { fr: SKY_EVENT_PATHS[id].fr, en: SKY_EVENT_PATHS[id].en, 'x-default': SKY_EVENT_PATHS[id].fr };
}

export const SKY_LINKS: Record<SkyLocale, { chart: string; moon: string; horoscope: string; chat: string; trial: string }> = {
  en: { chart: BIG_THREE_PATHS.en, moon: MOON_PATHS.en, horoscope: weekPath('en'), chat: '/en/chat', trial: '/en/free-trial' },
  fr: { chart: BIG_THREE_PATHS.fr, moon: MOON_PATHS.fr, horoscope: weekPath('fr'), chat: '/fr/chat', trial: '/fr/essai' },
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
  fullMoon: { utc: '2026-11-24T14:54:00Z', degree: '2°20′', sign: 'gemini' },
  mercuryShadowEnd: { utc: '2026-11-30T06:21:00Z' },
  venusIntoScorpio: { utc: '2026-12-04T08:13:00Z' },
  mercuryIntoSagittarius: { utc: '2026-12-06T08:33:00Z' },
  venusShadowEnd: { utc: '2026-12-15T18:30:00Z' },
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

const LIBRA = 6;
const SCORPIO = 7;

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
        { href: l.horoscope, label: 'Lire l’horoscope de la semaine pour les 12 signes' },
        { href: l.chat, label: 'Poser votre question par message (1re réponse offerte)' },
        { href: l.trial, label: 'Parler 3 minutes gratuitement avec une Conseillère ou un Conseiller Callastral' },
      ]
    : [
        { href: l.chart, label: 'Get your free birth chart (Sun, Moon and rising sign)' },
        { href: l.moon, label: 'Check the Moon today: live sign and phase' },
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
      title: 'Mercure et Vénus directs en novembre 2026 : dates, heures et signes',
      description: 'Mercure rétrograde finit le 13 novembre 2026 à 16 h 54 (Paris), Vénus rétrograde le 14 novembre vers 1 h 27. Dates calculées, ombre et effets pour les 12 signes.',
      h1: 'Mercure et Vénus redeviennent directs les 13 et 14 novembre 2026',
      breadcrumb: 'Mercure et Vénus directs, novembre 2026',
      answer: [
        `Mercure rétrograde se termine le 13 novembre 2026 à 16 h 54, heure de Paris (15 h 54 UTC), quand Mercure redevient direct à 5°02′ Scorpion ; Vénus rétrograde se termine environ 8 h 30 plus tard, le 14 novembre 2026 vers 1 h 27 à Paris (0 h 27 UTC), à 22°52′ Balance.`,
        'Les retards de communication, de déplacements et de papiers s’atténuent d’abord, puis les décisions d’amour et d’argent suspendues depuis le 3 octobre peuvent avancer, progressivement, jusqu’à la fin des périodes d’ombre le 30 novembre (Mercure) et le 15 décembre (Vénus).',
      ],
      updated: 'Publié le 30 octobre 2026',
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
    title: 'Mercury and Venus Direct November 2026: Dates, Times and Your Sign',
    description: 'Mercury retrograde ends 13 Nov 2026 at 15:54 UTC; Venus retrograde ends 14 Nov at about 00:27 UTC. Calculated dates, shadow periods and all 12 signs.',
    h1: 'Mercury and Venus station direct on 13–14 November 2026',
    breadcrumb: 'Mercury and Venus direct, November 2026',
    answer: [
      'Mercury retrograde ends on 13 November 2026 at 15:54 UTC (16:54 Paris time), when Mercury stations direct at 5°02′ Scorpio; Venus retrograde ends about 8.5 hours later, on 14 November 2026 at about 00:27 UTC (01:27 Paris time), at 22°52′ Libra.',
      'Communication, travel and paperwork delays ease first, then love and money decisions put on hold since 3 October can move forward, gradually, until the shadow periods end on 30 November (Mercury) and 15 December (Venus).',
    ],
    updated: 'Published on 30 October 2026',
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
      title: 'Nouvelle Lune en Scorpion du 9 novembre 2026 : heure, sens et signes',
      description: 'Nouvelle Lune en Scorpion le 9 novembre 2026 à 8 h 02 (Paris), 7 h 02 UTC, à 16°53′ Scorpion, pendant Mercure et Vénus rétrogrades. Sens, intentions et 12 signes.',
      h1: 'Nouvelle Lune en Scorpion du 9 novembre 2026',
      breadcrumb: 'Nouvelle Lune en Scorpion, 9 novembre 2026',
      answer: [
        'La Nouvelle Lune en Scorpion a lieu le lundi 9 novembre 2026 à 8 h 02, heure de Paris (7 h 02 UTC), à 16°53′ Scorpion.',
        'C’est une Lune de recommencement en profondeur : on y pose des intentions sur ce qu’on veut transformer, lâcher ou regarder en face, avec une particularité cette année : Mercure et Vénus sont encore rétrogrades, donc mieux vaut préparer que lancer, puis agir après leurs stations des 13 et 14 novembre.',
      ],
      updated: 'Publié le 30 octobre 2026',
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
        { question: 'Quand est la prochaine Pleine Lune ?', answer: 'Le 24 novembre 2026 à 15 h 54, heure de Paris (14 h 54 UTC), à 2°20′ Gémeaux.' },
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
    title: 'New Moon in Scorpio 9 November 2026: Time, Meaning and Your Sign',
    description: 'New Moon in Scorpio on 9 Nov 2026 at 07:02 UTC (08:02 Paris time), at 16°53′ Scorpio, during Mercury and Venus retrograde. Meaning, intentions and all 12 signs.',
    h1: 'New Moon in Scorpio on 9 November 2026',
    breadcrumb: 'New Moon in Scorpio, 9 November 2026',
    answer: [
      'The New Moon in Scorpio takes place on Monday 9 November 2026 at 07:02 UTC (08:02 Paris time, 02:02 New York time), at 16°53′ Scorpio.',
      'It is a New Moon for deep fresh starts: set intentions about what you want to transform, release or face honestly, with one twist this year: Mercury and Venus are still retrograde, so prepare rather than launch, then act after their stations on 13 and 14 November.',
    ],
    updated: 'Published on 30 October 2026',
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
      { question: 'When is the next Full Moon?', answer: 'On 24 November 2026 at 14:54 UTC (15:54 Paris time), at 2°20′ Gemini.' },
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

export function skyEventCopy(id: SkyEventId, locale: SkyLocale): SkyEventCopy {
  return id === 'mercuryVenusDirect' ? mercuryVenusCopy(locale) : newMoonCopy(locale);
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
        datePublished: SKY_EVENTS_PUBLISHED,
        dateModified: SKY_EVENTS_PUBLISHED,
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
