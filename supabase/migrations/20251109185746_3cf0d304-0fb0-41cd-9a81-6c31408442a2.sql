-- Make category optional since UI no longer uses categories
ALTER TABLE public.forum_topics
  ALTER COLUMN category_id DROP NOT NULL;

-- Add optional link to articles for discussions
ALTER TABLE public.forum_topics
  ADD COLUMN IF NOT EXISTS article_slug TEXT;

-- Create likes table for topics
CREATE TABLE IF NOT EXISTS public.forum_topic_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (topic_id, user_id)
);

-- Enable RLS
ALTER TABLE public.forum_topic_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY "Anyone can view topic likes"
  ON public.forum_topic_likes
  FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can like topics"
  ON public.forum_topic_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can unlike their likes"
  ON public.forum_topic_likes
  FOR DELETE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add tables to realtime publication (ignore if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_topic_likes;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_topics;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_replies;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
