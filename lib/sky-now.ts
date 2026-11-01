import { moonPhase, type PhaseId } from './free-tools.ts';
import { SIGN_IDS, signName, type SignId } from './zodiac/signs.ts';

/** Mini-lecture instantanée : signe solaire (date seule) + ciel réel du moment, sans compte. */
export type SkyNowLocale = 'fr' | 'en';

export interface SkyNowInput {
  /** Longitude du Soleil le jour de naissance (midi UTC). */
  natalSun: number;
  sunNow: number;
  moonNow: number;
  moonSpeed: number;
}

export interface SkyNowReading {
  sign: SignId;
  signLabel: string;
  cusp: boolean;
  moonSign: string;
  sunSign: string;
  phase: PhaseId;
  illumination: number;
  moonHouse: number;
  sunHouse: number;
  headline: string;
  lines: string[];
  question: string;
}

const HOUSES: Record<SkyNowLocale, string[]> = {
  fr: [
    'vous-même, votre énergie et la façon dont on vous perçoit',
    'l’argent, ce que vous valez et ce qui vous rassure',
    'les messages, les échanges et les petits déplacements',
    'la maison, la famille et ce qui vous ancre',
    'le plaisir, l’amour naissant et la créativité',
    'le quotidien, le travail et la santé',
    'le couple et les relations en face à face',
    'l’intimité, les liens profonds et ce qui se transforme',
    'les horizons lointains, les études et le sens',
    'la carrière, l’image publique et les objectifs',
    'les amis, les projets collectifs et les espoirs',
    'le repos, l’intériorité et ce qui se termine en silence',
  ],
  en: [
    'yourself, your energy and how others see you',
    'money, self-worth and what makes you feel safe',
    'messages, conversations and short trips',
    'home, family and what grounds you',
    'pleasure, new romance and creativity',
    'daily routine, work and health',
    'partnership and one-to-one relationships',
    'intimacy, deep bonds and what is transforming',
    'far horizons, learning and meaning',
    'career, public image and goals',
    'friends, group projects and hopes',
    'rest, inner life and what quietly ends',
  ],
};

const PHASES: Record<SkyNowLocale, Record<PhaseId, string>> = {
  fr: {
    new: 'nouvelle lune', waxingCrescent: 'premier croissant', firstQuarter: 'premier quartier', waxingGibbous: 'lune gibbeuse croissante',
    full: 'pleine lune', waningGibbous: 'lune gibbeuse décroissante', lastQuarter: 'dernier quartier', waningCrescent: 'dernier croissant',
  },
  en: {
    new: 'new moon', waxingCrescent: 'waxing crescent', firstQuarter: 'first quarter', waxingGibbous: 'waxing gibbous',
    full: 'full moon', waningGibbous: 'waning gibbous', lastQuarter: 'last quarter', waningCrescent: 'waning crescent',
  },
};

const norm = (lon: number) => ((lon % 360) + 360) % 360;
export const signIndexOf = (lon: number) => Math.floor(norm(lon) / 30);

/** Maison solaire (signe entier) d’un signe vu depuis le signe solaire. */
export function solarHouseFrom(natalIndex: number, transitIndex: number): number {
  return ((transitIndex - natalIndex + 12) % 12) + 1;
}

export function buildSkyNowReading(locale: SkyNowLocale, input: SkyNowInput): SkyNowReading {
  const natalIndex = signIndexOf(input.natalSun);
  const within = norm(input.natalSun) % 30;
  const cusp = within < 1 || within > 29;
  const sign = SIGN_IDS[natalIndex];
  const moonIndex = signIndexOf(input.moonNow);
  const sunIndex = signIndexOf(input.sunNow);
  const phase = moonPhase(input.sunNow, input.moonNow);
  const moonHouse = solarHouseFrom(natalIndex, moonIndex);
  const sunHouse = solarHouseFrom(natalIndex, sunIndex);
  const signLabel = signName(locale, sign);
  const moonSign = signName(locale, SIGN_IDS[moonIndex]);
  const sunSign = signName(locale, SIGN_IDS[sunIndex]);
  const phaseLabel = PHASES[locale][phase.id];
  const h = HOUSES[locale];
  if (locale === 'en') {
    return {
      sign, signLabel, cusp, moonSign, sunSign, phase: phase.id, illumination: phase.illumination, moonHouse, sunHouse,
      headline: `Your sky right now, ${signLabel}`,
      lines: [
        `The Moon is in ${moonSign} (${phaseLabel}, ${phase.illumination}% lit). For a ${signLabel} Sun, it crosses your solar house ${moonHouse}: ${h[moonHouse - 1]}. That is where your mood is likely to land over the next couple of days.`,
        `The Sun is in ${sunSign}, lighting your solar house ${sunHouse}: ${h[sunHouse - 1]}. That is the backdrop of the month.`,
      ],
      question: `What does this Moon in ${moonSign} change for me this week?`,
    };
  }
  return {
    sign, signLabel, cusp, moonSign, sunSign, phase: phase.id, illumination: phase.illumination, moonHouse, sunHouse,
    headline: `Votre ciel, en ce moment — ${signLabel}`,
    lines: [
      `La Lune est en ${moonSign} (${phaseLabel}, éclairée à ${phase.illumination} %). Pour un Soleil ${signLabel}, elle traverse votre maison solaire ${moonHouse} : ${h[moonHouse - 1]}. C’est là que votre humeur risque de se poser ces deux prochains jours.`,
      `Le Soleil est en ${sunSign} et éclaire votre maison solaire ${sunHouse} : ${h[sunHouse - 1]}. C’est la toile de fond du mois.`,
    ],
    question: `Qu’est-ce que cette Lune en ${moonSign} change pour moi cette semaine ?`,
  };
}
