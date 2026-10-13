-- Source de la première visite sur les visites, les comptes et les paiements.
-- /admin et les robots restent hors de l’entonnoir.
-- À appliquer à la main. L’application ne lance pas cette migration.

BEGIN;

ALTER TABLE callastral.events
  ADD COLUMN IF NOT EXISTS visitor_id text,
  ADD COLUMN IF NOT EXISTS path text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false;

ALTER TABLE callastral.users
  ADD COLUMN IF NOT EXISTS first_utm_source text,
  ADD COLUMN IF NOT EXISTS first_utm_medium text,
  ADD COLUMN IF NOT EXISTS first_utm_campaign text,
  ADD COLUMN IF NOT EXISTS first_referrer text,
  ADD COLUMN IF NOT EXISTS first_landing_page text,
  ADD COLUMN IF NOT EXISTS first_visitor_id text,
  ADD COLUMN IF NOT EXISTS first_seen_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_checkout_opt_out boolean NOT NULL DEFAULT false;

ALTER TABLE callastral.bookings
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS landing_page text;

CREATE TABLE IF NOT EXISTS callastral.checkout_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES callastral.users (id) ON DELETE CASCADE,
  visitor_id text,
  purpose text NOT NULL,
  checkout_session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  landing_page text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checkout_attributions_user_idx
  ON callastral.checkout_attributions (user_id, created_at);

CREATE TABLE IF NOT EXISTS callastral.checkout_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES callastral.users (id) ON DELETE CASCADE,
  checkout_session_id text,
  resend_email_id text,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE callastral.checkout_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.checkout_attributions FORCE ROW LEVEL SECURITY;
ALTER TABLE callastral.checkout_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE callastral.checkout_reminders FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE callastral.checkout_attributions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE callastral.checkout_reminders FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.checkout_attributions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE callastral.checkout_reminders TO service_role;

-- Visiteurs : robots, comptes de test et /admin exclus.
CREATE OR REPLACE VIEW callastral.visitor_first_touch WITH (security_invoker = true) AS
SELECT DISTINCT ON (visitor_id)
  visitor_id,
  created_at AS first_seen_at,
  path AS landing_page,
  referrer,
  utm_source,
  utm_medium,
  utm_campaign,
  callastral.traffic_source(utm_source, referrer) AS source
FROM callastral.events_canonical
WHERE visitor_id IS NOT NULL
  AND NOT is_bot
  AND NOT is_test
  AND coalesce(path, '') NOT LIKE '/admin%'
ORDER BY visitor_id, created_at;

CREATE OR REPLACE VIEW callastral.funnel_weekly WITH (security_invoker = true) AS
WITH weeks AS (
  SELECT generate_series(
    date_trunc('week', (SELECT coalesce(min(created_at), now()) FROM callastral.events) AT TIME ZONE 'Europe/Paris'),
    date_trunc('week', now() AT TIME ZONE 'Europe/Paris'),
    interval '1 week'
  )::date AS week_start
),
visitors AS (
  SELECT date_trunc('week', created_at AT TIME ZONE 'Europe/Paris')::date AS week_start,
         count(DISTINCT visitor_id) AS unique_visitors,
         count(*) FILTER (WHERE name IN ('view_home', 'view_advisor', 'page_view')) AS page_views
  FROM callastral.events_canonical
  WHERE NOT is_bot AND NOT is_test AND coalesce(path, '') NOT LIKE '/admin%'
  GROUP BY 1
),
signups AS (
  SELECT date_trunc('week', created_at AT TIME ZONE 'Europe/Paris')::date AS week_start, count(*) AS signups
  FROM callastral.users
  WHERE NOT callastral.is_test_email(email)
  GROUP BY 1
),
paid AS (
  SELECT date_trunc('week', paid_at AT TIME ZONE 'Europe/Paris')::date AS week_start,
         count(*) AS paid_bookings,
         count(*) FILTER (WHERE booking_rank = 1) AS first_paid,
         count(DISTINCT user_id) AS paying_users,
         count(DISTINCT user_id) FILTER (WHERE booking_rank > 1) AS repeat_bookers
  FROM callastral.funnel_paid_bookings
  GROUP BY 1
),
completed AS (
  SELECT date_trunc('week', completed_at AT TIME ZONE 'Europe/Paris')::date AS week_start, count(*) AS completed_calls
  FROM callastral.funnel_paid_bookings
  WHERE completed
  GROUP BY 1
)
SELECT
  w.week_start,
  to_char(w.week_start, 'IYYY-"W"IW') AS iso_week,
  coalesce(v.unique_visitors, 0) AS unique_visitors,
  coalesce(v.page_views, 0) AS page_views,
  coalesce(s.signups, 0) AS signups,
  coalesce(p.first_paid, 0) AS first_paid,
  coalesce(p.paid_bookings, 0) AS paid_bookings,
  coalesce(c.completed_calls, 0) AS completed_calls,
  coalesce(p.paying_users, 0) AS paying_users,
  coalesce(p.repeat_bookers, 0) AS repeat_bookers,
  round(coalesce(s.signups, 0)::numeric / nullif(v.unique_visitors, 0), 4) AS visitor_to_signup,
  round(coalesce(p.first_paid, 0)::numeric / nullif(s.signups, 0), 4) AS signup_to_first_paid,
  round(coalesce(c.completed_calls, 0)::numeric / nullif(p.paid_bookings, 0), 4) AS paid_to_completed,
  round(coalesce(p.repeat_bookers, 0)::numeric / nullif(p.paying_users, 0), 4) AS repeat_rate
FROM weeks w
LEFT JOIN visitors v USING (week_start)
LEFT JOIN signups s USING (week_start)
LEFT JOIN paid p USING (week_start)
LEFT JOIN completed c USING (week_start)
ORDER BY w.week_start DESC;

