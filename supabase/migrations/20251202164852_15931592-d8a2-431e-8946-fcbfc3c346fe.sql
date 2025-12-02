-- Update whatsapp_imports DELETE policy to allow admins
DROP POLICY IF EXISTS "Users can delete their own imports" ON public.whatsapp_imports;
CREATE POLICY "Users can delete own imports or admins can delete any"
ON public.whatsapp_imports
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Update whatsapp_events DELETE policy to allow admins
DROP POLICY IF EXISTS "Users can delete their own events" ON public.whatsapp_events;
CREATE POLICY "Users can delete own events or admins can delete any"
ON public.whatsapp_events
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Update whatsapp_messages DELETE policy to allow admins
DROP POLICY IF EXISTS "Users can delete messages from their imports" ON public.whatsapp_messages;
CREATE POLICY "Users can delete own messages or admins can delete any"
ON public.whatsapp_messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM whatsapp_imports
    WHERE whatsapp_imports.id = whatsapp_messages.import_id
    AND whatsapp_imports.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);