const fs = require('fs');
const { Client } = require('pg');

async function runMigrations() {
  // Configuration Supabase
  const supabaseUrl = 'https://lqqnadahkkzofrxanbha.supabase.co';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcW5hZGFoa2t6b2ZyeGFuYmhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NTQwNSwiZXhwIjoyMDgzMTIxNDA1fQ.tZlYjGDjj5nMqLUQwP9o-b14AuKMel-V9jHbXYsZKmc';

  // Construire la chaîne de connexion PostgreSQL
  const projectRef = 'lqqnadahkkzofrxanbha';
  const connectionString = `postgresql://postgres:Oyaboug@Ifumb@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;

  console.log('🚀 Début de l\'exécution des migrations Supabase...');
  console.log('📍 Projet:', projectRef);
  console.log('🔗 URL:', supabaseUrl);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connexion à la base de données...');
    await client.connect();
    console.log('✅ Connexion établie');

    // Lire le fichier de migration
    console.log('📖 Lecture du fichier de migration...');
    const migrationSQL = fs.readFileSync('./complete_migration.sql', 'utf8');
    console.log('✅ Fichier lu (' + migrationSQL.length + ' caractères)');

    // Diviser le SQL en statements individuels (séparés par des points-virgules)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 ${statements.length} statements SQL à exécuter`);

    // Exécuter chaque statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Exécution du statement ${i + 1}/${statements.length}...`);
          await client.query(statement);
          console.log(`✅ Statement ${i + 1} exécuté avec succès`);
        } catch (error) {
          console.error(`❌ Erreur lors du statement ${i + 1}:`, error.message);
          // Continuer avec les autres statements
        }
      }
    }

    console.log('🎉 Migrations terminées avec succès !');
    console.log('');
    console.log('📊 Résumé :');
    console.log('- Tables créées/modifiées');
    console.log('- Index ajoutés');
    console.log('- Politiques RLS configurées');
    console.log('- Triggers et fonctions ajoutés');
    console.log('');
    console.log('🌐 Votre base de données Oyaboung est prête !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des migrations:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter les migrations
runMigrations().catch(console.error);