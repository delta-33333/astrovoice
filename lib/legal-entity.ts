import type { Locale } from './seo.ts';

export type LegalIdentity = {
  entity: string;
  /** SIREN ou identifiant, lu depuis LEGAL_SIREN puis LEGAL_ENTITY_ID. */
  id: string;
  address: string;
  email: string;
  director: string;
  entityMissing: boolean;
  idMissing: boolean;
  addressMissing: boolean;
  emailMissing: boolean;
  directorMissing: boolean;
};

function raw(name: string, env: NodeJS.ProcessEnv): string {
  return (env[name] || '').trim();
}

function emailOk(value: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

/**
 * Lit les variables d’identité. Une valeur absente reste vide :
 * la page n’affiche pas de marqueur ni de donnée inventée.
 */
export function readLegalIdentity(
  _locale: Locale,
  env: NodeJS.ProcessEnv = process.env,
): LegalIdentity {
  const entity = raw('LEGAL_ENTITY_NAME', env);
  const id = raw('LEGAL_SIREN', env) || raw('LEGAL_ENTITY_ID', env);
  const address = raw('LEGAL_ADDRESS', env);
  const email = raw('CONTACT_EMAIL', env);
  const director = raw('LEGAL_DIRECTOR', env);
  const emailValid = emailOk(email);
  return {
    entity,
    id,
    address,
    email: emailValid ? email : '',
    director,
    entityMissing: !entity,
    idMissing: !id,
    addressMissing: !address,
    emailMissing: !emailValid,
    directorMissing: !director,
  };
}

/** Lignes publiques, dans l’ordre, sans trou pour une variable absente. */
export function legalIdentityLines(legal: LegalIdentity): string[] {
  const lines: string[] = [];
  if (!legal.entityMissing) lines.push(legal.entity);
  if (!legal.idMissing) lines.push(legal.id);
  if (!legal.addressMissing) lines.push(legal.address);
  if (!legal.directorMissing) lines.push(legal.director);
  if (!legal.emailMissing) lines.push(legal.email);
  return lines;
}
