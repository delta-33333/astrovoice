'use client';

import Link from 'next/link';
import type { BirthData } from '@/lib/types';

export function birthLine(data: BirthData): string {
  const date = data.date ? new Date(`${data.date}T12:00:00`).toLocaleDateString('fr-FR') : '';
  const time = data.timeUnknown || !data.time ? 'heure inconnue' : data.time;
  return [date, time, data.place].filter(Boolean).join(' · ');
}

/** Coordonnées enregistrées sur le compte, avec un lien pour les modifier. */
export default function BirthSummary({ data, next, className = '' }: { data: BirthData; next?: string; className?: string }) {
  const editHref = `/birth?edit=1${next ? `&next=${encodeURIComponent(next)}` : ''}`;
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm ${className}`}>
      <p className="text-white/50">Coordonnées de naissance</p>
      <p className="mt-1 text-white/90">
        {data.name ? `${data.name} · ` : ''}
        {birthLine(data)}
      </p>
      <Link href={editHref} className="mt-2 inline-block text-celestial-gold underline">Modifier</Link>
    </div>
  );
}
