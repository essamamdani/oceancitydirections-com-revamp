ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS remove_request uuid NULL;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_deleted_at ON public.businesses (deleted_at);
