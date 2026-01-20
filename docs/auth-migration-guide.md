# Guide de Migration - Auth V2

## 📋 Vue d'Ensemble

Ce guide explique comment migrer du système d'authentification actuel vers Auth V2.

---

## 🎯 Prérequis

### Dépendances NPM

Ajoutez les dépendances nécessaires:

```bash
npm install --save zod@^3.25.76

npm install --save-dev \
  vitest@^1.0.0 \
  @vitest/ui@^1.0.0 \
  @testing-library/react@^14.0.0 \
  @testing-library/jest-dom@^6.1.5 \
  @testing-library/user-event@^14.5.1 \
  jsdom@^23.0.1
```

---

## 🗄️ Migration Base de Données

### 1. Backup Database

**CRITIQUE**: Toujours backup avant migration!

```bash
# Backup complet
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Ou via psql directement
pg_dump $DATABASE_URL > backup.sql
```

### 2. Exécuter Migrations

```bash
# Test en local d'abord
supabase db reset
supabase migration up

# Vérifier que tout fonctionne
npm run test:unit
```

### 3. Migrations à Appliquer

Les fichiers suivants doivent être exécutés dans l'ordre:

1. `20260115140000_auth_v2_schema.sql` - Crée tables et fonctions
2. `20260115141000_auth_v2_rls.sql` - Configure RLS policies

### 4. Vérifications Post-Migration

```sql
-- Vérifier tables créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'auth_%';

-- Devrait retourner:
-- auth_sessions
-- auth_audit_log
-- auth_mfa_factors
-- password_reset_tokens
-- failed_login_attempts

-- Vérifier fonctions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%auth%';

-- Vérifier policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' AND tablename LIKE 'auth_%';
```

---

## 💻 Migration Code Frontend

### 1. Imports à Mettre à Jour

**Avant**:
```typescript
import { User, UserRole } from '@/types';
import { signInWithEmail } from '@/api/auth.api';
```

**Après**:
```typescript
import type { UserWithAuth, UserRole } from '@/lib/auth';
import { signInWithEmail } from '@/api/auth.api';
import { logger } from '@/lib/logger';
import { 
  validatePassword, 
  calculatePasswordStrength 
} from '@/lib/auth/validation';
```

### 2. Remplacer console.log par logger

**Avant**:
```typescript
console.log('User logged in:', user.email);
console.error('Login failed:', error);
```

**Après**:
```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { email: user.email });
logger.error('Login failed', error, { email });
```

### 3. Utiliser Nouveaux Schemas de Validation

**Avant** (validation manuelle):
```typescript
if (password.length < 8) {
  setError('Password too short');
}
```

**Après** (Zod schemas):
```typescript
import { signInSchema } from '@/lib/auth/validation';

const result = signInSchema.safeParse({ email, password });
if (!result.success) {
  setError(result.error.errors[0].message);
}
```

### 4. Gestion d'Erreurs Améliorée

**Avant**:
```typescript
catch (error) {
  setError('Une erreur est survenue');
}
```

**Après**:
```typescript
import { getErrorMessage, isAuthError } from '@/lib/auth/errors';

catch (error) {
  const message = getErrorMessage(error);
  setError(message);
  
  // Log détaillé
  logger.error('Operation failed', error);
}
```

---

## 🔒 Nouvelles Fonctionnalités à Intégrer

### 1. Indicateur Force de Mot de Passe

Créez un composant `PasswordStrengthIndicator`:

```typescript
import { calculatePasswordStrength } from '@/lib/auth/validation';

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = calculatePasswordStrength(password);
  
  return (
    <div>
      <div className="strength-bar" data-strength={strength.strength_label}>
        <div style={{ width: `${strength.score}%` }} />
      </div>
      <p>{strength.estimated_crack_time}</p>
      {strength.feedback.map((f, i) => (
        <p key={i} className="text-sm text-red-500">• {f}</p>
      ))}
    </div>
  );
}
```

### 2. Gestionnaire de Sessions

