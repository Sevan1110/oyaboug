#!/bin/bash

# ============================================
# Script pour exécuter le seed de la base de données
# ouyaboung Platform
# ============================================

set -e

echo "🌱 Exécution du seed de la base de données..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé."
    echo "📦 Installation: npm install -g supabase"
    exit 1
fi

# Vérifier si le projet est lié
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Le projet n'est pas lié à Supabase."
    echo "🔗 Lier le projet: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Supabase CLI détecté"
echo "📋 Vérification des migrations..."

# Appliquer les migrations si nécessaire
echo "🔄 Application des migrations..."
supabase db push

# Exécuter le seed
echo "🌱 Exécution du seed..."
supabase db seed

echo "✅ Seed terminé avec succès!"
echo ""
echo "📝 Notes importantes:"
echo "   - Assurez-vous d'avoir créé les utilisateurs dans auth.users"
echo "   - Adaptez les UUIDs dans seed.sql avec vos vrais user_id"
echo "   - Vérifiez les données dans l'interface Supabase"
