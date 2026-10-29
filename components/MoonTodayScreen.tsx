import type { Metadata } from 'next';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { notFound, permanentRedirect } from 'next/navigation';
import FreeToolCta from '@/components/FreeToolCta';
import FreeToolLinks from '@/components/FreeToolLinks';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import { getCopy } from '@/lib/ascendant-copy';
import { ASCENDANT_SIGNS, type FrenchSign } from '@/lib/ascendant-tool';
import { skyAtUtc } from '@/lib/chart-calc';
import { BIG_THREE, COMMON, MOON } from '@/lib/free-tools-copy';
import { bigThreePath, hoursToNextSign, moonPath, moonPhase, type ToolLang } from '@/lib/free-tools';
import { hreflangAlternates, isLocale, localeHomePath } from '@/lib/seo';
import { appBaseUrl } from '@/lib/stripe';
import { signByFrench, signPath } from '@/lib/zodiac/signs';

const ZONE: Record<ToolLang, string> = { fr: 'Europe/Paris', en: 'UTC', es: 'Europe/Madrid', de: 'Europe/Berlin', it: 'Europe/Rome' };

function skyAt(instant: DateTime) {
  const utc = instant.toUTC();
  const { bodies } = skyAtUtc(utc.year, utc.month, utc.day, utc.hour, utc.minute);
  const sun = bodies.find((body) => body.name === 'Soleil');
  const moon = bodies.find((body) => body.name === 'Lune');
  if (!sun || !moon) throw new Error('sky');
  return { sun, moon, phase: moonPhase(sun.longitude, moon.longitude) };
}

export async function moonMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const copy = MOON[locale];
  const path = moonPath(locale);
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: path, languages: hreflangAlternates(moonPath) },
    openGraph: { title: copy.title, description: copy.description, url: path, type: 'website' },
  };
}

export default async function MoonTodayScreen(props: { params: Promise<{ locale: string }>; slug: string }) {
  const { locale: raw } = await props.params;
  if (!isLocale(raw)) notFound();
  const locale: ToolLang = raw;
  const path = moonPath(locale);
  if (`/${locale}/${props.slug}` !== path) permanentRedirect(path);
  const copy = MOON[locale];
  const common = COMMON[locale];
  const signCopy = getCopy(locale).signs;
  const nameOf = (french: string) => signCopy[french as FrenchSign]?.name ?? french;
  const zone = ZONE[locale];
  const now = DateTime.now().setZone(zone);
  const today = skyAt(now);
  const phaseName = copy.phases[today.phase.id];
  const moonSign = nameOf(today.moon.sign);
  const nextIndex = (ASCENDANT_SIGNS.indexOf(today.moon.sign as FrenchSign) + 1) % 12;
  const nextSign = nameOf(ASCENDANT_SIGNS[nextIndex]);
  const hours = hoursToNextSign(today.moon.longitude, today.moon.speed);
  const signId = signByFrench(today.moon.sign);
  const week = Array.from({ length: 7 }, (_, index) => {
    const day = now.plus({ days: index + 1 }).set({ hour: 12, minute: 0, second: 0 });
    const sky = skyAt(day);
    return { label: day.setLocale(locale).toFormat('cccc d LLLL'), sign: nameOf(sky.moon.sign), phase: copy.phases[sky.phase.id], pct: sky.phase.illumination };
  });
  const when = now.setLocale(locale).toFormat('d LLLL yyyy, HH:mm');
  const answer = copy.answer(moonSign, phaseName, today.phase.illumination);
  const origin = appBaseUrl();
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: copy.h1,
      url: `${origin}${path}`,
      description: copy.description,
      inLanguage: locale,
      dateModified: now.toUTC().toISO(),
      isAccessibleForFree: true,
      publisher: { '@type': 'Organization', name: 'Callastral', url: origin },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: copy.faq.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: common.home, item: `${origin}${localeHomePath(locale)}` },
        { '@type': 'ListItem', position: 2, name: copy.h1, item: `${origin}${path}` },
      ],
    },
  ];

  return (
    <main className="pb-28 sm:pb-0">
      <SeoChrome locale={locale} alternatePath={moonPath} />
      <JsonLd data={jsonLd} />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <nav aria-label="breadcrumb" className="text-sm text-white/50 mb-4">
          <Link href={localeHomePath(locale)}>{common.home}</Link><span> / </span><span>{copy.h1}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-glow">{copy.h1}</h1>
        <p className="mt-4 text-lg text-white/90 leading-relaxed" data-testid="moon-answer">{answer}</p>
        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="card-glow rounded-2xl border border-celestial-gold/30 bg-celestial-purple/10 p-4">
            <p className="text-xs uppercase tracking-widest text-celestial-gold">{copy.inSign}</p>
            <p className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl">
              {signId ? <Link href={signPath(locale, signId)} className="hover:underline">{moonSign}</Link> : moonSign}
            </p>
            {hours !== null ? <p className="mt-1 text-xs text-white/60">{copy.nextSign(hours, nextSign)}</p> : null}
          </div>
          <div className="card-glow rounded-2xl border border-celestial-gold/30 bg-celestial-purple/10 p-4">
            <p className="text-xs uppercase tracking-widest text-celestial-gold">{copy.phase}</p>
            <p className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl">{phaseName}</p>
          </div>
          <div className="card-glow rounded-2xl border border-celestial-gold/30 bg-celestial-purple/10 p-4">
            <p className="text-xs uppercase tracking-widest text-celestial-gold">{copy.illumination}</p>
            <p className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl">{today.phase.illumination} %</p>
          </div>
        </section>
        <p className="mt-3 text-xs text-white/50">{copy.computed(when)}</p>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-celestial-gold">{copy.meaningTitle}</h2>
          <p className="mt-3 text-white/80"><strong>{phaseName}</strong> : {copy.phaseMeaning[today.phase.id]}</p>
          <p className="mt-3 text-white/80">
            <Link href={bigThreePath(locale)} className="underline">{BIG_THREE[locale].h1}</Link>
          </p>
        </section>

        <FreeToolCta locale={locale} placement="moon-today" />

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-celestial-gold">{copy.weekTitle}</h2>
          <table className="mt-3 w-full text-sm">
            <thead><tr className="text-left text-white/60"><th className="py-1">{copy.day}</th><th>{copy.inSign}</th><th>{copy.phase}</th><th className="text-right">%</th></tr></thead>
            <tbody>
              {week.map((row) => (
                <tr key={row.label} className="border-t border-white/10"><td className="py-2 capitalize">{row.label}</td><td>{row.sign}</td><td>{row.phase}</td><td className="text-right">{row.pct}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-celestial-gold">{copy.faqTitle}</h2>
          <dl className="mt-3 space-y-4">
            {copy.faq.map((item) => (
              <div key={item.q}><dt className="font-semibold">{item.q}</dt><dd className="mt-1 text-white/75">{item.a}</dd></div>
            ))}
          </dl>
        </section>
        <FreeToolLinks locale={locale} current="moon" />
      </article>
    </main>
  );
}
