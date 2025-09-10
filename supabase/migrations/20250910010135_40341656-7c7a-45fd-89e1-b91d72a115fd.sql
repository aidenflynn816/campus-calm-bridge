-- Fix the email_notifications table by adding RLS policies
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Allow reading email notifications for system operations 
CREATE POLICY "Allow system access to email notifications" 
ON public.email_notifications 
FOR ALL 
USING (true);