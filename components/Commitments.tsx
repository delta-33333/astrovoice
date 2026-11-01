import { COMMITMENTS, TRUST_PROMISE, type TrustLocale } from '@/lib/trust-copy';

/** Bloc « Nos engagements » (prix plafonné, pas de date, ciel réel, IA transparente, confidentialité). */
export default function Commitments({ locale, promise = true }: { locale: TrustLocale; promise?: boolean }) {
  const copy = COMMITMENTS[locale];
  return (
    <section data-commitments className="px-4 py-8">
      <div className="mx-auto max-w-lg md:max-w-4xl">
        {promise && <p className="text-center font-[family-name:var(--font-cinzel)] text-xl text-celestial-gold">{TRUST_PROMISE[locale]}</p>}
        <h2 className="mt-3 font-[family-name:var(--font-cinzel)] text-2xl">{copy.title}</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {copy.items.map((item) => (
            <li key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold"><span className="text-celestial-gold">✓</span> {item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/70">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
