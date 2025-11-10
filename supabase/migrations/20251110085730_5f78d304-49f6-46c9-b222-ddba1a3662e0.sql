-- Create storage bucket for article files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'articles',
  'articles',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp']
);

-- Create user_articles table for uploaded articles
CREATE TABLE IF NOT EXISTS public.user_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on user_articles
ALTER TABLE public.user_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_articles
CREATE POLICY "Anyone can view articles"
  ON public.user_articles
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload articles"
  ON public.user_articles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles"
  ON public.user_articles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles"
  ON public.user_articles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Storage RLS policies for articles bucket
CREATE POLICY "Anyone can view article files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'articles');

CREATE POLICY "Authenticated users can upload article files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'articles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own article files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'articles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own article files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'articles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create trigger for updated_at
CREATE TRIGGER update_user_articles_updated_at
  BEFORE UPDATE ON public.user_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();