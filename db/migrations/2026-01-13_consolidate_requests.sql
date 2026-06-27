-- Migration: Consolidate request tables into request_info
-- Date: 2026-01-13

-- Ensure request_info table exists with superset of columns
CREATE TABLE IF NOT EXISTS public.request_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    remarks TEXT, -- Will store 'remarks' from info requests and 'reason' from removal requests
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add 'type' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'request_info' AND column_name = 'type') THEN
        ALTER TABLE public.request_info ADD COLUMN type TEXT DEFAULT 'information';
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.request_info ENABLE ROW LEVEL SECURITY;

-- Allow public insert (if not already policy)
-- Note: You might want to check existing policies. For now, we assume admin or public access is handled.
-- If we need a policy for anon insert:
-- CREATE POLICY "Allow public insert" ON public.request_info FOR INSERT WITH CHECK (true);
