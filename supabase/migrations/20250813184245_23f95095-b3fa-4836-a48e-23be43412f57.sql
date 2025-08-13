-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  type TEXT NOT NULL CHECK (type IN ('article', 'pdf', 'video', 'image')),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies for resources
CREATE POLICY "Anyone can view published resources" 
ON public.resources 
FOR SELECT 
USING (true);

CREATE POLICY "Counselors can create resources" 
ON public.resources 
FOR INSERT 
WITH CHECK (
  auth.uid() = counselor_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'counselor'
  )
);

CREATE POLICY "Counselors can update their own resources" 
ON public.resources 
FOR UPDATE 
USING (
  auth.uid() = counselor_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'counselor'
  )
);

CREATE POLICY "Counselors can delete their own resources" 
ON public.resources 
FOR DELETE 
USING (
  auth.uid() = counselor_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'counselor'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for resource files
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Create storage policies
CREATE POLICY "Resource files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resources');

CREATE POLICY "Counselors can upload resource files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'resources' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'counselor'
  )
);

CREATE POLICY "Counselors can update their resource files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'resources' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'counselor'
  )
);

CREATE POLICY "Counselors can delete their resource files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'resources' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'counselor'
  )
);