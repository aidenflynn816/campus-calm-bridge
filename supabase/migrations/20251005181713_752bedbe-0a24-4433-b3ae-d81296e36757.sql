-- CRITICAL SECURITY FIX: Remove all client access to Google tokens
-- These tokens must only be accessible via edge functions with service role

-- Drop existing permissive RLS policy
DROP POLICY IF EXISTS "Users can only access their own Google tokens" ON public.user_google_tokens;

-- Create highly restrictive policies that only allow service role access
-- Completely block all direct client access to sensitive token data
CREATE POLICY "Block all client SELECT access to tokens"
  ON public.user_google_tokens
  FOR SELECT
  USING (false);

CREATE POLICY "Block all client INSERT access to tokens"
  ON public.user_google_tokens
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block all client UPDATE access to tokens"
  ON public.user_google_tokens
  FOR UPDATE
  USING (false);

CREATE POLICY "Block all client DELETE access to tokens"
  ON public.user_google_tokens
  FOR DELETE
  USING (false);

-- Add helpful comment explaining the security model
COMMENT ON TABLE public.user_google_tokens IS 
  'SECURITY: This table contains sensitive Google OAuth tokens. 
   All access MUST go through edge functions using service role. 
   Client-side access is completely blocked by RLS policies.';

-- Create a secure helper function for edge functions to access tokens
-- This uses SECURITY DEFINER to allow service-level access
CREATE OR REPLACE FUNCTION public.get_user_google_token_secure(target_user_id uuid)
RETURNS TABLE (
  access_token text,
  refresh_token text,
  calendar_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow access if called from service role context
  -- This function should only be called from edge functions
  IF current_setting('role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: This function can only be called with service role';
  END IF;

  RETURN QUERY
  SELECT 
    google_access_token,
    google_refresh_token,
    google_calendar_id
  FROM public.user_google_tokens
  WHERE user_id = target_user_id;
END;
$$;

COMMENT ON FUNCTION public.get_user_google_token_secure IS 
  'SECURITY: Service-role only function to retrieve Google tokens. 
   Must only be called from edge functions with proper authentication.';