-- 1. Backfill missing claimed_by from claim_businesses
-- This fixes businesses that were approved before the column existed or populated correctly
UPDATE public.businesses b
SET claimed_by = cb.claimer_user_id,
    is_claimed = true,
    claimed_approval = true
FROM public.claim_businesses cb
WHERE b.id = cb.business_id
  AND cb.status = 'approved'
  AND b.claimed_by IS NULL;

-- 2. Enable RLS on businesses table
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- 3. Policy for reading businesses (public access)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'businesses' AND policyname = 'Businesses are viewable by everyone'
    ) THEN
        CREATE POLICY "Businesses are viewable by everyone" 
        ON public.businesses FOR SELECT 
        TO public 
        USING (true);
    END IF;
END $$;

-- 4. Policy for updating own businesses
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'businesses' AND policyname = 'Users can update their own businesses'
    ) THEN
        CREATE POLICY "Users can update their own businesses" 
        ON public.businesses FOR UPDATE 
        TO authenticated 
        USING (auth.uid() = claimed_by)
        WITH CHECK (auth.uid() = claimed_by);
    END IF;
END $$;
