import { NextRequest, NextResponse } from 'next/server';
import { geocodePlace } from '@/lib/utils';

const ASTROLOGY_API_KEY = process.env.ASTROLOGY_API_KEY;
const ASTROLOGY_API_BASE = 'https://api.astrology-api.io';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, place, timeUnknown } = body;

    if (!date || !place) {
      return NextResponse.json(
        { error: 'Date et lieu requis' },
        { status: 400 }
      );
    }

    // Geocode the place
    const coords = await geocodePlace(place);
    if (!coords) {
      return NextResponse.json(
        { error: 'Lieu introuvable. Essayez avec ville, pays (ex: Paris, France)' },
        { status: 400 }
      );
    }

    // If API key is placeholder, return mock data
    if (!ASTROLOGY_API_KEY || ASTROLOGY_API_KEY === 'placeholder') {
      console.warn('⚠️ Using mock natal chart data (ASTROLOGY_API_KEY not configured)');
      return NextResponse.json({
        mock: true,
        planets: [
          { name: 'Sun', sign: 'Aries', degree: 15.5, house: 10 },
          { name: 'Moon', sign: 'Cancer', degree: 22.3, house: 1 },
          { name: 'Mercury', sign: 'Aries', degree: 8.2, house: 10 },
          { name: 'Venus', sign: 'Pisces', degree: 28.9, house: 9 },
          { name: 'Mars', sign: 'Gemini', degree: 12.1, house: 12 },
        ],
        houses: [
          { number: 1, sign: 'Cancer', degree: 18.5 },
          { number: 2, sign: 'Leo', degree: 14.2 },
          { number: 3, sign: 'Virgo', degree: 11.8 },
        ],
        aspects: [
          { planet1: 'Sun', planet2: 'Moon', type: 'Square', orb: 2.3 },
          { planet1: 'Venus', planet2: 'Mars', type: 'Trine', orb: 1.2 },
        ],
        coords,
      });
    }

    // Parse date and time
    const [year, month, day] = date.split('-').map(Number);
    let hour = 12, minute = 0; // Default noon if time unknown
    
    if (!timeUnknown && time) {
      [hour, minute] = time.split(':').map(Number);
    }

    // Call Astrology API
    // Note: This is a placeholder structure - adapt to actual Astrology-API.io format
    const response = await fetch(`${ASTROLOGY_API_BASE}/natal-chart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ASTROLOGY_API_KEY}`,
      },
      body: JSON.stringify({
        year,
        month,
        day,
        hour,
        minute,
        latitude: coords.lat,
        longitude: coords.lon,
        timezone: 'UTC', // Could be improved with proper timezone lookup
      }),
    });

    if (!response.ok) {
      throw new Error(`Astrology API error: ${response.status}`);
    }

    const chartData = await response.json();

    return NextResponse.json({
      ...chartData,
      coords,
      timeUsed: timeUnknown ? 'noon-default' : 'exact',
    });

  } catch (error) {
    console.error('Natal chart calculation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul du thème natal' },
      { status: 500 }
    );
  }
}
