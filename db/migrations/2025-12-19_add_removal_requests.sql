create table if not exists public.removal_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone not null default now(),
  business_id bigint not null references public.businesses (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  reason text,
  status text default 'pending'
);

alter table public.removal_requests enable row level security;

create policy "Enable insert for all users" on public.removal_requests for insert with check (true);
create policy "Enable select for admins" on public.removal_requests for select using (auth.role() = 'service_role');
