import type { Locale } from '../seo.ts';
import type { SignId } from './signs.ts';

export interface SignDossier {
  sign: [string, string];
  rising: [string, string];
  love: string;
  work: string;
  /** Fragment sans point, propre au signe, utilisé seulement dans les duos. */
  grain: string;
  tempo: string;
}

const FR: Record<SignId, SignDossier> = {
  belier: {
    sign: [
      'Le Bélier ouvre le zodiaque tropical à l’équinoxe de mars. Feu cardinal, il est gouverné par Mars : le geste précède le bilan, et la colère, quand elle vient, dure moins longtemps que l’élan.',
      'Ce signe supporte mal l’attente sans objet. Il confond parfois la vitesse avec la direction. Mars donne le courage de commencer, pas la preuve que la cible était la bonne.',
    ],
    rising: [
      'L’ascendant Bélier est la cuspide de la maison I, le seuil par lequel on vous rencontre, pas le signe solaire. Mars au lever rend l’entrée directe, parfois brusque : le corps part avant la formule de politesse.',
      'Ce seuil se calcule avec l’heure exacte et le fuseau historique du lieu. Une heure fausse peut changer le signe. Le Bélier levant ne se lit donc que si l’heure de naissance est connue.',
    ],
    love: 'En amour, le Bélier veut un oui clair. L’ambiguïté polie l’use davantage qu’un refus net, et il s’engage vite dès que le lien bouge.',
    work: 'Au travail, il lance, dispute un délai, fait un prototype. Entretenir un processus déjà stable l’intéresse moins que d’en ouvrir un.',
    grain: 'partir avant d’avoir fini d’expliquer',
    tempo: 'un délai court et une cible visible',
  },
  taureau: {
    sign: [
      'Le Taureau est une terre fixe gouvernée par Vénus. Le Soleil y passe au milieu du printemps. La valeur se juge à ce qui se touche, se garde et se répète sans s’user.',
      'Le changement n’est pas refusé par principe : il est refusé tant qu’il n’a pas de contrepartie concrète. La patience du Taureau devient de l’entêtement quand le motif de bouger reste abstrait.',
    ],
    rising: [
      'L’ascendant Taureau ralentit la première impression. Vénus au lever donne une présence posée, un rythme qui ne se presse pas, et le besoin de sentir que le lieu est habitable avant de s’y montrer.',
      'Comme tout ascendant, il dépend de l’heure civile réelle, heure d’été historique comprise. Sans cette heure, on peut connaître le Soleil en Taureau, pas le Taureau levant.',
    ],
    love: 'En amour, le Taureau s’attache à un corps, à un rythme, à des preuves matérielles de continuité. La promesse légère ne remplace pas la présence répétée.',
    work: 'Au travail, il tient un savoir-faire et une charge dans la durée. On peut lui confier ce qui doit encore être là dans six mois, moins ce qui doit changer de cap chaque matin.',
    grain: 'ne lâcher un acquis que contre une raison palpable',
    tempo: 'un rythme stable et un objet qu’on peut garder',
  },
  gemeaux: {
    sign: [
      'Les Gémeaux sont un air mutable gouverné par Mercure. Le signe vit de liens, de versions et de questions. Une seule explication lui paraît vite incomplète.',
      'La curiosité est le moteur, pas la dispersion pour elle-même. Le piège est de collectionner les pistes jusqu’à ne plus savoir laquelle on avait décidé de suivre.',
    ],
    rising: [
      'L’ascendant Gémeaux fait passer le premier contact par la parole. Mercure au lever change l’impression vite : une question, un trait, puis déjà un autre sujet. On vous lit comme quelqu’un de mobile avant de vous lire comme quelqu’un de fixé.',
      'L’heure de naissance décide de ce lever. Les Gémeaux solaires parlent d’un Soleil ; l’ascendant Gémeaux parle de la porte du thème, et les deux peuvent différer.',
    ],
    love: 'En amour, les Gémeaux ont besoin que la conversation reste vivante. Le silence prolongé est pris pour une absence, même quand l’attachement est réel.',
    work: 'Au travail, ils relient des gens, des idées, des dossiers. Ils sont à l’aise pour ouvrir un sujet et pour le traduire, moins pour le clore quand toutes les nuances ne sont pas dites.',
    grain: 'ouvrir trois pistes avant d’en fermer une',
    tempo: 'une conversation qui a le droit de changer de sujet',
  },
  cancer: {
    sign: [
      'Le Cancer est une eau cardinale gouvernée par la Lune. Il commence l’été tropical. Le mouvement du signe est de protéger un dedans : un foyer, un cercle, une mémoire.',
      'L’humeur compte autant que l’argument. Le Cancer décide souvent selon que le lieu est sûr ou non. Ce n’est pas de la faiblesse de jugement, c’est un autre critère.',
    ],
    rising: [
      'L’ascendant Cancer met la réserve en avant. La Lune au lever fait tester le climat d’une pièce avant d’y montrer beaucoup. On peut vous trouver prudent alors que l’intérieur est déjà engagé.',
      'Ce calcul bouge avec l’heure et avec le fuseau en vigueur ce jour-là. Le Cancer levant disparaît du thème si l’heure est inventée ou arrondie trop largement.',
    ],
    love: 'En amour, le Cancer s’engage quand le lien peut devenir un abri. Il retient les anniversaires, les tons de voix, et se ferme si l’intimité est exposée trop tôt.',
    work: 'Au travail, il tient une équipe, une clientèle, une continuité. Il voit ce que les autres oublient de demander. La pression publique permanente l’use plus que la charge elle-même.',
    grain: 'vérifier d’abord si le lieu est sûr',
    tempo: 'un cercle protégé et une mémoire des détails',
  },
  lion: {
    sign: [
      'Le Lion est un feu fixe gouverné par le Soleil. Il tient le milieu de l’été. La question du signe n’est pas de démarrer, c’est de rester visible sans s’éteindre.',
      'La chaleur est réelle et la fierté aussi. Le Lion donne beaucoup quand il est reconnu, et il retire la scène quand on le traite comme un décor.',
    ],
    rising: [
      'L’ascendant Lion se remarque en entrant. Le Soleil au lever donne une allure, un souci de ne pas arriver effacé, et une chaleur que les autres voient avant d’entendre le fond.',
      'Il ne se déduit pas du mois de naissance. Seule l’heure, convertie avec le fuseau historique, place le Lion sur la maison I.',
    ],
    love: 'En amour, le Lion veut être choisi au grand jour. La tiédeur passe pour de l’indifférence, et la loyauté se montre par la place qu’on lui fait.',
    work: 'Au travail, il porte un rôle, un nom, une responsabilité visible. Il anime, il représente, il tient un cap. Le travail anonyme de longue haleine lui pèse s’il n’a aucune scène.',
    grain: 'tenir le centre sans s’excuser d’y être',
    tempo: 'une reconnaissance visible et un rôle tenu',
  },
  vierge: {
    sign: [
      'La Vierge est une terre mutable gouvernée par Mercure. Elle trie, corrige, remet au bon endroit. Le détail n’est pas une manie : c’est la manière dont le signe rend le monde utilisable.',
      'Le risque est de ne jamais déclarer le travail fini. Mercure ici ne collectionne pas les versions comme aux Gémeaux : il sépare le juste de l’approximatif.',
    ],
    rising: [
      'L’ascendant Vierge donne un premier contact précis, parfois réservé. On observe, on range, on parle peu tant que la phrase n’est pas juste. Les autres peuvent lire de la froideur là où il y a de l’attention.',
      'Sans heure exacte, cet ascendant n’est qu’une hypothèse. La Vierge solaire décrit un Soleil ; le lever Vierge décrit la porte, et Mercure n’y agit pas de la même façon.',
    ],
    love: 'En amour, la Vierge montre son attachement en réglant des choses concrètes. Elle a besoin que le lien soit juste dans le quotidien, pas seulement déclaré.',
    work: 'Au travail, elle améliore un processus, chasse l’erreur, tient un niveau. On la cherche quand la qualité compte plus que l’annonce.',
    grain: 'séparer le juste de l’approximatif',
    tempo: 'un détail vérifié avant de dire que c’est fini',
  },
  balance: {
    sign: [
      'La Balance est un air cardinal gouverné par Vénus. Elle ouvre l’automne tropical. Le signe ne se pense pas seul : une décision n’est tenue pour bonne que si la relation qu’elle crée reste viable.',
      'Le sens de l’équité peut retarder le choix. La Balance n’est pas sans désir ; elle refuse qu’un désir à un seul bout tienne lieu d’accord.',
    ],
    rising: [
      'L’ascendant Balance aborde l’autre avec courtoisie. Vénus au lever cherche le regard, l’équilibre, la forme juste. Le désaccord existe, mais il ne se met pas en avant à la première minute.',
      'Cette porte se calcule à l’heure près. Une Balance solaire peut avoir un autre ascendant, et un autre Soleil peut se présenter avec une Balance levante.',
    ],
    love: 'En amour, la Balance cherche un duo lisible. Elle soigne la manière, elle entend les deux versions, et elle s’éloigne si le lien exige un vainqueur permanent.',
    work: 'Au travail, elle négocie, met en forme, tient un cadre entre des intérêts. Elle est utile là où il faut un accord visible, moins là où il faut trancher seul et vite.',
    grain: 'chercher un accord qui reste tenable pour deux',
    tempo: 'une forme juste et un duo lisible',
  },
  scorpion: {
    sign: [
      'Le Scorpion est une eau fixe. La tradition le place sous Mars ; la maîtrise moderne ajoute Pluton. Rien n’est donné en surface : le signe cherche ce qui reste quand la version officielle a été retirée.',
      'La loyauté est exigeante et la mémoire longue. Le Scorpion ne confond pas l’intensité avec le bruit. Il peut se taire longtemps et n’en penser pas moins.',
    ],
    rising: [
      'L’ascendant Scorpion retient le premier contact. Le regard tient, peu est offert d’emblée, et la confiance ne se place pas au premier échange. Mars et Pluton au lever rendent l’entrée intense plutôt que bavarde.',
      'L’heure exacte est indispensable. Sans elle, on peut parler d’un Soleil en Scorpion, pas de cette porte-là.',
    ],
    love: 'En amour, le Scorpion veut une vérité tenue, pas une légèreté de passage. La demi-confidence le ferme plus sûrement qu’un conflit franc.',
    work: 'Au travail, il creuse un dossier, tient un secret professionnel, va au bout d’une crise. Il est moins fait pour l’esquisse que pour ce qui doit être vu jusqu’au fond.',
    grain: 'ne rien lâcher tant que la version officielle reste incomplète',
    tempo: 'une confiance rare et une mémoire longue',
  },
  sagittaire: {
    sign: [
      'Le Sagittaire est un feu mutable gouverné par Jupiter. Il élargit : une idée, une route, une croyance qui doit pouvoir se vérifier plus loin que la pièce où elle est née.',
      'La franchise est un outil, parfois un choc. Le signe déteste le cadre trop petit et peut partir avant d’avoir tenu une promesse très précise.',
    ],
    rising: [
      'L’ascendant Sagittaire entre de façon ouverte. Jupiter au lever donne une franchise visible, un élan vers plus large, et l’impression que le cadre actuel ne suffit pas à vous définir.',
      'Ce n’est pas le Sagittaire solaire. Le lever se décide à l’heure et au lieu, fuseau historique compris. Sans cela, l’ascendant reste inconnu.',
    ],
    love: 'En amour, le Sagittaire a besoin d’air et d’un horizon commun. Il s’attache à quelqu’un avec qui l’on peut encore bouger, apprendre, dire les choses sans protocole.',
    work: 'Au travail, il ouvre un marché, un enseignement, un déplacement. Il tient mal un détail répétitif s’il n’y voit pas la direction.',
    grain: 'élargir la carte avant de refermer le dossier',
    tempo: 'un horizon et le droit de dire les choses franchement',
  },
  capricorne: {
    sign: [
      'Le Capricorne est une terre cardinale gouvernée par Saturne. Il ouvre l’hiver tropical. Le signe construit pour que l’œuvre reste quand l’humeur est passée.',
      'Le sérieux n’est pas toute la personne, mais c’est ce qu’il montre d’abord. Saturne demande un temps long et punit la promesse qui n’a pas de calendrier.',
    ],
    rising: [
      'L’ascendant Capricorne tient l’image. Saturne au lever donne une maîtrise affichée, un sens de la responsabilité visible, même quand l’intérieur est moins raide que la porte.',
      'L’heure de naissance, et le décalage réel de ce jour-là, décident de ce Saturne-là. Un Soleil en Capricorne ne le remplace pas.',
    ],
    love: 'En amour, le Capricorne s’engage par des actes qui durent : du temps, une structure, une parole tenue. La démonstration sans suite le convainc peu.',
    work: 'Au travail, il vise un étage, une charge, une compétence qui s’accumule. Il respecte l’effort visible et se méfie de l’annonce sans livraison.',
    grain: 'ne compter que ce qui tient encore dans un an',
    tempo: 'un calendrier et une charge qu’on peut assumer',
  },
  verseau: {
    sign: [
      'Le Verseau est un air fixe. Saturne le gouverne dans la tradition ; Uranus s’y ajoute en maîtrise moderne. Le signe tient une distance amicale et une règle qui devrait valoir au-delà du cas personnel.',
      'Il entre dans le groupe sans s’y fondre. L’indépendance n’est pas un caprice : c’est le refus d’un « nous » qui efface la différence.',
    ],
    rising: [
      'L’ascendant Verseau marque une différence dès l’entrée. La distance reste cordiale. On vous perçoit comme quelqu’un qui participe sans se laisser définir par le milieu.',
      'Uranus et Saturne ne se placent sur la maison I que par l’heure exacte. Le Verseau solaire et le Verseau levant sont deux faits distincts.',
    ],
    love: 'En amour, le Verseau a besoin d’un lien qui laisse de l’air et une amitié au milieu du désir. Il se braque si l’attachement devient une surveillance.',
    work: 'Au travail, il pense un système, une réforme, un usage collectif. Il préfère changer la règle qui produit les cas plutôt que de réparer les cas un par un.',
    grain: 'tenir une règle qui vaut pour plus que soi',
    tempo: 'une liberté gardée et un groupe qui n’exige pas la fusion',
  },
  poissons: {
    sign: [
      'Les Poissons ferment le zodiaque tropical. Eau mutable, ils sont gouvernés par Jupiter dans la tradition et par Neptune en maîtrise moderne. Le signe sent un climat avant de poser un contour.',
      'La porosité est une compétence et un risque. Les Poissons relient ce que d’autres séparent, et ils se perdent si aucun bord ne leur est rendu.',
    ],
    rising: [
      'L’ascendant Poissons rend le premier contact plus souple, parfois difficile à cerner. Neptune et Jupiter au lever font capter l’ambiance avant de se définir. On peut vous trouver doux, rêveur, ou simplement peu bordé.',
      'Sans heure précise et sans fuseau historique, cet ascendant ne se calcule pas. Le Soleil en Poissons ne dit rien de la maison I.',
    ],
    love: 'En amour, les Poissons s’attachent à une atmosphère autant qu’à une personne. Ils ont besoin de douceur et d’un cadre léger, sinon l’empathie se confond avec la fusion.',
    work: 'Au travail, ils imaginent, écoutent, relient des demandes floues. Ils sont précieux quand le sens compte, et ils ont besoin qu’un autre signe tienne l’échéance.',
    grain: 'sentir le climat avant de poser un bord',
    tempo: 'une atmosphère vraie et un contour qui ne se ferme pas trop vite',
  },
};

