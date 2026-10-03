/**
 * Libellé de disponibilité, sans rareté artificielle : les conseillers virtuels
 * répondent 24 h/24, on n’affiche que « Disponible maintenant » quand un créneau
 * immédiat existe réellement, sinon rien.
 */
export const AVAILABLE_NOW = 'Disponible maintenant';

export function availabilityLabel(now: Date, availableStarts: Date[]): string | null {
  return hasImmediateSlot(now, availableStarts) ? AVAILABLE_NOW : null;
}

export function hasImmediateSlot(now: Date, availableStarts: Date[]): boolean {
  const horizon = now.getTime() + 15 * 60 * 1000;
  return availableStarts.some((start) => {
    const time = start.getTime();
    return time > now.getTime() && time <= horizon;
  });
}
