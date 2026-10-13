import { NextRequest } from 'next/server';
import { readOptOut } from '@/lib/checkout-reminder-copy';
import { optOutCheckoutReminder } from '@/lib/checkout-reminder';
import { authSecret } from '@/lib/session';

export const dynamic = 'force-dynamic';

const PAGE: Record<string, { title: string; ok: string; bad: string }> = {
  fr: {
    title: 'Désinscription',
    ok: 'Vous ne recevrez plus le rappel de paiement Callastral. Le compte et les e-mails de service restent inchangés.',
    bad: 'Ce lien de désinscription n’est pas valable.',
  },
  en: {
    title: 'Unsubscribe',
    ok: 'You will no longer receive the Callastral payment reminder. The account and service emails stay as they are.',
    bad: 'This unsubscribe link is not valid.',
  },
  es: {
    title: 'Baja',
    ok: 'Ya no recibirás el recordatorio de pago de Callastral. La cuenta y los correos de servicio no cambian.',
    bad: 'Este enlace de baja no es válido.',
  },
  de: {
    title: 'Abmeldung',
    ok: 'Sie erhalten die Zahlungserinnerung von Callastral nicht mehr. Konto und Service-E-Mails bleiben unverändert.',
    bad: 'Dieser Abmeldelink ist ungültig.',
  },
  it: {
    title: 'Disiscrizione',
    ok: 'Non riceverai più il promemoria di pagamento Callastral. L’account e le e-mail di servizio restano invariati.',
    bad: 'Questo link di disiscrizione non è valido.',
  },
};

function page(locale: string, message: string): Response {
  const copy = PAGE[locale] || PAGE.fr;
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${copy.title}</title></head><body style="font-family:system-ui,sans-serif;background:#0c1018;color:#f7f4ec;padding:2rem"><main style="max-width:36rem;margin:auto"><h1>${copy.title}</h1><p>${message}</p></main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: NextRequest) {
  const locale = (request.nextUrl.searchParams.get('lang') || 'fr').slice(0, 2);
  const secret = authSecret();
  const token = request.nextUrl.searchParams.get('token') || '';
  const userId = secret ? readOptOut(token, secret) : null;
  if (!userId) return page(locale, (PAGE[locale] || PAGE.fr).bad);
  await optOutCheckoutReminder(userId);
  return page(locale, (PAGE[locale] || PAGE.fr).ok);
}