const EN: Record<SignId, SignDossier> = {
  belier: {
    sign: [
      'Aries opens the tropical zodiac at the March equinox. Cardinal fire, ruled by Mars: the move comes before the review, and anger, when it shows, burns shorter than the impulse.',
      'This sign handles aimless waiting badly. It sometimes mistakes speed for direction. Mars supplies the nerve to start, not proof that the target was the right one.',
    ],
    rising: [
      'Aries rising is the cusp of the first house, the threshold other people meet, not the Sun sign. Mars on the ascendant makes the entrance direct, sometimes blunt: the body moves before the polite sentence.',
      'That threshold needs the exact birth time and the historical time zone of the place. A wrong hour can change the sign. Aries rising is readable only when the birth time is known.',
    ],
    love: 'In love, Aries wants a clear yes. Polite ambiguity wears it down more than a plain no, and it commits fast once the bond is moving.',
    work: 'At work, Aries starts things, argues a deadline, and builds a prototype. Maintaining a process that already runs interests it less than opening one.',
    grain: 'set off before the explanation is finished',
    tempo: 'a short deadline and a visible target',
  },
  taureau: {
    sign: [
      'Taurus is fixed earth ruled by Venus. The Sun travels it in mid-spring. Value is judged by what can be touched, kept, and repeated without wearing out.',
      'Change is not refused on principle. It is refused until it has a concrete return. Taurus patience becomes stubbornness when the reason to move stays abstract.',
    ],
    rising: [
      'Taurus rising slows the first impression. Venus on the ascendant gives an unhurried presence and a need to feel that a room is livable before showing much of oneself.',
      'Like every ascendant, it depends on the real civil time, historical daylight saving included. Without that hour you may know a Taurus Sun, not Taurus rising.',
    ],
    love: 'In love, Taurus attaches to a body, a rhythm, and material proof of continuity. A light promise does not replace a repeated presence.',
    work: 'At work, Taurus holds a craft and a load over time. It can be trusted with what must still be there in six months, less with what must change direction every morning.',
    grain: 'release something already held only for a reason you can touch',
    tempo: 'a steady pace and an object worth keeping',
  },
  gemeaux: {
    sign: [
      'Gemini is mutable air ruled by Mercury. The sign lives on links, versions, and questions. A single explanation soon feels incomplete.',
      'Curiosity is the engine, not scatter for its own sake. The trap is collecting tracks until you no longer know which one you meant to follow.',
    ],
    rising: [
      'Gemini rising sends the first contact through speech. Mercury on the ascendant shifts the impression quickly: a question, a joke, then already another subject.',
      'Birth time decides this rising sign. A Gemini Sun describes a Sun; Gemini rising describes the chart’s door, and the two can differ.',
    ],
    love: 'In love, Gemini needs the conversation to stay alive. A long silence is read as absence, even when the attachment is real.',
    work: 'At work, Gemini connects people, ideas, and files. It is comfortable opening a subject and translating it, less comfortable closing it while nuances remain unsaid.',
    grain: 'open three tracks before closing one',
    tempo: 'a conversation allowed to change subject',
  },
  cancer: {
    sign: [
      'Cancer is cardinal water ruled by the Moon. It opens the tropical summer. The sign’s move is to protect an inside: a home, a circle, a memory.',
      'Mood counts as much as argument. Cancer often decides by whether a place feels safe. That is another criterion, not a failure of judgment.',
    ],
    rising: [
      'Cancer rising puts reserve first. The Moon on the ascendant tests the weather of a room before showing much. People can read caution where the inside is already committed.',
      'The calculation moves with the hour and with the zone in force that day. Cancer rising drops out of the chart if the time is invented or rounded too broadly.',
    ],
    love: 'In love, Cancer commits when the bond can become shelter. It remembers dates and tones of voice, and it closes if intimacy is exposed too soon.',
    work: 'At work, Cancer holds a team, a clientele, a continuity. It notices what others forget to ask. Constant public pressure wears it more than the load itself.',
    grain: 'check first whether the place is safe',
    tempo: 'a protected circle and a memory for detail',
  },
  lion: {
    sign: [
      'Leo is fixed fire ruled by the Sun. It holds the middle of summer. The sign’s question is not how to start, but how to stay visible without burning out.',
      'The warmth is real, and so is the pride. Leo gives a great deal when it is recognized, and it leaves the stage when it is treated as scenery.',
    ],
    rising: [
      'Leo rising is noticed on the way in. The Sun on the ascendant brings a sense of style and a dislike of arriving erased. Warmth shows before the substance is heard.',
      'It cannot be deduced from the birth month. Only the hour, converted with the historical zone, places Leo on the first house.',
    ],
    love: 'In love, Leo wants to be chosen in daylight. Lukewarmness reads as indifference, and loyalty shows in the place one is given.',
    work: 'At work, Leo carries a role, a name, a visible responsibility. It animates and represents. Long anonymous labor weighs on it if there is no stage at all.',
    grain: 'hold the center without apologizing for being there',
    tempo: 'visible recognition and a role that is actually held',
  },
  vierge: {
    sign: [
      'Virgo is mutable earth ruled by Mercury. It sorts, corrects, and puts things back where they work. Detail is not a tic: it is how the sign makes the world usable.',
      'The risk is never declaring the work finished. Mercury here does not collect versions the way Gemini does. It separates what is accurate from what is approximate.',
    ],
    rising: [
      'Virgo rising makes the first contact precise, sometimes reserved. It watches, tidies, and says little until the sentence is right. Others can read coldness where there is attention.',
      'Without an exact hour, this ascendant is only a guess. A Virgo Sun describes a Sun; Virgo rising describes the door, and Mercury does not act the same way in both places.',
    ],
    love: 'In love, Virgo shows attachment by fixing concrete things. It needs the bond to be accurate in daily life, not only declared.',
    work: 'At work, Virgo improves a process, hunts the error, and holds a standard. It is the person to call when quality matters more than the announcement.',
    grain: 'separate what is accurate from what is approximate',
    tempo: 'a detail checked before anyone says it is done',
  },
  balance: {
    sign: [
      'Libra is cardinal air ruled by Venus. It opens the tropical autumn. The sign does not think alone: a decision counts as good only if the relationship it creates can still stand.',
      'A sense of fairness can delay the choice. Libra is not without desire. It refuses to let a one-sided desire stand in for an agreement.',
    ],
    rising: [
      'Libra rising meets the other person with courtesy. Venus on the ascendant looks for the gaze, the balance, the right form. Disagreement exists, but it is not put first in the opening minute.',
      'This door is calculated to the hour. A Libra Sun can have another rising sign, and another Sun can arrive with Libra rising.',
    ],
    love: 'In love, Libra wants a duo that can be read. It cares about manner, hears both versions, and steps back if the bond requires a permanent winner.',
    work: 'At work, Libra negotiates, shapes, and holds a frame between interests. It is useful where a visible agreement is needed, less useful where someone must cut alone and fast.',
    grain: 'look for an agreement two people can still live with',
    tempo: 'a fair form and a duo that can be read',
  },
  scorpion: {
    sign: [
      'Scorpio is fixed water. Tradition places it under Mars; modern rulership adds Pluto. Little is given on the surface: the sign looks for what remains when the official version is taken away.',
      'Loyalty is demanding and memory is long. Scorpio does not confuse intensity with noise. It can stay silent for a long time and still be thinking.',
    ],
    rising: [
      'Scorpio rising holds the first contact back. The gaze stays, little is offered at once, and trust is not placed in the first exchange. Mars and Pluto on the ascendant make the entrance intense rather than talkative.',
      'The exact hour is required. Without it you can discuss a Scorpio Sun, not this particular door.',
    ],
    love: 'In love, Scorpio wants a truth that is kept, not a passing lightness. A half-confidence closes it more surely than an open conflict.',
    work: 'At work, Scorpio digs into a file, keeps a professional secret, and stays through a crisis. It is built for what must be seen to the bottom, not for the sketch.',
    grain: 'refuse to let go while the official version is still incomplete',
    tempo: 'rare trust and a long memory',
  },
  sagittaire: {
    sign: [
      'Sagittarius is mutable fire ruled by Jupiter. It widens: an idea, a road, a belief that has to be tested farther than the room where it was born.',
      'Frankness is a tool, and sometimes a shock. The sign hates a frame that is too small, and it can leave before a very specific promise has been kept.',
    ],
    rising: [
      'Sagittarius rising comes in openly. Jupiter on the ascendant gives a visible frankness and a pull toward something wider. The current frame does not seem enough to define you.',
      'This is not the Sagittarius Sun. Rising is decided by hour and place, historical zone included. Without that, the ascendant stays unknown.',
    ],
    love: 'In love, Sagittarius needs air and a shared horizon. It attaches to someone with whom it is still possible to move, learn, and speak without a protocol.',
    work: 'At work, Sagittarius opens a market, a course, a journey. It holds a repetitive detail poorly if it cannot see the direction.',
    grain: 'widen the map before closing the file',
    tempo: 'a horizon and the right to say things plainly',
  },
  capricorne: {
    sign: [
      'Capricorn is cardinal earth ruled by Saturn. It opens the tropical winter. The sign builds so that the work is still there when the mood has passed.',
      'Seriousness is not the whole person, but it is what shows first. Saturn asks for a long time and punishes a promise that has no calendar.',
    ],
    rising: [
      'Capricorn rising holds the image. Saturn on the ascendant gives a displayed self-control and a visible sense of duty, even when the inside is less strict than the door.',
      'Birth time, and the real offset of that day, decide this Saturn. A Capricorn Sun does not replace it.',
    ],
    love: 'In love, Capricorn commits through acts that last: time, a structure, a kept word. A display with no follow-through convinces it very little.',
    work: 'At work, Capricorn aims at a floor, a load, a skill that accumulates. It respects visible effort and distrusts an announcement with no delivery.',
    grain: 'count only what will still stand in a year',
    tempo: 'a calendar and a load that can actually be carried',
  },
  verseau: {
    sign: [
      'Aquarius is fixed air. Saturn rules it in the tradition; Uranus is added in modern rulership. The sign keeps a friendly distance and a rule that ought to hold beyond the personal case.',
      'It joins the group without dissolving into it. Independence is not a whim. It is the refusal of a “we” that erases the difference.',
    ],
    rising: [
      'Aquarius rising marks a difference at the door. The distance stays cordial. You are read as someone who takes part without letting the room define you.',
      'Uranus and Saturn land on the first house only through the exact hour. An Aquarius Sun and Aquarius rising are two different facts.',
    ],
    love: 'In love, Aquarius needs a bond that leaves air, and friendship inside desire. It locks up if attachment turns into surveillance.',
    work: 'At work, Aquarius thinks a system, a reform, a collective use. It would rather change the rule that produces the cases than repair the cases one by one.',
    grain: 'hold a rule that applies to more than oneself',
    tempo: 'a kept freedom and a group that does not demand fusion',
  },
  poissons: {
    sign: [
      'Pisces closes the tropical zodiac. Mutable water, ruled by Jupiter in the tradition and by Neptune in modern rulership. The sign catches a climate before it draws an outline.',
      'Porosity is a skill and a risk. Pisces joins what others separate, and it gets lost if no edge is given back to it.',
    ],
    rising: [
      'Pisces rising makes the first contact softer, sometimes hard to pin down. Neptune and Jupiter on the ascendant catch the mood of a place before a firm definition. You may seem gentle, dreamy, or simply unbordered.',
      'Without a precise hour and a historical zone, this ascendant cannot be calculated. A Pisces Sun says nothing about the first house.',
    ],
    love: 'In love, Pisces attaches to an atmosphere as much as to a person. It needs gentleness and a light frame, or empathy blurs into fusion.',
    work: 'At work, Pisces imagines, listens, and connects vague requests. It is valuable when meaning matters, and it needs another sign to hold the deadline.',
    grain: 'catch the climate before drawing an edge',
    tempo: 'a true atmosphere and an outline that does not close too fast',
  },
};

