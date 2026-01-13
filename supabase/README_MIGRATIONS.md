# Guide des Migrations et Seed - ouyaboung Platform

Ce guide explique comment utiliser les migrations et le seed pour configurer la base de données Supabase.

## 📋 Structure des fichiers

```
supabase/
├── migrations/
│   ├── 20260105_initial_schema.sql          # Schéma initial (tables de base)
│   └── 20260115_complete_schema_with_rls.sql  # Schéma complet avec RLS et fonctions
├── seed.sql                                 # Données de test
└── README_MIGRATIONS.md                     # Ce fichier
```

## 🗄️ Tables de la base de données

### Tables principales

1. **profiles** - Profils utilisateurs (lié à auth.users)
2. **merchants** - Commerces partenaires
3. **food_items** - Produits alimentaires invendus
4. **orders** - Commandes/réservations
5. **notifications** - Notifications utilisateurs
6. **favorites** - Favoris (merchants)
7. **reviews** - Avis clients
8. **impact_logs** - Logs d'impact environnemental
9. **pricing_history** - Historique des prix
10. **user_roles** - Rôles utilisateurs (RBAC)
11. **admin_activities** - Journal des actions admin
12. **impact_reports** - Rapports d'impact générés
13. **monthly_aggregates** - Agrégats mensuels (cache)

## 🚀 Installation

### Option 1: Via Supabase CLI (recommandé)

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à votre projet
supabase login

# Lier votre projet local
supabase link --project-ref YOUR_PROJECT_REF

# Appliquer les migrations
supabase db push

