-- First, let's create the missing student profile
INSERT INTO public.profiles (user_id, full_name, role)
VALUES ('c9ecd617-c1de-4fb1-b511-68e83edc4575', 'aidenflynn816@gmail.com', 'student');

-- Let's also check if the trigger exists and fix it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger to ensure new users get profiles automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();