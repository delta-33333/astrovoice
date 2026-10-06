import { AI_TERMS_CLAUSE } from '@/lib/legal';

/** Clause des CGU sur les conseillers virtuels (IA), partagée par /cgu et /terms. */
export default function AiTermsSection({ id = 'conseillers-virtuels' }: { id?: string }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-20">
      <h2 className="text-white text-lg font-semibold">{AI_TERMS_CLAUSE.title}</h2>
      {AI_TERMS_CLAUSE.paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 32)}>{paragraph}</p>
      ))}
    </section>
  );
}
