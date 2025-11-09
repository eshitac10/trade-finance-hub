-- Update RLS policies to allow public access for all operations
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can delete events" ON public.events;

-- Create new policies allowing public access
CREATE POLICY "Anyone can insert events"
ON public.events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update events"
ON public.events
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete events"
ON public.events
FOR DELETE
USING (true);