/**
 * Référent et UTM à joindre à un événement navigateur.
 * La source d'arrivée (document.referrer externe + utm_* de la page d'atterrissage) est mémorisée
 * pour la session : un retour sur l'accueil (view_home) après navigation interne garde sa source.
 */
export type Landing = { referrer: string | null; search: string };

const UTM_RE = /[?&]utm_(source|medium|campaign)=/i;

export function isExternalReferrer(referrer: string | null | undefined, host: string): boolean {
  if (!referrer) return false;
  try {
    return new URL(referrer).host !== host;
  } catch {
    return false;
  }
}

export function pickAttribution(input: {
  referrer: string | null | undefined;
  search: string;
  host: string;
  stored: Landing | null;
}): { landing: Landing; referrer: string | null; search: string } {
  const external = isExternalReferrer(input.referrer, input.host) ? (input.referrer as string) : null;
  const hasUtm = UTM_RE.test(input.search);
  const landing: Landing =
    input.stored && !external && !hasUtm ? input.stored : { referrer: external, search: hasUtm ? input.search : input.stored?.search ?? '' };
  return {
    landing,
    referrer: external ?? landing.referrer,
    search: hasUtm ? input.search : landing.search,
  };
}
