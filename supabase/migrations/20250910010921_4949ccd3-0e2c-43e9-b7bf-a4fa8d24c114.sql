-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule mood reminder emails for 9:30 PM Eastern Time daily
-- 9:30 PM Eastern = 1:30 AM UTC (during EST) or 2:30 AM UTC (during EDT)
-- Using 1:30 AM UTC to cover most of the year (EDT)
SELECT cron.schedule(
  'daily-mood-reminder',
  '30 1 * * *', -- Run at 1:30 AM UTC every day (9:30 PM Eastern during EDT)
  $$
  SELECT
    net.http_post(
        url:='https://rjspahcbxchzgbexiqah.supabase.co/functions/v1/send-mood-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3BhaGNieGdiZXhpcWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDY4NjEsImV4cCI6MjA3MDY4Mjg2MX0.1snrCDknkYdSNIxeRLhnz5cfSPMogaeGSHWiBu72tUU"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);