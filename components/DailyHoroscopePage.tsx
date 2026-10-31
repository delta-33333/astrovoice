import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AiDisclosure from '@/components/AiDisclosure';
import CallastralLockup from '@/components/CallastralLockup';
import ChatCta from '@/components/ChatCta';
import JsonLd from '@/components/JsonLd';
import { loadDailyDay } from '@/lib/daily-horoscope-data';
import {
  DAILY_LINKS,
  DAILY_ORIGIN,
  bodyLabel,
  dailyAlternates,
  dailyCanonical,
  dailyDateLabel,
  dailyDates,
  dailyHubPath,
  dailyJsonLd,
  dailySignName,
  dailySignPath,
  firstSentence,
  isDailyDate,
  latestDailyDate,
  skySignLabel,
  type DailyDay,
  type DailyLocale,
} from '@/lib/daily-horoscope';
import { SIGN_IDS, type SignId } from '@/lib/zodiac/signs';

const h2 = 'font-[family-name:var(--font-cinzel)] text-2xl text-white';

const T = {
  en: {
    home: 'Home',
    hub: 'Daily horoscope',
    hubTitle: (d: string) => `Daily horoscope for all 12 signs — ${d}`,
    hubH1: (d: string) => `Today’s horoscope for every sign, ${d}`,
    signTitle: (s: string, d: string) => `${s} horoscope today — ${d}`,
    signH1: (s: string, d: string) => `${s} horoscope for today, ${d}`,
    signsTitle: 'Choose your sign',
    read: 'Read the full horoscope',
    skyTitle: 'Today’s sky',
    skyCaption: 'Geocentric tropical positions computed at 08:00 Paris time.',
    cols: ['Body', 'Sign', 'Degree'],
    retro: 'retrograde',
    otherSigns: 'Other signs today',
    archiveTitle: 'Previous days',
    linksTitle: 'Go further',
    links: (l: (typeof DAILY_LINKS)['en']) => [
      { href: l.chart, label: 'Get your free birth chart (Sun, Moon and rising sign)' },
      { href: l.moon, label: 'Check the Moon today: live sign and phase' },
      { href: l.chat, label: 'Ask your question by message (first answer free)' },
      { href: l.trial, label: 'Talk 3 minutes free with a Callastral advisor' },
    ],
    ctaText: 'Your Sun sign is only part of the story. A Callastral advisor can read today’s sky against your own birth chart, by phone, with the first 3 minutes free.',
    ctaButton: 'Try 3 free minutes',
    faqTitle: 'Questions',
    method: 'Method: planetary positions are computed each morning with the Swiss Ephemeris at 08:00 Paris time, the same calculation as our Moon today page. Houses are counted from your Sun sign (whole signs).',
    disclaimer: 'Entertainment. A daily horoscope describes the sky for a Sun sign; it does not predict personal events.',
    faqSign: (s: string) => `What does today’s horoscope say for ${s}?`,
    faqMoon: 'Where is the Moon today?',
    faqPersonal: 'Is a daily horoscope personal?',
    faqPersonalA: 'No. It is written for a Sun sign. For a reading based on your own birth date, time and place, use the free birth chart or talk with a Callastral advisor.',
    archived: (d: string) => `Archive: this horoscope was published for ${d}.`,
    seeToday: 'See today’s horoscope',
    updated: (d: string) => `Published ${d}`,
  },
  fr: {
    home: 'Accueil',
    hub: 'Horoscope du jour',
    hubTitle: (d: string) => `Horoscope du jour des 12 signes — ${d}`,
    hubH1: (d: string) => `L’horoscope du jour pour chaque signe, ${d}`,
    signTitle: (s: string, d: string) => `Horoscope ${s} du jour — ${d}`,
    signH1: (s: string, d: string) => `Horoscope ${s} d’aujourd’hui, ${d}`,
    signsTitle: 'Choisissez votre signe',
    read: 'Lire l’horoscope complet',
    skyTitle: 'Le ciel du jour',
    skyCaption: 'Positions géocentriques tropicales calculées à 8 h, heure de Paris.',
    cols: ['Astre', 'Signe', 'Degré'],
    retro: 'rétrograde',
    otherSigns: 'Les autres signes aujourd’hui',
    archiveTitle: 'Jours précédents',
    linksTitle: 'Aller plus loin',
    links: (l: (typeof DAILY_LINKS)['fr']) => [
      { href: l.chart, label: 'Calculer votre thème astral gratuit (Soleil, Lune, ascendant)' },
      { href: l.moon, label: 'Voir la Lune aujourd’hui : signe et phase en direct' },
      { href: l.chat, label: 'Poser votre question par message (1re réponse offerte)' },
      { href: l.trial, label: 'Parler 3 minutes gratuitement avec une Conseillère ou un Conseiller Callastral' },
    ],
    ctaText: 'Votre signe solaire n’est qu’une partie de l’histoire. Une Conseillère ou un Conseiller Callastral peut lire le ciel du jour avec votre propre thème, par téléphone, les 3 premières minutes offertes.',
    ctaButton: 'Essayer 3 minutes offertes',
    faqTitle: 'Questions',
    method: 'Méthode : les positions des planètes sont calculées chaque matin avec la Swiss Ephemeris à 8 h, heure de Paris, comme notre page Lune aujourd’hui. Les maisons sont comptées depuis votre signe solaire (signes entiers).',
    disclaimer: 'Divertissement. Un horoscope du jour décrit le ciel pour un signe solaire ; il ne prédit pas d’événement personnel.',
    faqSign: (s: string) => `Que dit l’horoscope du jour pour le signe ${s} ?`,
    faqMoon: 'Où est la Lune aujourd’hui ?',
    faqPersonal: 'L’horoscope du jour est-il personnel ?',
    faqPersonalA: 'Non. Il est écrit pour un signe solaire. Pour une lecture fondée sur votre date, heure et lieu de naissance, utilisez le thème astral gratuit ou parlez avec une Conseillère ou un Conseiller Callastral.',
    archived: (d: string) => `Archive : cet horoscope a été publié pour le ${d}.`,
    seeToday: 'Voir l’horoscope d’aujourd’hui',
    updated: (d: string) => `Publié le ${d}`,
  },
} as const;

