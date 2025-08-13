-- Drop the overly permissive policy that allows all users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a more restrictive policy that follows the principle of least privilege
CREATE POLICY "Users can view profiles based on role relationships" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can always view their own profile
  auth.uid() = user_id 
  OR 
  -- Students can view counselor profiles (needed for booking appointments, messaging)
  (
    EXISTS (
      SELECT 1 FROM public.profiles AS requester 
      WHERE requester.user_id = auth.uid() 
      AND requester.role = 'student'
    ) 
    AND role = 'counselor'
  )
  OR
  -- Counselors can view student profiles (needed for managing their caseload)
  (
    EXISTS (
      SELECT 1 FROM public.profiles AS requester 
      WHERE requester.user_id = auth.uid() 
      AND requester.role = 'counselor'
    ) 
    AND role = 'student'
  )
);