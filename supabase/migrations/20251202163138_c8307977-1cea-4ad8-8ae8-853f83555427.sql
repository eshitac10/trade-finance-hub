-- Update whatsapp_imports SELECT policy to allow all authenticated users
DROP POLICY IF EXISTS "Users can view their own imports" ON public.whatsapp_imports;
CREATE POLICY "Authenticated users can view all imports"
ON public.whatsapp_imports
FOR SELECT
TO authenticated
USING (true);

-- Update whatsapp_events SELECT policy to allow all authenticated users
DROP POLICY IF EXISTS "Users can view their own events" ON public.whatsapp_events;
CREATE POLICY "Authenticated users can view all events"
ON public.whatsapp_events
FOR SELECT
TO authenticated
USING (true);

-- Update whatsapp_messages SELECT policy to allow all authenticated users
DROP POLICY IF EXISTS "Users can view messages from their imports" ON public.whatsapp_messages;
CREATE POLICY "Authenticated users can view all messages"
ON public.whatsapp_messages
FOR SELECT
TO authenticated
USING (true);