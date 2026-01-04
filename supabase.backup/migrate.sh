#!/bin/bash

# ============================================
# Supabase Migration Script - Oyaboung Platform
# ============================================

set -e

echo "🚀 Starting Supabase migration process..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory. Please run this from the project root."
    exit 1
fi

echo "📦 Checking Supabase status..."
supabase status

echo "🗃️ Applying migrations..."
supabase db push

echo "🔐 Applying auth hooks..."
# Add any auth hooks here if needed

echo "✅ Migration completed successfully!"
echo ""
echo "🌐 Your local Supabase instance is ready at:"
echo "   - API: http://localhost:54321"
echo "   - Database: postgresql://postgres:postgres@localhost:54322/postgres"
echo "   - Studio: http://localhost:54323"
echo ""
echo "To start the local development environment, run:"
echo "supabase start"