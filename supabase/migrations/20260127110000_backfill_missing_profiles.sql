-- ==========================================
-- BACKFILL MISSING PROFILES
-- ==========================================

-- Insert missing profiles for existing auth users who don't have a profile row
INSERT INTO public.profiles (
    user_id, 
    email, 
    role, 
    full_name, 
    first_name, 
    last_name, 
    birth_date
)
SELECT 
    au.id,
    au.email,
    -- Role logic: check specific email or metadata, default to 'user'
    CASE 
        WHEN au.email IN ('sevankedesh11@gmail.com', 'pendysevan11@gmail.com') THEN 'admin'
        ELSE COALESCE(au.raw_user_meta_data->>'role', 'user')
    END,
    -- Full name logic: use full_name or combine first/last
    COALESCE(
        au.raw_user_meta_data->>'full_name', 
        TRIM(COALESCE(au.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(au.raw_user_meta_data->>'last_name', ''))
    ),
    au.raw_user_meta_data->>'first_name',
    au.raw_user_meta_data->>'last_name',
    -- Birth date logic: cast string to date if valid
    CASE 
        WHEN au.raw_user_meta_data->>'birth_date' IS NOT NULL AND au.raw_user_meta_data->>'birth_date' != ''
        THEN (au.raw_user_meta_data->>'birth_date')::date 
        ELSE NULL 
    END
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.id IS NULL;
