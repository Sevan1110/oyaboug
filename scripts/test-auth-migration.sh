#!/bin/bash

# ==========================================
# Script de Test de la Migration Auth
# ==========================================

set -e

echo "🔍 Test de la migration d'authentification..."
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que les variables d'environnement sont définies
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "${RED}❌ ERREUR: SUPABASE_DB_PASSWORD n'est pas défini${NC}"
    echo "Définissez-le avec: export SUPABASE_DB_PASSWORD='votre_mot_de_passe'"
    exit 1
fi

DB_URL="postgresql://postgres.geqvbpghvmcglzfkqmvj:${SUPABASE_DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

echo "📊 Vérification 1: Colonnes de la table profiles"
echo "================================================="
psql "$DB_URL" -c "
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
" 2>&1 | grep -E "(first_name|last_name|birth_date|Column|---)" || echo -e "${YELLOW}⚠️ Impossible de se connecter à la base de données${NC}"

echo ""
echo "🔧 Vérification 2: Fonction handle_new_user"
echo "================================================="
psql "$DB_URL" -c "
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'handle_new_user';
" 2>&1 | head -20 || echo -e "${YELLOW}⚠️ Impossible de se connecter à la base de données${NC}"

echo ""
echo "👤 Vérification 3: Profil admin"
echo "================================================="
psql "$DB_URL" -c "
SELECT 
  user_id,
  email,
  role,
  full_name,
  first_name,
  last_name,
  created_at
FROM public.profiles 
WHERE email = 'pendysevan11@gmail.com';
" 2>&1 || echo -e "${YELLOW}⚠️ Impossible de se connecter à la base de données${NC}"

echo ""
echo "🔐 Vérification 4: Politiques RLS sur profiles"
echo "================================================="
psql "$DB_URL" -c "
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY policyname;
" 2>&1 || echo -e "${YELLOW}⚠️ Impossible de se connecter à la base de données${NC}"

echo ""
echo "✅ Vérification 5: Fonction is_admin"
echo "================================================="
psql "$DB_URL" -c "
SELECT EXISTS (
  SELECT 1 
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
    AND p.proname = 'is_admin'
) as is_admin_exists;
" 2>&1 || echo -e "${YELLOW}⚠️ Impossible de se connecter à la base de données${NC}"

echo ""
echo "📝 Instructions pour appliquer la migration:"
echo "================================================="
echo "1. Connectez-vous au dashboard Supabase"
echo "2. Allez dans SQL Editor"
echo "3. Copiez le contenu de: supabase/migrations/20260127000000_atomic_auth_repair.sql"
echo "4. Exécutez la migration"
echo ""
echo "OU utilisez la CLI Supabase:"
echo "  supabase db push"
echo ""

echo -e "${GREEN}✅ Tests terminés${NC}"
