import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Accès base de données Callastral — SERVEUR UNIQUEMENT.
 *
 * Les tables vivent dans le schéma Postgres dédié `callastral` (base partagée
 * avec un autre projet : on n'utilise jamais `public`). RLS est activé et les
 * rôles `anon` / `authenticated` n'ont aucun droit : seul le client admin
 * (clé service_role) peut lire/écrire. La clé anon ne doit JAMAIS être utilisée
 * pour interroger ces tables, ni côté navigateur ni côté serveur.
 */
export const SUPABASE_DB_SCHEMA = 'callastral';

export type AdminClient = SupabaseClient<any, any, any>;

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

function isPlaceholder(value: string): boolean {
  return !value || value.includes('placeholder') || value.includes('your-project');
}

/** Rôle porté par une clé JWT legacy (`anon`, `service_role`) ; null si clé non-JWT (sb_secret_…). */
function jwtRole(key: string): string | null {
  const parts = key.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

/**
 * La base est « configurée » dès qu'une URL Supabase est fournie. Dans ce cas
 * on n'utilise plus le repli cookie : si la clé service_role manque, les accès
 * échouent bruyamment (exception + log) au lieu de basculer sur la clé anon.
 */
export const supabaseAvailable = !isPlaceholder(supabaseUrl);

let configError: string | null = null;
if (supabaseAvailable) {
  if (isPlaceholder(serviceRoleKey)) {
    configError = 'SUPABASE_SERVICE_ROLE_KEY manquante : accès base Callastral impossible.';
  } else if (serviceRoleKey.startsWith('sb_publishable_') || jwtRole(serviceRoleKey) === 'anon') {
    configError = 'SUPABASE_SERVICE_ROLE_KEY contient une clé anon/publishable, pas la clé service_role.';
  }
  if (configError) console.error(`[supabase] ${configError}`);
}

let adminClient: AdminClient | null = null;

/** Client admin (service_role, schéma callastral). Lève une erreur si mal configuré. */
export function getSupabaseAdmin(): AdminClient {
  if (!supabaseAvailable) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }
  if (configError) {
    throw new Error(configError);
  }
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: SUPABASE_DB_SCHEMA },
    });
  }
  return adminClient;
}

export interface UserProfile {
  id: string;
  username: string;
  password_hash: string | null;
  display_name: string;
  birth_date: string;
  birth_time?: string;
  birth_time_unknown: boolean;
  birth_place: string;
  birth_latitude?: number;
  birth_longitude?: number;
  natal_chart_json?: string;
  favorite_astrologer_id?: string;
  consent_accepted_at?: string;
  prepaid_seconds: number;
  stripe_customer_id?: string;
  email?: string;
  founding_claimed?: boolean;
  credited_checkout_sessions?: string[];
  created_at: string;
}
