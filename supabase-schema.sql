-- Callastral (Lunara) — schéma Postgres dédié `callastral`
-- Base partagée avec le projet Supabase Warbid : ne jamais toucher au schéma `public`.
-- Après création, exposer le schéma à l'API Data :
--   ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, callastral';
--   NOTIFY pgrst, 'reload config'; NOTIFY pgrst, 'reload schema';

CREATE SCHEMA IF NOT EXISTS callastral;

CREATE TABLE IF NOT EXISTS callastral.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  birth_date text,
  birth_time text,
  birth_time_unknown boolean DEFAULT false,
  birth_place text,
  birth_latitude numeric,
  birth_longitude numeric,
  natal_chart_json text,
  favorite_astrologer_id text,
  consent_accepted_at text,
  prepaid_seconds integer DEFAULT 0,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  email text,
  founding_claimed boolean DEFAULT false,
  credited_checkout_sessions jsonb DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_users_username ON callastral.users (username);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON callastral.users (stripe_customer_id);

CREATE TABLE IF NOT EXISTS callastral.stripe_credit_grants (
  checkout_session_id text PRIMARY KEY,
  user_id text NOT NULL,
  seconds integer NOT NULL,
  amount_cents integer NOT NULL,
  pack_id text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stripe_credit_grants_user ON callastral.stripe_credit_grants (user_id);

CREATE TABLE IF NOT EXISTS callastral.call_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES callastral.users(id) ON DELETE CASCADE,
  astrologer_id text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  summary text,
  key_points jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_call_sessions_user ON callastral.call_sessions (user_id);

-- Atomique : une session Checkout ne crédite qu'une fois.
CREATE OR REPLACE FUNCTION callastral.grant_prepaid_seconds(
  p_session_id text, p_user_id text, p_seconds integer, p_amount integer, p_pack_id text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'callastral'
AS $$
BEGIN
  INSERT INTO callastral.stripe_credit_grants (checkout_session_id, user_id, seconds, amount_cents, pack_id)
  VALUES (p_session_id, p_user_id, p_seconds, p_amount, p_pack_id);

  UPDATE callastral.users
  SET prepaid_seconds = COALESCE(prepaid_seconds, 0) + p_seconds,
      founding_claimed = CASE WHEN p_pack_id = 'founding' THEN true ELSE founding_claimed END
  WHERE id::text = p_user_id;

  RETURN TRUE;
EXCEPTION WHEN unique_violation THEN
  RETURN FALSE;
END;
$$;

-- Consomme des secondes prépayées. -1 si le compte est absent.
CREATE OR REPLACE FUNCTION callastral.consume_prepaid_seconds(p_user_id text, p_seconds integer)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'callastral'
AS $$
DECLARE
  available INT;
  used INT;
BEGIN
  SELECT prepaid_seconds INTO available FROM callastral.users WHERE id::text = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN -1;
  END IF;
  used := LEAST(GREATEST(COALESCE(available, 0), 0), GREATEST(COALESCE(p_seconds, 0), 0));
  UPDATE callastral.users SET prepaid_seconds = GREATEST(COALESCE(available, 0), 0) - used
  WHERE id::text = p_user_id;
  RETURN used;
END;
$$;

-- RLS désactivé (accès serveur uniquement, comme l'ancien projet).
GRANT USAGE ON SCHEMA callastral TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA callastral TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA callastral TO anon, authenticated, service_role;
