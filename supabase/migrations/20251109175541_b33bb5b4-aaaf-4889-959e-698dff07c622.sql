-- Temporarily update RLS policies to work with localStorage authentication
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can upload their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Create simpler policies that allow all operations for now
-- This is temporary until proper Supabase auth is implemented
CREATE POLICY "Allow all document operations"
ON public.documents
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all storage operations"
ON storage.objects
FOR ALL
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');