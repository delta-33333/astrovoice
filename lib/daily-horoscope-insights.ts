import { SIGN_IDS, SIGNS, type SignId } from './zodiac/signs.ts';
import type { DailyDay, DailyLocale, DailySkyBody } from './daily-horoscope.ts';

/**
 * Lecture « par signe » du ciel du jour, calculée à partir des positions réelles
 * (content/daily-horoscope/<date>.json → sky). Rien n’est inventé : chaque phrase
 * dérive de la maison (signes entiers depuis le signe solaire), des rétrogradations,
 * des aspects du jour et de la phase de la Lune. Pas de prédiction d’événement daté.
 */

const FR_SIGNS = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
const EN_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const BODY_EN: Record<string, string> = { Soleil: 'the Sun', Lune: 'the Moon', Mercure: 'Mercury', 'Vénus': 'Venus', Mars: 'Mars', Jupiter: 'Jupiter', Saturne: 'Saturn', Uranus: 'Uranus', Neptune: 'Neptune', Pluton: 'Pluto', 'Nœud nord': 'the North Node' };
const BODY_FR: Record<string, string> = { Soleil: 'le Soleil', Lune: 'la Lune', Mercure: 'Mercure', 'Vénus': 'Vénus', Mars: 'Mars', Jupiter: 'Jupiter', Saturne: 'Saturne', Uranus: 'Uranus', Neptune: 'Neptune', Pluton: 'Pluton', 'Nœud nord': 'le Nœud nord' };
const RULER_FR: Record<string, string> = { mars: 'Mars', venus: 'Vénus', mercury: 'Mercure', moon: 'Lune', sun: 'Soleil', jupiter: 'Jupiter', saturn: 'Saturne', pluto: 'Pluton', uranus: 'Uranus', neptune: 'Neptune' };

const ORD_EN = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const ORD_FR = ['1re', '2e', '3e', '4e', '5e', '6e', '7e', '8e', '9e', '10e', '11e', '12e'];

const HOUSE: Record<DailyLocale, string[]> = {
  en: ['self, body and first impressions', 'money, possessions and self-worth', 'messages, siblings and short trips', 'home, family and roots', 'pleasure, romance and creativity', 'daily work, routines and health', 'partners, contracts and open rivals', 'shared money, intimacy and debts', 'studies, travel and beliefs', 'career, status and public image', 'friends, networks and hopes', 'rest, solitude and what stays hidden'],
  fr: ['soi, le corps et la première impression', 'l’argent, les biens et l’estime de soi', 'les échanges, la fratrie et les petits trajets', 'le foyer, la famille et les racines', 'le plaisir, la romance et la création', 'le travail quotidien, les routines et la santé', 'le couple, les contrats et les rivaux déclarés', 'l’argent partagé, l’intimité et les dettes', 'les études, les voyages et les convictions', 'la carrière, le statut et l’image publique', 'les amis, les réseaux et les projets', 'le repos, la solitude et ce qui reste caché'],
};

/** Lune : humeur et agenda, par maison. */
const MOON: Record<DailyLocale, string[]> = {
  en: [
    'Your feelings show on your face today, so name a need plainly instead of hoping others guess it.',
    'Comfort spending tempts you; check whether a purchase soothes a mood or answers a real need.',
    'Your mind jumps between conversations; write the important point down before the next call.',
    'Home asks for attention: a tidy corner, a call to family or an evening in restores you.',
    'Play and affection lift the mood; give an hour to something you enjoy for its own sake.',
    'The to-do list feels heavier; sort tasks by size and finish one small job early.',
    'Other people set the tone; listen first, then say clearly what you can and cannot give.',
    'Emotions run deep and private; it is a day to look at a shared bill or a trust question calmly.',
    'You want a wider view; reading, a course or a plan for a trip feeds the restlessness.',
    'Your public role is in focus; how you handle duty today is noticed more than usual.',
    'Friends and groups matter; one message to the right person can reopen a useful door.',
    'Energy turns inward; protect some quiet time and do not over-commit your evening.',
  ],
  fr: [
    'Vos émotions se lisent sur votre visage : exprimez un besoin simplement plutôt que d’attendre qu’on le devine.',
    'Les achats réconfort tentent ; vérifiez si une dépense apaise une humeur ou répond à un vrai besoin.',
    'Votre esprit saute d’un échange à l’autre : notez le point important avant le prochain appel.',
    'Le foyer réclame de l’attention : un coin rangé, un appel à la famille ou une soirée chez vous ressource.',
    'Le jeu et la tendresse remontent le moral ; offrez une heure à une activité pour le seul plaisir.',
    'La liste de tâches pèse ; classez-les par taille et bouclez tôt une petite chose.',
    'Les autres donnent le ton : écoutez d’abord, puis dites clairement ce que vous pouvez donner ou non.',
    'Les émotions sont profondes et privées ; c’est le moment de regarder calmement une dépense commune ou une question de confiance.',
    'Vous avez besoin d’horizon : une lecture, une formation ou un projet de voyage nourrit l’impatience.',
    'Votre rôle public est en vue : la façon dont vous tenez vos engagements se remarque davantage.',
    'Amis et groupes comptent : un message à la bonne personne peut rouvrir une porte utile.',
    'L’énergie se tourne vers l’intérieur ; gardez du calme et ne surchargez pas votre soirée.',
  ],
};

