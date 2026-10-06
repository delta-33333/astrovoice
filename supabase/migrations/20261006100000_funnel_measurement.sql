-- Mesure du parcours : visiteur anonyme, source, robots, première source du compte,
-- noms d'événements canoniques, vues d'entonnoir et correctif du nettoyage des créneaux.

-- 1. Événements : contexte visiteur (aucune donnée personnelle, pas d'IP).
alter table callastral.events
  add column if not exists visitor_id text,
  add column if not exists path text,
  add column if not exists referrer text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists user_agent text,
  add column if not exists is_bot boolean not null default false;

create index if not exists events_visitor_idx on callastral.events (visitor_id, created_at) where visitor_id is not null;
create index if not exists events_bot_created_idx on callastral.events (is_bot, created_at);
create index if not exists events_name_created_idx on callastral.events (name, created_at);

alter table callastral.events drop constraint if exists events_name_check;
alter table callastral.events add constraint events_name_check check (name = any (array[
  'view_home', 'view_advisor', 'select_slot', 'signup', 'checkout_start', 'payment_success',
  'call_started', 'call_completed', 'visit', 'birth_data', 'slot_selected', 'checkout_started',
  'paid', 'summary_bought', 'call_reengage', 'call_silence_end',
  'page_view', 'book_click', 'signup_view', 'birth_start', 'rebook'
]::text[]));

-- Robots déjà enregistrés (anonymes uniquement).
update callastral.events
set is_bot = true
where user_id is null and is_bot = false and user_agent ~* '(bot|crawl|spider|headless|curl/|wget|python-|uptime|monitor|preview)';

-- 2. Première source du compte.
alter table callastral.users
  add column if not exists first_utm_source text,
  add column if not exists first_utm_medium text,
  add column if not exists first_utm_campaign text,
  add column if not exists first_referrer text,
  add column if not exists first_landing_page text,
  add column if not exists first_visitor_id text,
  add column if not exists first_seen_at timestamptz;

create index if not exists users_first_visitor_idx on callastral.users (first_visitor_id) where first_visitor_id is not null;

-- 3. Fonctions utilitaires.
create or replace function callastral.canonical_event_name(p_name text)
returns text language sql immutable set search_path = '' as $$
  select case p_name
    when 'visit' then 'view_home'
    when 'slot_selected' then 'select_slot'
    when 'checkout_started' then 'checkout_start'
    when 'paid' then 'payment_success'
    else p_name
  end
$$;

create or replace function callastral.is_test_email(p_email text)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(
    lower(p_email) like any (array['%mailinator%', '%audit%', '%test%', '%@example.com', '%@example.org'])
    or lower(p_email) = 'ju.descostes@gmail.com',
    false
  )
$$;

create or replace function callastral.traffic_source(p_utm_source text, p_referrer text)
returns text language sql immutable set search_path = '' as $$
  select coalesce(
    nullif(lower(trim(p_utm_source)), ''),
    nullif(regexp_replace(lower(substring(p_referrer from '^https?://([^/:]+)')), '^www\.', ''), ''),
    '(direct)'
  )
$$;

revoke all on function callastral.canonical_event_name(text) from public, anon, authenticated;
revoke all on function callastral.is_test_email(text) from public, anon, authenticated;
revoke all on function callastral.traffic_source(text, text) from public, anon, authenticated;
grant execute on function callastral.canonical_event_name(text) to service_role;
grant execute on function callastral.is_test_email(text) to service_role;
grant execute on function callastral.traffic_source(text, text) to service_role;

-- 4. Vues.
-- Événements avec nom canonique ; les anciennes lignes restent lisibles (raw_name).
-- is_test : compte de test, ou visiteur anonyme dont l'identifiant a servi à un compte de test.
create or replace view callastral.events_canonical with (security_invoker = true) as
with test_visitors as (
  select distinct e.visitor_id
  from callastral.events e
  join callastral.users u on u.id = e.user_id
  where e.visitor_id is not null and callastral.is_test_email(u.email)
  union
  select u.first_visitor_id from callastral.users u
  where u.first_visitor_id is not null and callastral.is_test_email(u.email)
)
select
  e.id,
  callastral.canonical_event_name(e.name) as name,
  e.name as raw_name,
  e.user_id,
  e.advisor_id,
  e.booking_id,
  e.metadata,
  e.created_at,
  e.visitor_id,
  e.path,
  e.referrer,
  e.utm_source,
  e.utm_medium,
  e.utm_campaign,
  e.user_agent,
  e.is_bot,
  (callastral.is_test_email(u.email) or tv.visitor_id is not null) as is_test
from callastral.events e
left join callastral.users u on u.id = e.user_id
left join test_visitors tv on tv.visitor_id = e.visitor_id;

-- Consultations payées (hors comptes de test et réservations QA), rang par client, appel réalisé.
create or replace view callastral.funnel_paid_bookings with (security_invoker = true) as
select
  b.id as booking_id,
  b.user_id,
  b.advisor_id,
  coalesce(b.confirmed_at, b.created_at) as paid_at,
  b.amount_cents,
  b.credit_cents,
  b.status,
  row_number() over (partition by b.user_id order by coalesce(b.confirmed_at, b.created_at), b.id) as booking_rank,
  (b.status = 'completed' or (cs.ended_at is not null and coalesce(cs.duration_seconds, 0) > 0)) as completed,
  case
    when b.status = 'completed' or (cs.ended_at is not null and coalesce(cs.duration_seconds, 0) > 0)
    then coalesce(cs.ended_at, b.starts_at)
  end as completed_at
from callastral.bookings b
join callastral.users u on u.id = b.user_id
left join lateral (
  select s.ended_at, s.duration_seconds
  from callastral.call_sessions s
  where s.booking_id = b.id
  order by s.ended_at desc nulls last
  limit 1
) cs on true
where b.status in ('confirmed', 'completed')
  and not callastral.is_test_email(u.email)
  and coalesce(b.stripe_checkout_session_id, '') not like 'qa\_%'
  and (
    coalesce(b.amount_cents, 0) + coalesce(b.credit_cents, 0) > 0
    or b.stripe_checkout_session_id like 'credit\_%'
    or b.stripe_checkout_session_id like 'subscription\_%'
  );

-- Entonnoir par semaine ISO (Europe/Paris), robots et comptes de test exclus.
create or replace view callastral.funnel_weekly with (security_invoker = true) as
with weeks as (
  select generate_series(
    date_trunc('week', (select coalesce(min(created_at), now()) from callastral.events) at time zone 'Europe/Paris'),
    date_trunc('week', now() at time zone 'Europe/Paris'),
    interval '1 week'
  )::date as week_start
),
visitors as (
  select date_trunc('week', created_at at time zone 'Europe/Paris')::date as week_start,
         count(distinct visitor_id) as unique_visitors,
         count(*) filter (where name in ('view_home', 'view_advisor', 'page_view')) as page_views
  from callastral.events_canonical
  where not is_bot and not is_test
  group by 1
),
signups as (
  select date_trunc('week', created_at at time zone 'Europe/Paris')::date as week_start, count(*) as signups
  from callastral.users
  where not callastral.is_test_email(email)
  group by 1
),
paid as (
  select date_trunc('week', paid_at at time zone 'Europe/Paris')::date as week_start,
         count(*) as paid_bookings,
         count(*) filter (where booking_rank = 1) as first_paid,
         count(distinct user_id) as paying_users,
         count(distinct user_id) filter (where booking_rank > 1) as repeat_bookers
  from callastral.funnel_paid_bookings
  group by 1
),
completed as (
  select date_trunc('week', completed_at at time zone 'Europe/Paris')::date as week_start, count(*) as completed_calls
  from callastral.funnel_paid_bookings
  where completed
  group by 1
)
select
  w.week_start,
  to_char(w.week_start, 'IYYY-"W"IW') as iso_week,
  coalesce(v.unique_visitors, 0) as unique_visitors,
  coalesce(v.page_views, 0) as page_views,
  coalesce(s.signups, 0) as signups,
  coalesce(p.first_paid, 0) as first_paid,
  coalesce(p.paid_bookings, 0) as paid_bookings,
  coalesce(c.completed_calls, 0) as completed_calls,
  coalesce(p.paying_users, 0) as paying_users,
  coalesce(p.repeat_bookers, 0) as repeat_bookers,
  round(coalesce(s.signups, 0)::numeric / nullif(v.unique_visitors, 0), 4) as visitor_to_signup,
  round(coalesce(p.first_paid, 0)::numeric / nullif(s.signups, 0), 4) as signup_to_first_paid,
  round(coalesce(c.completed_calls, 0)::numeric / nullif(p.paid_bookings, 0), 4) as paid_to_completed,
  round(coalesce(p.repeat_bookers, 0)::numeric / nullif(p.paying_users, 0), 4) as repeat_rate
from weeks w
left join visitors v using (week_start)
left join signups s using (week_start)
left join paid p using (week_start)
left join completed c using (week_start)
order by w.week_start desc;

-- Mêmes indicateurs par jour (90 derniers jours).
create or replace view callastral.funnel_daily with (security_invoker = true) as
with days as (
  select generate_series(
    (now() at time zone 'Europe/Paris')::date - 89,
    (now() at time zone 'Europe/Paris')::date,
    interval '1 day'
  )::date as day
),
visitors as (
  select (created_at at time zone 'Europe/Paris')::date as day,
         count(distinct visitor_id) as unique_visitors,
         count(*) filter (where name in ('view_home', 'view_advisor', 'page_view')) as page_views,
         count(*) filter (where name = 'book_click') as book_clicks,
         count(*) filter (where name = 'checkout_start') as checkouts
  from callastral.events_canonical
  where not is_bot and not is_test and created_at >= now() - interval '91 days'
  group by 1
),
signups as (
  select (created_at at time zone 'Europe/Paris')::date as day, count(*) as signups
  from callastral.users
  where not callastral.is_test_email(email) and created_at >= now() - interval '91 days'
  group by 1
),
paid as (
  select (paid_at at time zone 'Europe/Paris')::date as day,
         count(*) as paid_bookings,
         count(*) filter (where booking_rank = 1) as first_paid
  from callastral.funnel_paid_bookings
  where paid_at >= now() - interval '91 days'
  group by 1
),
completed as (
  select (completed_at at time zone 'Europe/Paris')::date as day, count(*) as completed_calls
  from callastral.funnel_paid_bookings
  where completed and completed_at >= now() - interval '91 days'
  group by 1
)
select
  d.day,
  coalesce(v.unique_visitors, 0) as unique_visitors,
  coalesce(v.page_views, 0) as page_views,
  coalesce(v.book_clicks, 0) as book_clicks,
  coalesce(v.checkouts, 0) as checkouts,
  coalesce(s.signups, 0) as signups,
  coalesce(p.first_paid, 0) as first_paid,
  coalesce(p.paid_bookings, 0) as paid_bookings,
  coalesce(c.completed_calls, 0) as completed_calls
from days d
left join visitors v using (day)
left join signups s using (day)
left join paid p using (day)
left join completed c using (day)
order by d.day desc;

-- Première visite de chaque visiteur (robots et tests exclus).
create or replace view callastral.visitor_first_touch with (security_invoker = true) as
select distinct on (visitor_id)
  visitor_id,
  created_at as first_seen_at,
  path as landing_page,
  referrer,
  utm_source,
  utm_medium,
  utm_campaign,
  callastral.traffic_source(utm_source, referrer) as source
from callastral.events_canonical
where visitor_id is not null and not is_bot and not is_test
order by visitor_id, created_at;

-- Sources d'acquisition : visiteurs (première visite) et comptes (première source enregistrée).
create or replace view callastral.acquisition_sources with (security_invoker = true) as
with visitors as (
  select source, coalesce(utm_medium, '') as medium, coalesce(utm_campaign, '') as campaign,
         count(*) as visitors
  from callastral.visitor_first_touch
  group by 1, 2, 3
),
accounts as (
  select callastral.traffic_source(u.first_utm_source, u.first_referrer) as source,
         coalesce(u.first_utm_medium, '') as medium,
         coalesce(u.first_utm_campaign, '') as campaign,
         count(*) as signups,
         count(*) filter (where exists (select 1 from callastral.funnel_paid_bookings p where p.user_id = u.id)) as paying_users
  from callastral.users u
  where not callastral.is_test_email(u.email) and u.first_seen_at is not null
  group by 1, 2, 3
)
select
  coalesce(v.source, a.source) as source,
  coalesce(v.medium, a.medium) as medium,
  coalesce(v.campaign, a.campaign) as campaign,
  coalesce(v.visitors, 0) as visitors,
  coalesce(a.signups, 0) as signups,
  coalesce(a.paying_users, 0) as paying_users
from visitors v
full join accounts a on a.source = v.source and a.medium = v.medium and a.campaign = v.campaign
order by coalesce(v.visitors, 0) desc, coalesce(a.signups, 0) desc;

-- Pages d'arrivée.
create or replace view callastral.landing_pages with (security_invoker = true) as
with visitors as (
  select landing_page, count(*) as visitors
  from callastral.visitor_first_touch
  where landing_page is not null
  group by 1
),
accounts as (
  select u.first_landing_page as landing_page,
         count(*) as signups,
         count(*) filter (where exists (select 1 from callastral.funnel_paid_bookings p where p.user_id = u.id)) as paying_users
  from callastral.users u
  where not callastral.is_test_email(u.email) and u.first_landing_page is not null
  group by 1
)
select
  coalesce(v.landing_page, a.landing_page) as landing_page,
  coalesce(v.visitors, 0) as visitors,
  coalesce(a.signups, 0) as signups,
  coalesce(a.paying_users, 0) as paying_users
from visitors v
full join accounts a on a.landing_page = v.landing_page
order by coalesce(v.visitors, 0) desc, coalesce(a.signups, 0) desc;

revoke all on callastral.events_canonical, callastral.funnel_paid_bookings, callastral.funnel_weekly,
  callastral.funnel_daily, callastral.visitor_first_touch, callastral.acquisition_sources,
  callastral.landing_pages from public, anon, authenticated;
grant select on callastral.events_canonical, callastral.funnel_paid_bookings, callastral.funnel_weekly,
  callastral.funnel_daily, callastral.visitor_first_touch, callastral.acquisition_sources,
  callastral.landing_pages to service_role;

-- 5. Créneaux : ne plus supprimer un créneau passé encore référencé par une réservation
--    (réservation annulée/expirée qui garde slot_id) — erreur quotidienne de /api/cron/slots.
do $$
declare
  def text := pg_get_functiondef('callastral.generate_advisor_slots()'::regprocedure);
  old_sql text := E'DELETE FROM callastral.slots\n  WHERE status = ''available''\n    AND starts_at < now();';
  new_sql text := E'DELETE FROM callastral.slots\n  WHERE status = ''available''\n    AND starts_at < now()\n    AND NOT EXISTS (\n      SELECT 1 FROM callastral.bookings WHERE bookings.slot_id = slots.id\n    );';
begin
  if position(old_sql in def) = 0 then
    if position('bookings.slot_id = slots.id' in def) > 0 then
      return;
    end if;
    raise exception 'generate_advisor_slots: DELETE introuvable';
  end if;
  execute replace(def, old_sql, new_sql);
end
$$;