const ES: Record<SignId, SignDossier> = {
  belier: {
    sign: [
      'Aries abre el zodiaco tropical en el equinoccio de marzo. Fuego cardinal regido por Marte: el gesto va antes del balance, y la ira, cuando aparece, dura menos que el impulso.',
      'Este signo lleva mal la espera sin objeto. A veces confunde la velocidad con la dirección. Marte da el valor de empezar, no la prueba de que el blanco era el correcto.',
    ],
    rising: [
      'El ascendente Aries es la cúspide de la casa I, el umbral por el que te encuentran, no el signo solar. Marte en el ascendente vuelve la entrada directa, a veces brusca.',
      'Ese umbral exige la hora exacta y el huso histórico del lugar. Una hora falsa puede cambiar el signo. El ascendente Aries solo se lee si la hora de nacimiento se conoce.',
    ],
    love: 'En el amor, Aries quiere un sí claro. La ambigüedad cortés lo desgasta más que un no franco, y se compromete rápido cuando el vínculo se mueve.',
    work: 'En el trabajo lanza, discute un plazo y hace un prototipo. Mantener un proceso que ya funciona le interesa menos que abrir uno.',
    grain: 'salir antes de haber terminado de explicar',
    tempo: 'un plazo corto y un blanco visible',
  },
  taureau: {
    sign: [
      'Tauro es tierra fija regida por Venus. El Sol lo recorre a mitad de la primavera. El valor se juzga por lo que se toca, se guarda y se repite sin gastarse.',
      'El cambio no se niega por principio: se niega mientras no tenga una contrapartida concreta. La paciencia de Tauro se vuelve terquedad cuando el motivo para moverse sigue siendo abstracto.',
    ],
    rising: [
      'El ascendente Tauro frena la primera impresión. Venus en el ascendente da una presencia pausada y la necesidad de sentir que el lugar es habitable antes de mostrarse.',
      'Como todo ascendente, depende de la hora civil real, horario de verano histórico incluido. Sin esa hora se puede conocer un Sol en Tauro, no un Tauro ascendente.',
    ],
    love: 'En el amor, Tauro se ata a un cuerpo, a un ritmo y a pruebas materiales de continuidad. La promesa ligera no sustituye la presencia repetida.',
    work: 'En el trabajo sostiene un oficio y una carga en el tiempo. Se le puede confiar lo que debe seguir ahí dentro de seis meses.',
    grain: 'no soltar un bien ya ganado si la razón no se puede tocar',
    tempo: 'un ritmo estable y un objeto que se pueda guardar',
  },
  gemeaux: {
    sign: [
      'Géminis es aire mutable regido por Mercurio. El signo vive de vínculos, versiones y preguntas. Una sola explicación le parece pronto incompleta.',
      'La curiosidad es el motor, no la dispersión por sí misma. La trampa es coleccionar pistas hasta no saber cuál se había decidido seguir.',
    ],
    rising: [
      'El ascendente Géminis hace pasar el primer contacto por la palabra. Mercurio en el ascendente cambia la impresión deprisa: una pregunta, un rasgo, y ya otro tema.',
      'La hora de nacimiento decide este ascendente. Un Sol en Géminis describe un Sol; Géminis ascendente describe la puerta de la carta, y pueden no coincidir.',
    ],
    love: 'En el amor, Géminis necesita que la conversación siga viva. El silencio largo se lee como ausencia, aunque el apego sea real.',
    work: 'En el trabajo conecta personas, ideas y expedientes. Abre un tema y lo traduce con facilidad; le cuesta cerrarlo mientras queden matices.',
    grain: 'abrir tres pistas antes de cerrar una',
    tempo: 'una conversación a la que se le permite cambiar de tema',
  },
  cancer: {
    sign: [
      'Cáncer es agua cardinal regida por la Luna. Abre el verano tropical. El movimiento del signo es proteger un adentro: una casa, un círculo, una memoria.',
      'El humor cuenta tanto como el argumento. Cáncer decide a menudo según si el lugar es seguro. Es otro criterio, no una falta de juicio.',
    ],
    rising: [
      'El ascendente Cáncer pone la reserva delante. La Luna en el ascendente prueba el clima de una sala antes de mostrar mucho. Pueden leerte cautela donde el interior ya está comprometido.',
      'El cálculo se mueve con la hora y con el huso vigente ese día. El ascendente Cáncer desaparece de la carta si la hora es inventada o redondeada de más.',
    ],
    love: 'En el amor, Cáncer se compromete cuando el vínculo puede volverse refugio. Guarda fechas y tonos de voz, y se cierra si la intimidad se expone demasiado pronto.',
    work: 'En el trabajo sostiene un equipo, una clientela, una continuidad. Ve lo que otros olvidan preguntar. La presión pública constante lo desgasta más que la carga.',
    grain: 'comprobar primero si el lugar es seguro',
    tempo: 'un círculo protegido y memoria para el detalle',
  },
  lion: {
    sign: [
      'Leo es fuego fijo regido por el Sol. Ocupa el centro del verano. La pregunta del signo no es empezar, sino seguir visible sin apagarse.',
      'El calor es real y el orgullo también. Leo da mucho cuando se lo reconoce, y retira la escena cuando se lo trata como decorado.',
    ],
    rising: [
      'El ascendente Leo se nota al entrar. El Sol en el ascendente da porte y el cuidado de no llegar borrado. El calor se ve antes de que se oiga el fondo.',
      'No se deduce del mes de nacimiento. Solo la hora, convertida con el huso histórico, coloca a Leo en la casa I.',
    ],
    love: 'En el amor, Leo quiere ser elegido a la luz del día. La tibieza se lee como indiferencia, y la lealtad se muestra en el lugar que se le hace.',
    work: 'En el trabajo lleva un papel, un nombre, una responsabilidad visible. Anima y representa. El trabajo anónimo y largo le pesa si no hay ninguna escena.',
    grain: 'sostener el centro sin disculparse por estar ahí',
    tempo: 'un reconocimiento visible y un papel de verdad sostenido',
  },
  vierge: {
    sign: [
      'Virgo es tierra mutable regida por Mercurio. Ordena, corrige y devuelve las cosas a un sitio útil. El detalle no es una manía: es el modo en que el signo vuelve el mundo utilizable.',
      'El riesgo es no declarar nunca el trabajo terminado. Mercurio aquí no colecciona versiones como en Géminis: separa lo justo de lo aproximado.',
    ],
    rising: [
      'El ascendente Virgo da un primer contacto preciso, a veces reservado. Observa, ordena y habla poco mientras la frase no es exacta. Otros pueden leer frialdad donde hay atención.',
      'Sin hora exacta, este ascendente es solo una hipótesis. El Sol en Virgo describe un Sol; Virgo ascendente describe la puerta.',
    ],
    love: 'En el amor, Virgo muestra el apego arreglando cosas concretas. Necesita que el vínculo sea justo en lo cotidiano, no solo declarado.',
    work: 'En el trabajo mejora un proceso, caza el error y sostiene un nivel. Se la busca cuando la calidad importa más que el anuncio.',
    grain: 'separar lo exacto de lo aproximado',
    tempo: 'un detalle comprobado antes de decir que está listo',
  },
  balance: {
    sign: [
      'Libra es aire cardinal regido por Venus. Abre el otoño tropical. El signo no se piensa solo: una decisión solo es buena si la relación que crea sigue siendo viable.',
      'El sentido de la equidad puede retrasar la elección. Libra no carece de deseo; rechaza que un deseo de un solo lado haga de acuerdo.',
    ],
    rising: [
      'El ascendente Libra aborda al otro con cortesía. Venus en el ascendente busca la mirada, el equilibrio, la forma justa. El desacuerdo existe, pero no se pone delante en el primer minuto.',
      'Esta puerta se calcula a la hora. Un Sol en Libra puede tener otro ascendente, y otro Sol puede presentarse con Libra ascendente.',
    ],
    love: 'En el amor, Libra busca un dúo legible. Cuida la manera, oye las dos versiones y se aparta si el vínculo exige un ganador permanente.',
    work: 'En el trabajo negocia, da forma y sostiene un marco entre intereses. Es útil donde hace falta un acuerdo visible.',
    grain: 'buscar un acuerdo que dos personas puedan sostener',
    tempo: 'una forma justa y un dúo legible',
  },
  scorpion: {
    sign: [
      'Escorpio es agua fija. La tradición lo pone bajo Marte; la regencia moderna añade Plutón. Poco se da en la superficie: el signo busca lo que queda cuando se retira la versión oficial.',
      'La lealtad es exigente y la memoria larga. Escorpio no confunde intensidad con ruido. Puede callar mucho tiempo y no por eso pensar menos.',
    ],
    rising: [
      'El ascendente Escorpio retiene el primer contacto. La mirada se sostiene, poco se ofrece de entrada y la confianza no se coloca en el primer intercambio.',
      'La hora exacta es indispensable. Sin ella se puede hablar de un Sol en Escorpio, no de esta puerta.',
    ],
    love: 'En el amor, Escorpio quiere una verdad mantenida, no una ligereza de paso. La media confidencia lo cierra más que un conflicto franco.',
    work: 'En el trabajo excava un expediente, guarda un secreto profesional y atraviesa una crisis. Está hecho para lo que debe verse hasta el fondo.',
    grain: 'no soltar mientras la versión oficial siga incompleta',
    tempo: 'una confianza rara y una memoria larga',
  },
  sagittaire: {
    sign: [
      'Sagitario es fuego mutable regido por Júpiter. Ensancha: una idea, un camino, una creencia que tiene que poder comprobarse más lejos de la sala donde nació.',
      'La franqueza es una herramienta y a veces un golpe. El signo detesta el marco demasiado pequeño y puede irse antes de haber cumplido una promesa muy precisa.',
    ],
    rising: [
      'El ascendente Sagitario entra de forma abierta. Júpiter en el ascendente da una franqueza visible y un impulso hacia algo más amplio.',
      'No es el Sol en Sagitario. El ascendente se decide por la hora y el lugar, huso histórico incluido. Sin eso, sigue siendo desconocido.',
    ],
    love: 'En el amor, Sagitario necesita aire y un horizonte común. Se ata a alguien con quien todavía se puede mover, aprender y hablar sin protocolo.',
    work: 'En el trabajo abre un mercado, una enseñanza, un desplazamiento. Sostiene mal un detalle repetitivo si no ve la dirección.',
    grain: 'ensanchar el mapa antes de cerrar el expediente',
    tempo: 'un horizonte y el derecho a decir las cosas con franqueza',
  },
  capricorne: {
    sign: [
      'Capricornio es tierra cardinal regida por Saturno. Abre el invierno tropical. El signo construye para que la obra siga ahí cuando el humor ya pasó.',
      'La seriedad no es toda la persona, pero es lo que muestra primero. Saturno pide un tiempo largo y castiga la promesa sin calendario.',
    ],
    rising: [
      'El ascendente Capricornio sostiene la imagen. Saturno en el ascendente da un dominio visible y un sentido del deber, aunque el interior sea menos rígido que la puerta.',
      'La hora de nacimiento, y el desfase real de ese día, deciden este Saturno. Un Sol en Capricornio no lo sustituye.',
    ],
    love: 'En el amor, Capricornio se compromete con actos que duran: tiempo, una estructura, una palabra cumplida. La demostración sin continuación lo convence poco.',
    work: 'En el trabajo apunta a un piso, una carga, una competencia que se acumula. Respeta el esfuerzo visible y desconfía del anuncio sin entrega.',
    grain: 'contar solo lo que sigue en pie dentro de un año',
    tempo: 'un calendario y una carga que se pueda asumir',
  },
  verseau: {
    sign: [
      'Acuario es aire fijo. Saturno lo rige en la tradición; Urano se añade en la regencia moderna. El signo guarda una distancia amable y una regla que debería valer más allá del caso personal.',
      'Entra en el grupo sin fundirse. La independencia no es un capricho: es el rechazo de un «nosotros» que borra la diferencia.',
    ],
    rising: [
      'El ascendente Acuario marca una diferencia desde la entrada. La distancia sigue siendo cordial. Se te lee como alguien que participa sin dejarse definir por el medio.',
      'Urano y Saturno solo se colocan en la casa I con la hora exacta. El Sol en Acuario y Acuario ascendente son dos hechos distintos.',
    ],
    love: 'En el amor, Acuario necesita un vínculo que deje aire y una amistad dentro del deseo. Se cierra si el apego se vuelve vigilancia.',
    work: 'En el trabajo piensa un sistema, una reforma, un uso colectivo. Prefiere cambiar la regla que produce los casos antes que repararlos uno por uno.',
    grain: 'sostener una regla que vale para más que uno mismo',
    tempo: 'una libertad guardada y un grupo que no exige la fusión',
  },
  poissons: {
    sign: [
      'Piscis cierra el zodiaco tropical. Agua mutable, regida por Júpiter en la tradición y por Neptuno en la regencia moderna. El signo siente un clima antes de poner un contorno.',
      'La porosidad es una competencia y un riesgo. Piscis une lo que otros separan, y se pierde si no se le devuelve un borde.',
    ],
    rising: [
      'El ascendente Piscis vuelve el primer contacto más flexible, a veces difícil de situar. Neptuno y Júpiter en el ascendente captan el ambiente antes de definirse.',
      'Sin hora precisa y sin huso histórico, este ascendente no se calcula. El Sol en Piscis no dice nada de la casa I.',
    ],
    love: 'En el amor, Piscis se ata a una atmósfera tanto como a una persona. Necesita dulzura y un marco ligero, si no la empatía se confunde con la fusión.',
    work: 'En el trabajo imagina, escucha y une pedidos borrosos. Es valioso cuando importa el sentido, y necesita que otro signo sostenga el plazo.',
    grain: 'sentir el clima antes de poner un borde',
    tempo: 'una atmósfera verdadera y un contorno que no se cierra demasiado pronto',
  },
};