export interface DailyRoute {
  locale: DailyLocale;
  date: string;
  sign?: SignId;
}

export function resolveDailyRoute(locale: DailyLocale, slug?: string, signSlug?: string): DailyRoute | null {
  const latest = latestDailyDate();
  if (!latest) return null;
  if (!slug) return { locale, date: latest };
  const asSign = SIGN_IDS.find((id) => dailySignPath(locale, id).endsWith(`/${slug}`));
  if (!signSlug) {
    if (asSign) return { locale, date: latest, sign: asSign };
    if (isDailyDate(slug)) return { locale, date: slug };
    return null;
  }
  if (!isDailyDate(slug)) return null;
  const sign = SIGN_IDS.find((id) => dailySignPath(locale, id, slug).endsWith(`/${signSlug}`));
  return sign ? { locale, date: slug, sign } : null;
}

export function dailyStaticParams(locale: DailyLocale, depth: 1 | 2): Record<string, string>[] {
  if (depth === 1) {
    return [
      ...SIGN_IDS.map((id) => ({ locale, slug: dailySignPath(locale, id).split('/').pop()! })),
      ...dailyDates().map((date) => ({ locale, slug: date })),
    ];
  }
  return dailyDates().flatMap((date) =>
    SIGN_IDS.map((id) => ({ locale, slug: date, sign: dailySignPath(locale, id, date).split('/').pop()! }))
  );
}

function headline(route: DailyRoute, day: DailyDay) {
  const t = T[route.locale];
  const d = dailyDateLabel(route.locale, route.date);
  if (route.sign) {
    const name = dailySignName(route.locale, route.sign);
    return { title: t.signTitle(name, d), h1: t.signH1(name, d), description: firstSentence(day[route.locale].signs[route.sign]) };
  }
  return { title: t.hubTitle(d), h1: t.hubH1(d), description: firstSentence(day[route.locale].summary) };
}

