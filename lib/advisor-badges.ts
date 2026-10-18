export type AdvisorBadge = 'nouveau' | 'populaire' | 'expert' | 'disponible';

export const BADGE_LABELS: Record<AdvisorBadge, string> = {
  nouveau: 'Nouveau',
  populaire: 'Populaire',
  expert: 'Expert',
  disponible: 'Disponible maintenant',
};

export const LANGUAGE_LABELS: Record<string, string> = {
  fr: 'Français',
  en: 'Anglais',
  es: 'Espagnol',
  de: 'Allemand',
  it: 'Italien',
};

export const STYLE_LABELS: Record<string, string> = {
  doux: 'Doux',
  direct: 'Direct',
  mystique: 'Mystique',
  pragmatique: 'Pragmatique',
  poétique: 'Poétique',
  structuré: 'Structuré',
};

/**
 * Badges dérivés de données réelles.
 * Populaire n'apparaît qu'à partir d'un volume de réservations confirmées.
 * Nouveau tant qu'il y a moins de 5 avis réels.
 * Pas de badge fondé sur l’âge ou l’ancienneté : les conseillers sont virtuels.
 * « Disponible maintenant » est affiché à part (libellé de disponibilité), pas en badge.
 */
const NOUVEAU_MS = 14 * 24 * 60 * 60 * 1000;

export function advisorBadges(input: {
  reviewCount: number;
  specialties: string[];
  age: number;
  bookingCount?: number;
  hasImmediateSlot?: boolean;
  createdAt?: string | null;
  now?: number;
}): AdvisorBadge[] {
  const badges: AdvisorBadge[] = [];
  if (input.createdAt) {
    const created = Date.parse(input.createdAt);
    const now = input.now ?? Date.now();
    if (Number.isFinite(created) && now - created < NOUVEAU_MS && now >= created) badges.push('nouveau');
  }
  if ((input.bookingCount ?? 0) >= 8) badges.push('populaire');
  return badges;
}

/** Un badge porté par 20 % ou plus des fiches ne distingue plus personne. */
export function suppressCommonNouveau<T extends { badges: AdvisorBadge[] }>(advisors: T[]): T[] {
  if (advisors.length === 0) return advisors;
  const flagged = advisors.filter((advisor) => advisor.badges.includes('nouveau')).length;
  if (flagged / advisors.length < 0.2) return advisors;
  return advisors.map((advisor) => ({
    ...advisor,
    badges: advisor.badges.filter((badge) => badge !== 'nouveau'),
  }));
}

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code;
}

export function styleLabel(style: string): string {
  return STYLE_LABELS[style] ?? style;
}