/** Vénus : amour et relations, par maison. */
const VENUS: Record<DailyLocale, string[]> = {
  en: [
    'charm comes easily and you can soften a tense exchange simply by how you present yourself',
    'affection and money mix; a gift or a shared treat says more than a long speech',
    'sweet words travel well, so a short kind message beats waiting for the perfect moment',
    'love feels safest at home; a quiet evening together counts more than an outing',
    'romance and fun are favoured, which suits a date, a flirt or a creative hobby shared with someone',
    'care shows through small services; helping with a chore can be a real gesture of love',
    'the couple and close partnerships take centre stage, so balance giving and receiving',
    'intimacy and trust are the theme; talk about what you share rather than keeping score',
    'attraction leans toward someone different from you, or toward plans to go somewhere together',
    'relationships and reputation meet; a partner may matter in a professional decision',
    'friendship and love overlap; a group setting can be easier than a one-to-one',
    'feelings stay discreet; some things are better felt privately before they are said',
  ],
  fr: [
    'le charme vient facilement et votre manière de vous présenter peut adoucir un échange tendu',
    'l’affection et l’argent se mêlent ; un cadeau ou un plaisir partagé dit plus qu’un long discours',
    'les mots doux passent bien, un court message gentil vaut mieux que d’attendre le moment parfait',
    'l’amour se sent en sécurité à la maison ; une soirée tranquille à deux compte plus qu’une sortie',
    'la romance et le plaisir sont favorisés, idéal pour un rendez-vous, un flirt ou un loisir créatif à deux',
    'l’attention passe par de petits services ; aider pour une corvée peut être un vrai geste d’amour',
    'le couple et les associations proches sont au centre, cherchez l’équilibre entre donner et recevoir',
    'l’intimité et la confiance sont le thème ; parlez de ce que vous partagez au lieu de compter les points',
    'l’attirance va vers quelqu’un de différent de vous, ou vers un projet de départ à deux',
    'relations et réputation se croisent ; un partenaire peut peser dans une décision professionnelle',
    'amitié et amour se mélangent ; un cadre de groupe peut être plus simple qu’un tête-à-tête',
    'les sentiments restent discrets ; certaines choses gagnent à être ressenties avant d’être dites',
  ],
};

/** Mars : énergie et travail, par maison. */
const MARS: Record<DailyLocale, string[]> = {
  en: [
    'your drive is high, so start the hardest task first and keep sport or movement in the day',
    'effort goes into earning; a firm request about pay or a price is easier to make',
    'you argue fast; check facts before you hit send on a sharp email',
    'energy goes into the household; repairs and family logistics move forward',
    'competitive spirit shows in games, sport or a creative project you want to win at',
    'work pace speeds up; break big jobs into steps and watch for strain or small injuries',
    'friction with a partner or client is possible; disagree on the issue, not the person',
    'you push on shared resources or a debt; act on paperwork rather than on suspicion',
    'you want to defend a belief or take a course; channel the zeal into learning',
    'ambition is visible; a clear proposal to a manager or client lands well',
    'you rally people; a team effort or a group project gains momentum',
    'energy is lower than you expect; rest is productive and anger is better processed alone',
  ],
  fr: [
    'votre élan est fort : commencez par la tâche la plus dure et gardez du mouvement ou du sport dans la journée',
    'l’effort va vers les revenus ; une demande ferme sur un tarif ou un salaire est plus facile',
    'vous répliquez vite ; vérifiez les faits avant d’envoyer un e-mail tranchant',
    'l’énergie va au foyer ; réparations et organisation familiale avancent',
    'l’esprit de compétition se montre dans le jeu, le sport ou un projet créatif',
    'le rythme de travail s’accélère ; découpez les gros dossiers et surveillez la fatigue ou les petites blessures',
    'une friction avec un partenaire ou un client est possible ; contestez le sujet, pas la personne',
    'vous poussez sur un budget commun ou une dette ; agissez sur les papiers plutôt que sur les soupçons',
    'vous voulez défendre une conviction ou vous former ; mettez ce zèle dans l’apprentissage',
    'l’ambition se voit ; une proposition claire à un responsable ou à un client passe bien',
    'vous mobilisez les autres ; un effort d’équipe ou un projet collectif prend de l’élan',
    'l’énergie est plus basse que prévu ; le repos est utile et la colère se digère mieux seul',
  ],
};

