-- Étapes d’entonnoir supplémentaires. Schéma callastral uniquement.
-- À appliquer à la main. Les anciens noms restent acceptés.

BEGIN;

-- pg_get_constraintdef rend « name = ANY (ARRAY[...]) », pas « IN » : on supprime par nom.
ALTER TABLE callastral.events DROP CONSTRAINT IF EXISTS events_name_check;

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
