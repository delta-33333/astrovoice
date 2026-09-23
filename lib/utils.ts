// Utility functions

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function calculateCost(seconds: number): number {
  // Intro offer: first 2 minutes at $0.99, then $1.99/min
  // Formula: 
  // - 0-120s: $0.99 for 2 min = 99 cents total
  // - 120s+: 99 cents + ((seconds - 120) * 199 / 60) cents
  
  if (seconds <= 120) {
    // First 2 minutes flat rate
    return 99;
  } else {
    // Intro (99¢) + additional time at $1.99/min
    const additionalSeconds = seconds - 120;
    const additionalCost = Math.ceil((additionalSeconds * 199) / 60);
    return 99 + additionalCost;
  }
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
