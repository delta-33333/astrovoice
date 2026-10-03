-- Événements d'entonnoir. Schéma callastral uniquement.
-- RLS activé, aucune policy anon/authenticated, droits réservés à service_role.
-- À appliquer après 20261003200000_call_reviews.sql.

BEGIN;

CREATE TABLE IF NOT EXISTS callastral.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL CHECK (name IN (
    'visit',
    'signup',
    'birth_data',
    'slot_selected',
    'checkout_started',
    'paid',
    'call_started',
    'call_completed',
    'summary_bought'
  )),
  advisor_id uuid,
  booking_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_created_idx ON callastral.events (created_at DESC);
CREATE INDEX IF NOT EXISTS events_name_created_idx ON callastral.events (name, created_at DESC);

ALTER TABLE callastral.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE callastral.events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.events TO service_role;

COMMIT;
