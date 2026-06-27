create type public.claim_status as enum ('pending','under_review','approved','rejected','cancelled');
create table public.claim_businesses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  business_id bigint not null references public.businesses (id) on delete cascade,
  claimer_user_id uuid not null references auth.users (id) on delete cascade,
  proposed_data jsonb not null default '{}'::jsonb,
  proposed_update_slug text null,
  status public.claim_status not null default 'pending',
  decision_reason text null,
  admin_user_id uuid null references auth.users (id),
  approved_at timestamp with time zone null,
  rejected_at timestamp with time zone null,
  processed_at timestamp with time zone null,
  ai_analysis jsonb null,
  ai_score numeric null
) TABLESPACE pg_default;
create index if not exists idx_claim_businesses_business_id on public.claim_businesses using btree (business_id) TABLESPACE pg_default;
create index if not exists idx_claim_businesses_claimer_user_id on public.claim_businesses using btree (claimer_user_id) TABLESPACE pg_default;
create index if not exists idx_claim_businesses_status on public.claim_businesses using btree (status) TABLESPACE pg_default;
create index if not exists idx_claim_businesses_created_at on public.claim_businesses using btree (created_at) TABLESPACE pg_default;
create unique index if not exists uniq_claim_businesses_open_per_user on public.claim_businesses (business_id, claimer_user_id) TABLESPACE pg_default where (status in ('pending','under_review'));
insert into public.claim_businesses (
  business_id,
  claimer_user_id,
  proposed_data,
  proposed_update_slug,
  status
)
select
  b.id,
  b.claimed_by,
  '{}'::jsonb,
  b.update_slug,
  'under_review'::public.claim_status
from public.businesses b
where b.claimed_by is not null
  and coalesce(b.claimed_approval, false) = false;
alter table public.claim_businesses enable row level security;
