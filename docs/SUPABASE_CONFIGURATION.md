# Configuration Supabase pour ouyaboug

Ce document contient les instructions pour configurer correctement Supabase pour le bon fonctionnement de l'application.

## 🔴 URGENT: Configuration des URLs (5 min)

### Étape 1: Accéder au Dashboard Supabase

1. Allez sur: https://supabase.com/dashboard/project/geqvbpghvmcglzfkqmvj
2. Connectez-vous avec vos identifiants

### Étape 2: URL Configuration

1. Dans le menu latéral, cliquez sur **"Authentication"**
2. Cliquez sur **"Settings"**
3. Cliquez sur l'onglet **"URL Configuration"**

### Étape 3: Configurer les URLs

Mettez à jour les champs suivants:

#### Site URL
```
https://oyaboug-git-main-sevans-projects-8efb02e0.vercel.app
```
**(Remplacez par votre URL Vercel réelle)**

#### Additional Redirect URLs
Ajoutez chaque URL sur une ligne séparée:
```
http://localhost:5173
http://localhost:5173/auth/callback
https://oyaboug-git-main-sevans-projects-8efb02e0.vercel.app/auth/callback
https://oyaboug.vercel.app/auth/callback
```

#### Redirect URLs (Legacy - si le champ existe)
```
http://localhost:5173/**
https://oyaboug-git-main-sevans-projects-8efb02e0.vercel.app/**
```

###Étape 4: Sauvegarder

Cliquez sur **"Save"** en bas de la page.

---

## 📧 Configuration Email Templates (Optionnel mais recommandé)

### Modifier le Template de Confirmation

1. Toujours dans **Authentication > Email Templates**
2. Sélectionnez **"Confirm signup"**
3. Modifiez le template pour pointer vers votre URL de production:

**Ancien**:
```html
<a href="{{ .ConfirmationURL }}">Confirm your email</a>
```

**Nouveau**:
```html
<a href="https://oyaboug.vercel.app/auth/callback?token_hash={{ .TokenHash }}&type=signup">
  Confirmer votre email
</a>
```

### Personnaliser les Autres Templates

- **Magic Link**: Utile si vous utilisez la connexion sans mot de passe
- **Reset Password**: Pour la réinitialisation de mot de passe
- **Change Email**: Pour la modification d'email

---

## 🔐 Configuration RLS (Row Level Security)

### Vérifier les Politiques

1. Allez dans **"Database" > "Policies"**
2. Vérifiez que la table `merchants` a la politique **"Enable insert for registration"**

Si elle n'existe pas, exécutez la migration `20260127100000_merchant_validation_workflow.sql`

---

## 🌐 Variables d'Environnement

### Variables Requises

#### `.env.local` (Développement)
```bash
VITE_SUPABASE_URL=https://geqvbpghvmcglzfkqmvj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXZicGdodm1jZ2x6ZmtxbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NzQ4NTksImV4cCI6MjA4MzE1MDg1OX0.tbuBJZEB7T_0WJFFM5gPlwdlJ8dXThXNl4wbE70VYsE
VITE_APP_URL=http://localhost:5173
```

#### `.env.production` (Production - Vercel)
```bash
VITE_SUPABASE_URL=https://geqvbpghvmcglzfkqmvj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXZicGdodm1jZ2x6ZmtxbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NzQ4NTksImV4cCI6MjA4MzE1MDg1OX0.tbuBJZEB7T_0WJFFM5gPlwdlJ8dXThXNl4wbE70VYsE
VITE_APP_URL=https://oyaboug.vercel.app
VITE_RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXX  # Optionnel
```

### Configuration Vercel

1. Allez sur https://vercel.com/sevans-projects/oyaboug
2. Settings > Environment Variables
3. Ajoutez chaque variable ci-dessus

---

## 📧 Configuration Resend.com (Optionnel - Pour emails professionnels)

### Étape 1: Créer un Compte

1. Allez sur https://resend.com
2. Créez un compte gratuit (3000 emails/mois gratuits)

### Étape 2: Ajouter un Domaine (Recommandé)

1. Dans Resend Dashboard, cliquez sur **"Domains"**
2. Ajoutez votre domaine (ex: `oyaboug.com`)
3. Suivez les instructions pour configurer les DNS

### Étape 3: Générer une API Key

1. Cliquez sur **"API Keys"**
2. Créez une nouvelle clé
3. Copiez la clé (`re_XXXXXXXXX`)

### Étape 4: Ajouter la Clé aux Variables d'Environnement

**Localement**:
```bash
echo "VITE_RESEND_API_KEY=re_XXXXXXXXX" >> .env.local
```

**Sur Vercel**:
1. Settings > Environment Variables
2. Ajoutez `VITE_RESEND_API_KEY` avec votre clé

### Étape 5: Modifier le FROM Email

Dans `src/services/email.service.ts`, ligne 8:

**Avant**:
```typescript
const FROM_EMAIL = 'ouyaboung <noreply@oyaboug.com>';
```

**Après** (si vous n'avez pas de domaine):
```typescript
const FROM_EMAIL = 'ouyaboung <noreply@resend.dev>';  // Email de test Resend
```

**Après** (avec votre domaine vérifié):
```typescript
const FROM_EMAIL = 'ouyaboung <noreply@votre-domaine.com>';
```

---

## ✅ Vérification de la Configuration

### Test 1: Vérifier les URLs

1. Créez un compte test sur votre application
2. Vérifiez l'email reçu
3. Cliquez sur le lien de confirmation
4. Vous devriez être redirigé vers votre URL de production (pas localhost)

### Test 2: Inscription Marchand

1. Allez sur `/merchant/register`
2. Remplissez le formulaire
3. Soumettez
4. Vérifiez dans le dashboard admin que la notification apparaît

### Test 3: Validation Admin

1. Connectez-vous en tant qu'admin (`pendysevan11@gmail.com`)
2. Allez sur le dashboard
3. Validez un marchand en attente
4. Vérifiez les logs de la console pour voir si l'email a été envoyé

---

## 🐛 Dépannage

### Les emails pointent toujours vers localhost

**Solution**: Videz le cache de votre navigateur et vérifiez que le Site URL est bien configuré dans Supabase.

### Erreur "Invalid redirect URL"

**Cause**: L'URL de redirection n'est pas dans la liste des URLs autorisées.

**Solution**: Ajoutez l'URL exacte dans "Additional Redirect URLs" de Supabase.

### Emails non reçus (Resend)

**Causes possibles**:
1. API Key non configurée
2. Domaine non vérifié
3. Email dans les spams

**Solution**: 
- Vérifiez les logs de la console
- Utilisez `onboarding@resend.dev` pour les tests
- Vérifiez le dashboard Resend pour voir les emails envoyés

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs Supabase: Dashboard > Logs
2. Vérifiez les erreurs dans la console du navigateur
3. Testez avec un email différent
4. Contactez le support Supabase si nécessaire
