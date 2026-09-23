import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseAvailable = !!supabase;

export interface UserProfile {
  id: string;
  username: string;
  password_hash: string;
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
