-- Add claimed_by column to businesses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'claimed_by') THEN
        ALTER TABLE public.businesses ADD COLUMN claimed_by uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Add claimed_approval column to businesses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'claimed_approval') THEN
        ALTER TABLE public.businesses ADD COLUMN claimed_approval boolean DEFAULT false;
    END IF;
END $$;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_businesses_claimed_by ON public.businesses (claimed_by);
