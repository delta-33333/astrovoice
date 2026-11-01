import Link from 'next/link';

const CASES: Record<'fr' | 'en', { title: string; items: Array<{ title: string; body: string }>; cta: string; note: string }> = {
  fr: {
    title: 'Ce qui t’amène',
    cta: 'En parler 3 min, offertes',
    note: 'Pas de date annoncée, pas de « il va revenir » : on regarde ce qui se joue dans ton ciel et ce que tu peux faire.',
    items: [
      { title: 'Amour, rupture, l’ex', body: 'Il revient ou pas ? Comprendre le lien, ce qui accroche et ce qui t’appartient.' },
      { title: 'Se sentir perdue', body: 'Remettre du sens quand tout s’emmêle, à partir de ton thème réel.' },
      { title: 'Une grosse décision', body: 'Partir, rester, changer de travail : poser les options à plat, sans promesse.' },
      { title: 'Famille', body: 'Une relation tendue avec un parent, un enfant, une sœur : y voir plus clair.' },
    ],
  },
  en: {
    title: 'What brings you here',
    cta: 'Talk it through, 3 free minutes',
    note: 'No dates announced, no “he will come back”: we look at what is at play in your sky and what you can do.',
    items: [
      { title: 'Love, breakup, the ex', body: 'Is he coming back or not? Understand the bond, what hooks you and what is yours.' },
      { title: 'Feeling lost', body: 'Make sense of things when everything gets tangled, from your real chart.' },
      { title: 'A big decision', body: 'Leave, stay, change jobs: lay the options out, without promises.' },
      { title: 'Family', body: 'A tense relationship with a parent, a child, a sibling: see it more clearly.' },
    ],
  },
};

/** Cas d’usage (douleurs de vie), chacun vers l’essai gratuit. */
export default function UseCases({ locale, trialHref }: { locale: 'fr' | 'en'; trialHref: string }) {
  const t = CASES[locale];
  return (
    <section data-use-cases className="px-4 py-8">
      <div className="mx-auto max-w-lg md:max-w-4xl">
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl">{t.title}</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {t.items.map((item, index) => (
            <li key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-white/70">{item.body}</p>
              <Link href={trialHref} data-cta={`usecase-${index + 1}`} className="mt-2 inline-block text-sm text-celestial-gold underline">{t.cta}</Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-white/55">{t.note}</p>
      </div>
    </section>
  );
}
