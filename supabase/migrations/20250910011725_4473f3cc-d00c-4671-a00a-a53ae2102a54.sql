-- Remove the overly permissive policy that allows access to all email notifications
DROP POLICY IF EXISTS "Allow system access to email notifications" ON public.email_notifications;

-- Create secure RLS policies for email notifications
-- Users can only view their own email notifications (if they need to for troubleshooting)
CREATE POLICY "Users can view their own email notifications" 
ON public.email_notifications 
FOR SELECT 
USING (auth.uid() = recipient_id);

-- Only system operations (using service role) can insert email notification records
-- Regular users should not be able to insert email notifications
CREATE POLICY "System can insert email notifications" 
ON public.email_notifications 
FOR INSERT 
WITH CHECK (current_setting('role') = 'service_role' OR auth.role() = 'service_role');

-- Only system operations can update email notifications  
CREATE POLICY "System can update email notifications"
ON public.email_notifications 
FOR UPDATE 
USING (current_setting('role') = 'service_role' OR auth.role() = 'service_role');

-- Prevent deletion of email notification records for audit trail
-- No DELETE policy means no one can delete records