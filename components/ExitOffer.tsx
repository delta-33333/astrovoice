'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'ca_exit_seen';
const WEEK = 7 * 24 * 60 * 60 * 1000;

function blocked(path: string): boolean {
  return /^\/(book|call|account|auth|admin)(\/|$)/.test(path)
    || path.includes('/essai')
    || path.includes('/free-trial')
    || path.includes('/prueba')
    || path.includes('/probe')
    || path.includes('/prova');
}

export default function ExitOffer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (blocked(window.location.pathname)) return;
    const seen = Number(localStorage.getItem(KEY) || '0');
    if (seen && Date.now() - seen < WEEK) return;
    const started = Date.now();
    let maxScroll = 0;
    const mark = () => {
      localStorage.setItem(KEY, String(Date.now()));
      setOpen(true);
    };
    const onLeave = (event: MouseEvent) => {
      if (event.clientY > 0) return;
      mark();
    };
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = height > 0 ? window.scrollY / height : 0;
      if (ratio > maxScroll) maxScroll = ratio;
      if (Date.now() - started > 30_000 && maxScroll >= 0.5 && ratio < maxScroll - 0.2) mark();
    };
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="max-w-md rounded-3xl border border-white/15 bg-[#0c1018] p-6">
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">3 minutes pour poser la question</h2>
        <p className="mt-3 text-sm text-white/75">Un code par e-mail, puis l’appel s’arrête tout seul. Les conseillers sont des voix générées par IA.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/fr/essai" className="btn-primary">Essayer</Link>
          <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Plus tard</button>
        </div>
      </div>
    </div>
  );
}
