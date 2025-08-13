-- Create a security definer function to get current user role
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view profiles based on role relationships" ON public.profiles;

-- Create a new policy using the security definer function
CREATE POLICY "Users can view profiles based on role relationships" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can always view their own profile
  auth.uid() = user_id 
  OR 
  -- Students can view counselor profiles
  (public.get_current_user_role() = 'student' AND role = 'counselor')
  OR
  -- Counselors can view student profiles  
  (public.get_current_user_role() = 'counselor' AND role = 'student')
);