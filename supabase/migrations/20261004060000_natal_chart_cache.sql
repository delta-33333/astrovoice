-- Cache du thème natal, du fuseau et du géocodage.
-- Schéma callastral uniquement. À appliquer à la main. Ne pas lancer depuis l’application.
-- Les appels et les rapports relisent ce JSON : ils ne recalculent pas le thème.

BEGIN;

ALTER TABLE callastral.users
  ADD COLUMN IF NOT EXISTS birth_timezone text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'callastral' AND table_name = 'users' AND column_name = 'birth_latitude'
  ) THEN
    ALTER TABLE callastral.users ADD COLUMN birth_latitude numeric;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'callastral' AND table_name = 'users' AND column_name = 'birth_longitude'
  ) THEN
    ALTER TABLE callastral.users ADD COLUMN birth_longitude numeric;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'callastral' AND table_name = 'users' AND column_name = 'natal_chart_json'
  ) THEN
    ALTER TABLE callastral.users ADD COLUMN natal_chart_json text;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS callastral.natal_charts (
  fingerprint text PRIMARY KEY,
  birth_date text NOT NULL,
  birth_time text,
  birth_time_unknown boolean NOT NULL DEFAULT false,
  birth_place text NOT NULL,
  latitude numeric,
  longitude numeric,
  time_zone text,
  engine text,
  chart jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS callastral.place_geocodes (
  place_key text PRIMARY KEY,
  label text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  time_zone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE callastral.natal_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.natal_charts FORCE ROW LEVEL SECURITY;
ALTER TABLE callastral.place_geocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.place_geocodes FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE callastral.natal_charts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE callastral.place_geocodes FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.natal_charts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.place_geocodes TO service_role;

COMMIT;
