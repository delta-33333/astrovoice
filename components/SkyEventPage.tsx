import Link from 'next/link';
import AiDisclosure from '@/components/AiDisclosure';
import CallastralLockup from '@/components/CallastralLockup';
import ChatCta from '@/components/ChatCta';
import JsonLd from '@/components/JsonLd';
import {
  SKY_EVENT_PATHS,
  SKY_EVENTS_PUBLISHED,
  SKY_LINKS,
  signRows,
  skyEventCopy,
  skyEventJsonLd,
  type SkyEventId,
  type SkyLocale,
} from '@/lib/sky-events';

const h2 = 'font-[family-name:var(--font-cinzel)] text-2xl text-white';

export default function SkyEventPage({ id, locale }: { id: SkyEventId; locale: SkyLocale }) {
  const copy = skyEventCopy(id, locale);
  const signs = signRows(id, locale);
  return (
    <main>
      <header className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href={`/${locale}`} className="inline-flex items-center min-w-0">
            <CallastralLockup className="h-7 w-auto sm:h-8" />
          </Link>
          <nav aria-label={locale === 'fr' ? 'Langues' : 'Languages'} className="flex gap-2 text-xs text-white/70">
            {(['en', 'fr'] as const).map((item) => (
              <Link
                key={item}
                href={SKY_EVENT_PATHS[id][item]}
                hrefLang={item}
                className={item === locale ? 'text-celestial-gold' : 'hover:text-white'}
              >
                {item.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-4 py-8 text-white/85 leading-relaxed">
        <nav aria-label={locale === 'fr' ? 'Fil d’Ariane' : 'Breadcrumb'} className="text-sm text-white/50 mb-4">
          <Link href={`/${locale}`} className="underline">{copy.home}</Link>
          <span> / </span>
          <span>{copy.breadcrumb}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white text-glow">{copy.h1}</h1>
        <p className="text-xs text-white/50 mt-2"><time dateTime={SKY_EVENTS_PUBLISHED}>{copy.updated}</time></p>
        <p className="mt-5 text-lg text-white">{copy.answer[0]}</p>
        <p className="mt-3">{copy.answer[1]}</p>

        <section className="mt-10">
          <h2 className={h2}>{copy.tableTitle}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <caption className="text-xs text-white/60 text-left mb-2">{copy.tableCaption}</caption>
              <thead>
                <tr className="border-b border-white/20 text-white">
                  {copy.cols.map((col) => <th key={col} scope="col" className="py-2 pr-3 align-bottom">{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {copy.rows.map((item) => (
                  <tr key={item.label} className="border-b border-white/10">
                    <th scope="row" className="py-2 pr-3 font-semibold text-white align-top">{item.label}</th>
                    <td className="py-2 pr-3 align-top">{item.paris}</td>
                    <td className="py-2 pr-3 align-top text-white/75">{item.utc}</td>
                    <td className="py-2 align-top text-celestial-gold/90 whitespace-nowrap">{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {copy.sections.map((section) => (
          <section key={section.h2} className="mt-10">
            <h2 className={h2}>{section.h2}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4">{paragraph}</p>)}
          </section>
        ))}

        <section className="mt-10">
          <h2 className={h2}>{copy.signsTitle}</h2>
          <p className="mt-4 text-white/70">
            {copy.signsIntro}{' '}
            <Link href={SKY_LINKS[locale].chart} className="text-celestial-gold underline">
              {locale === 'fr' ? 'Thème astral gratuit' : 'Free birth chart'}
            </Link>
          </p>
          <div className="mt-4 space-y-4">
            {signs.map((sign) => (
              <div key={sign.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="font-semibold text-celestial-gold">
                  <Link href={sign.href} className="hover:underline">{sign.name}</Link>
                </h3>
                <p className="mt-2 text-white/80">{sign.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className={h2}>{copy.adviceTitle}</h2>
          <ul className="mt-4 list-disc pl-5 space-y-2">
            {copy.advice.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </section>

        <div className="mt-10 rounded-2xl border border-celestial-gold/40 p-5">
          <p className="text-white/85">{copy.ctaText}</p>
          <Link href={SKY_LINKS[locale].trial} data-primary-cta="trial" className="btn-primary inline-block mt-3 text-center">
            {copy.ctaButton}
          </Link>
          <AiDisclosure locale={locale} className="mt-2" />
          <div className="mt-4"><ChatCta locale={locale} placement={`sky-${id}`} className="w-full sm:w-auto" /></div>
        </div>

        <section className="mt-10">
          <h2 className={h2}>{copy.faqTitle}</h2>
          <div className="mt-4 space-y-3">
            {copy.faqs.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-white/10 p-4">
                <summary className="cursor-pointer font-semibold text-white">{faq.question}</summary>
                <p className="mt-2 text-white/80">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className={h2}>{copy.linksTitle}</h2>
          <ul className="mt-4 space-y-2">
            {copy.links.map((link) => (
              <li key={link.href}><Link href={link.href} className="text-celestial-gold underline">{link.label}</Link></li>
            ))}
            <li><Link href={copy.related.href} className="text-celestial-gold underline">{copy.related.label}</Link></li>
          </ul>
        </section>

        <p className="mt-10 text-xs text-white/50">{copy.method}</p>
        <p className="mt-3 text-xs text-white/50">{copy.disclaimer}</p>
      </article>
      <JsonLd data={skyEventJsonLd(copy)} />
    </main>
  );
}
