import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import SeoChrome from '@/components/SeoChrome';
import {
  aboutCopy,
  aboutHubLinks,
  aboutJsonLd,
  aboutLegalLinks,
  aboutPath,
} from '@/lib/about';
import { readLegalIdentity } from '@/lib/legal-entity';
import type { Locale } from '@/lib/seo';
import { appBaseUrl } from '@/lib/stripe';
import { trialPath } from '@/lib/free-call';

const TRY_COPY: Record<Locale, { h2: string; line: string; trial: string; packs: string }> = {
  fr: { h2: 'Essayer sur son propre thème', line: 'Le thème est calculé sur le vrai ciel à partir de la date, de l’heure et du lieu de naissance. Aucune date inventée, aucun compteur caché.', trial: '3 minutes offertes, sans carte ni abonnement', packs: 'Voir les packs à prix fixe (l’appel s’arrête tout seul)' },
  en: { h2: 'Try it on your own chart', line: 'The chart is computed on the real sky from your birth date, time and place. No invented dates, no hidden meter.', trial: '3 free minutes, no card and no subscription', packs: 'See the fixed-price packs (the call stops by itself)' },
  es: { h2: 'Probar con tu propia carta', line: 'La carta se calcula con el cielo real a partir de la fecha, la hora y el lugar de nacimiento. Sin fechas inventadas, sin contador oculto.', trial: '3 minutos gratis, sin tarjeta ni suscripción', packs: 'Ver los packs a precio fijo (la llamada se detiene sola)' },
  de: { h2: 'Mit dem eigenen Horoskop testen', line: 'Das Horoskop wird am echten Himmel aus Geburtsdatum, Uhrzeit und Ort berechnet. Keine erfundenen Daten, kein versteckter Zähler.', trial: '3 Gratisminuten, ohne Karte und ohne Abo', packs: 'Festpreis-Pakete ansehen (der Anruf endet von selbst)' },
  it: { h2: 'Provare con il proprio tema', line: 'Il tema è calcolato sul cielo reale da data, ora e luogo di nascita. Nessuna data inventata, nessun contatore nascosto.', trial: '3 minuti gratis, senza carta né abbonamento', packs: 'Vedere i pacchetti a prezzo fisso (la chiamata si ferma da sola)' },
};

export default function AboutService({ locale }: { locale: Locale }) {
  const copy = aboutCopy(locale);
  const legal = readLegalIdentity(locale);
  const origin = appBaseUrl();
  const entity = [
    legal.entityMissing ? '' : legal.entity,
    legal.idMissing ? '' : legal.id,
    legal.addressMissing ? '' : legal.address,
  ].filter(Boolean).join(' — ');
  return (
    <main>
      <SeoChrome locale={locale} alternatePath={aboutPath} />
      <article className="max-w-3xl mx-auto px-4 py-8 text-white/85 leading-relaxed">
        <nav aria-label={copy.home} className="text-sm text-white/50 mb-4">
          <Link href={`/${locale}`} className="underline">{copy.home}</Link>
          <span> / </span>
          <span>{copy.h1}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">{copy.h1}</h1>
        <p className="mt-2 text-sm text-white/50">{copy.updated} {copy.updatedDate}</p>
        {copy.sections.map((section) => (
          <section key={section.h2} className="mt-8">
            <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-white">{section.h2}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4">{paragraph}</p>
            ))}
          </section>
        ))}
        <section className="mt-8 rounded-2xl border border-celestial-gold/40 bg-white/5 p-5">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-white">{TRY_COPY[locale].h2}</h2>
          <p className="mt-3">{TRY_COPY[locale].line}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link href={trialPath(locale)} data-cta="about_trial" className="rounded-full bg-celestial-gold px-5 py-3 text-center font-semibold text-[#0c1028]">
              {TRY_COPY[locale].trial}
            </Link>
            <Link href={`/${locale}/offres`} data-cta="about_packs" className="rounded-full border border-celestial-gold/60 px-5 py-3 text-center text-celestial-gold">
              {TRY_COPY[locale].packs}
            </Link>
          </div>
        </section>
        <p className="mt-4">{copy.label} {copy.labelLine}.</p>
        <p className="mt-4">{copy.spoken} « {copy.spokenLine} »</p>
        {entity ? <p className="mt-4">{entity}.</p> : null}
        {!legal.emailMissing ? <p className="mt-4">{legal.email}</p> : null}
        <p className="mt-6">
          {copy.legal}{' '}
          {aboutLegalLinks(locale).map((item, index) => (
            <span key={item.href}>
              {index > 0 ? ' · ' : ''}
              <Link href={item.href} className="underline text-celestial-gold">{item.label}</Link>
            </span>
          ))}
        </p>
        <p className="mt-4">
          {copy.topics}{' '}
          {aboutHubLinks(locale).map((item, index) => (
            <span key={item.href}>
              {index > 0 ? ' · ' : ''}
              <Link href={item.href} className="underline text-celestial-gold">{item.label}</Link>
            </span>
          ))}
        </p>
      </article>
      <JsonLd data={aboutJsonLd(origin, locale)} />
    </main>
  );
}
