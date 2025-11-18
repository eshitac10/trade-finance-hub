-- Enable realtime for whatsapp_imports table
ALTER TABLE whatsapp_imports REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_imports;