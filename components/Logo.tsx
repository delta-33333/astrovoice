import Link from 'next/link';
import CallastralLockup from '@/components/CallastralLockup';

/** Wordmark Callastral. Les fichiers /logo.png et /icon.png servent au manifeste, au favicon et au schéma. */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center min-w-0 ${className}`}>
      <CallastralLockup className="h-7 w-auto sm:h-8" />
    </Link>
  );
}
