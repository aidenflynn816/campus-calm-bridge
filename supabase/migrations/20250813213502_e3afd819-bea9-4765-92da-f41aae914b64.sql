-- Add calendly_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN calendly_url TEXT;