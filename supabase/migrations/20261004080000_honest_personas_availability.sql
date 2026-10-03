-- Honnêteté : les personas virtuelles ne revendiquent ni âge ni années de pratique,
-- et chaque conseiller actif non occupé reçoit un créneau immédiat (service disponible 24 h/24).
-- Réversible :
--   UPDATE callastral.advisors a SET persona_prompt = b.persona_prompt
--   FROM callastral.advisor_persona_backup b
--   WHERE b.advisor_id = a.id AND b.migration = '20261004080000_honest_personas_availability';
--   Fonction : réappliquer 20261004030000_immediate_availability.sql (target := LEAST(3, pool)).

INSERT INTO callastral.advisor_persona_backup (advisor_id, migration, persona_prompt, saved_at)
SELECT id, '20261004080000_honest_personas_availability', persona_prompt, now()
FROM callastral.advisors
WHERE persona_prompt IS NOT NULL AND (persona_prompt ~ ', [0-9]+ ans\.' OR persona_prompt ~ ' Tu consultes depuis [0-9]+ ans\.' OR persona_prompt ~ ', [0-9]+ years old\.' OR persona_prompt ~ ' You have been consulting for [0-9]+ years\.' OR persona_prompt ~ ', [0-9]+ años\.' OR persona_prompt ~ ' Consultas desde hace [0-9]+ años\.' OR persona_prompt ~ ', [0-9]+ Jahre alt\.' OR persona_prompt ~ ' Du berätst seit [0-9]+ Jahren\.' OR persona_prompt ~ ', [0-9]+ anni\.' OR persona_prompt ~ ' Consulti da [0-9]+ anni\.');

UPDATE callastral.advisors
SET persona_prompt = regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(persona_prompt, ', [0-9]+ ans\.', '.'), ' Tu consultes depuis [0-9]+ ans\.', ' Tu es une persona virtuelle : tu ne revendiques jamais d’âge, d’années de pratique ni de parcours humain.'), ', [0-9]+ years old\.', '.'), ' You have been consulting for [0-9]+ years\.', ' You are a virtual persona: never claim an age, years of practice or a human career.'), ', [0-9]+ años\.', '.'), ' Consultas desde hace [0-9]+ años\.', ' Eres una persona virtual: nunca afirmes una edad, años de práctica ni una trayectoria humana.'), ', [0-9]+ Jahre alt\.', '.'), ' Du berätst seit [0-9]+ Jahren\.', ' Du bist eine virtuelle Persona: nenne nie ein Alter, Berufsjahre oder einen menschlichen Werdegang.'), ', [0-9]+ anni\.', '.'), ' Consulti da [0-9]+ anni\.', ' Sei una persona virtuale: non dichiarare mai un''età, anni di pratica o un percorso umano.')
WHERE persona_prompt IS NOT NULL AND (persona_prompt ~ ', [0-9]+ ans\.' OR persona_prompt ~ ' Tu consultes depuis [0-9]+ ans\.' OR persona_prompt ~ ', [0-9]+ years old\.' OR persona_prompt ~ ' You have been consulting for [0-9]+ years\.' OR persona_prompt ~ ', [0-9]+ años\.' OR persona_prompt ~ ' Consultas desde hace [0-9]+ años\.' OR persona_prompt ~ ', [0-9]+ Jahre alt\.' OR persona_prompt ~ ' Du berätst seit [0-9]+ Jahren\.' OR persona_prompt ~ ', [0-9]+ anni\.' OR persona_prompt ~ ' Consulti da [0-9]+ anni\.');

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
    AND starts_at < now()
    AND NOT EXISTS (SELECT 1 FROM callastral.bookings WHERE bookings.slot_id = slots.id);

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

    target := pool;
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

REVOKE ALL ON FUNCTION callastral.ensure_immediate_availability() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION callastral.ensure_immediate_availability() TO service_role;
