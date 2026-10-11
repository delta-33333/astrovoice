import type { Locale } from './seo';

const MARK: Record<Locale, (key: string) => string> = {
  fr: (key) => `[à compléter : ${key}]`,
  en: (key) => `[to be completed: ${key}]`,
  es: (key) => `[por completar: ${key}]`,
  de: (key) => `[noch einzutragen: ${key}]`,
  it: (key) => `[da completare: ${key}]`,
};

export type LegalIdentity = {
  entity: string;
  id: string;
  address: string;
  email: string;
  entityMissing: boolean;
  idMissing: boolean;
  addressMissing: boolean;
  emailMissing: boolean;
};

function raw(name: string): string {
  return (process.env[name] || '').trim();
}

/** Lit LEGAL_ENTITY_* et CONTACT_EMAIL. Une valeur absente reste un marqueur explicite, jamais une donnée inventée. */
export function readLegalIdentity(locale: Locale): LegalIdentity {
  const mark = MARK[locale];
  const entity = raw('LEGAL_ENTITY_NAME');
  const id = raw('LEGAL_ENTITY_ID');
  const address = raw('LEGAL_ADDRESS');
  const email = raw('CONTACT_EMAIL');
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  return {
    entity: entity || mark('LEGAL_ENTITY_NAME'),
    id: id || mark('LEGAL_ENTITY_ID'),
    address: address || mark('LEGAL_ADDRESS'),
    email: emailOk ? email : mark('CONTACT_EMAIL'),
    entityMissing: !entity,
    idMissing: !id,
    addressMissing: !address,
    emailMissing: !emailOk,
  };
}
