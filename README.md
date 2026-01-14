<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/leaf.svg" width="80" height="80" alt="ouyaboung Logo">
  <h1>ouyaboung</h1>
  <p><strong>Plateforme Intelligente de Lutte contre le Gaspillage Alimentaire au Gabon</strong></p>
  <p>Propulsé par <strong>IFUMB</strong></p>

  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

---

## Présentation

**ouyaboung** est une plateforme innovante dédiée à la réduction du gaspillage alimentaire au Gabon. Elle connecte les commerçants (boulangeries, restaurants, épiceries, etc.) disposant d'invendus de qualité avec des citoyens souhaitant consommer de manière responsable tout en faisant des économies.

### Mission
Transformer le "surplus" en "ressource" en facilitant la redistribution rapide des produits alimentaires proches de leur date de péremption.

---

## Fonctionnalités Clés

### Pour les Citoyens (Utilisateurs)
- **Recherche Géo-localisée** : Trouvez des offres anti-gaspis dans votre quartier.
- **Profil Public Commerçant** : Explorez l'univers et les offres de vos commerces favoris.
- **Réservation Instantanée** : Bloquez votre panier en un clic.
- **Impact Tracking** : Visualisez votre contribution personnelle (CO2 évité, argent économisé).
- **Historique & Favoris** : Gérez vos commandes et suivez vos commerçants préférés.

### Pour les Commerçants
- **Dashboard de Gestion** : Gérez vos stocks d'invendus en temps réel.
- **Mise en ligne rapide** : Créez une offre en moins de 30 secondes.
- **Analytique Merchant** : Suivez vos revenus générés par le "non-gaspillage".
- **Flux de Validation** : Inscription fluide avec validation par l'administration.
- **Profil Personnalisable** : Gérez vos horaires, logo et images de couverture.

### Administration & Sécurité
- **Interface Admin Dédiée** : Validation des nouveaux commerçants et supervision du réseau.
- **Sécurité par Design** : Utilisation de **Slugs** pour l'obfuscation des IDs techniques.
- **Row Level Security (RLS)** : Protection stricte des données au niveau de la base de données (Supabase).
- **Authentification Robuste** : Système OTP (One-Time Password) et gestion des rôles synchronisée.

---

## Installation Rapide

### Prérequis
- Node.js (v18+)
- npm ou pnpm
- Un projet [Supabase](https://supabase.com/) configuré

### Étapes
1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Sevan1110/oyaboug.git
   cd oyaboug
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Variables d'environnement**
   Créez un fichier `.env` à la racine :
   ```env
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

---

## Pile Technique

- **Frontend** : React 18, Vite, TypeScript.
- **Styling** : Tailwind CSS, Shadcn/UI, Framer Motion (animations).
- **Icons** : Lucide React.
- **Backend & Auth** : Supabase (PostgreSQL, GoTrue).
- **Gestion d'état** : React Query (TanStack Query).

---

## Structure du Projet

```text
src/
├── api/             # Couche de communication avec Supabase
├── components/      # Composants UI réutilisables (shadcn/custom)
├── contexts/        # AuthContext & Providers globaux
├── hooks/           # Hooks React personnalisés (useAuth, etc.)
├── pages/           # Vues principales classées par domaines (Admin, User, Merchant)
├── services/        # Logique métier et transformation de données
├── types/           # Interfaces et définitions TypeScript
└── utils/           # Fonctions utilitaires (Slugs, formatage)
```

---

## Contribution

Les contributions sont les bienvenues ! 
1. Forkez le projet.
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`).
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`).
4. Pushez vers la branche (`git push origin feature/AmazingFeature`).
5. Ouvrez une Pull Request.

---

## Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

<div align="center">
  <p>Une solution développée par <strong>IFUMB</strong> pour un Gabon plus vert.</p>
</div>
