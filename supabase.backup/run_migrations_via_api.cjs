const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function runMigrations() {
  // Configuration Supabase
  const supabaseUrl = 'https://lqqnadahkkzofrxanbha.supabase.co';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcW5hZGFoa2t6b2ZyeGFuYmhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NTQwNSwiZXhwIjoyMDgzMTIxNDA1fQ.tZlYjGDjj5nMqLUQwP9o-b14AuKMel-V9jHbXYsZKmc';

  console.log('🚀 Début de l\'exécution des migrations Supabase...');
  console.log('📍 Projet:', supabaseUrl);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🔌 Connexion à Supabase...');

    // Tester la connexion
    const { data: testData, error: testError } = await supabase.from('profiles').select('count').limit(1);
    if (testError && !testError.message.includes('relation "public.profiles" does not exist')) {
      throw testError;
    }
    console.log('✅ Connexion établie');

    // Lire le fichier de migration
    console.log('📖 Lecture du fichier de migration...');
    const migrationSQL = fs.readFileSync('./complete_migration.sql', 'utf8');
    console.log('✅ Fichier lu (' + migrationSQL.length + ' caractères)');

    // Pour Supabase, nous devons utiliser l'API REST ou le SQL Editor
    // Comme nous ne pouvons pas exécuter du SQL brut via l'API REST standard,
    // nous allons diviser le SQL et utiliser une approche différente

    console.log('⚠️ Note: Pour des migrations complexes, veuillez utiliser le SQL Editor de Supabase');
    console.log('📋 Instructions:');
    console.log('1. Ouvrez https://supabase.com/dashboard/project/lqqnadahkkzofrxanbha/sql');
    console.log('2. Copiez le contenu du fichier complete_migration.sql');
    console.log('3. Exécutez-le dans l\'éditeur SQL');
    console.log('');
    console.log('Le fichier de migration contient tous les schémas nécessaires pour Oyaboung.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des migrations:', error.message);
    console.log('');
    console.log('🔄 Solution alternative: Utilisez le SQL Editor de Supabase');
    console.log('1. Allez sur https://supabase.com/dashboard/project/lqqnadahkkzofrxanbha/sql');
    console.log('2. Copiez le contenu de supabase/complete_migration.sql');
    console.log('3. Exécutez la migration');
  }
}

runMigrations();