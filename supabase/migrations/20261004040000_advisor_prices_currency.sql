-- Tarif par conseiller (centimes EUR) et devise des réservations / avoirs.
-- Ne pas appliquer depuis l'application : migration à lancer sur Supabase.
-- La formule de seed est la même que pricePerMinCents dans lib/money.ts.

ALTER TABLE callastral.advisors
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS price_per_min_cents integer;

UPDATE callastral.advisors
SET years_experience = GREATEST(1, LEAST(45, COALESCE(age, 28) - 27))
WHERE years_experience IS NULL;

UPDATE callastral.advisors
SET price_per_min_cents = GREATEST(50, LEAST(199,
  50
  + GREATEST(1, LEAST(45, COALESCE(years_experience, COALESCE(age, 28) - 27))) * 3
  + GREATEST(0, COALESCE(array_length(specialties, 1), 0) - 1) * 12
))
WHERE price_per_min_cents IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'advisors_years_experience_check'
      AND connamespace = 'callastral'::regnamespace
  ) THEN
    ALTER TABLE callastral.advisors
      ADD CONSTRAINT advisors_years_experience_check
      CHECK (years_experience IS NULL OR years_experience BETWEEN 1 AND 45);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'advisors_price_per_min_cents_check'
      AND connamespace = 'callastral'::regnamespace
  ) THEN
    ALTER TABLE callastral.advisors
      ADD CONSTRAINT advisors_price_per_min_cents_check
      CHECK (price_per_min_cents IS NULL OR price_per_min_cents BETWEEN 50 AND 199);
  END IF;
END $$;

ALTER TABLE callastral.bookings
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'eur';

ALTER TABLE callastral.booking_credits
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'eur';