/** Jupiter : argent et opportunités, par maison. */
const JUPITER: Record<DailyLocale, string[]> = {
  en: [
    'confidence grows, but so does the urge to overdo; keep promises realistic',
    'it is a period to build income patiently and to value your skills at their real price',
    'learning and networking nearby pay off; a local contact or a short course is worth it',
    'investing in home comfort or family is supported, within a set budget',
    'generosity toward pleasure is strong; enjoy, but set a limit on leisure spending',
    'better methods at work bring gains; improving a routine is worth more than a gamble',
    'partners can bring opportunities; read the terms of any agreement before you sign',
    'shared finances, loans or taxes deserve a careful review rather than a bold move',
    'opportunities come from far away, from study or from publishing; think long-term',
    'career growth is supported over the months; show results rather than promises',
    'your network is your asset; a friend or a group can point you to a useful opening',
    'quiet preparation pays; review your accounts privately before any big decision',
  ],
  fr: [
    'la confiance grandit, mais aussi l’envie d’en faire trop ; gardez des promesses réalistes',
    'c’est une période pour bâtir des revenus patiemment et estimer vos compétences à leur juste prix',
    'apprendre et réseauter près de chez vous rapporte ; un contact local ou une courte formation en vaut la peine',
    'investir dans le confort du foyer ou la famille est soutenu, dans un budget fixé',
    'la générosité pour les loisirs est forte ; profitez, mais fixez une limite aux dépenses',
    'de meilleures méthodes au travail rapportent ; améliorer une routine vaut mieux qu’un pari',
    'les partenaires peuvent apporter des occasions ; lisez les conditions avant de signer',
    'finances communes, crédits ou impôts méritent une revue attentive plutôt qu’un coup d’éclat',
    'les occasions viennent de loin, des études ou de la publication ; pensez à long terme',
    'la progression de carrière est soutenue sur plusieurs mois ; montrez des résultats plutôt que des promesses',
    'votre réseau est votre atout ; un ami ou un groupe peut vous signaler une ouverture utile',
    'la préparation discrète paie ; revoyez vos comptes en privé avant toute grande décision',
  ],
};

/** Mercure : communication, par maison. */
const MERCURY: Record<DailyLocale, string[]> = {
  en: ['how you speak about yourself', 'figures, invoices and prices', 'emails, calls and neighbours', 'family talks and home paperwork', 'creative ideas and conversations with children', 'work instructions and health appointments', 'negotiations with a partner or client', 'contracts, insurance and joint accounts', 'courses, travel bookings and big ideas', 'reports to a manager and your public message', 'group chats and plans with friends', 'private thoughts, journaling and what you keep to yourself'],
  fr: ['la façon de parler de vous', 'les chiffres, factures et prix', 'les e-mails, appels et voisins', 'les discussions familiales et papiers du foyer', 'les idées créatives et échanges avec les enfants', 'les consignes de travail et rendez-vous de santé', 'les négociations avec un partenaire ou un client', 'les contrats, assurances et comptes joints', 'les formations, réservations de voyage et grandes idées', 'les comptes rendus à un responsable et votre message public', 'les groupes de discussion et projets entre amis', 'les pensées privées, l’écriture intime et ce que vous gardez pour vous'],
};

