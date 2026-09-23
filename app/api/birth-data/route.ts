import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { updateUserProfile } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { name, date, time, timeUnknown, place, latitude, longitude, natalChartJson } = await request.json();

    const success = await updateUserProfile(user.id, {
      display_name: name || user.display_name,
      birth_date: date,
      birth_time: time,
      birth_time_unknown: timeUnknown,
      birth_place: place,
      birth_latitude: latitude,
      birth_longitude: longitude,
      natal_chart_json: natalChartJson,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save birth data error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
