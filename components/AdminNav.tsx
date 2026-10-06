import Link from 'next/link';

const LINKS = [
  ['/admin', 'Entonnoir'],
  ['/admin/acquisition', 'Acquisition'],
  ['/admin/bookings', 'Réservations'],
  ['/admin/payments', 'Paiements'],
  ['/admin/users', 'Comptes'],
  ['/admin/advisors', 'Conseillers'],
  ['/admin/reviews', 'Avis'],
];

export default function AdminNav() {
  return (
    <header className="border-b border-white/10 px-4 py-4">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-3">
        <p className="font-[family-name:var(--font-cinzel)] text-lg mr-2">Administration</p>
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} className="text-sm text-white/70 hover:text-celestial-gold">
            {label}
          </Link>
        ))}
        <form action="/api/admin/logout" method="post" className="ml-auto">
          <button type="submit" className="text-sm text-white/45">
            Quitter
          </button>
        </form>
      </div>
    </header>
  );
}
