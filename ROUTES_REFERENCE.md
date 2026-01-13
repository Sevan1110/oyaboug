# Référence des Routes - ouyaboung Platform

Ce document liste toutes les routes de l'application pour référence.

## 📍 Routes Frontend (React Router)

### Routes Publiques
- `/` - Page d'accueil
- `/auth` - Authentification (login/signup)
- `/forgot-password` - Mot de passe oublié
- `/auth/reset` - Réinitialisation du mot de passe
- `/search` - Recherche de produits invendus
- `/concept` - Page "Comment ça marche"
- `/cgu` - Conditions générales d'utilisation
- `/privacy` - Politique de confidentialité
- `/help` - Centre d'aide

### Routes Merchant (Inscription)
- `/merchant/register` - Inscription commerçant
- `/merchant/register/success` - Confirmation d'inscription

### Routes Utilisateur (User)
- `/user` - Dashboard utilisateur
- `/user/reservations` - Mes réservations
- `/user/favorites` - Mes favoris
- `/user/impact` - Mon impact environnemental
- `/user/profile` - Mon profil
- `/user/notifications` - Mes notifications
- `/user/settings` - Paramètres
- `/user/help` - Aide

### Routes Commerçant (Merchant)
- `/merchant` - Dashboard commerçant
- `/merchant/products` - Gestion des produits
- `/merchant/orders` - Commandes reçues
- `/merchant/analytics` - Analytics
- `/merchant/impact` - Impact environnemental
- `/merchant/profile` - Profil du commerce
- `/merchant/settings` - Paramètres

### Routes Administrateur (Admin)
- `/admin` - Dashboard admin
- `/admin/merchants` - Gestion des merchants
- `/admin/validations` - Validations en attente
- `/admin/clients` - Gestion des clients
- `/admin/products` - Gestion des produits
- `/admin/transactions` - Transactions
- `/admin/analytics` - Analytics
- `/admin/geo` - Géolocalisation
- `/admin/settings` - Paramètres

## 🔌 Routes API (Supabase)

### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `POST /auth/signup` - Inscription
- `POST /auth/reset-password` - Réinitialisation mot de passe
- `POST /auth/verify-otp` - Vérification OTP
- `POST /auth/refresh` - Rafraîchir le token
- `GET /auth/session` - Session actuelle

### Utilisateurs
- `GET /profiles` - Liste des profils
- `GET /profiles/:id` - Profil par ID
- `PUT /profiles/:id` - Mettre à jour un profil
- `GET /profiles/:id/preferences` - Préférences utilisateur
- `GET /profiles/:id/favorites` - Favoris utilisateur
- `GET /profiles/:id/impact` - Impact utilisateur

### Merchants
- `GET /merchants` - Liste des merchants
- `GET /merchants/:id` - Merchant par ID
- `POST /merchants` - Créer un merchant
- `PUT /merchants/:id` - Mettre à jour un merchant
- `POST /merchants/:id/verify` - Vérifier un merchant
- `GET /merchants/:id/products` - Produits d'un merchant
- `GET /merchants/:id/orders` - Commandes d'un merchant
- `GET /merchants/:id/stats` - Statistiques d'un merchant
- `GET /merchants/:id/impact` - Impact d'un merchant
- `GET /merchants/nearby` - Merchants à proximité

### Produits (Food Items)
- `GET /food_items` - Liste des produits
- `GET /food_items/:id` - Produit par ID
- `POST /food_items` - Créer un produit
- `PUT /food_items/:id` - Mettre à jour un produit
- `DELETE /food_items/:id` - Supprimer un produit
- `GET /food_items/search` - Rechercher des produits
- `GET /food_items/merchant/:merchantId` - Produits d'un merchant
- `GET /food_items/available` - Produits disponibles
- `GET /food_items/categories` - Catégories disponibles

### Commandes (Orders)
- `GET /orders` - Liste des commandes
- `GET /orders/:id` - Commande par ID
- `POST /orders` - Créer une commande
- `PUT /orders/:id` - Mettre à jour une commande
- `POST /orders/:id/cancel` - Annuler une commande
- `POST /orders/:id/confirm` - Confirmer une commande
- `POST /orders/:id/complete` - Compléter une commande
- `GET /orders/user/:userId` - Commandes d'un utilisateur
- `GET /orders/merchant/:merchantId` - Commandes d'un merchant
- `GET /orders/active` - Commandes actives
- `GET /orders/history` - Historique des commandes

### Prix (Pricing)
- `POST /pricing/recommend` - Recommandation de prix
- `POST /pricing/calculate-discount` - Calculer une réduction
- `GET /pricing/history/:itemId` - Historique des prix
- `GET /pricing/analytics` - Analytics de pricing

### Impact
- `GET /impact/global` - Impact global
- `GET /impact/user/:userId` - Impact utilisateur
- `GET /impact/merchant/:merchantId` - Impact merchant
- `POST /impact/calculate-co2` - Calculer CO2
- `GET /impact/report` - Rapport d'impact
- `GET /impact/leaderboard` - Classement

### Géolocalisation
- `GET /geo/cities` - Liste des villes
- `GET /geo/quartiers/:city` - Quartiers d'une ville
- `GET /geo/search` - Recherche géographique
- `GET /geo/nearby` - Points à proximité
- `GET /geo/reverse` - Géocodage inverse

### Notifications
- `GET /notifications` - Liste des notifications
- `GET /notifications/:id` - Notification par ID
- `PUT /notifications/:id/read` - Marquer comme lu
- `PUT /notifications/read-all` - Tout marquer comme lu
- `GET /notifications/preferences` - Préférences de notification

### IA (AI Services)
- `POST /ai/classify-food` - Classifier un aliment
- `POST /ai/estimate-quantity` - Estimer la quantité
- `POST /ai/recommend-price` - Recommander un prix
- `POST /ai/calculate-impact` - Calculer l'impact
- `POST /ai/predict-waste` - Prédire le gaspillage
- `POST /ai/detect-fraud` - Détecter la fraude

## 🗄️ Tables de Base de Données

### Tables Principales
1. `profiles` - Profils utilisateurs
2. `merchants` - Commerces
3. `food_items` - Produits alimentaires
4. `orders` - Commandes
5. `notifications` - Notifications
6. `favorites` - Favoris
7. `reviews` - Avis
8. `impact_logs` - Logs d'impact
9. `pricing_history` - Historique des prix
10. `user_roles` - Rôles utilisateurs
11. `admin_activities` - Activités admin
12. `impact_reports` - Rapports d'impact
13. `monthly_aggregates` - Agrégats mensuels

### Vues
- `user_impact_summary` - Résumé impact utilisateur
- `merchant_impact_summary` - Résumé impact merchant

## 🔐 Sécurité

Toutes les routes API nécessitent:
- Authentification (sauf routes publiques)
- Permissions appropriées selon le rôle (user, merchant, admin)
- Row Level Security (RLS) activé sur toutes les tables

## 📝 Notes

- Toutes les routes API utilisent Supabase comme backend
- Les routes frontend utilisent React Router
- Les prix sont en FCFA (XAF)
- Les dates sont en UTC (timestamptz)
