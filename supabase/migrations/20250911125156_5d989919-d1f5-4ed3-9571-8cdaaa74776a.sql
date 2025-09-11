-- First, let's clean up any existing mood reminder cron jobs
SELECT cron.unschedule('send-mood-reminder');
SELECT cron.unschedule('mood-reminder-daily');
SELECT cron.unschedule('daily-mood-reminder');

-- Create a single cron job that runs at 1:30 AM UTC (9:30 PM Eastern)
SELECT cron.schedule(
  'daily-mood-reminder-eastern',
  '30 1 * * *', -- 1:30 AM UTC = 9:30 PM Eastern (accounting for EST/EDT)
  $$
  SELECT net.http_post(
    url := 'https://rjspahcbxchzgbexiqah.supabase.co/functions/v1/send-mood-reminder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3BhaGNieGNoemdiZXhpcWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDY4NjEsImV4cCI6MjA3MDY4Mjg2MX0.1snrCDknkYdSNIxeRLhnz5cfSPMogaeGSHWiBu72tUU"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  );
  $$
);