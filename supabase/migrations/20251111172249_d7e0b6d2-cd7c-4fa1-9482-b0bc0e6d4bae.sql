-- Create folders table for organizing memories
CREATE TABLE IF NOT EXISTS public.memory_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.memory_folders ENABLE ROW LEVEL SECURITY;

-- Create policies for memory_folders
CREATE POLICY "Users can view their own folders"
ON public.memory_folders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
ON public.memory_folders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
ON public.memory_folders
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
ON public.memory_folders
FOR DELETE
USING (auth.uid() = user_id);

-- Add folder_id to memories table
ALTER TABLE public.memories
ADD COLUMN folder_id UUID REFERENCES public.memory_folders(id) ON DELETE SET NULL;

-- Add file_type column to memories to support videos
ALTER TABLE public.memories
ADD COLUMN file_type TEXT DEFAULT 'image';

-- Add trigger for updating updated_at
CREATE TRIGGER update_memory_folders_updated_at
BEFORE UPDATE ON public.memory_folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();