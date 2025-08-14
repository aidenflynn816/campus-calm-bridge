-- Create a secure table for Google integration tokens
CREATE TABLE public.user_google_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_calendar_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.user_google_tokens ENABLE ROW LEVEL SECURITY;

-- Create strict RLS policy - users can only access their own tokens
CREATE POLICY "Users can only access their own Google tokens"
ON public.user_google_tokens
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_google_tokens_updated_at
  BEFORE UPDATE ON public.user_google_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing Google token data to the new secure table
INSERT INTO public.user_google_tokens (user_id, google_access_token, google_refresh_token, google_calendar_id)
SELECT user_id, google_access_token, google_refresh_token, google_calendar_id
FROM public.profiles
WHERE google_access_token IS NOT NULL 
   OR google_refresh_token IS NOT NULL 
   OR google_calendar_id IS NOT NULL;

-- Remove the sensitive columns from the profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS google_access_token;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS google_refresh_token;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS google_calendar_id;