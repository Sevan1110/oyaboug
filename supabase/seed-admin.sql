-- Créer un compte admin pour test local
-- Email: sevankedesh11@gmail.com
-- Password: Admin123!

-- 1. Supprimer l'utilisateur s'il existe déjà
DELETE FROM auth.users WHERE email = 'sevankedesh11@gmail.com';

-- 2. Créer l'utilisateur dans auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
) VALUES (
  '2a09bd3a-66dd-41d3-8ce4-a71450038456',  -- UUID fixe pour admin
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sevankedesh11@gmail.com',
  crypt('Admin123!', gen_salt('bf')),  -- Hash du mot de passe
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  false,
  ''
);

-- 3. Créer l'identité email
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '2a09bd3a-66dd-41d3-8ce4-a71450038456',
  format('{"sub":"%s","email":"%s"}', '2a09bd3a-66dd-41d3-8ce4-a71450038456', 'sevankedesh11@gmail.com')::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- 4. Le profil sera créé automatiquement par le trigger handle_new_user

SELECT 'Admin user créé: sevankedesh11@gmail.com / Admin123!' as result;
