-- Créer utilisateur test avec SQL simple
-- L'utilisateur pourra ensuite changer son mot de passe via l'interface

-- 1. Créer un utilisateur test SIMPLE
SELECT auth.create_user(
  jsonb_build_object(
    'email', 'test@oyaboug.com',
    'password', 'test123',
    'email_confirm', true,
    'user_metadata', jsonb_build_object('role', 'user')
  )
);

-- 2. Créer un admin
SELECT auth.create_user(
  jsonb_build_object(
    'email', 'admin@oyaboug.com',
    'password', 'admin123',
    'email_confirm', true,
    'user_metadata', jsonb_build_object('role', 'admin')
  )
);

SELECT 'Users créés avec succès!' as message,
       'test@oyaboug.com / test123 (user)' as user_account,
       'admin@oyaboug.com / admin123 (admin)' as admin_account;