const PHASE: Record<DailyLocale, Record<string, string>> = {
  en: { newMoon: 'a New Moon, a quiet point to set one intention', waxingCrescent: 'a waxing crescent, good for first steps', firstQuarter: 'a first quarter, a moment to push through a small obstacle', waxingGibbous: 'a waxing gibbous Moon, good for adjusting before finishing', fullMoon: 'a Full Moon, when feelings peak and things become visible', waningGibbous: 'a waning gibbous Moon, good for sharing what you learned', lastQuarter: 'a last-quarter Moon, a time to sort, close and let go', waningCrescent: 'a waning crescent, best for rest and clearing' },
  fr: { newMoon: 'une Nouvelle Lune, un point calme pour poser une intention', waxingCrescent: 'un premier croissant, bon pour les premiers pas', firstQuarter: 'un premier quartier, moment pour franchir un petit obstacle', waxingGibbous: 'une Lune gibbeuse croissante, bonne pour ajuster avant de finir', fullMoon: 'une Pleine Lune, quand les émotions culminent et que les choses se voient', waningGibbous: 'une Lune gibbeuse décroissante, bonne pour partager ce que vous avez appris', lastQuarter: 'un dernier quartier, temps de trier, clore et lâcher prise', waningCrescent: 'un dernier croissant, idéal pour le repos et le rangement' },
};

const ASPECT: Record<DailyLocale, Record<string, string>> = {
  en: { conjunction: 'conjunct', sextile: 'sextile', square: 'square', trine: 'trine', opposition: 'opposite' },
  fr: { conjunction: 'conjoint à', sextile: 'en sextile avec', square: 'en carré avec', trine: 'en trigone avec', opposition: 'opposé à' },
};
const ASPECT_TONE: Record<DailyLocale, Record<string, string>> = {
  en: { conjunction: 'blends the two areas', sextile: 'offers an easy opening between them', square: 'creates tension that asks for a decision', trine: 'lets them support each other', opposition: 'asks you to balance them' },
  fr: { conjunction: 'fusionne ces deux domaines', sextile: 'ouvre une passerelle facile entre eux', square: 'crée une tension qui demande un choix', trine: 'les fait se soutenir', opposition: 'vous demande de les équilibrer' },
};

export interface DailyInsightSection {
  id: 'moon' | 'transits' | 'love' | 'work' | 'money' | 'aspects';
  h2: string;
  paragraphs: string[];
}

function house(signIndex: number, skySign: string): number {
  const idx = FR_SIGNS.indexOf(skySign);
  return ((idx - signIndex + 12) % 12) + 1;
}

