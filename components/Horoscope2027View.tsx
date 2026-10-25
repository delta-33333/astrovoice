import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import {
  H2027_DISCLAIMER,
  H2027_SIGNS,
  H2027_TRIAL,
  SKY_2027,
  h2027Name,
  h2027Path,
} from '@/lib/horoscope-2027';

export function SkyTable() {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <caption className="text-xs text-white/60 text-left mb-2">Dates calculées pour 2027, heure de Paris</caption>
        <thead>
          <tr className="border-b border-white/20">
            <th scope="col" className="py-2 pr-3">Date</th>
            <th scope="col" className="py-2 pr-3">Événement</th>
            <th scope="col" className="py-2">Détail</th>
          </tr>
        </thead>
        <tbody>
          {SKY_2027.map((row) => (
            <tr key={`${row.date}-${row.event}`} className="border-b border-white/10">
              <td className="py-2 pr-3 whitespace-nowrap">{row.date}</td>
              <td className="py-2 pr-3">{row.event}</td>
              <td className="py-2 text-white/75">{row.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TrialCta() {
  return (
    <div className="mt-10 rounded-2xl border border-celestial-gold/40 p-5">
      <p className="text-white/85">Une question sur votre année 2027 ? Parlez-en à voix haute avec un conseiller IA de Callastral.</p>
      <Link href={H2027_TRIAL} data-primary-cta="trial" className="btn-primary inline-block mt-3 text-center">3 min offertes, sans carte</Link>
    </div>
  );
}

export function SignChips({ current }: { current?: string }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {H2027_SIGNS.filter((id) => id !== current).map((id) => (
        <li key={id}>
          <Link href={h2027Path(id)} className="text-sm px-3 py-1 rounded-full border border-celestial-gold/40 text-celestial-gold">
            Horoscope 2027 {h2027Name(id)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Disclaimer() {
  return <p className="mt-4 text-sm text-celestial-gold">{H2027_DISCLAIMER}</p>;
}

export function Chrome({ children, jsonLd }: { children: React.ReactNode; jsonLd: unknown }) {
  return (
    <main>
      <SeoChrome locale="fr" alternatePath={(locale) => `/${locale}`} />
      <article className="max-w-3xl mx-auto px-4 py-8">{children}</article>
      <JsonLd data={jsonLd} />
    </main>
  );
}
