import { clientIp } from './request-ip';

const hits = new Map<string, number[]>();

/** Limite en mémoire, par instance. Utile pour les formulaires publics sans compteur en base. */
export function tooManyHits(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    const first = hits.keys().next().value;
    if (first) hits.delete(first);
  }
  return false;
}

export function tooManyRequests(request: Request, bucket: string, limit: number, windowMs: number): boolean {
  return tooManyHits(`${bucket}:${clientIp(request)}`, limit, windowMs);
}
