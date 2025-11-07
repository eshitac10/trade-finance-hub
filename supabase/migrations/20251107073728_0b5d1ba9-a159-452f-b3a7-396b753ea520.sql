-- Add column to store AI-generated thumbnail
ALTER TABLE public.google_drive_articles 
ADD COLUMN ai_thumbnail TEXT;

-- Enable realtime for automatic updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.google_drive_articles;