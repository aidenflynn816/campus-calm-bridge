-- Enable full row replication and add tables to realtime publication
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.typing_status REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN others THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_status;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;