-- Keep application tables server-only until policies are added for direct client access.
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', table_record.tablename);
  END LOOP;
END
$$;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
