import { getSupabaseAdmin, supabaseAvailable } from './supabase';

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const raw = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '0.0.0.0';
  return raw.slice(0, 64);
}

function missingTable(message: string, code?: string): boolean {
  return code === '42P01' || code === 'PGRST205' || /auth_attempts/i.test(message);
}

/** Limite les essais login / réinitialisation par adresse IP et par e-mail. */
export async function rateLimit(input: {
  kind: 'login' | 'reset';
  ip: string;
  email: string;
  limit: number;
  windowMs: number;
  ipLimit: number;
}): Promise<'ok' | 'limited' | 'unavailable'> {
  if (!supabaseAvailable) return 'unavailable';

  const admin = getSupabaseAdmin();
  const since = new Date(Date.now() - input.windowMs).toISOString();
  const emailCount = await admin
    .from('auth_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('kind', input.kind)
    .eq('ip', input.ip)
    .eq('email', input.email)
    .gte('created_at', since);

  if (emailCount.error) {
    if (missingTable(emailCount.error.message, emailCount.error.code)) {
      console.warn('Limite d’essais inactive tant que la migration auth n’est pas appliquée.');
      return 'ok';
    }
    console.warn('Limite d’essais:', emailCount.error.message);
    return 'unavailable';
  }

  const ipCount = await admin
    .from('auth_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('kind', input.kind)
    .eq('ip', input.ip)
    .gte('created_at', since);

  if (ipCount.error) {
    console.warn('Limite d’essais:', ipCount.error.message);
    return 'unavailable';
  }

  if ((emailCount.count ?? 0) >= input.limit || (ipCount.count ?? 0) >= input.ipLimit) {
    return 'limited';
  }

  const insert = await admin.from('auth_attempts').insert({
    kind: input.kind,
    ip: input.ip,
    email: input.email,
  });
  if (insert.error && !missingTable(insert.error.message, insert.error.code)) {
    console.warn('auth_attempts:', insert.error.message);
    return 'unavailable';
  }

  void admin
    .from('auth_attempts')
    .delete()
    .lt('created_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString());

  return 'ok';
}
