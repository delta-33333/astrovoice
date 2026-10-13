-- Plancher minute 0,89 €, conseillers au moins 0,99 €, Alexandre Lambert à 0,99 €.
-- Accueil une fois par compte, formules hebdomadaires, rappel avant le premier plein tarif.
-- Schéma callastral uniquement. À appliquer à la main. Ne pas lancer depuis l’application.

BEGIN;

ALTER TABLE callastral.advisors
  DROP CONSTRAINT IF EXISTS advisors_price_per_min_cents_check;

UPDATE callastral.advisors
SET price_per_min_cents = GREATEST(price_per_min_cents, 99)
WHERE price_per_min_cents IS NOT NULL;

UPDATE callastral.advisors
SET price_per_min_cents = 99
WHERE slug = 'alexandre-lambert'
   OR (first_name = 'Alexandre' AND last_name = 'Lambert');

ALTER TABLE callastral.advisors
  ADD CONSTRAINT advisors_price_per_min_cents_check
  CHECK (price_per_min_cents IS NULL OR price_per_min_cents BETWEEN 89 AND 199);

ALTER TABLE callastral.users
  ADD COLUMN IF NOT EXISTS intro_claimed boolean NOT NULL DEFAULT false;

ALTER TABLE callastral.subscriptions
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS first_full_charge_at timestamptz,
  ADD COLUMN IF NOT EXISTS renewal_reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS language text;

ALTER TABLE callastral.bookings
  ADD COLUMN IF NOT EXISTS intro_applied boolean NOT NULL DEFAULT false;

COMMIT;
