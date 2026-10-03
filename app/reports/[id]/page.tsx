import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reportTitle } from '@/lib/offers';
import { getOwnedReport } from '@/lib/reports';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Rapport — Callastral',
  robots: { index: false, follow: false },
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) {
    return (
      <main className="min-h-screen px-4 py-16 text-center">
        <p className="text-white/70">Connectez-vous pour lire ce rapport.</p>
        <Link href="/auth" className="btn-primary inline-block mt-6">Connexion</Link>
      </main>
    );
  }
  const report = await getOwnedReport(user.id, id);
  if (!report) notFound();
  const title = reportTitle(report.kind);
  return (
    <main className="min-h-screen px-4 py-10">
      <article className="max-w-2xl mx-auto space-y-6">
        <Link href="/account" className="text-sm text-white/50">← Compte</Link>
        <h1 className="font-[family-name:var(--font-cinzel)] text-4xl">{title}</h1>
        {report.body ? (
          <>
            <div className="space-y-4 text-white/85 leading-relaxed whitespace-pre-wrap">{report.body}</div>
            <a href={`/api/reports/${report.id}/pdf`} className="btn-secondary inline-block">Télécharger le PDF</a>
          </>
        ) : (
          <p className="text-white/70">Le texte est en préparation. Il arrivera aussi par e-mail.</p>
        )}
      </article>
    </main>
  );
}
