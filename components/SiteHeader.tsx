import Link from 'next/link';
import Logo from '@/components/Logo';
import MarketSwitch from '@/components/MarketSwitch';
import { resolveMarket } from '@/lib/market';
import { getSession } from '@/lib/session';

export default async function SiteHeader() {
  const [market, user] = await Promise.all([resolveMarket(), getSession()]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c1018]/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-2">
          <MarketSwitch language={market.language} currency={market.currency} />
          <Link href={user ? '/account' : '/auth'} className="text-sm text-white/80 px-2 py-1">
            {user ? 'Compte' : 'Connexion'}
          </Link>
        </div>
      </div>
    </header>
  );
}
