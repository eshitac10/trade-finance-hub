-- Create table for WhatsApp imports
CREATE TABLE public.whatsapp_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'processing',
  total_messages INTEGER DEFAULT 0,
  timezone TEXT,
  date_format TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for parsed WhatsApp messages
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  import_id UUID NOT NULL REFERENCES public.whatsapp_imports(id) ON DELETE CASCADE,
  event_id UUID,
  message_id TEXT NOT NULL,
  datetime_iso TIMESTAMP WITH TIME ZONE NOT NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  attachments TEXT[],
  raw_line TEXT NOT NULL,
  is_noise BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for detected events
CREATE TABLE public.whatsapp_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  import_id UUID NOT NULL REFERENCES public.whatsapp_imports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  message_count INTEGER DEFAULT 0,
  keywords TEXT[],
  confidence_score NUMERIC(3,2),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_imports
CREATE POLICY "Users can view their own imports"
  ON public.whatsapp_imports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports"
  ON public.whatsapp_imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports"
  ON public.whatsapp_imports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports"
  ON public.whatsapp_imports FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for whatsapp_messages
CREATE POLICY "Users can view messages from their imports"
  ON public.whatsapp_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.whatsapp_imports
    WHERE whatsapp_imports.id = whatsapp_messages.import_id
    AND whatsapp_imports.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages to their imports"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.whatsapp_imports
    WHERE whatsapp_imports.id = whatsapp_messages.import_id
    AND whatsapp_imports.user_id = auth.uid()
  ));

CREATE POLICY "Users can update messages from their imports"
  ON public.whatsapp_messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.whatsapp_imports
    WHERE whatsapp_imports.id = whatsapp_messages.import_id
    AND whatsapp_imports.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete messages from their imports"
  ON public.whatsapp_messages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.whatsapp_imports
    WHERE whatsapp_imports.id = whatsapp_messages.import_id
    AND whatsapp_imports.user_id = auth.uid()
  ));

-- RLS Policies for whatsapp_events
CREATE POLICY "Users can view their own events"
  ON public.whatsapp_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON public.whatsapp_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON public.whatsapp_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON public.whatsapp_events FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_whatsapp_messages_import_id ON public.whatsapp_messages(import_id);
CREATE INDEX idx_whatsapp_messages_event_id ON public.whatsapp_messages(event_id);
CREATE INDEX idx_whatsapp_messages_datetime ON public.whatsapp_messages(datetime_iso);
CREATE INDEX idx_whatsapp_events_import_id ON public.whatsapp_events(import_id);
CREATE INDEX idx_whatsapp_events_user_id ON public.whatsapp_events(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_whatsapp_imports_updated_at
  BEFORE UPDATE ON public.whatsapp_imports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_whatsapp_events_updated_at
  BEFORE UPDATE ON public.whatsapp_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();