-- Create mood_check_ins table
CREATE TABLE public.mood_check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 5),
  mood_emoji TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mood_check_ins ENABLE ROW LEVEL SECURITY;

-- Create policies for mood check-ins
CREATE POLICY "Users can view their own mood check-ins" 
ON public.mood_check_ins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood check-ins" 
ON public.mood_check_ins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood check-ins" 
ON public.mood_check_ins 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood check-ins" 
ON public.mood_check_ins 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mood_check_ins_updated_at
BEFORE UPDATE ON public.mood_check_ins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on user queries
CREATE INDEX idx_mood_check_ins_user_id_created_at ON public.mood_check_ins(user_id, created_at DESC);