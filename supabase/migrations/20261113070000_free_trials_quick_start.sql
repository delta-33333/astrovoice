-- Essai allégé : appel lancé avant l’e-mail (appareil + réseau + plafond du jour), e-mail rattaché après l’appel avec un code.
alter table callastral.free_trials add column if not exists pending_email text null;
alter table callastral.free_trials add column if not exists quick boolean not null default false;
