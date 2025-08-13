-- Add Google Calendar integration fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN google_calendar_id TEXT,
ADD COLUMN google_access_token TEXT,
ADD COLUMN google_refresh_token TEXT,
ADD COLUMN calendar_connected BOOLEAN DEFAULT false;

-- Create counselor_availability table
CREATE TABLE public.counselor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_counselor_availability_counselor FOREIGN KEY (counselor_id) REFERENCES public.profiles(user_id)
);

-- Enable RLS on counselor_availability
ALTER TABLE public.counselor_availability ENABLE ROW LEVEL SECURITY;

-- Create policies for counselor_availability
CREATE POLICY "Counselors can manage their own availability" 
ON public.counselor_availability 
FOR ALL
USING (
  auth.uid() = counselor_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'counselor'
  )
);

CREATE POLICY "Students can view counselor availability" 
ON public.counselor_availability 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'student'
  )
);

-- Add Google Calendar event ID to appointments table
ALTER TABLE public.appointments 
ADD COLUMN google_event_id TEXT;

-- Create trigger for availability table
CREATE TRIGGER update_counselor_availability_updated_at
BEFORE UPDATE ON public.counselor_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();