const DE: Record<SignId, SignDossier> = {
  belier: {
    sign: [
      'Der Widder eröffnet den tropischen Tierkreis zur März-Tagundnachtgleiche. Kardinales Feuer, von Mars regiert: die Bewegung kommt vor der Bilanz, und der Zorn, wenn er kommt, brennt kürzer als der Impuls.',
      'Dieses Zeichen erträgt Warten ohne Gegenstand schlecht. Es verwechselt Tempo manchmal mit Richtung. Mars gibt den Mut anzufangen, nicht den Beweis, dass das Ziel das richtige war.',
    ],
    rising: [
      'Der Aszendent Widder ist die Spitze des ersten Hauses, die Schwelle, an der andere dich treffen, nicht das Sonnenzeichen. Mars am Aszendenten macht den Eintritt direkt, manchmal schroff.',
      'Diese Schwelle braucht die genaue Geburtszeit und die historische Zeitzone des Ortes. Eine falsche Stunde kann das Zeichen wechseln.',
    ],
    love: 'In der Liebe will der Widder ein klares Ja. Höfliche Unklarheit zermürbt ihn mehr als ein deutliches Nein, und er bindet sich schnell, sobald die Beziehung sich bewegt.',
    work: 'Bei der Arbeit startet er, streitet eine Frist, baut einen Prototyp. Einen laufenden Prozess zu pflegen interessiert ihn weniger, als einen zu öffnen.',
    grain: 'losgehen, bevor die Erklärung zu Ende ist',
    tempo: 'eine kurze Frist und ein sichtbares Ziel',
  },
  taureau: {
    sign: [
      'Der Stier ist fixe Erde, von Venus regiert. Die Sonne durchläuft ihn im mittleren Frühling. Wert bemisst sich an dem, was man anfassen, behalten und wiederholen kann, ohne dass es sich abnutzt.',
      'Veränderung wird nicht aus Prinzip abgelehnt. Sie wird abgelehnt, solange sie keinen greifbaren Gegenwert hat.',
    ],
    rising: [
      'Der Aszendent Stier verlangsamt den ersten Eindruck. Venus am Aszendenten gibt eine unaufgeregte Gegenwart und das Bedürfnis, einen Ort erst bewohnbar zu finden.',
      'Wie jeder Aszendent hängt er von der wirklichen bürgerlichen Zeit ab, historische Sommerzeit eingeschlossen. Ohne diese Stunde kennt man eine Sonne im Stier, nicht den steigenden Stier.',
    ],
    love: 'In der Liebe bindet sich der Stier an einen Körper, einen Rhythmus und an materielle Beweise von Dauer. Ein leichtes Versprechen ersetzt keine wiederholte Gegenwart.',
    work: 'Bei der Arbeit hält er ein Können und eine Last über die Zeit. Ihm kann anvertraut werden, was in sechs Monaten noch da sein muss.',
    grain: 'etwas Erworbenes nur gegen einen greifbaren Grund loslassen',
    tempo: 'ein stetiger Rhythmus und ein Gegenstand, den man behalten kann',
  },
  gemeaux: {
    sign: [
      'Die Zwillinge sind veränderliche Luft, von Merkur regiert. Das Zeichen lebt von Verbindungen, Versionen und Fragen. Eine einzige Erklärung wirkt schnell unvollständig.',
      'Neugier ist der Motor, nicht Zerstreuung um ihrer selbst willen. Die Falle ist, Spuren zu sammeln, bis unklar wird, welcher man folgen wollte.',
    ],
    rising: [
      'Der Aszendent Zwillinge schickt den ersten Kontakt durch die Sprache. Merkur am Aszendenten wechselt den Eindruck schnell: eine Frage, ein Einfall, schon das nächste Thema.',
      'Die Geburtszeit entscheidet diesen Aszendenten. Eine Sonne in den Zwillingen beschreibt eine Sonne; Zwillinge am Aszendenten beschreiben die Tür des Horoskops.',
    ],
    love: 'In der Liebe brauchen die Zwillinge ein Gespräch, das lebendig bleibt. Langes Schweigen wird als Abwesenheit gelesen, auch wenn die Bindung echt ist.',
    work: 'Bei der Arbeit verbinden sie Menschen, Ideen und Akten. Ein Thema zu öffnen und zu übersetzen liegt ihnen; es zu schließen, solange Nuancen offen sind, weniger.',
    grain: 'drei Spuren öffnen, bevor eine geschlossen wird',
    tempo: 'ein Gespräch, das das Thema wechseln darf',
  },
  cancer: {
    sign: [
      'Der Krebs ist kardinales Wasser, vom Mond regiert. Er eröffnet den tropischen Sommer. Die Bewegung des Zeichens ist, ein Innen zu schützen: ein Zuhause, einen Kreis, eine Erinnerung.',
      'Die Stimmung zählt so viel wie das Argument. Der Krebs entscheidet oft danach, ob ein Ort sicher ist. Das ist ein anderes Kriterium, kein Mangel an Urteil.',
    ],
    rising: [
      'Der Aszendent Krebs stellt die Zurückhaltung nach vorn. Der Mond am Aszendenten prüft das Klima eines Raums, bevor viel gezeigt wird.',
      'Die Rechnung wandert mit der Stunde und mit der Zone, die an diesem Tag galt. Ohne verlässliche Zeit fällt dieser Aszendent aus.',
    ],
    love: 'In der Liebe bindet sich der Krebs, wenn die Beziehung ein Schutz werden kann. Er merkt sich Daten und Tonfälle und schließt sich, wenn Intimität zu früh ausgestellt wird.',
    work: 'Bei der Arbeit hält er ein Team, eine Kundschaft, eine Kontinuität. Ständiger öffentlicher Druck zermürbt ihn mehr als die Last selbst.',
    grain: 'zuerst prüfen, ob der Ort sicher ist',
    tempo: 'ein geschützter Kreis und ein Gedächtnis für Details',
  },
  lion: {
    sign: [
      'Der Löwe ist fixes Feuer, von der Sonne regiert. Er hält die Mitte des Sommers. Die Frage des Zeichens ist nicht das Anfangen, sondern sichtbar zu bleiben, ohne zu verglühen.',
      'Die Wärme ist echt, der Stolz auch. Der Löwe gibt viel, wenn man ihn erkennt, und er nimmt die Bühne zurück, wenn man ihn als Dekor behandelt.',
    ],
    rising: [
      'Der Aszendent Löwe fällt beim Eintreten auf. Die Sonne am Aszendenten gibt Haltung und den Unwillen, ausgelöscht anzukommen. Wärme zeigt sich, bevor der Inhalt gehört wird.',
      'Er lässt sich nicht aus dem Geburtsmonat ableiten. Nur die Stunde, umgerechnet mit der historischen Zone, setzt den Löwen auf das erste Haus.',
    ],
    love: 'In der Liebe will der Löwe bei Tageslicht gewählt werden. Lauheit liest er als Gleichgültigkeit, und Treue zeigt sich an dem Platz, den man ihm gibt.',
    work: 'Bei der Arbeit trägt er eine Rolle, einen Namen, eine sichtbare Verantwortung. Lange anonyme Arbeit lastet, wenn es gar keine Bühne gibt.',
    grain: 'die Mitte halten, ohne sich dafür zu entschuldigen',
    tempo: 'sichtbare Anerkennung und eine Rolle, die wirklich gehalten wird',
  },
  vierge: {
    sign: [
      'Die Jungfrau ist veränderliche Erde, von Merkur regiert. Sie sortiert, korrigiert und stellt zurück, was brauchbar sein soll. Das Detail ist keine Marotte: so macht das Zeichen die Welt benutzbar.',
      'Das Risiko ist, die Arbeit nie für fertig zu erklären. Merkur trennt hier das Genaue vom Ungefähren, statt wie bei den Zwillingen Versionen zu sammeln.',
    ],
    rising: [
      'Der Aszendent Jungfrau macht den ersten Kontakt genau, manchmal zurückhaltend. Beobachten, ordnen, wenig sagen, solange der Satz nicht stimmt.',
      'Ohne genaue Stunde ist dieser Aszendent nur eine Vermutung. Eine Sonne in der Jungfrau ersetzt die Tür nicht.',
    ],
    love: 'In der Liebe zeigt die Jungfrau Bindung, indem sie Konkretes in Ordnung bringt. Der Alltag muss stimmen, nicht nur die Erklärung.',
    work: 'Bei der Arbeit verbessert sie einen Prozess, jagt den Fehler und hält ein Niveau. Man holt sie, wenn Qualität mehr zählt als die Ankündigung.',
    grain: 'das Genaue vom Ungefähren trennen',
    tempo: 'ein geprüftes Detail, bevor jemand fertig sagt',
  },
  balance: {
    sign: [
      'Die Waage ist kardinale Luft, von Venus regiert. Sie eröffnet den tropischen Herbst. Das Zeichen denkt sich nicht allein: eine Entscheidung gilt erst, wenn die Beziehung, die sie schafft, noch tragfähig ist.',
      'Der Sinn für Billigkeit kann die Wahl verzögern. Der Waage fehlt das Begehren nicht. Sie lehnt ab, dass ein einseitiges Begehren als Einigung gilt.',
    ],
    rising: [
      'Der Aszendent Waage begegnet dem anderen mit Höflichkeit. Venus am Aszendenten sucht den Blick, das Gleichgewicht, die richtige Form. Widerspruch gibt es, er steht aber nicht in der ersten Minute vorn.',
      'Diese Tür wird auf die Stunde berechnet. Eine Sonne in der Waage kann einen anderen Aszendenten haben.',
    ],
    love: 'In der Liebe sucht die Waage ein lesbares Duo. Sie pflegt die Form, hört beide Versionen und tritt zurück, wenn die Bindung einen dauernden Sieger verlangt.',
    work: 'Bei der Arbeit verhandelt sie, formt und hält einen Rahmen zwischen Interessen. Nützlich, wo eine sichtbare Einigung nötig ist.',
    grain: 'eine Einigung suchen, die zwei Menschen noch tragen können',
    tempo: 'eine faire Form und ein lesbares Duo',
  },
  scorpion: {
    sign: [
      'Der Skorpion ist fixes Wasser. Die Tradition stellt ihn unter Mars; die moderne Würde fügt Pluto hinzu. An der Oberfläche wird wenig gegeben: das Zeichen sucht, was bleibt, wenn die offizielle Version weg ist.',
      'Loyalität ist anspruchsvoll, das Gedächtnis lang. Der Skorpion verwechselt Intensität nicht mit Lärm. Er kann lange schweigen und trotzdem denken.',
    ],
    rising: [
      'Der Aszendent Skorpion hält den ersten Kontakt zurück. Der Blick bleibt, wenig wird sofort gegeben, und Vertrauen steht nicht im ersten Austausch.',
      'Die genaue Stunde ist nötig. Ohne sie lässt sich über eine Sonne im Skorpion sprechen, nicht über diese Tür.',
    ],
    love: 'In der Liebe will der Skorpion eine Wahrheit, die gehalten wird, keine vorübergehende Leichtigkeit. Eine halbe Vertrautheit schließt ihn sicherer als ein offener Streit.',
    work: 'Bei der Arbeit gräbt er eine Akte, wahrt ein Berufsgeheimnis und bleibt in einer Krise. Er ist für das gebaut, was bis zum Grund gesehen werden muss.',
    grain: 'nicht loslassen, solange die offizielle Version unvollständig ist',
    tempo: 'seltenes Vertrauen und ein langes Gedächtnis',
  },
  sagittaire: {
    sign: [
      'Der Schütze ist veränderliches Feuer, von Jupiter regiert. Er weitet: eine Idee, eine Straße, einen Glauben, der weiter geprüft werden muss als der Raum, in dem er entstand.',
      'Offenheit ist ein Werkzeug und manchmal ein Stoß. Das Zeichen hasst einen zu engen Rahmen und kann gehen, bevor ein sehr genaues Versprechen gehalten ist.',
    ],
    rising: [
      'Der Aszendent Schütze tritt offen ein. Jupiter am Aszendenten gibt eine sichtbare Offenheit und einen Zug ins Weitere.',
      'Das ist nicht die Sonne im Schützen. Der Aszendent entscheidet sich über Stunde und Ort, historische Zone eingeschlossen.',
    ],
    love: 'In der Liebe braucht der Schütze Luft und einen gemeinsamen Horizont. Er bindet sich an jemanden, mit dem man sich noch bewegen, lernen und ohne Protokoll sprechen kann.',
    work: 'Bei der Arbeit öffnet er einen Markt, eine Lehre, eine Reise. Ein wiederkehrendes Detail hält er schlecht, wenn er die Richtung nicht sieht.',
    grain: 'die Karte weiten, bevor die Akte geschlossen wird',
    tempo: 'einen Horizont und das Recht, die Dinge offen zu sagen',
  },
  capricorne: {
    sign: [
      'Der Steinbock ist kardinale Erde, von Saturn regiert. Er eröffnet den tropischen Winter. Das Zeichen baut, damit das Werk noch da ist, wenn die Stimmung vorbei ist.',
      'Ernst ist nicht die ganze Person, aber er zeigt sich zuerst. Saturn verlangt eine lange Zeit und bestraft ein Versprechen ohne Kalender.',
    ],
    rising: [
      'Der Aszendent Steinbock hält das Bild. Saturn am Aszendenten gibt eine gezeigte Beherrschung und eine sichtbare Pflicht, auch wenn das Innere weniger streng ist als die Tür.',
      'Geburtszeit und der wirkliche Versatz jenes Tages entscheiden diesen Saturn. Eine Sonne im Steinbock ersetzt ihn nicht.',
    ],
    love: 'In der Liebe bindet sich der Steinbock durch Taten, die dauern: Zeit, eine Struktur, ein gehaltenes Wort. Eine Geste ohne Folge überzeugt ihn wenig.',
    work: 'Bei der Arbeit zielt er auf eine Stufe, eine Last, eine Fähigkeit, die sich anhäuft. Er achtet sichtbare Mühe und misstraut einer Ankündigung ohne Lieferung.',
    grain: 'nur zählen, was in einem Jahr noch steht',
    tempo: 'einen Kalender und eine Last, die sich tragen lässt',
  },
  verseau: {
    sign: [
      'Der Wassermann ist fixe Luft. Saturn regiert ihn in der Tradition; Uranus kommt in der modernen Würde dazu. Das Zeichen hält eine freundliche Distanz und eine Regel, die über den persönlichen Fall hinaus gelten sollte.',
      'Er tritt in die Gruppe, ohne in ihr zu verschwinden. Unabhängigkeit ist keine Laune, sondern die Weigerung eines Wir, das den Unterschied löscht.',
    ],
    rising: [
      'Der Aszendent Wassermann markiert schon am Eintritt einen Unterschied. Die Distanz bleibt höflich. Man liest dich als jemanden, der mitmacht, ohne sich vom Raum definieren zu lassen.',
      'Uranus und Saturn liegen nur durch die genaue Stunde auf dem ersten Haus. Sonne im Wassermann und Wassermann am Aszendenten sind zwei verschiedene Tatsachen.',
    ],
    love: 'In der Liebe braucht der Wassermann eine Bindung, die Luft lässt, und Freundschaft mitten im Begehren. Er sperrt sich, wenn Anhänglichkeit zur Überwachung wird.',
    work: 'Bei der Arbeit denkt er ein System, eine Reform, einen kollektiven Gebrauch. Lieber die Regel ändern, die die Fälle erzeugt, als die Fälle einzeln flicken.',
    grain: 'eine Regel halten, die für mehr gilt als für einen selbst',
    tempo: 'eine bewahrte Freiheit und eine Gruppe, die keine Fusion verlangt',
  },
  poissons: {
    sign: [
      'Die Fische schließen den tropischen Tierkreis. Veränderliches Wasser, traditionell von Jupiter regiert und modern von Neptun. Das Zeichen fasst ein Klima, bevor es eine Kontur zieht.',
      'Durchlässigkeit ist eine Fähigkeit und ein Risiko. Die Fische verbinden, was andere trennen, und sie verlieren sich, wenn ihnen kein Rand zurückgegeben wird.',
    ],
    rising: [
      'Der Aszendent Fische macht den ersten Kontakt weicher, manchmal schwer zu fassen. Neptun und Jupiter am Aszendenten nehmen die Stimmung eines Ortes wahr, bevor eine feste Definition kommt.',
      'Ohne genaue Stunde und historische Zone lässt sich dieser Aszendent nicht rechnen. Eine Sonne in den Fischen sagt nichts über das erste Haus.',
    ],
    love: 'In der Liebe binden sich die Fische an eine Atmosphäre so sehr wie an eine Person. Sie brauchen Sanftheit und einen leichten Rahmen, sonst wird Empathie zur Fusion.',
    work: 'Bei der Arbeit stellen sie sich vor, hören zu und verbinden unscharfe Aufträge. Wertvoll, wenn der Sinn zählt; sie brauchen ein anderes Zeichen für die Frist.',
    grain: 'das Klima fassen, bevor ein Rand gezogen wird',
    tempo: 'eine echte Atmosphäre und eine Kontur, die sich nicht zu schnell schließt',
  },
};

