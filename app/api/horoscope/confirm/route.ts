import { NextRequest } from 'next/server';
import { confirmHoroscope } from '@/lib/horoscope-subscribers';

export const dynamic = 'force-dynamic';

const PAGE: Record<string, { title: string; ok: string; bad: string }> = {
  fr: {
    title: 'Horoscope du matin',
    ok: 'C’est confirmé. L’horoscope du matin partira après le prochain envoi du matin.',
    bad: 'Ce lien de confirmation n’est pas valable.',
  },
  en: {
    title: 'Morning horoscope',
    ok: 'Confirmed. The morning horoscope will go out with the next morning send.',
    bad: 'This confirmation link is not valid.',
  },
  es: {
    title: 'Horóscopo de la mañana',
    ok: 'Confirmado. El horóscopo de la mañana saldrá con el próximo envío.',
    bad: 'Este enlace de confirmación no es válido.',
  },
  de: {
    title: 'Morgenhoroskop',
    ok: 'Bestätigt. Das Morgenhoroskop geht mit dem nächsten Morgenversand raus.',
    bad: 'Dieser Bestätigungslink ist ungültig.',
  },
  it: {
    title: 'Oroscopo del mattino',
    ok: 'Confermato. L’oroscopo del mattino partirà con il prossimo invio.',
    bad: 'Questo link di conferma non è valido.',
  },
};

function page(locale: string, ok: boolean): Response {
  const copy = PAGE[locale] || PAGE.fr;
  const message = ok ? copy.ok : copy.bad;
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${copy.title}</title></head><body style="font-family:system-ui,sans-serif;background:#0c1018;color:#f7f4ec;padding:2rem"><main style="max-width:36rem;margin:auto"><h1>${copy.title}</h1><p>${message}</p></main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
}

export async function GET(request: NextRequest) {
  const locale = (request.nextUrl.searchParams.get('lang') || 'fr').slice(0, 2);
  const token = request.nextUrl.searchParams.get('token') || '';
  const ok = await confirmHoroscope(token);
  return page(locale, ok);
}
