-- Create forum categories table
CREATE TABLE public.forum_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create forum topics table
CREATE TABLE public.forum_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES public.forum_categories(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create forum replies table
CREATE TABLE public.forum_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id uuid REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_categories (everyone can view, authenticated users can create)
CREATE POLICY "Anyone can view categories" 
ON public.forum_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert categories" 
ON public.forum_categories 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for forum_topics
CREATE POLICY "Anyone can view topics" 
ON public.forum_topics 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create topics" 
ON public.forum_topics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" 
ON public.forum_topics 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" 
ON public.forum_topics 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for forum_replies
CREATE POLICY "Anyone can view replies" 
ON public.forum_replies 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create replies" 
ON public.forum_replies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" 
ON public.forum_replies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" 
ON public.forum_replies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER set_forum_categories_updated_at
BEFORE UPDATE ON public.forum_categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_forum_topics_updated_at
BEFORE UPDATE ON public.forum_topics
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_forum_replies_updated_at
BEFORE UPDATE ON public.forum_replies
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable realtime for all forum tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_replies;

-- Insert default categories
INSERT INTO public.forum_categories (name, description) VALUES
  ('General Discussion', 'Open discussion about trade finance topics'),
  ('Industry News', 'Latest news and updates in trade finance'),
  ('Questions & Answers', 'Ask questions and get answers from the community'),
  ('Best Practices', 'Share and discuss best practices in trade finance');