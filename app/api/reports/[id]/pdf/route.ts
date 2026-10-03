import { NextResponse } from 'next/server';
import { pdfFromText } from '@/lib/pdf-text';
import { reportTitle } from '@/lib/offers';
import { getOwnedReport } from '@/lib/reports';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { id } = await context.params;
  const report = await getOwnedReport(user.id, id);
  if (!report || !report.body) return NextResponse.json({ error: 'Rapport introuvable' }, { status: 404 });
  const title = reportTitle(report.kind);
  const pdf = pdfFromText(title, report.body);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${title.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
    },
  });
}
