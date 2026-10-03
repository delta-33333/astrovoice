'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Logo Callastral. Déposez le fichier dans /public/logo.png :
 * l’image remplace le texte dès qu’elle se charge.
 */
export default function Logo({ className = '' }: { className?: string }) {
  const [ready, setReady] = useState(false);

  return (
    <Link href="/" className={`inline-flex items-center gap-2 min-h-8 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Callastral"
        className={ready ? 'h-8 w-auto' : 'hidden'}
        onLoad={() => setReady(true)}
        onError={() => setReady(false)}
      />
      {!ready && (
        <span className="font-[family-name:var(--font-cinzel)] text-xl font-semibold tracking-wide">
          Callastral
        </span>
      )}
    </Link>
  );
}
