-- Add mood reminder preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN mood_reminder_enabled boolean DEFAULT true;

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job to send mood reminders at 9:30 PM Eastern daily
SELECT cron.schedule(
  'daily-mood-reminders',
  '30 21 * * *', -- 9:30 PM Eastern (adjust timezone as needed)
  $$
  SELECT net.http_post(
    url := 'https://rjspahcbxchzgbexiqah.supabase.co/functions/v1/send-mood-reminder',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3BhaGNieGNoemdiZXhpcWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEwNjg2MSwiZXhwIjoyMDcwNjgyODYxfQ.VlSEYzvKgM3EeuJC7K9Be7vtqtCXJpCrRa5vTmfyP2k"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);