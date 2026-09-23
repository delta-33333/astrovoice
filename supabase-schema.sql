-- Lunara User Accounts Schema
-- Run this SQL in your Supabase SQL Editor or via the Supabase CLI

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  birth_date TEXT,
  birth_time TEXT,
  birth_time_unknown BOOLEAN DEFAULT false,
  birth_place TEXT,
  birth_latitude NUMERIC,
  birth_longitude NUMERIC,
  natal_chart_json TEXT,
  favorite_astrologer_id TEXT,
  consent_accepted_at TEXT,
  prepaid_seconds INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index on stripe_customer_id for webhook handling
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data (when using anon key + RLS)
-- Note: For server-side operations, use service_role_key which bypasses RLS
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- If you're using service_role_key for all operations (recommended for this app),
-- you can disable RLS:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Crédits minutes Callastral (idempotence webhook Stripe)
CREATE TABLE IF NOT EXISTS stripe_credit_grants (
  checkout_session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  seconds INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  pack_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_credit_grants_user ON stripe_credit_grants(user_id);

ALTER TABLE stripe_credit_grants ENABLE ROW LEVEL SECURITY;

-- Atomique : une session Checkout ne crédite qu'une fois.
CREATE OR REPLACE FUNCTION grant_prepaid_seconds(
  p_session_id TEXT,
  p_user_id TEXT,
  p_seconds INT,
  p_amount INT,
  p_pack_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO stripe_credit_grants (checkout_session_id, user_id, seconds, amount_cents, pack_id)
  VALUES (p_session_id, p_user_id, p_seconds, p_amount, p_pack_id);

  UPDATE users
  SET prepaid_seconds = COALESCE(prepaid_seconds, 0) + p_seconds
  WHERE id::text = p_user_id;

  RETURN TRUE;
EXCEPTION WHEN unique_violation THEN
  RETURN FALSE;
END;
$$;

-- Consomme des secondes prépayées. -1 si le compte est absent.
CREATE OR REPLACE FUNCTION consume_prepaid_seconds(
  p_user_id TEXT,
  p_seconds INT
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  available INT;
  used INT;
BEGIN
  SELECT prepaid_seconds INTO available
  FROM users
  WHERE id::text = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  used := LEAST(GREATEST(COALESCE(available, 0), 0), GREATEST(COALESCE(p_seconds, 0), 0));

  UPDATE users
  SET prepaid_seconds = GREATEST(COALESCE(available, 0), 0) - used
  WHERE id::text = p_user_id;

  RETURN used;
END;
$$;

REVOKE ALL ON FUNCTION grant_prepaid_seconds(TEXT, TEXT, INT, INT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION consume_prepaid_seconds(TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION grant_prepaid_seconds(TEXT, TEXT, INT, INT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION consume_prepaid_seconds(TEXT, INT) TO service_role;