CREATE OR REPLACE VIEW callastral.funnel_daily WITH (security_invoker = true) AS
WITH days AS (
  SELECT generate_series(
    (now() AT TIME ZONE 'Europe/Paris')::date - 89,
    (now() AT TIME ZONE 'Europe/Paris')::date,
    interval '1 day'
  )::date AS day
),
visitors AS (
  SELECT (created_at AT TIME ZONE 'Europe/Paris')::date AS day,
         count(DISTINCT visitor_id) AS unique_visitors,
         count(*) FILTER (WHERE name IN ('view_home', 'view_advisor', 'page_view')) AS page_views,
         count(*) FILTER (WHERE name = 'book_click') AS book_clicks,
         count(*) FILTER (WHERE name = 'checkout_start') AS checkouts
  FROM callastral.events_canonical
  WHERE NOT is_bot AND NOT is_test
    AND coalesce(path, '') NOT LIKE '/admin%'
    AND created_at >= now() - interval '91 days'
  GROUP BY 1
),
signups AS (
  SELECT (created_at AT TIME ZONE 'Europe/Paris')::date AS day, count(*) AS signups
  FROM callastral.users
  WHERE NOT callastral.is_test_email(email) AND created_at >= now() - interval '91 days'
  GROUP BY 1
),
paid AS (
  SELECT (paid_at AT TIME ZONE 'Europe/Paris')::date AS day,
         count(*) AS paid_bookings,
         count(*) FILTER (WHERE booking_rank = 1) AS first_paid
  FROM callastral.funnel_paid_bookings
  WHERE paid_at >= now() - interval '91 days'
  GROUP BY 1
),
completed AS (
  SELECT (completed_at AT TIME ZONE 'Europe/Paris')::date AS day, count(*) AS completed_calls
  FROM callastral.funnel_paid_bookings
  WHERE completed AND completed_at >= now() - interval '91 days'
  GROUP BY 1
)
SELECT
  d.day,
  coalesce(v.unique_visitors, 0) AS unique_visitors,
  coalesce(v.page_views, 0) AS page_views,
  coalesce(v.book_clicks, 0) AS book_clicks,
  coalesce(v.checkouts, 0) AS checkouts,
  coalesce(s.signups, 0) AS signups,
  coalesce(p.first_paid, 0) AS first_paid,
  coalesce(p.paid_bookings, 0) AS paid_bookings,
  coalesce(c.completed_calls, 0) AS completed_calls
FROM days d
LEFT JOIN visitors v USING (day)
LEFT JOIN signups s USING (day)
LEFT JOIN paid p USING (day)
LEFT JOIN completed c USING (day)
ORDER BY d.day DESC;

-- Sources : visite (events), compte (users) et paiement (checkout_attributions ou bookings).
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
)
SELECT
  coalesce(v.source, a.source) AS source,
  coalesce(v.medium, a.medium) AS medium,
  coalesce(v.campaign, a.campaign) AS campaign,
  coalesce(v.visitors, 0) AS visitors,
  coalesce(a.signups, 0) AS signups,
  coalesce(a.paying_users, 0) AS paying_users
FROM visitors v
FULL JOIN accounts a ON a.source = v.source AND a.medium = v.medium AND a.campaign = v.campaign
ORDER BY coalesce(v.visitors, 0) DESC, coalesce(a.signups, 0) DESC;

CREATE OR REPLACE VIEW callastral.landing_pages WITH (security_invoker = true) AS
WITH visitors AS (
  SELECT landing_page, count(*) AS visitors
  FROM callastral.visitor_first_touch
  WHERE landing_page IS NOT NULL AND landing_page NOT LIKE '/admin%'
  GROUP BY 1
),
checkout_touch AS (
  SELECT DISTINCT ON (user_id) user_id, landing_page
  FROM (
    SELECT user_id, landing_page, created_at FROM callastral.checkout_attributions WHERE landing_page IS NOT NULL
    UNION ALL
    SELECT user_id, landing_page, created_at FROM callastral.bookings WHERE landing_page IS NOT NULL
  ) touches
  ORDER BY user_id, created_at
),
accounts AS (
  SELECT coalesce(u.first_landing_page, c.landing_page) AS landing_page,
         count(*) AS signups,
         count(*) FILTER (WHERE EXISTS (
           SELECT 1 FROM callastral.funnel_paid_bookings p WHERE p.user_id = u.id
         )) AS paying_users
  FROM callastral.users u
  LEFT JOIN checkout_touch c ON c.user_id = u.id
  WHERE NOT callastral.is_test_email(u.email)
    AND coalesce(u.first_landing_page, c.landing_page) IS NOT NULL
    AND coalesce(u.first_landing_page, c.landing_page) NOT LIKE '/admin%'
  GROUP BY 1
)
SELECT
  coalesce(v.landing_page, a.landing_page) AS landing_page,
  coalesce(v.visitors, 0) AS visitors,
  coalesce(a.signups, 0) AS signups,
  coalesce(a.paying_users, 0) AS paying_users
FROM visitors v
FULL JOIN accounts a ON a.landing_page = v.landing_page
ORDER BY coalesce(v.visitors, 0) DESC, coalesce(a.signups, 0) DESC;

REVOKE ALL ON callastral.visitor_first_touch, callastral.funnel_weekly, callastral.funnel_daily,
  callastral.acquisition_sources, callastral.landing_pages FROM PUBLIC, anon, authenticated;
GRANT SELECT ON callastral.visitor_first_touch, callastral.funnel_weekly, callastral.funnel_daily,
  callastral.acquisition_sources, callastral.landing_pages TO service_role;

COMMIT;
