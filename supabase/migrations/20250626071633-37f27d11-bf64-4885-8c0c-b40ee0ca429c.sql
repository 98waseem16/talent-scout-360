
-- First, let's check if the user exists and get their ID
-- If the user doesn't exist yet, they'll need to sign up first
-- Once they have an account, we can add them to the admin_users table

-- Add the user to admin_users table (replace the UUID with the actual user ID)
-- You'll need to get the user's UUID from the auth.users table after they sign up
INSERT INTO public.admin_users (id, created_at)
SELECT id, NOW()
FROM auth.users 
WHERE email = 'lameezbrown12@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Alternative: If you know the user's UUID, you can insert it directly
-- INSERT INTO public.admin_users (id, created_at) 
-- VALUES ('USER_UUID_HERE', NOW())
-- ON CONFLICT (id) DO NOTHING;
