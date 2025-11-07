-- Create table to store Google Drive articles metadata
CREATE TABLE public.google_drive_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  web_view_link TEXT,
  thumbnail_link TEXT,
  created_time TIMESTAMP WITH TIME ZONE,
  modified_time TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.google_drive_articles ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view articles
CREATE POLICY "Authenticated users can view articles" 
ON public.google_drive_articles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create index for faster lookups
CREATE INDEX idx_google_drive_articles_file_id ON public.google_drive_articles(file_id);
CREATE INDEX idx_google_drive_articles_modified_time ON public.google_drive_articles(modified_time DESC);