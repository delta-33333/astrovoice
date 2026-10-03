// Types for the application
export interface BirthData {
  name: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM (optional)
  timeUnknown: boolean;
  place: string;
  latitude?: number;
  longitude?: number;
}

export type VoiceId = 'ara' | 'eve' | 'leo' | 'rex' | 'sal';

export type AdvisorBadge = 'nouveau' | 'populaire' | 'expert' | 'disponible';

/** Fiche publique renvoyée au navigateur. Jamais de persona ni de prompt. */
export interface PublicAdvisor {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  name: string;
  age: number;
  gender: 'femme' | 'homme';
  languages: string[];
  specialties: string[];
  readingStyle: string;
  bio: string;
  photoUrl: string | null;
  voiceId: VoiceId;
  featured: boolean;
  dailyCapacity: number;
  reviewCount: number;
  averageRating: number | null;
  bookingCount: number;
  badges: AdvisorBadge[];
}

export interface AdvisorAvailability {
  slotsToday: number;
  slotsWeek: number;
  nextSlotAt: string | null;
  hasImmediate: boolean;
  scarcity: string | null;
  immediateSlotId: string | null;
  immediateStartsAt: string | null;
}

export interface DirectoryAdvisor extends PublicAdvisor {
  availability: AdvisorAvailability;
}

export interface AdvisorSlot {
  id: string;
  startsAt: string;
  durationMin: number;
}

export interface NatalChart {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
}

export interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
}

export interface House {
  number: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

export interface CallSession {
  sessionId: string;
  birthData: BirthData;
  astrologerId: string;
  natalChart: NatalChart;
  startTime: number;
  stripePaymentIntentId: string;
}
