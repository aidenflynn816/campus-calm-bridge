-- Create table to queue email notifications for batching
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists pgcrypto with schema public;

create table if not exists public.email_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid,
  recipient_email text not null,
  sender_name text,
  thread_key text,
  type text not null default 'message',
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.email_notifications enable row level security;

-- No public access; no policies added so only service role can access

create index if not exists idx_email_notifications_unsent_recipient_created
  on public.email_notifications(recipient_email, created_at)
  where sent_at is null;

-- Schedule cron job every 10 minutes to process batches
select
  cron.schedule(
    'bridge-email-batch-every-10-min',
    '*/10 * * * *',
    $$
    select
      net.http_post(
          url:='https://rjspahcbxchzgbexiqah.functions.supabase.co/process-email-notifications',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3BhaGNieGNoemdiZXhpcWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMDY4NjEsImV4cCI6MjA3MDY4Mjg2MX0.1snrCDknkYdSNIxeRLhnz5cfSPMogaeGSHWiBu72tUU"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
  );