@echo off
echo ============================================
echo 🚀 Script de migration Supabase
echo ============================================
echo.
echo Ce script va exécuter toutes les migrations
echo nécessaires pour la plateforme Oyaboung.
echo.
echo Prérequis: Clé de service Supabase
echo.
set /p SERVICE_KEY="Entrez votre clé de service Supabase (service_role): "
echo.
echo 🔄 Exécution des migrations...
echo.
node run_migrations.js "%SERVICE_KEY%"
echo.
echo ============================================
pause