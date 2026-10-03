import { NextRequest, NextResponse } from 'next/server';
import { createElementsCheckout } from '@/lib/checkout';
import { resolveMarket } from '@/lib/market';
import { formatMoney } from '@/lib/money';
import { isReportKind, reportTitle } from '@/lib/offers';
import { attachReportCheckout, chargeAmount, createPendingReport, parseReportInput } from '@/lib/reports';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Connectez-vous pour régler ce rapport.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const kind = typeof body?.kind === 'string' ? body.kind : '';
  if (!isReportKind(kind)) return NextResponse.json({ error: 'Offre inconnue.' }, { status: 400 });
  const parsed = parseReportInput(kind, body?.input);
  if (!parsed) return NextResponse.json({ error: 'Indiquez la date, le lieu et le prénom.' }, { status: 400 });

  const market = await resolveMarket();
  const amountCents = chargeAmount(kind, market.currency);
  try {
    const reportId = await createPendingReport({
      userId: user.id,
      kind,
      currency: market.currency,
      amountCents,
      input: parsed,
    });
    const title = reportTitle(kind);
    const session = await createElementsCheckout({
      request,
      user,
      amountCents,
      currency: market.currency,
      productName: title,
      productDescription: `${title}, envoyé par e-mail et conservé dans le compte.`,
      purpose: 'report',
      metadata: { report_id: reportId, kind },
      manualCapture: false,
      flow: 'report',
      integrationFlow: 'report',
    });
    await attachReportCheckout(reportId, session.checkoutSessionId);
    return NextResponse.json({
      clientSecret: session.clientSecret,
      checkoutSessionId: session.checkoutSessionId,
      collectContact: session.collectContact,
      amountLabel: formatMoney(amountCents, market.currency),
      reportId,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'REPORTS_NOT_READY') {
      return NextResponse.json(
        { error: 'Les rapports seront disponibles après la mise à jour de la base.' },
        { status: 503 }
      );
    }
    if (code === 'STRIPE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Le paiement est indisponible.' }, { status: 503 });
    }
    console.error('Rapport:', code);
    return NextResponse.json({ error: 'Le paiement n’a pas pu être préparé.' }, { status: 500 });
  }
}
