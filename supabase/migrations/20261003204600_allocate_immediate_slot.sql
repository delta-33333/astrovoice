-- Hotfix « Appeler maintenant » : un créneau immédiat périmé (début passé, supprimé ou retenu)
-- ne doit plus bloquer le paiement. Cette fonction rend un créneau immédiat valable pour le
-- conseiller : un créneau libre qui commence dans les 15 minutes, sinon un nouveau créneau
-- qui commence dans 2 minutes, sauf si le conseiller est réellement occupé (réservé, ou retenu
-- par quelqu’un d’autre). Schéma callastral uniquement ; service_role seulement.
-- Réversible : DROP FUNCTION callastral.allocate_immediate_slot(uuid, uuid);

CREATE OR REPLACE FUNCTION callastral.allocate_immediate_slot(p_advisor_id uuid, p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = callastral, pg_temp
AS $$
DECLARE
  found_id uuid;
  new_start timestamptz;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM advisors WHERE id = p_advisor_id AND active) THEN
    RETURN NULL;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('immediate:' || p_advisor_id::text));

  -- Libère les blocages expirés de ce conseiller (paiements abandonnés).
  -- (même règle que ensure_immediate_availability : la réservation en attente reste, le créneau est libéré)
  UPDATE slots
  SET status = 'available', hold_expires_at = NULL, booking_id = NULL
  WHERE advisor_id = p_advisor_id
    AND status = 'held'
    AND hold_expires_at IS NOT NULL AND hold_expires_at < now();

  -- Blocage encore valide de ce même client sur ce conseiller : on le réutilise.
  SELECT s.id INTO found_id
  FROM slots s JOIN bookings b ON b.id = s.booking_id
  WHERE s.advisor_id = p_advisor_id AND s.status = 'held'
    AND s.hold_expires_at > now() AND s.starts_at > now()
    AND b.user_id = p_user_id AND b.status = 'pending'
  ORDER BY s.starts_at
  LIMIT 1;
  IF found_id IS NOT NULL THEN
    RETURN found_id;
  END IF;

  -- Créneau libre qui commence bientôt.
  SELECT id INTO found_id
  FROM slots
  WHERE advisor_id = p_advisor_id AND status = 'available'
    AND starts_at > now() + interval '30 seconds'
    AND starts_at <= now() + interval '15 minutes'
  ORDER BY starts_at
  LIMIT 1;
  IF found_id IS NOT NULL THEN
    RETURN found_id;
  END IF;

  -- Réellement occupé : un rendez-vous réservé ou retenu par un autre client qui chevauche.
  IF EXISTS (
    SELECT 1 FROM slots busy
    WHERE busy.advisor_id = p_advisor_id
      AND (busy.status = 'booked' OR (busy.status = 'held' AND busy.hold_expires_at > now()))
      AND busy.starts_at < now() + interval '35 minutes'
      AND busy.starts_at + make_interval(mins => GREATEST(busy.duration_min, 30)) > now()
  ) THEN
    RETURN NULL;
  END IF;

  new_start := date_trunc('minute', now()) + interval '2 minutes';
  INSERT INTO slots (advisor_id, starts_at, duration_min, status)
  VALUES (p_advisor_id, new_start, 30, 'available')
  ON CONFLICT (advisor_id, starts_at) DO NOTHING
  RETURNING id INTO found_id;

  IF found_id IS NULL THEN
    SELECT id INTO found_id FROM slots
    WHERE advisor_id = p_advisor_id AND starts_at = new_start AND status = 'available';
  END IF;
  RETURN found_id;
END;
$$;

REVOKE ALL ON FUNCTION callastral.allocate_immediate_slot(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION callastral.allocate_immediate_slot(uuid, uuid) TO service_role;
