-- Disponibilité immédiate 24 h/24. Schéma callastral uniquement.
-- RLS inchangé : exécution réservée à service_role.
-- À appliquer à la main (ne pas lancer depuis l’application).
-- Les conseillers sont joignables à toute heure : on crée de vrais créneaux
-- dans les 8 à 14 prochaines minutes, sans attendre le cron quotidien.
-- Pour chaque langue (fr, en, es, de, it) et chaque spécialité, 2 conseillers
-- au minimum et 3 dès que le vivier le permet.

BEGIN;

CREATE OR REPLACE FUNCTION callastral.ensure_immediate_availability()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = callastral, pg_temp
AS $$
DECLARE
  lang text;
  spec text;
  adv record;
  pool int;
  target int;
  current_n int;
  needed int;
  picked int;
  new_start timestamptz;
  inserted int := 0;
  released int := 0;
BEGIN
  PERFORM set_config('lock_timeout', '3s', true);
  PERFORM pg_advisory_xact_lock(81432026);

  UPDATE callastral.slots
  SET status = 'available', hold_expires_at = NULL, booking_id = NULL
  WHERE status = 'held'
    AND hold_expires_at IS NOT NULL
    AND hold_expires_at < now();
  GET DIAGNOSTICS released = ROW_COUNT;

  DELETE FROM callastral.slots
  WHERE status = 'available'
    AND starts_at < now();

  FOR lang, spec IN
    SELECT langs.lang, specs.spec
    FROM unnest(ARRAY['fr', 'en', 'es', 'de', 'it']::text[]) AS langs(lang)
    CROSS JOIN unnest(ARRAY[
      'amour',
      'carrière',
      'spiritualité',
      'transition de vie',
      'compatibilité',
      'argent',
      'famille'
    ]::text[]) AS specs(spec)
  LOOP
    SELECT count(*) INTO pool
    FROM callastral.advisors
    WHERE active
      AND lang = ANY (languages)
      AND spec = ANY (specialties);

    target := LEAST(3, pool);
    IF target < 1 THEN
      CONTINUE;
    END IF;

    SELECT count(DISTINCT advisors.id) INTO current_n
    FROM callastral.advisors
    JOIN callastral.slots ON slots.advisor_id = advisors.id
    WHERE advisors.active
      AND lang = ANY (advisors.languages)
      AND spec = ANY (advisors.specialties)
      AND slots.status = 'available'
      AND slots.starts_at > now()
      AND slots.starts_at <= now() + interval '15 minutes';

    IF current_n >= target THEN
      CONTINUE;
    END IF;

    needed := target - current_n;
    picked := 0;

    FOR adv IN
      SELECT advisors.id
      FROM callastral.advisors
      WHERE advisors.active
        AND lang = ANY (advisors.languages)
        AND spec = ANY (advisors.specialties)
        AND NOT EXISTS (
          SELECT 1
          FROM callastral.slots soon
          WHERE soon.advisor_id = advisors.id
            AND soon.status = 'available'
            AND soon.starts_at > now()
            AND soon.starts_at <= now() + interval '15 minutes'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM callastral.slots busy
          WHERE busy.advisor_id = advisors.id
            AND busy.status IN ('held', 'booked')
            AND busy.starts_at > now() - interval '30 minutes'
            AND busy.starts_at < now() + interval '45 minutes'
        )
      ORDER BY advisors.featured DESC, random()
      LIMIT needed + 6
    LOOP
      EXIT WHEN picked >= needed;

      new_start := date_trunc(
        'minute',
        now() + make_interval(secs => 480 + floor(random() * 360)::int)
      );

      BEGIN
        INSERT INTO callastral.slots (advisor_id, starts_at, duration_min, status)
        SELECT adv.id, new_start, 30, 'available'
        WHERE NOT EXISTS (
          SELECT 1
          FROM callastral.slots existing
          WHERE existing.advisor_id = adv.id
            AND existing.starts_at BETWEEN new_start - interval '20 minutes'
                                      AND new_start + interval '20 minutes'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM callastral.slots soon
          WHERE soon.advisor_id = adv.id
            AND soon.status = 'available'
            AND soon.starts_at > now()
            AND soon.starts_at <= now() + interval '15 minutes'
        );

        IF FOUND THEN
          inserted := inserted + 1;
          picked := picked + 1;
        END IF;
      EXCEPTION
        WHEN unique_violation THEN
          NULL;
      END;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('inserted', inserted, 'released', released);
END;
$$;

CREATE OR REPLACE FUNCTION callastral.directory_slot_summary()
RETURNS TABLE (
  advisor_id uuid,
  slots_today integer,
  slots_week integer,
  next_slot_at timestamptz,
  has_immediate boolean,
  immediate_slot_id uuid,
  immediate_starts_at timestamptz,
  upcoming timestamptz[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = callastral, pg_temp
AS $$
  SELECT
    advisors.id,
    COALESCE(stats.slots_today, 0)::integer,
    COALESCE(stats.slots_week, 0)::integer,
    stats.next_slot_at,
    COALESCE(stats.has_immediate, false),
    stats.immediate_slot_id,
    stats.immediate_starts_at,
    COALESCE(stats.upcoming, ARRAY[]::timestamptz[])
  FROM callastral.advisors
  LEFT JOIN LATERAL (
    SELECT
      count(*) FILTER (
        WHERE (slots.starts_at AT TIME ZONE 'Europe/Paris')::date
            = (now() AT TIME ZONE 'Europe/Paris')::date
      )::integer AS slots_today,
      count(*) FILTER (
        WHERE slots.starts_at < now() + interval '7 days'
      )::integer AS slots_week,
      min(slots.starts_at) AS next_slot_at,
      bool_or(slots.starts_at <= now() + interval '15 minutes') AS has_immediate,
      (
        array_agg(slots.id ORDER BY slots.starts_at)
        FILTER (WHERE slots.starts_at <= now() + interval '15 minutes')
      )[1] AS immediate_slot_id,
      (
        array_agg(slots.starts_at ORDER BY slots.starts_at)
        FILTER (WHERE slots.starts_at <= now() + interval '15 minutes')
      )[1] AS immediate_starts_at,
      (array_agg(slots.starts_at ORDER BY slots.starts_at))[1:40] AS upcoming
    FROM callastral.slots
    WHERE slots.advisor_id = advisors.id
      AND slots.status = 'available'
      AND slots.starts_at > now()
  ) stats ON true
  WHERE advisors.active;
$$;

REVOKE ALL ON FUNCTION callastral.ensure_immediate_availability() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION callastral.directory_slot_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION callastral.ensure_immediate_availability() TO service_role;
GRANT EXECUTE ON FUNCTION callastral.directory_slot_summary() TO service_role;

COMMIT;
