-- Insert some sample counselor profiles for testing
INSERT INTO public.profiles (user_id, full_name, role, avatar_url) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Dr. Sarah Chen', 'counselor', null),
  ('22222222-2222-2222-2222-222222222222', 'Dr. Michael Brown', 'counselor', null),
  ('33333333-3333-3333-3333-333333333333', 'Dr. Jamie Wilson', 'counselor', null),
  ('44444444-4444-4444-4444-444444444444', 'Dr. Lisa Rodriguez', 'counselor', null)
ON CONFLICT (user_id) DO NOTHING;