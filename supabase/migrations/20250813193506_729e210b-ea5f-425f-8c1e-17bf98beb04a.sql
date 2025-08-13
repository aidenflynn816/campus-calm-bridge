-- Create data sharing requests table
CREATE TABLE public.data_sharing_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id UUID NOT NULL,
  student_id UUID NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'mood_data',
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(counselor_id, student_id, request_type)
);

-- Enable Row Level Security
ALTER TABLE public.data_sharing_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for data sharing requests
CREATE POLICY "Counselors can create requests for their students" 
ON public.data_sharing_requests 
FOR INSERT 
WITH CHECK (
  auth.uid() = counselor_id AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'counselor'
  )
);

CREATE POLICY "Users can view their own requests" 
ON public.data_sharing_requests 
FOR SELECT 
USING (auth.uid() = counselor_id OR auth.uid() = student_id);

CREATE POLICY "Students can update requests sent to them" 
ON public.data_sharing_requests 
FOR UPDATE 
USING (auth.uid() = student_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_data_sharing_requests_updated_at
BEFORE UPDATE ON public.data_sharing_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update mood_check_ins RLS to allow counselors to see approved data
DROP POLICY IF EXISTS "Users can view their own mood check-ins" ON public.mood_check_ins;

CREATE POLICY "Users can view their own mood check-ins" 
ON public.mood_check_ins 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM data_sharing_requests 
    WHERE student_id = mood_check_ins.user_id 
    AND counselor_id = auth.uid() 
    AND request_type = 'mood_data' 
    AND status = 'approved'
  )
);