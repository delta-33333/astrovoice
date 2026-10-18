import { discoveryHeadline } from './book-funnel.ts';
import { escapeHtml } from './email.ts';
import { VIRTUAL_ADVISOR_DISCLOSURE } from './legal.ts';
import type { AdvisorLang } from './money.ts';
import { WEEKLY_PLANS } from './weekly.ts';
import { trialPath } from './free-call.ts';

export const DAY_MS = 24 * 60 * 60 * 1000;

/** J+0 immédiat, J+1, J+3. Le cron de 8 h envoie les échéances passées. */
export const TRIAL_FOLLOWUP_OFFSETS_MS = [0, DAY_MS, 3 * DAY_MS] as const;

export type SequenceKind = 'trial_followup_0' | 'trial_followup_1' | 'trial_followup_3' | 'horoscope_welcome' | 'checkout_abandon';

export interface SequenceMail {
  kind: SequenceKind;
  sendAt: string;
  subject: string;
  html: string;
}

function unsubscribeFooter(url: string, locale: AdvisorLang): string {
  const label = {
    fr: 'Se désinscrire',
    en: 'Unsubscribe',
    es: 'Darse de baja',
    de: 'Abmelden',
    it: 'Disiscriviti',
  }[locale];
  return `<p><a href="${escapeHtml(url)}">${label}</a></p>`;
}

export function trialFollowupMails(input: {
  locale: AdvisorLang;
  advisorName: string;
  summary: string;
  resumeUrl: string;
  unsubscribeUrl: string;
  from?: Date;
}): SequenceMail[] {
  const from = input.from ?? new Date();
  const price = discoveryHeadline(input.locale, 'eur');
  const name = escapeHtml(input.advisorName || 'Callastral');
  const summary = escapeHtml(input.summary || '');
  const href = escapeHtml(input.resumeUrl);
  const ai = escapeHtml(VIRTUAL_ADVISOR_DISCLOSURE);
  const minutes = WEEKLY_PLANS.decouverte.minutes;
  const subjects = {
    fr: [
      `Le résumé de votre appel avec ${input.advisorName}`,
      'Votre question mérite plus de 3 minutes',
      `La 1re semaine ${WEEKLY_PLANS.decouverte.names.fr} reste à ${price}`,
    ],
    en: [
      `The summary of your call with ${input.advisorName}`,
      'Your question deserves more than 3 minutes',
      `The first week of ${WEEKLY_PLANS.decouverte.names.en} is still ${price}`,
    ],
  };
  const pack = input.locale === 'en' ? subjects.en : subjects.fr;
  const html = [
    `<p>${summary}</p><p>${ai}</p><p><a href="${href}">${input.locale === 'en' ? `Continue with ${name} — ${price}` : `Continuer avec ${name} — ${price}`}</a></p>`,
    `<p>${input.locale === 'en'
      ? `${WEEKLY_PLANS.decouverte.names.en}: ${minutes} minutes a week, call memory, cancel in one click.`
      : `${WEEKLY_PLANS.decouverte.names.fr} : ${minutes} minutes par semaine, mémoire des appels, résiliation en 1 clic.`}</p><p>${ai}</p><p><a href="${href}">${price}</a></p>`,
    `<p>${input.locale === 'en'
      ? `The first week is ${price}. There is no end date on that price.`
      : `La 1re semaine est à ${price}. Aucune date de fin n’est affichée pour ce prix.`}</p><p>${ai}</p><p><a href="${href}">${price}</a></p>`,
  ];
  const kinds: SequenceKind[] = ['trial_followup_0', 'trial_followup_1', 'trial_followup_3'];
  return TRIAL_FOLLOWUP_OFFSETS_MS.map((offset, index) => ({
    kind: kinds[index],
    sendAt: new Date(from.getTime() + offset).toISOString(),
    subject: pack[index],
    html: `${html[index]}${unsubscribeFooter(input.unsubscribeUrl, input.locale)}`,
  }));
}

export function horoscopeWelcomeMail(input: {
  locale: AdvisorLang;
  trialUrl: string;
  unsubscribeUrl: string;
}): { subject: string; html: string } {
  const href = escapeHtml(input.trialUrl);
  const subject = input.locale === 'en'
    ? 'Welcome — your first horoscope arrives tomorrow morning'
    : 'Bienvenue — votre premier horoscope arrive demain matin';
  const body = input.locale === 'en'
    ? `<p>Your morning horoscope is confirmed. The first one arrives tomorrow morning.</p><p><a href="${href}">A 3-minute call is free</a></p>`
    : `<p>Votre horoscope du matin est confirmé. Le premier part demain matin.</p><p><a href="${href}">3 minutes offertes</a></p>`;
  return {
    subject,
    html: `${body}<p>${escapeHtml(VIRTUAL_ADVISOR_DISCLOSURE)}</p>${unsubscribeFooter(input.unsubscribeUrl, input.locale)}`,
  };
}

/** Un seul bloc promo. L’appel gratuit remplace Découverte les jours 2 et 5 si l’essai est ouvert. */
export function morningPromo(input: {
  locale: AdvisorLang;
  daysSinceConfirm: number | null;
  freeCall: boolean;
  origin: string;
}): { label: string; url: string } | null {
  const day = input.daysSinceConfirm;
  if (input.freeCall && (day === 2 || day === 5)) {
    const path = trialPath(input.locale);
    return {
      label: input.locale === 'en'
        ? 'A question about today’s sky? Ask it out loud: 3 minutes free.'
        : 'Une question sur ce que dit votre ciel aujourd’hui ? Posez-la à voix haute : 3 minutes offertes.',
      url: `${input.origin}${path}?utm_source=horoscope&utm_medium=email`,
    };
  }
  return null;
}

export function dueSequenceIds(rows: Array<{ id: string; sendAt: string; sentAt: string | null; cancelledAt: string | null }>, now: Date): string[] {
  return rows
    .filter((row) => !row.sentAt && !row.cancelledAt && Date.parse(row.sendAt) <= now.getTime())
    .map((row) => row.id);
}

export function cancelRemaining(rows: Array<{ id: string; kind: string; sentAt: string | null; cancelledAt: string | null }>): string[] {
  return rows
    .filter((row) => row.kind.startsWith('trial_followup') && !row.sentAt && !row.cancelledAt)
    .map((row) => row.id);
}
