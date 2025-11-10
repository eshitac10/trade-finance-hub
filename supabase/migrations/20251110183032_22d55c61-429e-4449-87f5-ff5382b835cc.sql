-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create storage bucket for memories
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', true);

-- Create memories table
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for memories table
CREATE POLICY "Users can view all memories"
  ON public.memories
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own memories"
  ON public.memories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON public.memories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON public.memories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Storage policies for memories bucket
CREATE POLICY "Anyone can view memories images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'memories');

CREATE POLICY "Authenticated users can upload memories"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'memories' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own memories images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'memories' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own memories images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'memories' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger for updated_at
CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();