export async function dailyMetadata(route: DailyRoute | null): Promise<Metadata> {
  if (!route) return {};
  const day = await loadDailyDay(route.date);
  if (!day) return {};
  const { title, description } = headline(route, day);
  const canonical = dailyCanonical(route.locale, route.date, route.sign);
  return {
    title: { absolute: `${title} | Callastral` },
    description,
    alternates: { canonical, languages: dailyAlternates(route.date, route.sign) },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${DAILY_ORIGIN}${canonical}`,
      type: 'article',
      locale: route.locale === 'fr' ? 'fr_FR' : 'en_GB',
    },
  };
}

export default async function DailyHoroscopePage({ route }: { route: DailyRoute | null }) {
  if (!route) notFound();
  const day = await loadDailyDay(route.date);
  if (!day) notFound();
  const { locale, date, sign } = route;
  const t = T[locale];
  const copy = day[locale];
  const links = t.links(DAILY_LINKS[locale] as never);
  const { h1, description } = headline(route, day);
  const latest = latestDailyDate();
  const isArchive = date !== latest;
  const dateLabel = dailyDateLabel(locale, date);
  const canonical = dailyCanonical(locale, date, sign);
  const signHref = (id: SignId) => (isArchive ? dailySignPath(locale, id, date) : dailySignPath(locale, id));
  const hubHref = isArchive ? dailyHubPath(locale, date) : dailyHubPath(locale);
  const moonSentence = firstSentence(copy.summary);
  const faqs = sign
    ? [
        { question: t.faqSign(dailySignName(locale, sign)), answer: firstSentence(copy.signs[sign]) },
        { question: t.faqMoon, answer: moonSentence },
        { question: t.faqPersonal, answer: t.faqPersonalA },
      ]
    : [
        { question: t.faqMoon, answer: moonSentence },
        { question: t.faqPersonal, answer: t.faqPersonalA },
      ];
  const crumbs: { name: string; url: string }[] = [{ name: t.hub, url: `${DAILY_ORIGIN}${dailyHubPath(locale)}` }];
  if (sign) crumbs.push({ name: dailySignName(locale, sign), url: `${DAILY_ORIGIN}${canonical}` });
  const otherLocale: DailyLocale = locale === 'fr' ? 'en' : 'fr';
  const previous = dailyDates().filter((item) => item !== latest).reverse().slice(0, 14);

  return (
    <main>
      <header className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href={`/${locale}`} className="inline-flex items-center min-w-0">
            <CallastralLockup className="h-7 w-auto sm:h-8" />
          </Link>
          <nav aria-label={locale === 'fr' ? 'Langues' : 'Languages'} className="flex gap-2 text-xs text-white/70">
            <span className="text-celestial-gold">{locale.toUpperCase()}</span>
            <Link href={dailyCanonical(otherLocale, date, sign)} hrefLang={otherLocale} className="hover:text-white">
              {otherLocale.toUpperCase()}
            </Link>
          </nav>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-4 py-8 text-white/85 leading-relaxed">
        <nav aria-label={locale === 'fr' ? 'Fil d’Ariane' : 'Breadcrumb'} className="text-sm text-white/50 mb-4">
          <Link href={`/${locale}`} className="underline">{t.home}</Link>
          <span> / </span>
          {sign ? <Link href={hubHref} className="underline">{t.hub}</Link> : <span>{t.hub}</span>}
          {sign ? <><span> / </span><span>{dailySignName(locale, sign)}</span></> : null}
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white text-glow">{h1}</h1>
        <p className="text-xs text-white/50 mt-2"><time dateTime={date}>{t.updated(dateLabel)}</time></p>
        {isArchive ? (
          <p className="mt-3 text-sm text-white/60">
            {t.archived(dateLabel)}{' '}
            <Link href={sign ? dailySignPath(locale, sign) : dailyHubPath(locale)} className="text-celestial-gold underline">{t.seeToday}</Link>
          </p>
        ) : null}

        {sign ? (
          <div className="mt-5 space-y-4">
            {copy.signs[sign].split('\n\n').map((paragraph, index) => (
              <p key={index} className={index === 0 ? 'text-lg text-white' : ''}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <>
            <p className="mt-5 text-lg text-white">{copy.summary}</p>
            <section className="mt-10">
              <h2 className={h2}>{t.signsTitle}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {SIGN_IDS.map((id) => (
                  <div key={id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="font-semibold text-celestial-gold">
                      <Link href={signHref(id)} className="hover:underline">{dailySignName(locale, id)}</Link>
                    </h3>
                    <p className="mt-2 text-white/80 text-sm">{firstSentence(copy.signs[id])}</p>
                    <Link href={signHref(id)} className="mt-2 inline-block text-sm text-celestial-gold underline">{t.read}</Link>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <section className="mt-10">
          <h2 className={h2}>{t.skyTitle}</h2>
          {sign ? <p className="mt-3 text-white/75">{copy.summary}</p> : null}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <caption className="text-xs text-white/60 text-left mb-2">{t.skyCaption}</caption>
              <thead>
                <tr className="border-b border-white/20 text-white">
                  {t.cols.map((col) => <th key={col} scope="col" className="py-2 pr-3">{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {day.sky.bodies.map((body) => (
                  <tr key={body.name} className="border-b border-white/10">
                    <th scope="row" className="py-2 pr-3 font-semibold text-white">{bodyLabel(locale, body.name)}</th>
                    <td className="py-2 pr-3">{skySignLabel(locale, body.sign)}{body.retrograde ? `, ${t.retro}` : ''}</td>
                    <td className="py-2 pr-3 text-white/75">{body.degree}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-2xl border border-celestial-gold/40 p-5">
          <p className="text-white/85">{t.ctaText}</p>
          <Link href={DAILY_LINKS[locale].trial} data-primary-cta="trial" className="btn-primary inline-block mt-3 text-center">
            {t.ctaButton}
          </Link>
          <AiDisclosure locale={locale} className="mt-2" />
          <div className="mt-4"><ChatCta locale={locale} placement="daily-horoscope" className="w-full sm:w-auto" /></div>
        </div>

        {sign ? (
          <section className="mt-10">
            <h2 className={h2}>{t.otherSigns}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SIGN_IDS.filter((id) => id !== sign).map((id) => (
                <li key={id}>
                  <Link href={signHref(id)} className="inline-block rounded-full border border-white/15 px-3 py-1 text-sm hover:border-celestial-gold">
                    {dailySignName(locale, id)}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={hubHref} className="inline-block rounded-full border border-celestial-gold/50 px-3 py-1 text-sm text-celestial-gold">{t.hub}</Link>
              </li>
            </ul>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className={h2}>{t.faqTitle}</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-white/10 p-4">
                <summary className="cursor-pointer font-semibold text-white">{faq.question}</summary>
                <p className="mt-2 text-white/80">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className={h2}>{t.linksTitle}</h2>
          <ul className="mt-4 space-y-2">
            {links.map((link) => (
              <li key={link.href}><Link href={link.href} className="text-celestial-gold underline">{link.label}</Link></li>
            ))}
          </ul>
        </section>

        {!sign && previous.length ? (
          <section className="mt-10">
            <h2 className={h2}>{t.archiveTitle}</h2>
            <ul className="mt-4 space-y-1 text-sm">
              {previous.map((item) => (
                <li key={item}><Link href={dailyHubPath(locale, item)} className="underline">{dailyDateLabel(locale, item)}</Link></li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-10 text-xs text-white/50">{t.method}</p>
        <p className="mt-3 text-xs text-white/50">{t.disclaimer}</p>
      </article>
      <JsonLd
        data={dailyJsonLd({
          locale,
          url: `${DAILY_ORIGIN}${canonical}`,
          headline: h1,
          description,
          date,
          home: t.home,
          crumbs,
          faqs,
        })}
      />
    </main>
  );
}
