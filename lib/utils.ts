// Utility functions

export { calculateCost, formatCurrency } from './pricing';

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export async function geocodePlace(place: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // Using Nominatim (OpenStreetMap) for free geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Lumen-Astrology/1.0',
        },
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export function validateBirthData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Le nom est requis');
  }
  
  if (!data.date) {
    errors.push('La date de naissance est requise');
  } else {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      errors.push('Date invalide');
    }
  }
  
  if (!data.timeUnknown && !data.time) {
    errors.push('L\'heure est requise (ou cochez "Heure inconnue")');
  }
  
  if (!data.place || data.place.trim().length === 0) {
    errors.push('Le lieu de naissance est requis');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
