-- Chat par message avec une conseillère / un conseiller Callastral.
-- 1 message offert, puis abonnement mensuel (fair-use). Accès service_role uniquement.

create table if not exists callastral.chat_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_norm text not null unique,
  first_name text null,
  birth_date date not null,
  birth_time text null,
  birth_time_unknown boolean not null default false,
  birth_place text not null,
  topic text not null default 'other',
  locale text not null default 'fr',
  advisor_id uuid null,
  chart_summary text null,
  sun_sign text null,
  session_hash text null,
  login_hash text null,
  login_expires_at timestamptz null,
  ip_hash text null,
  free_used_at timestamptz null,
  stripe_customer_id text null,
  stripe_subscription_id text null,
  subscription_status text null,
  period_start timestamptz null,
  period_end timestamptz null,
  period_messages int not null default 0,
  horoscope_optin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists chat_users_session_idx on callastral.chat_users (session_hash);
create index if not exists chat_users_ip_idx on callastral.chat_users (ip_hash, created_at);
create index if not exists chat_users_sub_idx on callastral.chat_users (stripe_subscription_id);

create table if not exists callastral.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_user_id uuid not null references callastral.chat_users (id) on delete cascade,
  role text not null check (role in ('user', 'advisor')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_user_idx on callastral.chat_messages (chat_user_id, created_at);

alter table callastral.chat_users enable row level security;
alter table callastral.chat_users force row level security;
revoke all on table callastral.chat_users from public, anon, authenticated;
grant select, insert, update, delete on table callastral.chat_users to service_role;

alter table callastral.chat_messages enable row level security;
alter table callastral.chat_messages force row level security;
revoke all on table callastral.chat_messages from public, anon, authenticated;
grant select, insert, update, delete on table callastral.chat_messages to service_role;

alter table callastral.events drop constraint if exists events_name_check;
alter table callastral.events add constraint events_name_check check (name = any (array[
  'view_home','view_advisor','select_slot','signup','checkout_start','payment_success','call_started','call_completed',
  'visit','birth_data','slot_selected','checkout_started','paid','summary_bought','call_reengage','call_silence_end',
  'page_view','book_click','signup_view','birth_start','rebook','sample_play','trial_code','trial_verified','ai_bot_hit',
  'cta_click','trial_start','trial_code_sent','trial_call_start',
  'chat_start','chat_email','chat_first_reply','chat_paywall_view','chat_subscribe'
]));
