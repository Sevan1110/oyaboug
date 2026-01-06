const { createClient } = require('@supabase/supabase-js');

async function testDatabase() {
  const supabaseUrl = 'https://lqqnadahkkzofrxanbha.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcW5hZGFoa2t6b2ZyeGFuYmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDU0MDUsImV4cCI6MjA4MzEyMTQwNX0.PDfeyjS-mOIeEHxnTWhVzBoKE22dDZcPFjiq7ccxsDQ';

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🧪 Test de connexion à la base de données Oyaboung...');

  try {
    // Tester les tables principales
    const tables = [
      'profiles',
      'merchants',
      'food_items',
      'orders',
      'reviews',
      'impact_logs',
      'admin_activities',
      'user_roles'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    console.log('\n🎉 Test terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testDatabase();