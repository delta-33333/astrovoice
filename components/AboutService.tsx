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
        {copy.paragraphs.map((paragraph) => (
          <p key={paragraph} className="mt-4">{paragraph}</p>
        ))}
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
