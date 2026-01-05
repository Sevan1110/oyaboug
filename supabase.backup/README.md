# Supabase Migrations - Oyaboung Platform

Ce dossier contient toutes les migrations Supabase pour la plateforme Oyaboung (anti-gaspillage alimentaire au Gabon).

## Structure

```
supabase/
├── config.toml          # Configuration Supabase
├── migrations/          # Fichiers de migration SQL
│   └── 20260104000000_initial_schema.sql
└── migrate.sh          # Script d'exécution des migrations
```

## Prérequis

1. **Supabase CLI** installé :
   ```bash
   npm install -g supabase
   ```

2. **Connexion à Supabase** :
   ```bash
   supabase login
   ```

3. **Initialisation du projet** (si pas déjà fait) :
   ```bash
   supabase init
   ```

## Utilisation

### Migration locale

Pour appliquer les migrations sur votre instance Supabase locale :

```bash
# Depuis la racine du projet
./supabase/migrate.sh
```

Ou manuellement :

```bash
# Démarrer Supabase localement
supabase start

# Appliquer les migrations
supabase db push
```

### Migration vers production

Pour déployer sur Supabase Cloud :

```bash
# Lier le projet à votre instance Supabase
supabase link --project-ref YOUR_PROJECT_REF

# Appliquer les migrations
supabase db push
```

## Tables créées

### Tables principales

1. **`profiles`** - Profils utilisateurs (étend `auth.users`)
2. **`merchants`** - Profils commerçants
3. **`food_items`** - Articles alimentaires
4. **`orders`** - Commandes et réservations
5. **`pricing_recommendations`** - Recommandations de prix
6. **`user_favorites`** - Favoris utilisateurs
7. **`notifications`** - Notifications
8. **`impact_stats`** - Statistiques d'impact globales
9. **`user_impact`** - Impact par utilisateur
10. **`merchant_impact`** - Impact par commerçant

### Fonctionnalités incluses

- **Row Level Security (RLS)** activé sur toutes les tables
- **Politiques de sécurité** appropriées pour chaque rôle
- **Index de performance** optimisés
- **Triggers automatiques** pour :
  - Génération de codes de retrait
  - Mise à jour des timestamps
  - Gestion des statuts de commande
- **Fonctions utilitaires** pour la génération de codes

## Développement

### Ajouter une nouvelle migration

```bash
# Créer une nouvelle migration
supabase migration new nom_de_la_migration

# Modifier le fichier SQL généré
# Puis appliquer
supabase db push
```

### Reset de la base de données

```bash
# Arrêter Supabase
supabase stop

# Reset complet
supabase db reset
```

## Sécurité

Toutes les tables utilisent **Row Level Security (RLS)** avec des politiques appropriées :

- **Utilisateurs** : Peuvent voir/modifier leurs propres données
- **Commerçants** : Peuvent gérer leurs articles et voir leurs commandes
- **Admins** : Accès complet (à définir selon les besoins)
- **Lecture seule** : Statistiques d'impact accessibles à tous les utilisateurs authentifiés

## Données de test

Pour ajouter des données de test, créez un fichier de migration séparé :

```sql
-- Dans supabase/migrations/20260104000001_seed_data.sql
INSERT INTO public.profiles (id, email, full_name, role) VALUES
('user-1', 'user@example.com', 'Utilisateur Test', 'user'),
('merchant-1', 'merchant@example.com', 'Commerçant Test', 'merchant');
```

## Support

En cas de problème avec les migrations :

1. Vérifiez que Supabase CLI est à jour : `supabase --version`
2. Vérifiez le statut : `supabase status`
3. Consultez les logs : `supabase logs`
4. Reset si nécessaire : `supabase db reset`

## Déploiement

### Variables d'environnement

Assurez-vous que votre application a les bonnes variables d'environnement :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Migration en production

⚠️ **Important** : Toujours tester les migrations en local avant de les appliquer en production.

```bash
# Vérifier les changements
supabase db diff

# Appliquer en production
supabase db push --include-all
```