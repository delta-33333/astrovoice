-- Réservations et avoirs. Schéma callastral uniquement.
-- RLS activé, aucune policy anon/authenticated, droits réservés à service_role.
-- À appliquer après 20261003160000_slots.sql.

BEGIN;

CREATE TABLE IF NOT EXISTS callastral.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES callastral.users (id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL REFERENCES callastral.advisors (id),
  slot_id uuid NOT NULL REFERENCES callastral.slots (id),
  starts_at timestamptz NOT NULL,
  duration_min integer NOT NULL CHECK (duration_min IN (10, 20, 30)),
  list_price_cents integer NOT NULL CHECK (list_price_cents >= 0),
  credit_cents integer NOT NULL DEFAULT 0 CHECK (credit_cents >= 0),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  credit_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  hold_expires_at timestamptz,
  reminder_sent_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS bookings_checkout_session_idx
  ON callastral.bookings (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS bookings_user_idx ON callastral.bookings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_reminder_idx ON callastral.bookings (status, starts_at);

CREATE TABLE IF NOT EXISTS callastral.booking_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES callastral.users (id) ON DELETE CASCADE,
  source_booking_id uuid NOT NULL REFERENCES callastral.bookings (id),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  remaining_cents integer NOT NULL CHECK (remaining_cents >= 0),
  expires_at timestamptz NOT NULL,
  used_on_booking_id uuid REFERENCES callastral.bookings (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_credits_user_idx
  ON callastral.booking_credits (user_id, expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS booking_credits_source_idx
  ON callastral.booking_credits (source_booking_id);

ALTER TABLE callastral.bookings
  ADD CONSTRAINT bookings_credit_id_fkey
  FOREIGN KEY (credit_id) REFERENCES callastral.booking_credits (id);

ALTER TABLE callastral.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.bookings FORCE ROW LEVEL SECURITY;
ALTER TABLE callastral.booking_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.booking_credits FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE callastral.bookings FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE callastral.booking_credits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.bookings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.booking_credits TO service_role;

CREATE OR REPLACE FUNCTION callastral.hold_slot(
  p_user_id uuid,
  p_slot_id uuid,
  p_duration integer,
  p_list_price integer
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
BEGIN
  IF p_duration NOT IN (10, 20, 30) OR p_list_price < 0 THEN
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
      status, hold_expires_at
    )
    SELECT
      p_user_id, advisors.id, s.id, s.starts_at, p_duration,
      p_list_price, use_credit, cash, CASE WHEN use_credit > 0 THEN credit.id ELSE NULL END,
      'pending', now() + interval '10 minutes'
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
        starts_at = s.starts_at
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
    'holdExpiresAt', now() + interval '10 minutes'
  );
END;
$$;

CREATE OR REPLACE FUNCTION callastral.confirm_booking_payment(
  p_booking_id uuid,
  p_session_id text,
  p_payment_intent text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = callastral, pg_temp
AS $$
DECLARE
  b bookings%ROWTYPE;
BEGIN
  SELECT * INTO b FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN 'missing';
  END IF;
  IF b.status = 'confirmed' OR b.status = 'completed' THEN
    RETURN 'already';
  END IF;
  IF b.status <> 'pending' THEN
    RETURN 'invalid';
  END IF;

  UPDATE bookings
  SET status = 'confirmed',
      confirmed_at = now(),
      stripe_checkout_session_id = COALESCE(b.stripe_checkout_session_id, NULLIF(p_session_id, '')),
      stripe_payment_intent_id = COALESCE(NULLIF(p_payment_intent, ''), stripe_payment_intent_id)
  WHERE id = b.id;

  UPDATE slots
  SET status = 'booked',
      booking_id = b.id,
      hold_expires_at = NULL
  WHERE id = b.slot_id;

  RETURN 'confirmed';
END;
$$;

REVOKE ALL ON FUNCTION callastral.hold_slot(uuid, uuid, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION callastral.confirm_booking_payment(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION callastral.hold_slot(uuid, uuid, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION callastral.confirm_booking_payment(uuid, text, text) TO service_role;

COMMIT;
