-- Compatibilité de couple, mémoire d’appel, horoscope du matin.
-- Le résultat de couple ne stocke ni date, ni heure, ni lieu.
-- À appliquer à la main. L’application ne lance pas cette migration.

BEGIN;

ALTER TABLE callastral.users
  ADD COLUMN IF NOT EXISTS advisor_memory_enabled boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS callastral.couple_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL CHECK (locale IN ('fr', 'en', 'es', 'de', 'it')),
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  strengths jsonb NOT NULL,
  tensions jsonb NOT NULL,
  initial_a text NOT NULL,
  initial_b text NOT NULL,
  label_a text,
  label_b text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS callastral.call_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES callastral.users (id) ON DELETE CASCADE,
  booking_id uuid NOT NULL UNIQUE REFERENCES callastral.bookings (id) ON DELETE CASCADE,
  advisor_id uuid,
  topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  advice jsonb NOT NULL DEFAULT '[]'::jsonb,
  mood text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS call_memories_user_idx
  ON callastral.call_memories (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS callastral.horoscope_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  locale text NOT NULL CHECK (locale IN ('fr', 'en', 'es', 'de', 'it')),
  sign text NOT NULL,
  birth_date date,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  consent_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  last_sent_on date,
  user_id uuid REFERENCES callastral.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS horoscope_subscribers_send_idx
  ON callastral.horoscope_subscribers (status, last_sent_on);

CREATE TABLE IF NOT EXISTS callastral.horoscope_issues (
  day date NOT NULL,
  locale text NOT NULL,
  sign text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (day, locale, sign)
);

ALTER TABLE callastral.couple_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.couple_results FORCE ROW LEVEL SECURITY;
ALTER TABLE callastral.call_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.call_memories FORCE ROW LEVEL SECURITY;
ALTER TABLE callastral.horoscope_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.horoscope_subscribers FORCE ROW LEVEL SECURITY;
ALTER TABLE callastral.horoscope_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.horoscope_issues FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE callastral.couple_results FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE callastral.call_memories FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE callastral.horoscope_subscribers FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE callastral.horoscope_issues FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.couple_results TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.call_memories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.horoscope_subscribers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.horoscope_issues TO service_role;

-- Conversion des inscrits à l’horoscope, jointe aux sources déjà suivies.
CREATE OR REPLACE VIEW callastral.acquisition_sources WITH (security_invoker = true) AS
WITH visitors AS (
  SELECT source, coalesce(utm_medium, '') AS medium, coalesce(utm_campaign, '') AS campaign,
         count(*) AS visitors
  FROM callastral.visitor_first_touch
  GROUP BY 1, 2, 3
),
checkout_touch AS (
  SELECT DISTINCT ON (user_id)
    user_id, utm_source, utm_medium, utm_campaign, referrer, landing_page
  FROM (
    SELECT user_id, utm_source, utm_medium, utm_campaign, referrer, landing_page, created_at
    FROM callastral.checkout_attributions
    UNION ALL
    SELECT user_id, utm_source, utm_medium, utm_campaign, referrer, landing_page, created_at
    FROM callastral.bookings
    WHERE utm_source IS NOT NULL OR referrer IS NOT NULL OR landing_page IS NOT NULL
  ) touches
  ORDER BY user_id, created_at
),
accounts AS (
  SELECT callastral.traffic_source(
           coalesce(u.first_utm_source, c.utm_source),
           coalesce(u.first_referrer, c.referrer)
         ) AS source,
         coalesce(u.first_utm_medium, c.utm_medium, '') AS medium,
         coalesce(u.first_utm_campaign, c.utm_campaign, '') AS campaign,
         count(*) AS signups,
         count(*) FILTER (WHERE EXISTS (
           SELECT 1 FROM callastral.funnel_paid_bookings p WHERE p.user_id = u.id
         )) AS paying_users
  FROM callastral.users u
  LEFT JOIN checkout_touch c ON c.user_id = u.id
  WHERE NOT callastral.is_test_email(u.email)
    AND (
      u.first_seen_at IS NOT NULL
      OR c.utm_source IS NOT NULL
      OR c.referrer IS NOT NULL
      OR c.landing_page IS NOT NULL
    )
  GROUP BY 1, 2, 3
),
base AS (
  SELECT
    coalesce(v.source, a.source) AS source,
    coalesce(v.medium, a.medium) AS medium,
    coalesce(v.campaign, a.campaign) AS campaign,
    coalesce(v.visitors, 0) AS visitors,
    coalesce(a.signups, 0) AS signups,
    coalesce(a.paying_users, 0) AS paying_users
  FROM visitors v
  FULL JOIN accounts a ON a.source = v.source AND a.medium = v.medium AND a.campaign = v.campaign
),
subscribers AS (
  SELECT
    callastral.traffic_source(coalesce(nullif(utm_source, ''), 'horoscope'), NULL) AS source,
    coalesce(utm_medium, '') AS medium,
    coalesce(utm_campaign, '') AS campaign,
    count(*) AS subscribers,
    count(*) FILTER (WHERE user_id IS NOT NULL) AS subscriber_signups,
    count(*) FILTER (WHERE user_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM callastral.funnel_paid_bookings p WHERE p.user_id = h.user_id
    )) AS subscriber_paying
  FROM callastral.horoscope_subscribers h
  WHERE status = 'confirmed'
    AND NOT callastral.is_test_email(email)
  GROUP BY 1, 2, 3
)
SELECT
  coalesce(b.source, s.source) AS source,
  coalesce(b.medium, s.medium) AS medium,
  coalesce(b.campaign, s.campaign) AS campaign,
  coalesce(b.visitors, 0) AS visitors,
  coalesce(b.signups, 0) AS signups,
  coalesce(b.paying_users, 0) AS paying_users,
  coalesce(s.subscribers, 0) AS subscribers,
  coalesce(s.subscriber_signups, 0) AS subscriber_signups,
  coalesce(s.subscriber_paying, 0) AS subscriber_paying
FROM base b
FULL JOIN subscribers s ON s.source = b.source AND s.medium = b.medium AND s.campaign = b.campaign
ORDER BY coalesce(b.visitors, 0) DESC, coalesce(s.subscribers, 0) DESC, coalesce(b.signups, 0) DESC;

REVOKE ALL ON callastral.acquisition_sources FROM PUBLIC, anon, authenticated;
GRANT SELECT ON callastral.acquisition_sources TO service_role;

COMMIT;
