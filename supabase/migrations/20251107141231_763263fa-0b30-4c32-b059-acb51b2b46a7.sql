-- Add RLS policies for INSERT, UPDATE, and DELETE on google_drive_articles
-- Only allow service role to perform these operations (deny regular authenticated users)

-- Prevent regular users from inserting articles
CREATE POLICY "Only service role can insert articles"
ON public.google_drive_articles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Prevent regular users from updating articles
CREATE POLICY "Only service role can update articles"
ON public.google_drive_articles
FOR UPDATE
TO authenticated
USING (false);

-- Prevent regular users from deleting articles
CREATE POLICY "Only service role can delete articles"
ON public.google_drive_articles
FOR DELETE
TO authenticated
USING (false);