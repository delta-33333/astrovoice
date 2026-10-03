-- Garantie « Remboursé si les 5 premières minutes ne te conviennent pas » et avis réels.
-- Schéma callastral uniquement. RLS activé et forcé, aucun droit anon/authenticated.
-- Réversible : DROP FUNCTION callastral.claim_guarantee, callastral.guarantee_candidates,
-- DROP TABLE callastral.guarantee_claims, et réappliquer submit_review de 20261003200000.

BEGIN;

CREATE TABLE IF NOT EXISTS callastral.guarantee_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES callastral.users (id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES callastral.bookings (id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'refunded', 'credited')),
  amount_cents integer NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),
  credit_cents integer NOT NULL DEFAULT 0 CHECK (credit_cents >= 0),
  currency text NOT NULL DEFAULT 'eur',
  billed_seconds integer NOT NULL,
  stripe_refund_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- Une seule garantie par compte, une seule par réservation.
CREATE UNIQUE INDEX IF NOT EXISTS guarantee_claims_user_idx ON callastral.guarantee_claims (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS guarantee_claims_booking_idx ON callastral.guarantee_claims (booking_id);

ALTER TABLE callastral.guarantee_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.guarantee_claims FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE callastral.guarantee_claims FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.guarantee_claims TO service_role;

-- Réservations éligibles : appel terminé depuis moins de 24 h, 1 à 300 s facturées,
-- payées (carte ou avoir), jamais le paiement historique exclu.
CREATE OR REPLACE FUNCTION callastral.guarantee_candidates(p_user_id uuid)
RETURNS TABLE (
  booking_id uuid,
  advisor_id uuid,
  starts_at timestamptz,
  ended_at timestamptz,
  billed_seconds integer,
  amount_cents integer,
  credit_cents integer,
  currency text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = callastral, pg_temp
AS $$
  SELECT b.id, b.advisor_id, b.starts_at, s.ended_at, s.duration_seconds,
         b.amount_cents, b.credit_cents, COALESCE(b.currency, 'eur')
  FROM bookings b
  JOIN call_sessions s ON s.booking_id = b.id
  WHERE b.user_id = p_user_id
    AND b.status IN ('confirmed', 'completed')
    AND (b.amount_cents > 0 OR b.credit_cents > 0)
    AND COALESCE(b.stripe_payment_intent_id, '') <> 'pi_3UMSlCLWCoPr9C3J1JR6kDLB'
    AND s.ended_at IS NOT NULL
    AND s.ended_at >= now() - interval '24 hours'
    AND s.duration_seconds BETWEEN 1 AND 300
    AND NOT EXISTS (SELECT 1 FROM guarantee_claims g WHERE g.user_id = p_user_id)
  ORDER BY s.ended_at DESC;
$$;

REVOKE ALL ON FUNCTION callastral.guarantee_candidates(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION callastral.guarantee_candidates(uuid) TO service_role;

-- Réclamation atomique : vérifie l'éligibilité, enregistre la demande et rend
-- immédiatement la part payée en avoir. La part carte est remboursée ensuite par l'API (Stripe).
CREATE OR REPLACE FUNCTION callastral.claim_guarantee(p_user_id uuid, p_booking_id uuid)
RETURNS TABLE (
  claim_id uuid,
  amount_cents integer,
  credit_cents integer,
  currency text,
  payment_intent text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = callastral, pg_temp
AS $$
DECLARE
  b bookings%ROWTYPE;
  s call_sessions%ROWTYPE;
  new_id uuid;
BEGIN
  SELECT * INTO b FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND OR b.user_id <> p_user_id OR b.status NOT IN ('confirmed', 'completed') THEN
    RAISE EXCEPTION 'ineligible';
  END IF;
  IF COALESCE(b.stripe_payment_intent_id, '') = 'pi_3UMSlCLWCoPr9C3J1JR6kDLB' THEN
    RAISE EXCEPTION 'ineligible';
  END IF;
  IF b.amount_cents <= 0 AND b.credit_cents <= 0 THEN
    RAISE EXCEPTION 'ineligible';
  END IF;

  SELECT * INTO s FROM call_sessions WHERE booking_id = b.id;
  IF NOT FOUND OR s.ended_at IS NULL OR s.ended_at < now() - interval '24 hours'
     OR s.duration_seconds IS NULL OR s.duration_seconds < 1 OR s.duration_seconds > 300 THEN
    RAISE EXCEPTION 'ineligible';
  END IF;

  IF EXISTS (SELECT 1 FROM guarantee_claims WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'already_claimed';
  END IF;

  INSERT INTO guarantee_claims (user_id, booking_id, amount_cents, credit_cents, currency, billed_seconds,
                                status, resolved_at)
  VALUES (p_user_id, b.id, b.amount_cents, b.credit_cents, COALESCE(b.currency, 'eur'), s.duration_seconds,
          CASE WHEN b.amount_cents > 0 THEN 'pending' ELSE 'credited' END,
          CASE WHEN b.amount_cents > 0 THEN NULL ELSE now() END)
  RETURNING id INTO new_id;

  IF b.credit_cents > 0 AND b.credit_id IS NOT NULL THEN
    UPDATE booking_credits
    SET remaining_cents = remaining_cents + b.credit_cents,
        expires_at = GREATEST(expires_at, now() + interval '30 days')
    WHERE id = b.credit_id;
  END IF;

  RETURN QUERY SELECT new_id, b.amount_cents, b.credit_cents, COALESCE(b.currency, 'eur'), b.stripe_payment_intent_id;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'already_claimed';
END;
$$;

REVOKE ALL ON FUNCTION callastral.claim_guarantee(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION callastral.claim_guarantee(uuid, uuid) TO service_role;

-- Avis : seulement après un appel réel d'au moins 2 minutes.
CREATE OR REPLACE FUNCTION callastral.submit_review(
  p_user_id uuid,
  p_booking_id uuid,
  p_stars integer,
  p_comment text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = callastral, pg_temp
AS $$
DECLARE
  b bookings%ROWTYPE;
  new_id uuid;
  clean text;
BEGIN
  IF p_stars < 1 OR p_stars > 5 THEN
    RAISE EXCEPTION 'invalid';
  END IF;

  SELECT * INTO b FROM bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND OR b.user_id <> p_user_id OR b.status NOT IN ('confirmed', 'completed') THEN
    RAISE EXCEPTION 'ineligible';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM call_sessions s
    WHERE s.booking_id = b.id AND s.ended_at IS NOT NULL AND COALESCE(s.duration_seconds, 0) >= 120
  ) THEN
    RAISE EXCEPTION 'ineligible';
  END IF;

  clean := NULLIF(left(btrim(COALESCE(p_comment, '')), 1000), '');

  INSERT INTO reviews (user_id, advisor_id, booking_id, stars, comment)
  VALUES (p_user_id, b.advisor_id, b.id, p_stars, clean)
  RETURNING id INTO new_id;

  RETURN new_id;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'exists';
END;
$$;

REVOKE ALL ON FUNCTION callastral.submit_review(uuid, uuid, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION callastral.submit_review(uuid, uuid, integer, text) TO service_role;

COMMIT;
