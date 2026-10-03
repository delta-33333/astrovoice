'use client';

import type { BirthData } from './types';

function fromSession(): BirthData | null {
  const raw = sessionStorage.getItem('birthData');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BirthData;
  } catch {
    sessionStorage.removeItem('birthData');
    return null;
  }
}

/**
 * Données de naissance : le compte fait foi (nouvel appareil, retour de paiement, autre onglet).
 * La copie sessionStorage ne sert que de secours hors connexion. Renvoie null s'il faut passer par /birth.
 */
export async function loadBirthData(): Promise<BirthData | null> {
  try {
    const response = await fetch('/api/birth-data', { cache: 'no-store' });
    if (response.ok) {
      const payload = (await response.json()) as { birthData?: BirthData | null };
      if (payload.birthData?.date && payload.birthData.place) {
        const data: BirthData = { ...payload.birthData, name: payload.birthData.name || 'Vous' };
        sessionStorage.setItem('birthData', JSON.stringify(data));
        return data;
      }
      return fromSession();
    }
  } catch {
    // réseau : on retombe sur la copie locale
  }
  return fromSession();
}