ALTER TABLE callastral.stripe_credit_grants
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'eur';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_currency_check'
      AND connamespace = 'callastral'::regnamespace
  ) THEN
    ALTER TABLE callastral.bookings
      ADD CONSTRAINT bookings_currency_check
      CHECK (currency IN ('eur', 'usd', 'gbp', 'jpy', 'chf', 'cad'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'booking_credits_currency_check'
      AND connamespace = 'callastral'::regnamespace
  ) THEN
    ALTER TABLE callastral.booking_credits
      ADD CONSTRAINT booking_credits_currency_check
      CHECK (currency IN ('eur', 'usd', 'gbp', 'jpy', 'chf', 'cad'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'stripe_credit_grants_currency_check'
      AND connamespace = 'callastral'::regnamespace
  ) THEN
    ALTER TABLE callastral.stripe_credit_grants
      ADD CONSTRAINT stripe_credit_grants_currency_check
      CHECK (currency IN ('eur', 'usd', 'gbp', 'jpy', 'chf', 'cad'));
  END IF;
END $$;

-- Remplace la signature à 4 arguments pour éviter l'ambiguïté PostgREST.
DROP FUNCTION IF EXISTS callastral.hold_slot(uuid, uuid, integer, integer);

CREATE FUNCTION callastral.hold_slot(
  p_user_id uuid,
  p_slot_id uuid,
  p_duration integer,
  p_list_price integer,
  p_currency text DEFAULT 'eur'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = callastral, pg_temp
AS $$
DECLARE
  s slots%ROWTYPE;
  b bookings%ROWTYPE;
  credit booking_credits%ROWTYPE;
  new_id uuid;
  use_credit integer := 0;
  cash integer;
  cur text;
BEGIN
  cur := lower(COALESCE(p_currency, 'eur'));
  IF p_duration NOT IN (10, 20, 30) OR p_list_price < 0
     OR cur NOT IN ('eur', 'usd', 'gbp', 'jpy', 'chf', 'cad') THEN
    RAISE EXCEPTION 'invalid';
  END IF;

  SELECT * INTO s FROM slots WHERE id = p_slot_id FOR UPDATE;
  IF NOT FOUND OR s.starts_at <= now() THEN
    RAISE EXCEPTION 'unavailable';
  END IF;

  IF s.status = 'booked' THEN
    RAISE EXCEPTION 'unavailable';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM advisors WHERE id = s.advisor_id AND active
  ) THEN
    RAISE EXCEPTION 'unavailable';
  END IF;

  IF s.status = 'held' AND s.hold_expires_at IS NOT NULL AND s.hold_expires_at > now() AND s.booking_id IS NOT NULL THEN
    SELECT * INTO b FROM bookings WHERE id = s.booking_id FOR UPDATE;
    IF b.user_id IS DISTINCT FROM p_user_id OR b.status <> 'pending' THEN
      RAISE EXCEPTION 'held';
    END IF;
    IF b.credit_id IS NOT NULL AND b.credit_cents > 0 THEN
      UPDATE booking_credits
      SET remaining_cents = remaining_cents + b.credit_cents
      WHERE id = b.credit_id;
    END IF;
    new_id := b.id;
  ELSIF s.status = 'held' THEN
    UPDATE bookings
    SET status = 'cancelled', cancelled_at = now()
    WHERE id = s.booking_id AND status = 'pending';
    IF FOUND AND s.booking_id IS NOT NULL THEN
      UPDATE booking_credits
      SET remaining_cents = remaining_cents + bookings.credit_cents
      FROM bookings
      WHERE bookings.id = s.booking_id
        AND booking_credits.id = bookings.credit_id
        AND bookings.credit_cents > 0;
    END IF;
  END IF;

  SELECT * INTO credit
  FROM booking_credits
  WHERE user_id = p_user_id
    AND remaining_cents > 0
    AND expires_at > now()
    AND lower(currency) = cur
  ORDER BY expires_at
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    credit := NULL;
  ELSIF credit.remaining_cents > 0 THEN
    use_credit := LEAST(credit.remaining_cents, p_list_price);
    IF use_credit > 0 THEN
      UPDATE booking_credits
      SET remaining_cents = remaining_cents - use_credit
      WHERE id = credit.id;
    END IF;
  END IF;

  cash := p_list_price - use_credit;

  IF new_id IS NULL THEN
    INSERT INTO bookings (
      user_id, advisor_id, slot_id, starts_at, duration_min,
      list_price_cents, credit_cents, amount_cents, credit_id,
      status, hold_expires_at, currency
    )
    SELECT
      p_user_id, advisors.id, s.id, s.starts_at, p_duration,
      p_list_price, use_credit, cash, CASE WHEN use_credit > 0 THEN credit.id ELSE NULL END,
      'pending', now() + interval '10 minutes', cur
    FROM advisors
    WHERE advisors.id = s.advisor_id AND advisors.active
    RETURNING id INTO new_id;

    IF new_id IS NULL THEN
      RAISE EXCEPTION 'unavailable';
    END IF;
  ELSE
    UPDATE bookings
    SET duration_min = p_duration,
        list_price_cents = p_list_price,
        credit_cents = use_credit,
        amount_cents = cash,
        credit_id = CASE WHEN use_credit > 0 THEN credit.id ELSE NULL END,
        hold_expires_at = now() + interval '10 minutes',
        starts_at = s.starts_at,
        currency = cur
    WHERE id = new_id;
  END IF;

  UPDATE slots
  SET status = 'held',
      hold_expires_at = now() + interval '10 minutes',
      booking_id = new_id
  WHERE id = s.id;

  RETURN jsonb_build_object(
    'bookingId', new_id,
    'amountCents', cash,
    'creditCents', use_credit,
    'listPriceCents', p_list_price,
    'startsAt', s.starts_at,
    'holdExpiresAt', now() + interval '10 minutes',
    'currency', cur
  );
END;
$$;

REVOKE ALL ON FUNCTION callastral.hold_slot(uuid, uuid, integer, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION callastral.hold_slot(uuid, uuid, integer, integer, text) TO service_role;

DROP FUNCTION IF EXISTS callastral.grant_prepaid_seconds(text, text, integer, integer, text);

CREATE FUNCTION callastral.grant_prepaid_seconds(
  p_session_id text,
  p_user_id text,
  p_seconds integer,
  p_amount integer,
  p_pack_id text,
  p_currency text DEFAULT 'eur'
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = callastral, pg_temp
AS $$
DECLARE
  cur text;
BEGIN
  cur := lower(COALESCE(p_currency, 'eur'));
  IF cur NOT IN ('eur', 'usd', 'gbp', 'jpy', 'chf', 'cad') THEN
    cur := 'eur';
  END IF;

  INSERT INTO callastral.stripe_credit_grants (
    checkout_session_id, user_id, seconds, amount_cents, pack_id, currency
  )
  VALUES (p_session_id, p_user_id, p_seconds, p_amount, p_pack_id, cur);

  UPDATE callastral.users
  SET prepaid_seconds = COALESCE(prepaid_seconds, 0) + p_seconds,
      founding_claimed = CASE WHEN p_pack_id = 'founding' THEN true ELSE founding_claimed END
  WHERE id::text = p_user_id;

  RETURN TRUE;
EXCEPTION WHEN unique_violation THEN
  RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION callastral.grant_prepaid_seconds(text, text, integer, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION callastral.grant_prepaid_seconds(text, text, integer, integer, text, text) TO service_role;