```typescript
import { getActiveSessions, revokeSession } from '@/lib/auth/session';

function SessionManager({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  
  useEffect(() => {
    getActiveSessions(userId).then(setSessions);
  }, [userId]);
  
  const handleRevoke = async (sessionId: string) => {
    await revokeSession(sessionId);
    setSessions(sessions.filter(s => s.id !== sessionId));
  };
  
  return (
    <div>
      {sessions.map(session => (
        <div key={session.id}>
          <span>{session.device}</span>
          <span>{session.is_current ? '(Actuelle)' : ''}</span>
          {!session.is_current && (
            <button onClick={() => handleRevoke(session.id)}>
              Révoquer
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 3. Configuration MFA

```typescript
import { setupMFA, verifyMFAToken } from '@/lib/auth/mfa';

// Dans composant settings
const handleSetupMFA = async () => {
  const response = await setupMFA(user.id, user.email, {
    factor_type: 'totp',
  });
  
  setQRCodeURL(response.qr_code_url);
  setBackupCodes(response.backup_codes);
  setFactorId(response.factor_id);
};

const handleVerifyMFA = async (token: string) => {
  const isValid = await verifyMFAToken(user.id, factorId, token);
  if (isValid) {
    toast.success('MFA activé avec succès!');
  }
};
```

---

## 🧪 Tests

### Exécuter Tests

```bash
# Tous les tests
npm run test

# Tests unitaires seulement
npm run test:unit

# Avec coverage
npm run test:coverage

# Watch mode (dev)
npm run test:watch
```

### Scripts package.json

Ajoutez dans `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --include 'src/**/*.test.ts'",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui"
  }
}
```

---

## 🚨 Breaking Changes

### 1. Sessions Invalidées

**Impact**: Tous les utilisateurs devront se reconnecter après la migration.

**Communication**:
- Email aux utilisateurs 48h avant
- Bannière sur le site
- Message clair lors de la déconnexion

### 2. Nouvelle Politique de Mot de Passe

**Impact**: Mots de passe existants < 12 caractères seront demandés de changer au prochain login.

**Implémentation**:
```typescript
// Au login, vérifier si password actuel est faible
if (user && !meetsNewPolicy(user)) {
  navigate('/change-password?required=true');
}
```

### 3. MFA Obligatoire pour Admins

**Impact**: Admins devront configurer MFA dans les 7 jours.

**Implémentation**:
```typescript
if (userRole === 'admin' && !mfaEnabled) {
  const daysSinceCreation = differenceInDays(now, user.created_at);
  if (daysSinceCreation > 7) {
    // Force MFA setup
    navigate('/settings/security/mfa?required=true');
  }
}
```

---

## 🔄 Rollback Plan

Si problèmes critiques après déploiement:

### 1. Restaurer Base de Données

```bash
psql $DATABASE_URL < backup.sql
```

### 2. Rollback Code

```bash
git revert <commit-sha>
vercel rollback  # ou équivalent
```

### 3. Critères de Rollback

Rollback SI:
- > 10% des utilisateurs ne peuvent pas se connecter
- Erreurs RLS bloquant l'accès aux données
- Performance dégradée (> 2s pour login)

---

## ✅ Checklist Déploiement

### Avant Déploiement

- [ ] Tests unitaires passent (> 90% coverage)
- [ ] Migrations testées en staging
- [ ] Backup production créé
- [ ] Plan rollback documenté
- [ ] Email utilisateurs envoyé
- [ ] Monitoring configuré

### Pendant Déploiement

- [ ] Mode maintenance activé
- [ ] Migrations exécutées
- [ ] Smoke tests manuels réussis
- [ ] Vérification logs (pas d'erreurs critiques)

### Après Déploiement

- [ ] Mode maintenance désactivé
- [ ] Monitoring actif
- [ ] Email confirmation envoyé
- [ ] Support prêt pour questions

---

## 📞 Support

En cas de problème durant la migration:

1. **Vérifier logs**:
   ```bash
   supabase logs --type api
   supabase logs --type db
   ```

2. **Vérifier RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

3. **Contacter l'équipe de développement** avec:
   - Logs d'erreur
   - Steps de reproduction
   - Impact utilisateurs

---

## 📚 Ressources

- [Implementation Plan](./implementation_plan.md)
- [Walkthrough](./walkthrough.md)
- [Auth API Documentation](../src/lib/auth/README.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
