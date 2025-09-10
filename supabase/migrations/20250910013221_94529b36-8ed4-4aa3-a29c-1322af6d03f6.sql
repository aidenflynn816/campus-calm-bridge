-- Create table to track counselor's manually selected students
CREATE TABLE public.counselor_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id UUID NOT NULL,
  student_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(counselor_id, student_id)
);

-- Enable RLS
ALTER TABLE public.counselor_students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Counselors can manage their own student assignments" 
ON public.counselor_students 
FOR ALL 
USING (
  auth.uid() = counselor_id 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'counselor'
  )
);

-- Students can view if they are assigned to a counselor
CREATE POLICY "Students can view their counselor assignments" 
ON public.counselor_students 
FOR SELECT 
USING (
  auth.uid() = student_id 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'student'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_counselor_students_updated_at
BEFORE UPDATE ON public.counselor_students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();