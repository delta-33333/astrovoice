/** Adresse IP du client, tronquée, pour les limites d’essais. Aucune donnée personnelle stockée. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const raw = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '0.0.0.0';
  return raw.slice(0, 64);
}
