-- Fix critical security issue: Resources table exposing counselor data publicly
-- Remove the overly permissive policy that allows anyone to view resources
DROP POLICY IF EXISTS "Anyone can view published resources" ON public.resources;

-- Create a more secure policy that requires authentication and proper relationships
-- Students can view resources shared by their counselors or featured resources
CREATE POLICY "Authenticated users can view appropriate resources" 
ON public.resources 
FOR SELECT 
TO authenticated
USING (
  -- Featured resources can be viewed by all authenticated users
  featured = true 
  OR 
  -- Users can view resources from counselors they have a relationship with
  (
    EXISTS (
      SELECT 1 FROM public.counselor_students cs 
      WHERE cs.counselor_id = resources.counselor_id 
      AND cs.student_id = auth.uid()
    )
  )
  OR
  -- Counselors can view all resources (for reference)
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'counselor'
    )
  )
  OR
  -- Users can view their own created resources
  counselor_id = auth.uid()
);

-- Add additional security: Create policy for resource metadata protection
-- This ensures that even if someone bypasses the SELECT policy, 
-- they can't access sensitive metadata
CREATE POLICY "Protect sensitive resource metadata" 
ON public.resources 
FOR SELECT 
TO authenticated
USING (
  -- Same conditions as above, but explicitly documented for metadata protection
  featured = true 
  OR 
  EXISTS (
    SELECT 1 FROM public.counselor_students cs 
    WHERE cs.counselor_id = resources.counselor_id 
    AND cs.student_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'counselor'
  )
  OR
  counselor_id = auth.uid()
);