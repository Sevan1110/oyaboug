-- ==========================================
-- Setup Default Admin Profile
-- ==========================================

-- This migration ensures that the default admin is correctly set up
-- if the user has already signed up. 
-- Otherwise, the 'on_auth_user_created' trigger will handle it upon signup.

-- Update existing profile if user already signed up
update public.profiles
set 
  role = 'admin'
where email = 'sevankedesh11@gmail.com'
and role != 'admin';
