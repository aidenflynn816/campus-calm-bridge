-- Add daily issues tracking to mood_check_ins table
ALTER TABLE public.mood_check_ins 
ADD COLUMN daily_issues TEXT[] DEFAULT '{}';

-- Add a comment for clarity
COMMENT ON COLUMN public.mood_check_ins.daily_issues IS 'Array of daily issues encountered: bullying, social_isolation, conflict_student_staff, burnout, anxiety';