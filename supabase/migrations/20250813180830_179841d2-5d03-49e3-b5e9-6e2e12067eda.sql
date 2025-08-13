-- Fix the main issue: update the RLS policy to allow trigger-based inserts
-- The core problem is that our trigger can't insert profiles due to RLS

-- Update the insert policy for profiles to allow trigger-based inserts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  -- Allow if the current user is creating their own profile
  auth.uid() = user_id
  OR
  -- Allow if this is being called from our trigger (bypassing RLS for system operations)
  current_setting('role', true) = 'supabase_auth_admin'
);

-- Also create the missing trigger function with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();