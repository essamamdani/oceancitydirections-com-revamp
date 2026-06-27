-- Add columns to claim_businesses for old data
ALTER TABLE public.claim_businesses 
ADD COLUMN IF NOT EXISTS old_slug text,
ADD COLUMN IF NOT EXISTS old_data jsonb;

-- Create request_info table
CREATE TABLE IF NOT EXISTS public.request_info (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone not null default now(),
  business_id bigint not null references public.businesses (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  remarks text,
  status text default 'pending'
);

-- Add index for request_info
CREATE INDEX IF NOT EXISTS idx_request_info_business_id ON public.request_info(business_id);
