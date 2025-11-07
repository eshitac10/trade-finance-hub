-- Create table to store Google OAuth tokens (singleton)
CREATE TABLE IF NOT EXISTS public.google_oauth_tokens (
  id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS set_google_oauth_tokens_updated_at ON public.google_oauth_tokens;
CREATE TRIGGER set_google_oauth_tokens_updated_at
BEFORE UPDATE ON public.google_oauth_tokens
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS and no public policies (functions use service role)
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;