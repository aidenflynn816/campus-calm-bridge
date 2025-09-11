-- Fix function search path security issue
DROP FUNCTION IF EXISTS public.audit_mood_access();

CREATE OR REPLACE FUNCTION public.audit_mood_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- This function can be extended to log mood data access for compliance
  -- For now, it just ensures the access is logged at database level
  RAISE NOTICE 'Mood data accessed for user: % by: %', NEW.user_id, current_user;
  RETURN NEW;
END;
$$;