# Exécuter le seed
supabase db seed
```

### Option 2: Via l'interface Supabase

1. **Appliquer les migrations**:
   - Allez dans votre projet Supabase
   - Naviguez vers "SQL Editor"
   - Exécutez d'abord `20260105_initial_schema.sql`
   - Puis exécutez `20260115_complete_schema_with_rls.sql`

2. **Exécuter le seed**:
   - Dans le SQL Editor, ouvrez `seed.sql`
   - **IMPORTANT**: Créez d'abord les utilisateurs via l'interface Auth
   - Adaptez les UUIDs dans le seed avec vos vrais user_id
   - Exécutez le script

## ⚠️ Important: Créer les utilisateurs Auth d'abord

Le seed nécessite que les utilisateurs soient créés dans `auth.users` avant d'insérer les données.

### Créer des utilisateurs de test

#### Via l'interface Supabase:
1. Allez dans "Authentication" > "Users"
2. Cliquez sur "Add user"
3. Créez les utilisateurs suivants:
   - **Admin**: `admin@ouyaboung.com` (password: `admin123`)
   - **Merchant 1**: `boulangerie@example.com` (password: `merchant123`)
   - **Merchant 2**: `restaurant@example.com` (password: `merchant123`)
   - **User 1**: `user1@example.com` (password: `user123`)
   - **User 2**: `user2@example.com` (password: `user123`)

#### Via SQL (si vous avez les permissions):
```sql
-- Note: Cette méthode nécessite des permissions spéciales
-- Il est préférable d'utiliser l'interface ou l'API Auth
```

#### Via l'API (recommandé pour les tests):
```typescript
// Utilisez votre service auth pour créer les utilisateurs
await register('admin@ouyaboung.com', 'admin123', { role: 'admin' });
await register('boulangerie@example.com', 'merchant123', { role: 'merchant' });
await register('user1@example.com', 'user123', { role: 'user' });
```

### Adapter le seed avec les vrais UUIDs

Une fois les utilisateurs créés, récupérez leurs UUIDs:

```sql
-- Récupérer les UUIDs des utilisateurs créés
select id, email from auth.users;
```

Puis modifiez le fichier `seed.sql` pour remplacer les UUIDs de test par les vrais UUIDs.

## 🔐 Row Level Security (RLS)

Toutes les tables ont RLS activé avec les politiques suivantes:

- **profiles**: Les utilisateurs peuvent voir/modifier leur propre profil
- **merchants**: Tous peuvent voir les merchants actifs, les merchants peuvent gérer leur profil
- **food_items**: Tous peuvent voir les items disponibles, les merchants peuvent gérer leurs items
- **orders**: Les utilisateurs voient leurs commandes, les merchants voient les commandes de leur commerce
- **notifications**: Les utilisateurs voient leurs notifications
- **favorites**: Les utilisateurs gèrent leurs favoris
- **reviews**: Tous peuvent voir les avis, les utilisateurs peuvent créer des avis pour leurs commandes

## 🔧 Fonctions et Triggers

### Fonctions créées:
- `get_user_role(user_uuid)` - Récupère le rôle d'un utilisateur
- `is_admin(user_uuid)` - Vérifie si un utilisateur est admin
- `generate_pickup_code()` - Génère un code de retrait
- `calculate_order_savings()` - Calcule les économies d'une commande

### Triggers:
- `trigger_log_order_impact` - Log automatique de l'impact quand une commande est complétée
- `trigger_notify_order_status_change` - Notification automatique lors du changement de statut d'une commande
- `set_*_updated_at` - Mise à jour automatique du champ `updated_at`

## 📊 Vues créées

- `user_impact_summary` - Résumé de l'impact par utilisateur
- `merchant_impact_summary` - Résumé de l'impact par merchant

## 🧪 Tester les routes

Une fois le seed exécuté, vous pouvez tester les routes suivantes:

### Routes publiques:
- `GET /` - Page d'accueil
- `GET /search` - Recherche de produits
- `GET /concept` - Page concept

### Routes utilisateur (nécessitent authentification):
- `GET /user` - Dashboard utilisateur
- `GET /user/reservations` - Réservations
- `GET /user/favorites` - Favoris
- `GET /user/impact` - Impact environnemental

### Routes merchant (nécessitent authentification merchant):
- `GET /merchant` - Dashboard merchant
- `GET /merchant/products` - Gestion des produits
- `GET /merchant/orders` - Commandes reçues

### Routes admin (nécessitent authentification admin):
- `GET /admin` - Dashboard admin
- `GET /admin/merchants` - Gestion des merchants
- `GET /admin/validations` - Validations en attente

## 🔄 Réinitialiser la base de données

⚠️ **Attention**: Cette opération supprime toutes les données!

```sql
-- Supprimer toutes les données (dans l'ordre)
truncate table public.impact_logs cascade;
truncate table public.orders cascade;
truncate table public.food_items cascade;
truncate table public.favorites cascade;
truncate table public.reviews cascade;
truncate table public.notifications cascade;
truncate table public.merchants cascade;
truncate table public.profiles cascade;
truncate table public.pricing_history cascade;
truncate table public.impact_reports cascade;
truncate table public.monthly_aggregates cascade;
truncate table public.admin_activities cascade;
```

## 📝 Notes importantes

1. **UUIDs**: Les UUIDs dans le seed sont des exemples. Remplacez-les par les vrais UUIDs de vos utilisateurs.

2. **Dates**: Les dates de retrait (`pickup_start`, `pickup_end`) sont calculées dynamiquement (demain).

3. **Prix**: Tous les prix sont en FCFA (XAF).

4. **RLS**: Assurez-vous que RLS est activé et que les politiques sont correctes pour votre cas d'usage.

5. **Extensions**: L'extension `postgis` est optionnelle (pour les fonctionnalités géolocalisation avancées).

## 🐛 Dépannage

### Erreur: "relation does not exist"
- Vérifiez que vous avez exécuté les migrations dans l'ordre
- Vérifiez que vous êtes connecté au bon projet Supabase

### Erreur: "permission denied"
- Vérifiez que RLS est correctement configuré
- Vérifiez que vous êtes authentifié avec un utilisateur ayant les bonnes permissions

### Erreur: "foreign key constraint"
- Vérifiez que les UUIDs dans le seed correspondent à des enregistrements existants
- Créez d'abord les utilisateurs dans auth.users

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
