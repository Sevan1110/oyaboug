#!/usr/bin/env node

/**
 * Script pour exécuter les migrations Supabase via API REST
 * Utilisation: node run_migrations.js <service_role_key>
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://lqqnadahkkzofrxanbha.supabase.co';
const MIGRATION_FILE = path.join(__dirname, 'supabase', 'complete_migration.sql');

function executeSQL(sql, serviceRoleKey) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query: sql
    });

    const options = {
      hostname: 'lqqnadahkkzofrxanbha.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runMigrations(serviceRoleKey) {
  try {
    console.log('🚀 Lecture du fichier de migration...');
    const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

    console.log('📡 Exécution des migrations via API Supabase...');
    const result = await executeSQL(sql, serviceRoleKey);

    console.log('✅ Migrations exécutées avec succès !');
    console.log('📊 Résultat:', result);

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des migrations:', error.message);

    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 Vérifiez que votre clé de service est correcte.');
      console.log('   Elle doit être la "service_role" key, pas la "anon" key.');
    }
  }
}

// Vérification des arguments
const serviceRoleKey = process.argv[2];
if (!serviceRoleKey) {
  console.log('❌ Clé de service manquante !');
  console.log('Utilisation: node run_migrations.js <service_role_key>');
  console.log('');
  console.log('Pour obtenir la clé de service :');
  console.log('1. Allez dans votre dashboard Supabase');
  console.log('2. Settings > API');
  console.log('3. Copiez la "service_role" key');
  process.exit(1);
}

if (!serviceRoleKey.startsWith('eyJ')) {
  console.log('⚠️  La clé fournie ne ressemble pas à une clé JWT Supabase');
  console.log('   Assurez-vous d\'utiliser la "service_role" key');
}

runMigrations(serviceRoleKey);