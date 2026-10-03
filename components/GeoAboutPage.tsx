import { GUARANTEE_TEXT } from '@/lib/guarantee-text';
import Link from 'next/link';
import AiDisclosure from '@/components/AiDisclosure';
import JsonLd from '@/components/JsonLd';
import { GeoFooter, GeoHeader, Updated } from '@/components/GeoShell';
import { GEO_PATHS, GEO_UPDATED_ISO, callastralFacts, type GeoLocale } from '@/lib/geo-pages';
import { AI_ACT_LINE, AI_ACT_SPOKEN } from '@/lib/legal';
import { appBaseUrl } from '@/lib/stripe';

const OPERATOR = 'Julien Descostes';

function envList(name: string): string[] {
  return (process.env[name] || '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => /^https:\/\//.test(item));
}

function legal() {
  const email = (process.env.CONTACT_EMAIL || '').trim();
  return {
    email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null,
    entity: (process.env.LEGAL_ENTITY_NAME || '').trim() || null,
    id: (process.env.LEGAL_ENTITY_ID || '').trim() || null,
    address: (process.env.LEGAL_ADDRESS || '').trim() || null,
  };
}

export function aboutCopy(locale: GeoLocale) {
  return locale === 'fr'
    ? {
        title: 'À propos de Callastral : transparence sur nos conseillers virtuels',
        description: 'Qui exploite Callastral, comment fonctionnent les conseillers virtuels, le calcul du thème natal avec Swiss Ephemeris, les prix, les remboursements et le contact.',
      }
    : {
        title: 'About Callastral: transparency about our virtual advisors',
        description: 'Who runs Callastral, how the virtual advisors work, birth charts computed with Swiss Ephemeris, prices, refunds and contact.',
      };
}

export default function GeoAboutPage({ locale }: { locale: GeoLocale }) {
  const fr = locale === 'fr';
  const copy = aboutCopy(locale);
  const c = callastralFacts(locale);
  const origin = appBaseUrl();
  const url = `${origin}${GEO_PATHS.about[locale]}`;
  const info = legal();
  const sameAs = envList('SITE_SAME_AS');
  const packs = c.packs.map((pack) => `${pack.minutes} min : ${pack.price}`).join(' · ');
  const packsEn = c.packs.map((pack) => `${pack.minutes} min: ${pack.price}`).join(' · ');

  const sections = fr
    ? [
        {
          title: 'En bref',
          body: [
            `Callastral propose des consultations d’astrologie par téléphone, à partir de votre thème natal, avec des conseillers virtuels. Chaque conseiller a un tarif entre ${c.min} et ${c.max} par minute, disponible 24 h/24 en 5 langues.`,
          ],
        },
        {
          title: 'Qui exploite Callastral',
          body: [
            `Callastral est un service indépendant créé et exploité par ${OPERATOR}.`,
            ...(info.entity ? [`Entité légale : ${info.entity}${info.id ? ` — ${info.id}` : ''}${info.address ? ` — ${info.address}` : ''}.`] : []),
          ],
        },
        {
          title: 'Comment fonctionnent les conseillers virtuels',
          body: [
            'Les conseillers sont des personas virtuelles créées par Callastral : un prénom, un style de lecture et des domaines de prédilection. Ils n’ont ni âge réel, ni années de pratique, ni parcours humain.',
            `Avant l’appel, chaque fiche affiche : « ${AI_ACT_LINE.fr} ». Au début de l’appel, le conseiller le dit : « ${AI_ACT_SPOKEN.fr} »`,
            'Votre thème natal est calculé à partir de la date, de l’heure et du lieu de naissance avec Swiss Ephemeris (positions des planètes et des maisons). Le conseiller s’appuie sur ce calcul et sur les transits du moment pour répondre à votre question.',
          ],
        },
        {
          title: 'Ce que les conseillers ne font pas',
          body: [
            'Ils ne garantissent aucune prédiction : l’astrologie est une lecture symbolique, pas une certitude.',
            'Ils ne gardent pas la mémoire de vos appels précédents : chaque appel repart de votre thème.',
            'Ils ne donnent ni avis médical, ni conseil juridique, ni recommandation financière.',
            'Ce n’est pas de la voyance, et aucune personne humaine ne parle à leur place.',
          ],
        },
        {
          title: 'Prix',
          body: [
            `En France, de ${c.min} à ${c.max} par minute selon le conseiller ; les ${c.introMinutes} premières minutes sont à tarif réduit. Le tarif dépend du pays (par exemple ${c.table.find((r) => r.id === 'us')?.min} à ${c.table.find((r) => r.id === 'us')?.max} aux États-Unis) et le prix exact est affiché avant le paiement.`,
            ...(c.founding ? [`Offre fondateur : ${c.founding.minutes} minutes pour ${c.founding.price}, une fois par compte.`] : []),
            `Packs de minutes, sans date d’expiration : ${packs}.`,
            `Callastral Illimité : ${c.subscription} par mois, dans la limite de ${c.fairUse} minutes par mois et de 60 minutes par appel ; résiliable à tout moment.`,
          ],
        },
        {
          title: 'Annulation et remboursement',
          body: [
            'Jusqu’à 24 heures avant le début d’une réservation, le montant payé est intégralement remboursé. Passé ce délai, il est converti en avoir valable 30 jours.',
            'Pour une consultation à la minute, seule la durée réelle est encaissée. L’abonnement se résilie depuis le compte ; l’accès court jusqu’à la fin de la période payée.',
            GUARANTEE_TEXT.title + ' : ' + GUARANTEE_TEXT.body,
          ],
        },
        {
          title: 'Contact',
          body: [
            info.email
              ? `Écrivez-nous à ${info.email}.`
              : 'Une adresse de contact dédiée sera publiée sur cette page.',
          ],
        },
      ]
    : [
        {
          title: 'In short',
          body: [
            `Callastral offers astrology consultations by phone, based on your birth chart, with virtual advisors. Each advisor has a rate between ${c.min} and ${c.max} per minute, available 24/7 in 5 languages.`,
          ],
        },
        {
          title: 'Who runs Callastral',
          body: [
            `Callastral is an independent service created and run by ${OPERATOR}.`,
            ...(info.entity ? [`Legal entity: ${info.entity}${info.id ? ` — ${info.id}` : ''}${info.address ? ` — ${info.address}` : ''}.`] : []),
          ],
        },
        {
          title: 'How the virtual advisors work',
          body: [
            'The advisors are virtual personas created by Callastral: a first name, a reading style and preferred topics. They have no real age, no years of practice and no human career.',
            `Before the call, each profile shows: “${AI_ACT_LINE.en}”. At the start of the call, the advisor says: “${AI_ACT_SPOKEN.en}”`,
            'Your birth chart is computed from your date, time and place of birth with Swiss Ephemeris (planet and house positions). The advisor uses this calculation and current transits to answer your question.',
          ],
        },
        {
          title: 'What the advisors do not do',
          body: [
            'They do not guarantee any prediction: astrology is a symbolic reading, not a certainty.',
            'They do not remember your previous calls: each call starts again from your chart.',
            'They give no medical, legal or financial advice.',
            'This is not a psychic service, and no human speaks in their place.',
          ],
        },
        {
          title: 'Prices',
          body: [
            `In France, from ${c.min} to ${c.max} per minute depending on the advisor; the first ${c.introMinutes} minutes are at a reduced rate. Rates depend on the country (for example ${c.table.find((r) => r.id === 'us')?.min} to ${c.table.find((r) => r.id === 'us')?.max} in the United States) and the exact price is shown before payment.`,
            ...(c.founding ? [`Founder offer: ${c.founding.minutes} minutes for ${c.founding.price}, once per account.`] : []),
            `Minute packs, with no expiry: ${packsEn}.`,
            `Callastral Unlimited: ${c.subscription} per month, up to ${c.fairUse} minutes a month and 60 minutes per call; cancel anytime.`,
          ],
        },
        {
          title: 'Cancellation and refunds',
          body: [
            'Up to 24 hours before a booking starts, the amount paid is fully refunded. After that, it becomes a credit valid for 30 days.',
            'For per-minute consultations, only the actual duration is charged. The subscription is cancelled from your account; access runs until the end of the paid period.',
            `Refunded if the first ${c.introMinutes} minutes don’t suit you: hang up within the first ${c.introMinutes} billed minutes and request a refund from your account within 24 hours (card refund to the same payment method, credit restored otherwise). One request per account.`,
          ],
        },
        {
          title: 'Contact',
          body: [
            info.email
              ? `Write to us at ${info.email}.`
              : 'A dedicated contact address will be published on this page.',
          ],
        },
      ];

  return (
    <main>
      <GeoHeader locale={locale} page="about" />
      <article className="max-w-3xl mx-auto px-4 py-8 text-white/85 leading-relaxed">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl text-white">{copy.title}</h1>
        <Updated locale={locale} />
        <AiDisclosure locale={locale} className="mt-4" />
        {sections.map((section) => (
          <section key={section.title} className="mt-8">
            <h2 className="text-xl text-white font-semibold">{section.title}</h2>
            {section.body.length > 1 ? (
              <ul className="mt-3 list-disc pl-5 space-y-2">
                {section.body.map((line) => <li key={line}>{line}</li>)}
              </ul>
            ) : (
              <p className="mt-3">{section.body[0]}</p>
            )}
          </section>
        ))}
        <p className="mt-10 space-x-4 text-sm">
          <Link href={GEO_PATHS.prices[locale]} className="underline text-celestial-gold">{fr ? 'Tarifs comparés 2026' : '2026 price comparison'}</Link>
          <Link href="/terms" className="underline text-celestial-gold">{fr ? 'Conditions générales' : 'Terms (French)'}</Link>
        </p>
      </article>
      <GeoFooter locale={locale} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'AboutPage',
            '@id': `${url}#page`,
            url,
            name: copy.title,
            description: copy.description,
            inLanguage: locale,
            dateModified: GEO_UPDATED_ISO,
            about: { '@id': `${origin}/#organization` },
          },
          {
            '@type': 'Organization',
            '@id': `${origin}/#organization`,
            name: 'Callastral',
            url: origin,
            logo: `${origin}/logo.png`,
            founder: { '@type': 'Person', name: OPERATOR },
            ...(info.entity ? { legalName: info.entity } : {}),
            ...(sameAs.length ? { sameAs } : {}),
            ...(info.email ? { contactPoint: { '@type': 'ContactPoint', email: info.email, contactType: 'customer support' } } : {}),
          },
        ],
      }} />
    </main>
  );
}
