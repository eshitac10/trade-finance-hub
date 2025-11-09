-- Remove the foreign key constraint that requires auth.users
-- This allows the app to work with localStorage authentication
ALTER TABLE public.documents
DROP CONSTRAINT IF EXISTS documents_user_id_fkey;

-- Make user_id a simple text field instead of uuid reference
ALTER TABLE public.documents
ALTER COLUMN user_id TYPE text;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);