-- Étapes d’entonnoir supplémentaires. Schéma callastral uniquement.
-- À appliquer à la main. Les anciens noms restent acceptés.

BEGIN;

DO $$
DECLARE
  cons text;
BEGIN
  FOR cons IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'callastral.events'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%name IN%'
  LOOP
    EXECUTE format('ALTER TABLE callastral.events DROP CONSTRAINT %I', cons);
  END LOOP;
END $$;

ALTER TABLE callastral.events
  ADD CONSTRAINT events_name_check CHECK (name IN (
    'view_home',
    'view_advisor',
    'select_slot',
    'signup',
    'checkout_start',
    'payment_success',
    'call_started',
    'call_completed',
    'visit',
    'birth_data',
    'slot_selected',
    'checkout_started',
    'paid',
    'summary_bought'
  ));

COMMIT;
