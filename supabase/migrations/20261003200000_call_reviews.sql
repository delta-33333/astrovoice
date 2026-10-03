-- Transcriptions, résumés écrits et avis. Schéma callastral uniquement.
-- call_sessions existe déjà dans le bootstrap : on l'enrichit, on verrouille le RLS.
-- RLS activé, aucune policy anon/authenticated, droits réservés à service_role.
-- À appliquer après 20261003180000_bookings.sql.

BEGIN;

CREATE TABLE IF NOT EXISTS callastral.call_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES callastral.users (id) ON DELETE CASCADE,
  astrologer_id text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  summary text,
  key_points jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE callastral.call_sessions
  ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES callastral.bookings (id),
  ADD COLUMN IF NOT EXISTS transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS summary_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS summary_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS summary_emailed_at timestamptz,
  ADD COLUMN IF NOT EXISTS summary_link_emailed_at timestamptz,
  ADD COLUMN IF NOT EXISTS summary_declined boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS call_sessions_booking_idx
  ON callastral.call_sessions (booking_id)
  WHERE booking_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS call_sessions_summary_checkout_idx
  ON callastral.call_sessions (summary_checkout_session_id)
  WHERE summary_checkout_session_id IS NOT NULL;

ALTER TABLE callastral.call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.call_sessions FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE callastral.call_sessions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.call_sessions TO service_role;

CREATE TABLE IF NOT EXISTS callastral.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES callastral.users (id) ON DELETE CASCADE,
  advisor_id uuid NOT NULL REFERENCES callastral.advisors (id),
  booking_id uuid NOT NULL REFERENCES callastral.bookings (id),
  stars integer NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS reviews_booking_idx ON callastral.reviews (booking_id);
CREATE INDEX IF NOT EXISTS reviews_advisor_idx ON callastral.reviews (advisor_id);

ALTER TABLE callastral.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.reviews FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE callastral.reviews FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.reviews TO service_role;

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
  IF NOT FOUND OR b.user_id <> p_user_id OR b.status <> 'completed' THEN
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

CREATE OR REPLACE VIEW callastral.advisor_signals AS
SELECT
  a.id AS advisor_id,
  COALESCE(r.review_count, 0)::integer AS review_count,
  r.rating_sum,
  COALESCE(b.booking_count, 0)::integer AS booking_count
FROM callastral.advisors a
LEFT JOIN (
  SELECT advisor_id, count(*)::integer AS review_count, sum(stars)::integer AS rating_sum
  FROM callastral.reviews
  GROUP BY advisor_id
) r ON r.advisor_id = a.id
LEFT JOIN (
  SELECT advisor_id, count(*)::integer AS booking_count
  FROM callastral.bookings
  WHERE status IN ('confirmed', 'completed')
  GROUP BY advisor_id
) b ON b.advisor_id = a.id;

REVOKE ALL ON callastral.advisor_signals FROM PUBLIC, anon, authenticated;
GRANT SELECT ON callastral.advisor_signals TO service_role;

COMMIT;
