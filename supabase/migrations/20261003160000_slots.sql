-- Créneaux Callastral. Schéma callastral uniquement.
-- RLS activé, aucune policy anon/authenticated, droits réservés à service_role.
-- À appliquer après 20261003143000_advisors.sql.
-- La fonction remplit 7 jours dans la capacité quotidienne, puis garantit
-- 1 à 3 conseillers par langue avec un créneau dans 5 à 15 minutes,
-- en déplaçant un créneau libre (pas en inventant de la capacité).

BEGIN;

CREATE TABLE IF NOT EXISTS callastral.slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL REFERENCES callastral.advisors (id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  duration_min integer NOT NULL CHECK (duration_min > 0 AND duration_min <= 120),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'held', 'booked')),
  hold_expires_at timestamptz,
  booking_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (advisor_id, starts_at)
);

CREATE INDEX IF NOT EXISTS slots_advisor_starts_idx ON callastral.slots (advisor_id, starts_at);
CREATE INDEX IF NOT EXISTS slots_status_starts_idx ON callastral.slots (status, starts_at);

ALTER TABLE callastral.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.slots FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE callastral.slots FROM PUBLIC;
REVOKE ALL ON TABLE callastral.slots FROM anon;
REVOKE ALL ON TABLE callastral.slots FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.slots TO service_role;

CREATE OR REPLACE FUNCTION callastral.generate_advisor_slots()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = callastral, pg_temp
AS $$
DECLARE
  adv record;
  lang text;
  day_offset int;
  local_day date;
  tz text;
  existing_count int;
  slot_index int;
  step_minutes int;
  start_local timestamp;
  start_utc timestamptz;
  inserted int := 0;
  moved int := 0;
  immediate_existing int;
  needed int;
  new_start timestamptz;
  candidate uuid;
BEGIN
  UPDATE callastral.slots
  SET status = 'available', hold_expires_at = NULL, booking_id = NULL
  WHERE status = 'held'
    AND hold_expires_at IS NOT NULL
    AND hold_expires_at < now();

  DELETE FROM callastral.slots
  WHERE status = 'available'
    AND starts_at < now();

  FOR adv IN
    SELECT id, languages, daily_capacity
    FROM callastral.advisors
    WHERE active
  LOOP
    tz := CASE adv.languages[1]
      WHEN 'en' THEN 'Europe/London'
      WHEN 'es' THEN 'Europe/Madrid'
      WHEN 'de' THEN 'Europe/Berlin'
      WHEN 'it' THEN 'Europe/Rome'
      ELSE 'Europe/Paris'
    END;

    FOR day_offset IN 0..6 LOOP
      local_day := (timezone(tz, now()))::date + day_offset;

      SELECT count(*) INTO existing_count
      FROM callastral.slots
      WHERE advisor_id = adv.id
        AND (starts_at AT TIME ZONE tz)::date = local_day;

      IF existing_count >= adv.daily_capacity THEN
        CONTINUE;
      END IF;

      step_minutes := GREATEST(30, (12 * 60) / adv.daily_capacity);

      FOR slot_index IN 0..(adv.daily_capacity - 1) LOOP
        EXIT WHEN existing_count >= adv.daily_capacity;

        start_local := local_day + time '09:00' + (slot_index * step_minutes) * interval '1 minute';
        start_utc := start_local AT TIME ZONE tz;

        IF start_utc <= now() OR start_local::time >= time '21:00' THEN
          CONTINUE;
        END IF;

        INSERT INTO callastral.slots (advisor_id, starts_at, duration_min, status)
        SELECT adv.id, start_utc, 30, 'available'
        WHERE NOT EXISTS (
          SELECT 1
          FROM callastral.slots existing
          WHERE existing.advisor_id = adv.id
            AND existing.starts_at BETWEEN start_utc - interval '20 minutes'
                                      AND start_utc + interval '20 minutes'
        );

        IF FOUND THEN
          inserted := inserted + 1;
          existing_count := existing_count + 1;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;

  FOREACH lang IN ARRAY ARRAY['fr', 'en', 'es', 'de', 'it'] LOOP
    SELECT count(DISTINCT slots.advisor_id) INTO immediate_existing
    FROM callastral.slots
    JOIN callastral.advisors ON advisors.id = slots.advisor_id
    WHERE slots.status = 'available'
      AND advisors.active
      AND advisors.languages[1] = lang
      AND slots.starts_at > now()
      AND slots.starts_at <= now() + interval '15 minutes';

    IF immediate_existing BETWEEN 1 AND 3 THEN
      CONTINUE;
    END IF;
    IF immediate_existing > 3 THEN
      CONTINUE;
    END IF;

    needed := 1 + floor(random() * 3)::int;

    FOR adv IN
      SELECT advisors.id
      FROM callastral.advisors
      WHERE advisors.active
        AND advisors.languages[1] = lang
        AND NOT EXISTS (
          SELECT 1
          FROM callastral.slots soon
          WHERE soon.advisor_id = advisors.id
            AND soon.status = 'available'
            AND soon.starts_at > now()
            AND soon.starts_at <= now() + interval '15 minutes'
        )
      ORDER BY advisors.featured ASC, random()
      LIMIT needed
    LOOP
      new_start := now() + make_interval(mins => 5 + floor(random() * 11)::int);

      SELECT slots.id INTO candidate
      FROM callastral.slots
      WHERE slots.advisor_id = adv.id
        AND slots.status = 'available'
        AND slots.starts_at > now() + interval '20 minutes'
      ORDER BY slots.starts_at
      LIMIT 1;

      IF candidate IS NULL THEN
        CONTINUE;
      END IF;

      IF EXISTS (
        SELECT 1 FROM callastral.slots taken
        WHERE taken.advisor_id = adv.id
          AND taken.starts_at = new_start
          AND taken.id <> candidate
      ) THEN
        CONTINUE;
      END IF;

      UPDATE callastral.slots
      SET starts_at = new_start
      WHERE id = candidate;

      IF FOUND THEN
        moved := moved + 1;
      END IF;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('inserted', inserted, 'moved', moved);
END;
$$;

REVOKE ALL ON FUNCTION callastral.generate_advisor_slots() FROM PUBLIC;
REVOKE ALL ON FUNCTION callastral.generate_advisor_slots() FROM anon;
REVOKE ALL ON FUNCTION callastral.generate_advisor_slots() FROM authenticated;
GRANT EXECUTE ON FUNCTION callastral.generate_advisor_slots() TO service_role;

SELECT callastral.generate_advisor_slots();

COMMIT;
