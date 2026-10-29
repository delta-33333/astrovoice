-- Programme d’affiliation : inscriptions créateurs + commissions (versement manuel).
create table if not exists callastral.affiliates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{4,16}$'),
  name text not null check (char_length(name) between 2 and 80),
  email text not null unique check (char_length(email) <= 160),
  social_handle text not null check (char_length(social_handle) between 2 and 120),
  locale text not null default 'fr',
  status text not null default 'active' check (status in ('active','suspended')),
  commission_rate numeric(4,3) not null default 0.300,
  created_at timestamptz not null default now()
);
create table if not exists callastral.referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references callastral.affiliates(id) on delete restrict,
  ref_code text not null,
  customer_key text not null unique,
  stripe_object_id text not null unique,
  purpose text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'eur',
  commission_cents integer not null check (commission_cents >= 0),
  payout_status text not null default 'due' check (payout_status in ('due','paid','void')),
  created_at timestamptz not null default now()
);
create index if not exists referrals_affiliate_idx on callastral.referrals (affiliate_id, created_at desc);
alter table callastral.affiliates enable row level security;
alter table callastral.referrals enable row level security;
revoke all on callastral.affiliates from anon, authenticated;
revoke all on callastral.referrals from anon, authenticated;
grant all on callastral.affiliates to service_role;
grant all on callastral.referrals to service_role;
