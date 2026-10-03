-- Comptes par e-mail, jetons de réinitialisation et limite d’essais.
-- Schéma callastral uniquement. À appliquer à la main.
-- Les comptes déjà créés sans mot de passe (password_hash vide ou NULL)
-- peuvent en choisir un via « Mot de passe oublié ».

BEGIN;

ALTER TABLE callastral.users
  ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE callastral.users
  ALTER COLUMN password_hash DROP NOT NULL;

UPDATE callastral.users
SET email = lower(username)
WHERE email IS NULL
  AND username LIKE '%@%';

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx
  ON callastral.users (lower(email))
  WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS callastral.password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES callastral.users (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_resets_user_idx
  ON callastral.password_resets (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS callastral.auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('login', 'reset')),
  ip text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_attempts_lookup_idx
  ON callastral.auth_attempts (kind, ip, email, created_at DESC);

CREATE INDEX IF NOT EXISTS auth_attempts_ip_idx
  ON callastral.auth_attempts (kind, ip, created_at DESC);

ALTER TABLE callastral.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.password_resets FORCE ROW LEVEL SECURITY;
ALTER TABLE callastral.auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.auth_attempts FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE callastral.password_resets FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE callastral.auth_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.password_resets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.auth_attempts TO service_role;

COMMIT;
