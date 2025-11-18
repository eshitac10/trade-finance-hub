-- Create analytics tracking table for page views and sessions
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can insert their own analytics
CREATE POLICY "Users can insert their own analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Policy: Only service role can read analytics (for admin stats page)
CREATE POLICY "Service role can read all analytics"
ON public.analytics_events
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_analytics_timestamp ON public.analytics_events(timestamp);
CREATE INDEX idx_analytics_user_session ON public.analytics_events(user_id, session_id);
CREATE INDEX idx_analytics_page_path ON public.analytics_events(page_path);