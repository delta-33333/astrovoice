import { NextRequest } from 'next/server';
import { unsubscribeHoroscope } from '@/lib/horoscope-subscribers';

export const dynamic = 'force-dynamic';

const PAGE: Record<string, { title: string; ok: string; bad: string }> = {
  fr: {
    title: 'Désinscription',
    ok: 'Vous ne recevrez plus l’horoscope du matin.',
    bad: 'Ce lien de désinscription n’est pas valable.',
  },
  en: {
    title: 'Unsubscribe',
    ok: 'You will no longer receive the morning horoscope.',
    bad: 'This unsubscribe link is not valid.',
  },
  es: {
    title: 'Baja',
    ok: 'Ya no recibirás el horóscopo de la mañana.',
    bad: 'Este enlace de baja no es válido.',
  },
  de: {
    title: 'Abmeldung',
    ok: 'Sie erhalten das Morgenhoroskop nicht mehr.',
    bad: 'Dieser Abmeldelink ist ungültig.',
  },
  it: {
    title: 'Disiscrizione',
    ok: 'Non riceverai più l’oroscopo del mattino.',
    bad: 'Questo link di disiscrizione non è valido.',
  },
};

function page(locale: string, ok: boolean): Response {
  const copy = PAGE[locale] || PAGE.fr;
  const message = ok ? copy.ok : copy.bad;
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${copy.title}</title></head><body style="font-family:system-ui,sans-serif;background:#0c1018;color:#f7f4ec;padding:2rem"><main style="max-width:36rem;margin:auto"><h1>${copy.title}</h1><p>${message}</p></main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
}

async function run(request: NextRequest): Promise<Response> {
  const locale = (request.nextUrl.searchParams.get('lang') || 'fr').slice(0, 2);
  const token = request.nextUrl.searchParams.get('token') || '';
  const ok = await unsubscribeHoroscope(token);
  return page(locale, ok);
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
