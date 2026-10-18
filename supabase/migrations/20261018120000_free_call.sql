-- Essai gratuit de 3 minutes, attribution et file d’e-mails.
-- L’application ne lance pas cette migration : l’opérateur l’applique sur le projet Supabase.

create table if not exists callastral.free_trials (
  id uuid primary key default gen_random_uuid(),
  email_norm text not null unique,
  user_id uuid null references callastral.users (id) on delete set null,
  ip_hash text not null,
  device_hash text not null,
  code_hash text null,
  code_expires_at timestamptz null,
  code_attempts int not null default 0,
  verified_at timestamptz null,
  seconds_used int not null default 0,
  token_issued_at timestamptz null,
  advisor_id text null,
  heard_from text null,
  summary text null,
  locale text not null default 'fr',
  created_at timestamptz not null default now()
);

create index if not exists free_trials_ip_created_idx on callastral.free_trials (ip_hash, created_at);
create index if not exists free_trials_device_idx on callastral.free_trials (device_hash);
create index if not exists free_trials_verified_idx on callastral.free_trials (verified_at);

alter table callastral.free_trials enable row level security;
alter table callastral.free_trials force row level security;
revoke all on table callastral.free_trials from public, anon, authenticated;
grant select, insert, update, delete on table callastral.free_trials to service_role;

alter table callastral.users add column if not exists heard_from text;

do $$ begin
  if to_regclass('callastral.horoscope_subscribers') is not null then
    alter table callastral.horoscope_subscribers add column if not exists heard_from text;
  end if;
end $$;

alter table callastral.call_memories alter column booking_id drop not null;
alter table callastral.call_memories add column if not exists trial_id uuid;
create unique index if not exists call_memories_trial_idx on callastral.call_memories (trial_id) where trial_id is not null;

create table if not exists callastral.mail_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  email_norm text not null,
  kind text not null,
  resend_id text null,
  send_at timestamptz not null,
  cancelled_at timestamptz null,
  sent_at timestamptz null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mail_schedule_due_idx on callastral.mail_schedule (send_at) where sent_at is null and cancelled_at is null;

alter table callastral.mail_schedule enable row level security;
alter table callastral.mail_schedule force row level security;
revoke all on table callastral.mail_schedule from public, anon, authenticated;
grant select, insert, update, delete on table callastral.mail_schedule to service_role;

alter table callastral.events drop constraint if exists events_name_check;
alter table callastral.events add constraint events_name_check check (name = any (array[
  'view_home', 'view_advisor', 'select_slot', 'signup', 'checkout_start', 'payment_success',
  'call_started', 'call_completed', 'visit', 'birth_data', 'slot_selected', 'checkout_started',
  'paid', 'summary_bought', 'call_reengage', 'call_silence_end',
  'page_view', 'book_click', 'signup_view', 'birth_start', 'rebook',
  'sample_play', 'trial_code', 'trial_verified', 'ai_bot_hit'
]::text[]));
