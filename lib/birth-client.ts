'use client';

import type { BirthData } from './types';

/**
 * Données de naissance pour l'appel : sessionStorage d'abord, sinon le profil enregistré
 * (nouvel appareil, nouvel onglet, reconnexion). Renvoie null s'il faut passer par /birth.
 */
export async function loadBirthData(): Promise<BirthData | null> {
  const raw = sessionStorage.getItem('birthData');
  if (raw) {
    try {
      return JSON.parse(raw) as BirthData;
    } catch {
      sessionStorage.removeItem('birthData');
    }
  }
  try {
    const response = await fetch('/api/birth-data', { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = (await response.json()) as { birthData?: BirthData | null };
    if (!payload.birthData?.date || !payload.birthData.place) return null;
    const data: BirthData = { ...payload.birthData, name: payload.birthData.name || 'Vous' };
    sessionStorage.setItem('birthData', JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}
