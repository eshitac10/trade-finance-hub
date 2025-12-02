-- Add indexes for common queries to speed up database operations

-- Index for profiles lookup by id (used in navbar and dashboard)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- Index for user_roles lookup by user_id and role (used in navbar auth checks)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- Index for analytics_events by session_id and timestamp (used in statistics page)
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_timestamp ON public.analytics_events(session_id, timestamp DESC);

-- Index for google_drive_articles by modified_time (used in articles page sorting)
CREATE INDEX IF NOT EXISTS idx_google_drive_articles_modified ON public.google_drive_articles(modified_time DESC);

-- Index for whatsapp_imports by user_id and upload_date (used in chat import page)
CREATE INDEX IF NOT EXISTS idx_whatsapp_imports_user_upload ON public.whatsapp_imports(user_id, upload_date DESC);

-- Index for whatsapp_events by import_id and start_datetime (used in chat import filtering)
CREATE INDEX IF NOT EXISTS idx_whatsapp_events_import_start ON public.whatsapp_events(import_id, start_datetime DESC);

-- Index for whatsapp_messages by event_id and datetime (used in message fetching)
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_event_datetime ON public.whatsapp_messages(event_id, datetime_iso DESC);

-- Index for forum_topics for homepage dashboard
CREATE INDEX IF NOT EXISTS idx_forum_topics_created ON public.forum_topics(created_at DESC);