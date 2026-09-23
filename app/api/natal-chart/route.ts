import { NextRequest, NextResponse } from 'next/server';
import { geocodePlace } from '@/lib/utils';

const XAI_API_KEY = process.env.XAI_API_KEY;

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

    // Parse date and time
    const [year, month, day] = date.split('-').map(Number);
    let hour = 12, minute = 0; // Default noon if time unknown
    
    if (!timeUnknown && time) {
      [hour, minute] = time.split(':').map(Number);
    }

    const birthDateTime = timeUnknown 
      ? `${date} (heure inconnue, midi utilisé par défaut)`
      : `${date} à ${time}`;

    // If API key is missing, return mock data for development
    if (!XAI_API_KEY || XAI_API_KEY === 'xai-placeholder') {
      console.warn('⚠️ Using mock natal chart data (XAI_API_KEY not configured)');
      return NextResponse.json({
        mock: true,
        planets: [
          { name: 'Soleil', sign: 'Bélier', degree: 15.5, house: 10 },
          { name: 'Lune', sign: 'Cancer', degree: 22.3, house: 1 },
          { name: 'Mercure', sign: 'Bélier', degree: 8.2, house: 10 },
          { name: 'Vénus', sign: 'Poissons', degree: 28.9, house: 9 },
          { name: 'Mars', sign: 'Gémeaux', degree: 12.1, house: 12 },
          { name: 'Jupiter', sign: 'Sagittaire', degree: 18.7, house: 6 },
          { name: 'Saturne', sign: 'Capricorne', degree: 25.4, house: 7 },
          { name: 'Uranus', sign: 'Verseau', degree: 9.2, house: 8 },
          { name: 'Neptune', sign: 'Poissons', degree: 14.6, house: 9 },
          { name: 'Pluton', sign: 'Capricorne', degree: 21.8, house: 7 },
        ],
        ascendant: 'Cancer',
        sunSign: 'Bélier',
        moonSign: 'Cancer',
        houses: [
          { number: 1, sign: 'Cancer', degree: 18.5 },
          { number: 2, sign: 'Lion', degree: 14.2 },
          { number: 3, sign: 'Vierge', degree: 11.8 },
          { number: 4, sign: 'Balance', degree: 8.5 },
          { number: 5, sign: 'Scorpion', degree: 10.2 },
          { number: 6, sign: 'Sagittaire', degree: 15.7 },
          { number: 7, sign: 'Capricorne', degree: 18.5 },
          { number: 8, sign: 'Verseau', degree: 14.2 },
          { number: 9, sign: 'Poissons', degree: 11.8 },
          { number: 10, sign: 'Bélier', degree: 8.5 },
          { number: 11, sign: 'Taureau', degree: 10.2 },
          { number: 12, sign: 'Gémeaux', degree: 15.7 },
        ],
        aspects: [
          { planet1: 'Soleil', planet2: 'Lune', type: 'Carré', orb: 2.3 },
          { planet1: 'Vénus', planet2: 'Mars', type: 'Trigone', orb: 1.2 },
          { planet1: 'Mercure', planet2: 'Jupiter', type: 'Sextile', orb: 0.8 },
          { planet1: 'Soleil', planet2: 'Saturne', type: 'Opposition', orb: 3.1 },
          { planet1: 'Lune', planet2: 'Neptune', type: 'Trigone', orb: 1.5 },
          { planet1: 'Mars', planet2: 'Uranus', type: 'Carré', orb: 2.9 },
        ],
        summary: `Un thème natal riche et dynamique. Le Soleil en Bélier apporte une énergie pionnière et un courage naturel, tandis que la Lune en Cancer offre une sensibilité profonde et un attachement aux racines. L'ascendant Cancer renforce cette dimension émotionnelle et protectrice. Le carré Soleil-Lune suggère une tension créative entre l'action et l'émotion, qui peut devenir une force si bien maîtrisée.`,
        coords,
        timeUsed: timeUnknown ? 'noon-default' : 'exact',
      });
    }

    // Call xAI Grok for natal chart generation with structured output
    const grokPrompt = `Tu es un astrologue expert. Génère un thème natal astrologique complet et précis pour les données suivantes :

Date et heure de naissance : ${birthDateTime}
Lieu de naissance : ${place}
Coordonnées : ${coords.lat}°N, ${coords.lon}°E

Calcule les positions planétaires, maisons astrologiques et aspects majeurs pour cette date, heure et lieu.

IMPORTANT : Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de texte avant ou après). Structure exacte :

{
  "planets": [
    {"name": "Soleil", "sign": "Bélier", "degree": 15.5, "house": 10},
    {"name": "Lune", "sign": "Cancer", "degree": 22.3, "house": 1},
    {"name": "Mercure", "sign": "...", "degree": ..., "house": ...},
    {"name": "Vénus", "sign": "...", "degree": ..., "house": ...},
    {"name": "Mars", "sign": "...", "degree": ..., "house": ...},
    {"name": "Jupiter", "sign": "...", "degree": ..., "house": ...},
    {"name": "Saturne", "sign": "...", "degree": ..., "house": ...},
    {"name": "Uranus", "sign": "...", "degree": ..., "house": ...},
    {"name": "Neptune", "sign": "...", "degree": ..., "house": ...},
    {"name": "Pluton", "sign": "...", "degree": ..., "house": ...}
  ],
  "ascendant": "Cancer",
  "sunSign": "Bélier",
  "moonSign": "Cancer",
  "houses": [
    {"number": 1, "sign": "Cancer", "degree": 18.5},
    {"number": 2, "sign": "Lion", "degree": 14.2},
    ... (12 maisons au total)
  ],
  "aspects": [
    {"planet1": "Soleil", "planet2": "Lune", "type": "Carré", "orb": 2.3},
    {"planet1": "Vénus", "planet2": "Mars", "type": "Trigone", "orb": 1.2},
    ... (jusqu'à 8 aspects majeurs maximum)
  ],
  "summary": "Un résumé narratif court (2-3 phrases) en français décrivant les traits principaux de ce thème natal pour l'aperçu UI."
}

Signes possibles : Bélier, Taureau, Gémeaux, Cancer, Lion, Vierge, Balance, Scorpion, Sagittaire, Capricorne, Verseau, Poissons
Aspects possibles : Conjonction, Sextile, Carré, Trigone, Opposition
Assure-toi que les degrés sont entre 0 et 30, et les maisons entre 1 et 12.`;

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en astrologie et calculs de thèmes natals. Tu réponds toujours avec du JSON valide, sans markdown.',
            },
            {
              role: 'user',
              content: grokPrompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Grok API error:', response.status, errorText);
        throw new Error(`Grok API error: ${response.status}`);
      }

      const grokResponse = await response.json();
      const content = grokResponse.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from Grok');
      }

      // Parse the JSON response (remove markdown code blocks if present)
      let chartData;
      try {
        const cleanedContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        chartData = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('Failed to parse Grok response:', content);
        throw new Error('Invalid JSON response from Grok');
      }

      // Validate and return the natal chart data
      return NextResponse.json({
        ...chartData,
        coords,
        timeUsed: timeUnknown ? 'noon-default' : 'exact',
      });

    } catch (grokError) {
      console.error('Grok natal chart generation error:', grokError);
      
      // Fallback to mock data if Grok fails
      return NextResponse.json({
        mock: true,
        fallbackReason: 'grok-error',
        planets: [
          { name: 'Soleil', sign: 'Bélier', degree: 15.5, house: 10 },
          { name: 'Lune', sign: 'Cancer', degree: 22.3, house: 1 },
          { name: 'Mercure', sign: 'Bélier', degree: 8.2, house: 10 },
          { name: 'Vénus', sign: 'Poissons', degree: 28.9, house: 9 },
          { name: 'Mars', sign: 'Gémeaux', degree: 12.1, house: 12 },
          { name: 'Jupiter', sign: 'Sagittaire', degree: 18.7, house: 6 },
          { name: 'Saturne', sign: 'Capricorne', degree: 25.4, house: 7 },
          { name: 'Uranus', sign: 'Verseau', degree: 9.2, house: 8 },
          { name: 'Neptune', sign: 'Poissons', degree: 14.6, house: 9 },
          { name: 'Pluton', sign: 'Capricorne', degree: 21.8, house: 7 },
        ],
        ascendant: 'Cancer',
        sunSign: 'Bélier',
        moonSign: 'Cancer',
        houses: [
          { number: 1, sign: 'Cancer', degree: 18.5 },
          { number: 2, sign: 'Lion', degree: 14.2 },
          { number: 3, sign: 'Vierge', degree: 11.8 },
          { number: 4, sign: 'Balance', degree: 8.5 },
          { number: 5, sign: 'Scorpion', degree: 10.2 },
          { number: 6, sign: 'Sagittaire', degree: 15.7 },
          { number: 7, sign: 'Capricorne', degree: 18.5 },
          { number: 8, sign: 'Verseau', degree: 14.2 },
          { number: 9, sign: 'Poissons', degree: 11.8 },
          { number: 10, sign: 'Bélier', degree: 8.5 },
          { number: 11, sign: 'Taureau', degree: 10.2 },
          { number: 12, sign: 'Gémeaux', degree: 15.7 },
        ],
        aspects: [
          { planet1: 'Soleil', planet2: 'Lune', type: 'Carré', orb: 2.3 },
          { planet1: 'Vénus', planet2: 'Mars', type: 'Trigone', orb: 1.2 },
          { planet1: 'Mercure', planet2: 'Jupiter', type: 'Sextile', orb: 0.8 },
          { planet1: 'Soleil', planet2: 'Saturne', type: 'Opposition', orb: 3.1 },
        ],
        summary: `Un thème natal équilibré et intéressant. Le Soleil en Bélier apporte dynamisme et initiative, tandis que la Lune en Cancer offre sensibilité et intuition.`,
        coords,
        timeUsed: timeUnknown ? 'noon-default' : 'exact',
      });
    }

  } catch (error) {
    console.error('Natal chart calculation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul du thème natal' },
      { status: 500 }
    );
  }
}
