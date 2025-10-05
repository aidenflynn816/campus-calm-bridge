-- Fix email_notifications security issue
-- Step 1: Update any existing rows with NULL recipient_id (set to a safe default or handle appropriately)
-- Since these are system notifications, we should delete any orphaned records
DELETE FROM public.email_notifications WHERE recipient_id IS NULL;

-- Step 2: Make recipient_id NOT NULL to prevent future security gaps
ALTER TABLE public.email_notifications 
  ALTER COLUMN recipient_id SET NOT NULL;

-- Step 3: Drop the old RLS policy and create a more explicit one
DROP POLICY IF EXISTS "Secure email notifications access" ON public.email_notifications;

-- Step 4: Create a strict RLS policy that only allows authenticated users to see their own notifications
CREATE POLICY "Users can only view their own email notifications"
  ON public.email_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);