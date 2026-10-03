import { NextResponse } from 'next/server';
import { getBooking } from '@/lib/bookings';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/session';
import { appBaseUrl } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

function icsStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour télécharger le calendrier.' }, { status: 401 });

  const { id } = await context.params;
  const booking = await getBooking(id);
  if (!booking || booking.user_id !== user.id || booking.status !== 'confirmed') {
    return NextResponse.json({ error: 'Consultation introuvable.' }, { status: 404 });
  }

  const { data: advisor } = await getSupabaseAdmin()
    .from('advisors')
    .select('first_name, last_name')
    .eq('id', booking.advisor_id)
    .maybeSingle();
  const name = advisor ? `${advisor.first_name} ${advisor.last_name}` : 'votre conseiller';
  const start = new Date(booking.starts_at);
  const end = new Date(start.getTime() + booking.duration_min * 60 * 1000);
  const url = `${appBaseUrl(new URL(request.url).origin)}/call/${booking.id}`;
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Callastral//Consultation//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@callastral.com`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsText(`Consultation Callastral avec ${name}`)}`,
    `DESCRIPTION:${icsText(`Rejoindre l’appel : ${url}`)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="consultation-callastral.ics"',
    },
  });
}