const IT: Record<SignId, SignDossier> = {
  belier: {
    sign: [
      'L’Ariete apre lo zodiaco tropicale all’equinozio di marzo. Fuoco cardinale retto da Marte: il gesto precede il bilancio, e la collera, quando arriva, dura meno dell’impulso.',
      'Questo segno sopporta male l’attesa senza oggetto. A volte confonde la velocità con la direzione. Marte dà il coraggio di cominciare, non la prova che il bersaglio fosse quello giusto.',
    ],
    rising: [
      'L’ascendente Ariete è la cuspide della casa I, la soglia da cui gli altri ti incontrano, non il segno solare. Marte all’ascendente rende l’ingresso diretto, a volte brusco.',
      'Quella soglia richiede l’ora esatta e il fuso storico del luogo. Un’ora sbagliata può cambiare il segno. L’Ariete ascendente si legge solo se l’ora di nascita è nota.',
    ],
    love: 'In amore l’Ariete vuole un sì chiaro. L’ambiguità cortese lo logora più di un no netto, e si impegna in fretta appena il legame si muove.',
    work: 'Al lavoro lancia, contesta una scadenza, fa un prototipo. Tenere un processo già stabile lo interessa meno che aprirne uno.',
    grain: 'partire prima di aver finito di spiegare',
    tempo: 'una scadenza breve e un bersaglio visibile',
  },
  taureau: {
    sign: [
      'Il Toro è terra fissa retta da Venere. Il Sole lo percorre a metà primavera. Il valore si giudica da ciò che si tocca, si custodisce e si ripete senza consumarsi.',
      'Il cambiamento non si rifiuta per principio: si rifiuta finché non ha un corrispettivo concreto. La pazienza del Toro diventa ostinazione quando il motivo per muoversi resta astratto.',
    ],
    rising: [
      'L’ascendente Toro rallenta la prima impressione. Venere all’ascendente dà una presenza posata e il bisogno di sentire che un luogo è abitabile prima di mostrarsi.',
      'Come ogni ascendente, dipende dall’ora civile reale, ora legale storica compresa. Senza quell’ora si può conoscere un Sole in Toro, non il Toro ascendente.',
    ],
    love: 'In amore il Toro si lega a un corpo, a un ritmo e a prove materiali di continuità. La promessa leggera non sostituisce la presenza ripetuta.',
    work: 'Al lavoro tiene un mestiere e un carico nel tempo. Gli si può affidare ciò che deve esserci ancora fra sei mesi.',
    grain: 'non mollare un acquisito se la ragione non si può toccare',
    tempo: 'un ritmo stabile e un oggetto che si possa custodire',
  },
  gemeaux: {
    sign: [
      'I Gemelli sono aria mobile retta da Mercurio. Il segno vive di legami, versioni e domande. Una sola spiegazione gli sembra presto incompleta.',
      'La curiosità è il motore, non la dispersione per se stessa. La trappola è collezionare piste fino a non sapere più quale si era deciso di seguire.',
    ],
    rising: [
      'L’ascendente Gemelli fa passare il primo contatto dalla parola. Mercurio all’ascendente cambia l’impressione in fretta: una domanda, un tratto, e già un altro tema.',
      'L’ora di nascita decide questo ascendente. Un Sole nei Gemelli descrive un Sole; i Gemelli ascendenti descrivono la porta del tema, e possono non coincidere.',
    ],
    love: 'In amore i Gemelli hanno bisogno che la conversazione resti viva. Il silenzio lungo è letto come assenza, anche quando l’attaccamento è reale.',
    work: 'Al lavoro collegano persone, idee e fascicoli. Aprire un tema e tradurlo è facile; chiuderlo mentre restano sfumature lo è meno.',
    grain: 'aprire tre piste prima di chiuderne una',
    tempo: 'una conversazione a cui è permesso cambiare argomento',
  },
  cancer: {
    sign: [
      'Il Cancro è acqua cardinale retta dalla Luna. Apre l’estate tropicale. Il movimento del segno è proteggere un dentro: una casa, un cerchio, una memoria.',
      'L’umore conta quanto l’argomento. Il Cancro decide spesso secondo che il luogo sia sicuro o no. È un altro criterio, non un difetto di giudizio.',
    ],
    rising: [
      'L’ascendente Cancro mette la riserva davanti. La Luna all’ascendente prova il clima di una stanza prima di mostrare molto.',
      'Il calcolo si sposta con l’ora e con il fuso in vigore quel giorno. Senza un’ora affidabile questo ascendente non c’è.',
    ],
    love: 'In amore il Cancro si impegna quando il legame può diventare un riparo. Ricorda date e toni di voce, e si chiude se l’intimità è esposta troppo presto.',
    work: 'Al lavoro tiene una squadra, una clientela, una continuità. La pressione pubblica costante lo logora più del carico stesso.',
    grain: 'verificare prima se il luogo è sicuro',
    tempo: 'un cerchio protetto e una memoria dei dettagli',
  },
  lion: {
    sign: [
      'Il Leone è fuoco fisso retto dal Sole. Tiene il centro dell’estate. La domanda del segno non è cominciare, ma restare visibile senza spegnersi.',
      'Il calore è reale e lo è anche l’orgoglio. Il Leone dà molto quando è riconosciuto, e ritira la scena quando lo si tratta come un fondale.',
    ],
    rising: [
      'L’ascendente Leone si nota entrando. Il Sole all’ascendente dà un portamento e la cura di non arrivare cancellato. Il calore si vede prima che si senta il fondo.',
      'Non si deduce dal mese di nascita. Solo l’ora, convertita con il fuso storico, mette il Leone sulla casa I.',
    ],
    love: 'In amore il Leone vuole essere scelto in piena luce. La tiepidezza è letta come indifferenza, e la lealtà si mostra nel posto che gli si fa.',
    work: 'Al lavoro porta un ruolo, un nome, una responsabilità visibile. Il lavoro anonimo e lungo pesa se non c’è nessuna scena.',
    grain: 'tenere il centro senza scusarsi di esserci',
    tempo: 'un riconoscimento visibile e un ruolo davvero tenuto',
  },
  vierge: {
    sign: [
      'La Vergine è terra mobile retta da Mercurio. Ordina, corregge e rimette le cose dove servono. Il dettaglio non è un tic: è il modo in cui il segno rende il mondo utilizzabile.',
      'Il rischio è non dichiarare mai finito il lavoro. Mercurio qui separa il giusto dall’approssimativo, non colleziona versioni come nei Gemelli.',
    ],
    rising: [
      'L’ascendente Vergine rende il primo contatto preciso, a volte riservato. Osserva, sistema e parla poco finché la frase non è giusta.',
      'Senza l’ora esatta questo ascendente è solo un’ipotesi. Un Sole in Vergine non sostituisce la porta.',
    ],
    love: 'In amore la Vergine mostra l’attaccamento sistemando cose concrete. Ha bisogno che il legame sia giusto nel quotidiano, non solo dichiarato.',
    work: 'Al lavoro migliora un processo, cerca l’errore e tiene un livello. La si cerca quando la qualità conta più dell’annuncio.',
    grain: 'separare ciò che è esatto da ciò che è approssimativo',
    tempo: 'un dettaglio verificato prima di dire che è finito',
  },
  balance: {
    sign: [
      'La Bilancia è aria cardinale retta da Venere. Apre l’autunno tropicale. Il segno non si pensa da solo: una decisione è buona solo se la relazione che crea resta sostenibile.',
      'Il senso dell’equità può ritardare la scelta. Alla Bilancia il desiderio non manca; rifiuta che un desiderio di una parte sola faccia da accordo.',
    ],
    rising: [
      'L’ascendente Bilancia affronta l’altro con cortesia. Venere all’ascendente cerca lo sguardo, l’equilibrio, la forma giusta. Il disaccordo c’è, ma non si mette davanti nel primo minuto.',
      'Questa porta si calcola all’ora. Un Sole in Bilancia può avere un altro ascendente.',
    ],
    love: 'In amore la Bilancia cerca un duo leggibile. Cura il modo, ascolta le due versioni e si allontana se il legame esige un vincitore permanente.',
    work: 'Al lavoro negozia, dà forma e tiene un quadro fra interessi. È utile dove serve un accordo visibile.',
    grain: 'cercare un accordo che due persone possano ancora reggere',
    tempo: 'una forma giusta e un duo leggibile',
  },
  scorpion: {
    sign: [
      'Lo Scorpione è acqua fissa. La tradizione lo pone sotto Marte; la dignità moderna aggiunge Plutone. In superficie si dà poco: il segno cerca ciò che resta quando si toglie la versione ufficiale.',
      'La lealtà è esigente e la memoria lunga. Lo Scorpione non confonde intensità e rumore. Può tacere a lungo e non per questo pensare di meno.',
    ],
    rising: [
      'L’ascendente Scorpione trattiene il primo contatto. Lo sguardo resta, poco è offerto subito e la fiducia non si colloca al primo scambio.',
      'L’ora esatta è indispensabile. Senza di essa si può parlare di un Sole in Scorpione, non di questa porta.',
    ],
    love: 'In amore lo Scorpione vuole una verità tenuta, non una leggerezza di passaggio. La mezza confidenza lo chiude più di un conflitto franco.',
    work: 'Al lavoro scava un fascicolo, custodisce un segreto professionale e attraversa una crisi. È fatto per ciò che va visto fino in fondo.',
    grain: 'non mollare finché la versione ufficiale resta incompleta',
    tempo: 'una fiducia rara e una memoria lunga',
  },
  sagittaire: {
    sign: [
      'Il Sagittario è fuoco mobile retto da Giove. Allarga: un’idea, una strada, una credenza che deve potersi verificare più lontano della stanza in cui è nata.',
      'La franchezza è uno strumento e a volte un urto. Il segno detesta il quadro troppo piccolo e può partire prima di aver mantenuto una promessa molto precisa.',
    ],
    rising: [
      'L’ascendente Sagittario entra in modo aperto. Giove all’ascendente dà una franchezza visibile e uno slancio verso qualcosa di più ampio.',
      'Non è il Sole in Sagittario. L’ascendente si decide con l’ora e il luogo, fuso storico compreso.',
    ],
    love: 'In amore il Sagittario ha bisogno d’aria e di un orizzonte comune. Si lega a qualcuno con cui si può ancora muoversi, imparare e parlare senza protocollo.',
    work: 'Al lavoro apre un mercato, un insegnamento, uno spostamento. Tiene male un dettaglio ripetitivo se non vede la direzione.',
    grain: 'allargare la mappa prima di chiudere il fascicolo',
    tempo: 'un orizzonte e il diritto di dire le cose in modo franco',
  },
  capricorne: {
    sign: [
      'Il Capricorno è terra cardinale retta da Saturno. Apre l’inverno tropicale. Il segno costruisce perché l’opera resti quando l’umore è passato.',
      'La serietà non è tutta la persona, ma è ciò che mostra per primo. Saturno chiede un tempo lungo e punisce la promessa senza calendario.',
    ],
    rising: [
      'L’ascendente Capricorno tiene l’immagine. Saturno all’ascendente dà una padronanza visibile e un senso del dovere, anche quando l’interno è meno rigido della porta.',
      'L’ora di nascita, e lo scarto reale di quel giorno, decidono questo Saturno. Un Sole in Capricorno non lo sostituisce.',
    ],
    love: 'In amore il Capricorno si impegna con atti che durano: tempo, una struttura, una parola mantenuta. La dimostrazione senza seguito lo convince poco.',
    work: 'Al lavoro mira a un piano, a un carico, a una competenza che si accumula. Rispetta lo sforzo visibile e diffida dell’annuncio senza consegna.',
    grain: 'contare solo ciò che sta ancora in piedi fra un anno',
    tempo: 'un calendario e un carico che si possa sostenere',
  },
  verseau: {
    sign: [
      'L’Acquario è aria fissa. Saturno lo regge nella tradizione; Urano si aggiunge nella dignità moderna. Il segno tiene una distanza amichevole e una regola che dovrebbe valere oltre il caso personale.',
      'Entra nel gruppo senza fondersi. L’indipendenza non è un capriccio: è il rifiuto di un noi che cancella la differenza.',
    ],
    rising: [
      'L’ascendente Acquario segna una differenza già all’ingresso. La distanza resta cordiale. Ti si legge come qualcuno che partecipa senza lasciarsi definire dall’ambiente.',
      'Urano e Saturno finiscono sulla casa I solo con l’ora esatta. Il Sole in Acquario e l’Acquario ascendente sono due fatti distinti.',
    ],
    love: 'In amore l’Acquario ha bisogno di un legame che lasci aria e di un’amicizia dentro il desiderio. Si chiude se l’attaccamento diventa sorveglianza.',
    work: 'Al lavoro pensa un sistema, una riforma, un uso collettivo. Preferisce cambiare la regola che produce i casi piuttosto che ripararli uno per uno.',
    grain: 'tenere una regola che vale per più di sé',
    tempo: 'una libertà custodita e un gruppo che non esige la fusione',
  },
  poissons: {
    sign: [
      'I Pesci chiudono lo zodiaco tropicale. Acqua mobile, retta da Giove nella tradizione e da Nettuno nella dignità moderna. Il segno sente un clima prima di porre un contorno.',
      'La porosità è una competenza e un rischio. I Pesci uniscono ciò che altri separano, e si perdono se non gli si restituisce un bordo.',
    ],
    rising: [
      'L’ascendente Pesci rende il primo contatto più morbido, a volte difficile da circoscrivere. Nettuno e Giove all’ascendente colgono l’atmosfera prima di definirsi.',
      'Senza ora precisa e senza fuso storico questo ascendente non si calcola. Il Sole nei Pesci non dice nulla della casa I.',
    ],
    love: 'In amore i Pesci si legano a un’atmosfera quanto a una persona. Hanno bisogno di dolcezza e di un quadro leggero, altrimenti l’empatia si confonde con la fusione.',
    work: 'Al lavoro immaginano, ascoltano e collegano richieste sfocate. Sono preziosi quando conta il senso, e hanno bisogno che un altro segno tenga la scadenza.',
    grain: 'sentire il clima prima di porre un bordo',
    tempo: 'un’atmosfera vera e un contorno che non si chiuda troppo in fretta',
  },
};

export const DOSSIERS: Record<Locale, Record<SignId, SignDossier>> = {
  fr: FR,
  en: EN,
  es: ES,
  de: DE,
  it: IT,
};

export function dossier(locale: Locale, id: SignId): SignDossier {
  return DOSSIERS[locale][id];
}
