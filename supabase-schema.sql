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
