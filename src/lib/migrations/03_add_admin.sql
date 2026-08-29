-- Run this in your Supabase SQL Editor to grant admin access to the specified user.
INSERT INTO admin_users (user_id) VALUES ('d70e7a7e-0543-4a80-b546-2df229aad8fa')
ON CONFLICT (user_id) DO NOTHING;