export function dailyInsights(locale: DailyLocale, sign: SignId, day: DailyDay): DailyInsightSection[] {
  const en = locale === 'en';
  const fact = SIGNS[sign];
  const si = fact.index;
  const sName = en ? EN_SIGNS[si] : FR_SIGNS[si];
  const skyName = (s: string) => (en ? EN_SIGNS[FR_SIGNS.indexOf(s)] ?? s : s);
  const bName = (b: string) => (en ? BODY_EN[b] : BODY_FR[b]) ?? b;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const ord = (h: number) => (en ? ORD_EN : ORD_FR)[h - 1];
  const theme = (h: number) => HOUSE[locale][h - 1];
  const get = (name: string): DailySkyBody | undefined => day.sky.bodies.find((b) => b.name === name);
  const where = (b: DailySkyBody) => {
    const h = house(si, b.sign);
    const retro = b.retrograde ? (en ? ', retrograde,' : ', rétrograde,') : '';
    return en
      ? `${cap(bName(b.name))} at ${b.degree}° ${skyName(b.sign)}${retro} crosses your ${ord(h)} house of ${theme(h)}`
      : `${cap(bName(b.name))} à ${b.degree}° ${b.sign}${retro} traverse votre ${ord(h)} maison (${theme(h)})`;
  };
  const sections: DailyInsightSection[] = [];

  const moon = get('Lune');
  if (moon) {
    const h = house(si, moon.sign);
    const p: string[] = [];
    const phase = PHASE[locale][day.sky.phase.id] ?? '';
    p.push(en
      ? `${where(moon)}. For ${sName}, this is where feelings and daily reactions gather today. ${MOON.en[h - 1]}`
      : `${where(moon)}. Pour le signe ${sName}, c’est là que se concentrent les émotions et les réactions du jour. ${MOON.fr[h - 1]}`);
    const ing = day.sky.ingresses.find((i) => i.name === 'Lune');
    if (ing) {
      const h2 = house(si, ing.to);
      p.push(en
        ? `Later the Moon moves into ${skyName(ing.to)}, your ${ord(h2)} house: the focus shifts toward ${theme(h2)}. ${MOON.en[h2 - 1]}`
        : `Ensuite la Lune entre en ${ing.to}, votre ${ord(h2)} maison : l’attention glisse vers ${theme(h2)}. ${MOON.fr[h2 - 1]}`);
    }
    if (phase) p.push(en
      ? `The lunar phase is ${phase} (${day.sky.phase.illumination}% lit), and for ${sName} it colours the ${ord(h)} house matters above.`
      : `La phase est ${phase} (${day.sky.phase.illumination} % éclairée) ; pour le signe ${sName}, elle teinte les sujets de la ${ord(h)} maison.`);
    sections.push({ id: 'moon', h2: en ? `The Moon today for ${sName}` : `La Lune aujourd’hui pour le signe ${sName}`, paragraphs: p });
  }

  // Transits au signe : planètes dans le signe, en face, en carré, en trigone.
  const rel: string[] = [];
  for (const b of day.sky.bodies) {
    if (b.name === 'Lune' || b.name === 'Nœud nord') continue;
    const h = house(si, b.sign);
    const kind = h === 1 ? 'conj' : h === 7 ? 'opp' : h === 4 || h === 10 ? 'sq' : h === 5 || h === 9 ? 'tri' : h === 3 || h === 11 ? 'sex' : null;
    if (!kind) continue;
    const label = en
      ? { conj: `is in your own sign, so its themes feel personal`, opp: `sits opposite your sign, so it reaches you through other people`, sq: `squares your sign, a source of friction that pushes you to adjust`, tri: `trines your sign, a fluid support you can lean on`, sex: `is sextile your sign, an opening that works if you use it` }[kind]
      : { conj: `est dans votre signe : ses thèmes vous touchent directement`, opp: `est face à votre signe : il vous atteint par les autres`, sq: `est en carré à votre signe : une friction qui pousse à s’ajuster`, tri: `est en trigone à votre signe : un appui fluide sur lequel compter`, sex: `est en sextile à votre signe : une ouverture qui marche si vous la saisissez` }[kind];
    rel.push(`${cap(bName(b.name))} (${b.degree}° ${skyName(b.sign)}${b.retrograde ? (en ? ', retrograde' : ', rétrograde') : ''}) ${label}.`);
  }
  const rulerId = fact.traditional;
  const rulerName = RULER_FR[rulerId];
  const ruler = get(rulerName);
  const tp: string[] = [];
  if (ruler && rulerName !== 'Lune') {
    const h = house(si, ruler.sign);
    tp.push(en
      ? `Your ruling planet is ${bName(rulerName)}. Today it sits at ${ruler.degree}° ${skyName(ruler.sign)}${ruler.retrograde ? ', retrograde,' : ''} in your ${ord(h)} house, so your sign’s energy is channelled into ${theme(h)}${ruler.retrograde ? '; retrograde motion favours reviewing over launching' : ''}.`
      : `Votre planète maîtresse est ${bName(rulerName)}. Aujourd’hui ${where(ruler)}, donc l’énergie de votre signe passe par ${theme(h)}${ruler.retrograde ? ' ; la rétrogradation invite à revoir plutôt qu’à lancer' : ''}.`);
  }
  if (rel.length) tp.push(...rel);
  if (tp.length) sections.push({ id: 'transits', h2: en ? `Planets touching ${sName} today` : `Les planètes qui touchent le signe ${sName} aujourd’hui`, paragraphs: tp });

  const venus = get('Vénus');
  const mars = get('Mars');
  const mercury = get('Mercure');
  const jupiter = get('Jupiter');
  const saturn = get('Saturne');
  if (venus) {
    const h = house(si, venus.sign);
    const p = [en ? `${where(venus)}: ${VENUS.en[h - 1]}.` : `${where(venus)} : ${VENUS.fr[h - 1]}.`];
    if (venus.retrograde) p.push(en
      ? `Venus is retrograde, so the area of ${theme(h)} is one to revisit: an old feeling, a past choice or a value you want to check, rather than a time to force a new commitment.`
      : `Vénus est rétrograde : le domaine de ${theme(h)} se revisite, un ancien sentiment, un choix passé ou une valeur à vérifier, plutôt que le moment de forcer un nouvel engagement.`);
    if (mars) {
      const hm = house(si, mars.sign);
      p.push(en
        ? `Desire follows Mars in your ${ord(hm)} house, so attraction gets mixed with ${theme(hm)}.`
        : `Le désir suit Mars en ${ord(hm)} maison : l’attirance se mêle à ${theme(hm)}.`);
    }
    sections.push({ id: 'love', h2: en ? `${sName} love today` : `Amour ${sName} aujourd’hui`, paragraphs: p });
  }
  const wp: string[] = [];
  if (mars) { const h = house(si, mars.sign); wp.push(en ? `${where(mars)}: ${MARS.en[h - 1]}.` : `${where(mars)} : ${MARS.fr[h - 1]}.`); }
  if (mercury) {
    const h = house(si, mercury.sign);
    wp.push(en
      ? `Mercury in your ${ord(h)} house puts the spotlight on ${MERCURY.en[h - 1]}${mercury.retrograde ? '; it is retrograde, so double-check names, dates and attachments, and prefer finishing drafts to signing new things' : '; it is direct, so clear explanations move things forward'}.`
      : `Mercure en ${ord(h)} maison met l’accent sur ${MERCURY.fr[h - 1]}${mercury.retrograde ? ' ; il est rétrograde, alors vérifiez noms, dates et pièces jointes, et préférez finir des brouillons plutôt que signer du neuf' : ' ; il est direct, des explications claires font avancer'}.`);
  }
  if (saturn) {
    const h = house(si, saturn.sign);
    wp.push(en
      ? `Saturn at ${saturn.degree}° ${skyName(saturn.sign)} in your ${ord(h)} house asks for patience and structure around ${theme(h)}: slow, steady effort there counts more than speed.`
      : `Saturne à ${saturn.degree}° ${saturn.sign}, en ${ord(h)} maison, demande patience et structure pour ${theme(h)} : un effort lent et régulier y compte plus que la vitesse.`);
  }
  if (wp.length) sections.push({ id: 'work', h2: en ? `${sName} work today` : `Travail ${sName} aujourd’hui`, paragraphs: wp });

  const mp: string[] = [];
  if (jupiter) { const h = house(si, jupiter.sign); mp.push(en ? `${where(jupiter)}: ${JUPITER.en[h - 1]}.` : `${where(jupiter)} : ${JUPITER.fr[h - 1]}.`); }
  const moneyHouses = day.sky.bodies.filter((b) => [2, 8].includes(house(si, b.sign)) && b.name !== 'Jupiter');
  if (moneyHouses.length) {
    const list = moneyHouses.map((b) => `${bName(b.name)} (${ord(house(si, b.sign))})`).join(', ');
    mp.push(en
      ? `Your money houses (2nd: own income, 8th: shared money) also host ${list} today, so finances are an active topic; compare before you commit.`
      : `Vos maisons d’argent (2e : revenus propres, 8e : argent partagé) accueillent aussi ${list} aujourd’hui ; les finances sont un sujet actif, comparez avant de vous engager.`);
  } else {
    mp.push(en
      ? `No planet occupies your 2nd or 8th house today, so money is a background topic for ${sName}: keep to your usual budget and avoid impulse decisions.`
      : `Aucune planète n’occupe vos maisons 2 ou 8 aujourd’hui : l’argent reste en arrière-plan pour le signe ${sName}, tenez votre budget habituel et évitez les décisions impulsives.`);
  }
  sections.push({ id: 'money', h2: en ? `${sName} money today` : `Argent ${sName} aujourd’hui`, paragraphs: mp });

  const ap = day.sky.aspects.slice(0, 4).map((a) => {
    const ba = get(a.a);
    const bb = get(a.b);
    if (!ba || !bb) return '';
    const ha = house(si, ba.sign);
    const hb = house(si, bb.sign);
    return en
      ? `${cap(bName(a.a))} ${ASPECT.en[a.aspect] ?? a.aspect} ${bName(a.b)} (orb ${a.orb}°) links your ${ord(ha)} house (${theme(ha)}) with your ${ord(hb)} house (${theme(hb)}) and ${ASPECT_TONE.en[a.aspect] ?? 'connects them'}.`
      : `${cap(bName(a.a))} ${ASPECT.fr[a.aspect] ?? a.aspect} ${bName(a.b)} (orbe ${a.orb}°) relie votre ${ord(ha)} maison (${theme(ha)}) et votre ${ord(hb)} maison (${theme(hb)}), et ${ASPECT_TONE.fr[a.aspect] ?? 'les relie'}.`;
  }).filter(Boolean);
  if (ap.length) sections.push({ id: 'aspects', h2: en ? `Today’s aspects in ${sName}’s chart` : `Les aspects du jour dans le thème du signe ${sName}`, paragraphs: ap });
  return sections;
}

export const DAILY_INSIGHT_SIGNS = SIGN_IDS;
