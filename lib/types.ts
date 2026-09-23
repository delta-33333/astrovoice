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

export interface Astrologer {
  id: string;
  name: string;
  voice: 'ara' | 'eve' | 'leo' | 'rex' | 'sal';
  bio: string;
  specialties: string[];
  avatar: string;
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
