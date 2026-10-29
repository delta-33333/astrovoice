import Link from 'next/link';
import { affiliatePath } from '@/lib/affiliate';
import { ascendantPath } from '@/lib/ascendant-tool';
import { couplePath } from '@/lib/couple-compat';
import { COMMON } from '@/lib/free-tools-copy';
import { bigThreePath, moonPath, type ToolLang } from '@/lib/free-tools';

/** Maillage interne entre outils gratuits. */
export default function FreeToolLinks({ locale, current }: { locale: ToolLang; current: 'big-three' | 'moon' | 'affiliate' }) {
  const copy = COMMON[locale];
  const items: [string, string, string][] = [
    ['big-three', bigThreePath(locale), copy.bigThreeTool],
    ['moon', moonPath(locale), copy.moonTool],
    ['rising', ascendantPath(locale), copy.risingTool],
    ['compat', couplePath(locale), copy.compatTool],
    ['affiliate', affiliatePath(locale), copy.affiliateLink],
  ];
  return (
    <nav aria-label={copy.related} className="mt-12 border-t border-white/10 pt-6">
      <h2 className="font-[family-name:var(--font-cinzel)] text-xl text-celestial-gold">{copy.related}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
        {items.filter(([id]) => id !== current).map(([id, href, label]) => (
          <li key={id}><Link href={href} className="underline text-white/80 hover:text-celestial-gold">{label}</Link></li>
        ))}
      </ul>
    </nav>
  );
}
