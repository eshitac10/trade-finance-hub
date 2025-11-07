-- Add content column to store article text content
ALTER TABLE public.google_drive_articles 
ADD COLUMN content TEXT;