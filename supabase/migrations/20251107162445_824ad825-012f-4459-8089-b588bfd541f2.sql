-- Temporarily allow public read access to articles until proper auth is implemented
DROP POLICY IF EXISTS "Authenticated users can view articles" ON public.google_drive_articles;

CREATE POLICY "Anyone can view articles"
ON public.google_drive_articles
FOR SELECT
TO anon, authenticated
USING (true);