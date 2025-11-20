-- Add cover_url column to memory_folders table for custom folder covers
ALTER TABLE public.memory_folders ADD COLUMN IF NOT EXISTS cover_url TEXT;