-- Trafic interne exclu (cookie cl_internal) + entonnoir quotidien : visites humaines, essais, appels, paiements.
alter table callastral.events add column if not exists is_internal boolean not null default false;

-- Nom canonique : page_view regroupé avec visit/view_home côté requêtes via la colonne is_page_view.
create or replace view callastral.events_canonical with (security_invoker = true) as
with test_visitors as (
  select distinct e_1.visitor_id
  from callastral.events e_1
  join callastral.users u_1 on u_1.id = e_1.user_id
  where e_1.visitor_id is not null and callastral.is_test_email(u_1.email)
  union
  select u_1.first_visitor_id from callastral.users u_1
  where u_1.first_visitor_id is not null and callastral.is_test_email(u_1.email)
)
select
  e.id,
  callastral.canonical_event_name(e.name) as name,
  e.name as raw_name,
  e.user_id, e.advisor_id, e.booking_id, e.metadata, e.created_at, e.visitor_id, e.path, e.referrer,
  e.utm_source, e.utm_medium, e.utm_campaign, e.user_agent, e.is_bot,
  callastral.is_test_email(u.email) or tv.visitor_id is not null as is_test,
  e.is_internal,
  callastral.canonical_event_name(e.name) in ('view_home', 'view_advisor', 'page_view') as is_page_view,
  (not e.is_bot and not e.is_internal and not (callastral.is_test_email(u.email) or tv.visitor_id is not null)
    and coalesce(e.path, '') not like '/admin%') as is_human
from callastral.events e
left join callastral.users u on u.id = e.user_id
left join test_visitors tv on tv.visitor_id = e.visitor_id;

create or replace view callastral.funnel_daily with (security_invoker = true) as
with days as (
  select generate_series(((now() at time zone 'Europe/Paris')::date - 89)::timestamptz,
    (now() at time zone 'Europe/Paris')::date::timestamptz, '1 day'::interval)::date as day
), visitors as (
  select (created_at at time zone 'Europe/Paris')::date as day,
    count(distinct visitor_id) as unique_visitors,
    count(*) filter (where is_page_view) as page_views,
    count(*) filter (where name = 'book_click') as book_clicks,
    count(*) filter (where name = 'checkout_start') as checkouts,
    count(distinct visitor_id) filter (where is_page_view) as human_visits,
    count(distinct coalesce(visitor_id::text, id::text)) filter (where name = 'trial_call_start') as trial_calls,
    count(*) filter (where name = 'payment_success') as payment_events
  from callastral.events_canonical
  where is_human and created_at >= now() - interval '91 days'
  group by 1
), signups as (
  select (created_at at time zone 'Europe/Paris')::date as day, count(*) as signups
  from callastral.users
  where not callastral.is_test_email(email) and created_at >= now() - interval '91 days'
  group by 1
), paid as (
  select (paid_at at time zone 'Europe/Paris')::date as day, count(*) as paid_bookings,
    count(*) filter (where booking_rank = 1) as first_paid
  from callastral.funnel_paid_bookings where paid_at >= now() - interval '91 days' group by 1
), completed as (
  select (completed_at at time zone 'Europe/Paris')::date as day, count(*) as completed_calls
  from callastral.funnel_paid_bookings
  where completed and completed_at >= now() - interval '91 days' group by 1
), trials as (
  select (created_at at time zone 'Europe/Paris')::date as day,
    count(*) as trials_requested,
    count(*) filter (where verified_at is not null) as trials_verified,
    count(*) filter (where seconds_used > 0) as trials_used
  from callastral.free_trials where created_at >= now() - interval '91 days' group by 1
), subs as (
  select (created_at at time zone 'Europe/Paris')::date as day, count(*) as subscriptions_started
  from callastral.subscriptions s
  where created_at >= now() - interval '91 days'
    and not exists (select 1 from callastral.users u where u.id = s.user_id and callastral.is_test_email(u.email))
  group by 1
)
select d.day,
  coalesce(v.unique_visitors, 0::bigint) as unique_visitors,
  coalesce(v.page_views, 0::bigint) as page_views,
  coalesce(v.book_clicks, 0::bigint) as book_clicks,
  coalesce(v.checkouts, 0::bigint) as checkouts,
  coalesce(s.signups, 0::bigint) as signups,
  coalesce(p.first_paid, 0::bigint) as first_paid,
  coalesce(p.paid_bookings, 0::bigint) as paid_bookings,
  coalesce(c.completed_calls, 0::bigint) as completed_calls,
  coalesce(v.human_visits, 0::bigint) as human_visits,
  coalesce(t.trials_requested, 0::bigint) as trials_requested,
  coalesce(t.trials_verified, 0::bigint) as trials_verified,
  coalesce(t.trials_used, 0::bigint) as trials_used,
  coalesce(v.trial_calls, 0::bigint) as trial_calls,
  coalesce(v.payment_events, 0::bigint) as payment_events,
  coalesce(su.subscriptions_started, 0::bigint) as subscriptions_started
from days d
left join visitors v using (day)
left join signups s using (day)
left join paid p using (day)
left join completed c using (day)
left join trials t using (day)
left join subs su using (day)
order by d.day desc;
