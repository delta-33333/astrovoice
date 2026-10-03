-- Abonnements, rapports écrits, reprise à prix réduit, plafond minute 1,99 €.
-- Schéma callastral uniquement. À appliquer à la main. Ne pas lancer depuis l’application.

BEGIN;

UPDATE callastral.advisors
SET price_per_min_cents = LEAST(price_per_min_cents, 199)
WHERE price_per_min_cents IS NOT NULL
  AND price_per_min_cents > 199;

ALTER TABLE callastral.advisors
  DROP CONSTRAINT IF EXISTS advisors_price_per_min_cents_check;

ALTER TABLE callastral.advisors
  ADD CONSTRAINT advisors_price_per_min_cents_check
  CHECK (price_per_min_cents IS NULL OR price_per_min_cents BETWEEN 50 AND 199);

CREATE TABLE IF NOT EXISTS callastral.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES callastral.users (id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_price_id text,
  status text NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  fair_use_seconds_used integer NOT NULL DEFAULT 0,
  fair_use_period text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_idx
  ON callastral.subscriptions (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS callastral.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES callastral.users (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('natal_pdf', 'forecast', 'compatibility', 'summary')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'delivered', 'failed')),
  stripe_checkout_session_id text UNIQUE,
  currency text NOT NULL DEFAULT 'eur',
  amount_cents integer NOT NULL,
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  chart jsonb,
  body text,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_user_idx
  ON callastral.reports (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS callastral.rebook_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES callastral.users (id) ON DELETE CASCADE,
  percent integer NOT NULL DEFAULT 15 CHECK (percent BETWEEN 1 AND 90),
  source_booking_id uuid,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  consumed_booking_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS rebook_offers_one_pending_idx
  ON callastral.rebook_offers (user_id)
  WHERE consumed_at IS NULL;

ALTER TABLE callastral.bookings
  ADD COLUMN IF NOT EXISTS rebook_offer_id uuid;

ALTER TABLE callastral.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE callastral.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.reports FORCE ROW LEVEL SECURITY;
ALTER TABLE callastral.rebook_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.rebook_offers FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE callastral.subscriptions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE callastral.reports FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE callastral.rebook_offers FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.reports TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.rebook_offers TO service_role;

COMMIT;
