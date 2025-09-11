-- Check what cron jobs exist first
SELECT jobname FROM cron.job WHERE jobname LIKE '%mood%' OR jobname LIKE '%reminder%';

-- Clean up existing cron jobs that actually exist
DO $$
BEGIN
    -- Try to unschedule each job, ignore errors if they don't exist
    BEGIN
        PERFORM cron.unschedule('send-mood-reminder');
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        PERFORM cron.unschedule('mood-reminder-daily');
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        PERFORM cron.unschedule('daily-mood-reminder');
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END $$;

-- Create a single cron job that runs at 1:30 AM UTC (9:30 PM Eastern)
SELECT cron.schedule(
  'daily-mood-reminder-eastern',
  '30 1 * * *', -- 1:30 AM UTC = 9:30 PM Eastern
  $$
  SELECT net.http_post(
    url := 'https://rjspahcbxchzgbexiqah.supabase.co/functions/v1/send-mood-reminder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3BhaGNieGNoemdiZXhpcWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDY4NjEsImV4cCI6MjA3MDY4Mjg2MX0.1snrCDknkYdSNIxeRLhnz5cfSPMogaeGSHWiBu72tUU"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  );
  $$
);