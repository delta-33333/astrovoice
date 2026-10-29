/** Outils gratuits sans compte : chemins et calculs purs (testables). */
export type ToolLang = 'fr' | 'en' | 'es' | 'de' | 'it';

export const BIG_THREE_PATHS: Record<ToolLang, string> = {
  fr: '/fr/theme-astral-gratuit',
  en: '/en/free-birth-chart',
  es: '/es/carta-astral-gratis',
  de: '/de/geburtshoroskop-gratis',
  it: '/it/tema-natale-gratis',
};

export const MOON_PATHS: Record<ToolLang, string> = {
  fr: '/fr/lune-aujourdhui',
  en: '/en/moon-sign-today',
  es: '/es/luna-hoy',
  de: '/de/mond-heute',
  it: '/it/luna-oggi',
};

export const bigThreePath = (locale: ToolLang): string => BIG_THREE_PATHS[locale];
export const moonPath = (locale: ToolLang): string => MOON_PATHS[locale];

export type PhaseId =
  | 'new'
  | 'waxingCrescent'
  | 'firstQuarter'
  | 'waxingGibbous'
  | 'full'
  | 'waningGibbous'
  | 'lastQuarter'
  | 'waningCrescent';

const PHASES: PhaseId[] = ['new', 'waxingCrescent', 'firstQuarter', 'waxingGibbous', 'full', 'waningGibbous', 'lastQuarter', 'waningCrescent'];

/** Élongation Lune − Soleil (0–360°) → phase, illumination et sens. */
export function moonPhase(sunLon: number, moonLon: number): { id: PhaseId; illumination: number; elongation: number; waxing: boolean } {
  const elongation = (((moonLon - sunLon) % 360) + 360) % 360;
  const illumination = Math.round(((1 - Math.cos((elongation * Math.PI) / 180)) / 2) * 100);
  const index = Math.floor(((elongation + 22.5) % 360) / 45);
  return { id: PHASES[index], illumination, elongation, waxing: elongation < 180 };
}

/** Heures avant l’entrée dans le signe suivant (vitesse en °/jour). */
export function hoursToNextSign(longitude: number, speedPerDay: number): number | null {
  if (!Number.isFinite(speedPerDay) || speedPerDay <= 0) return null;
  const within = ((longitude % 30) + 30) % 30;
  return ((30 - within) / speedPerDay) * 24;
}
