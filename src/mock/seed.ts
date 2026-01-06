import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { MOCK_MERCHANTS } from './data/merchants';
import { MOCK_USERS } from './data/users';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log('🌱 Starting seed...');

  // 1. Users & Profiles
  console.log('👤 Seeding Users & Profiles...');
  const userMap = new Map<string, string>(); // email -> user_id

  for (const user of MOCK_USERS) {
    // 1.1 Sign Up User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    let userId = authData.user?.id;

    if (authError) {
      // If user already exists, try to sign in (or just skip if we can't get ID easily without login)
      // For existing users, we can't get ID easily via anon key unless we login.
      // But for "mock" data, maybe they are already created.
      console.log(`   User ${user.email} might already exist or error: ${authError.message}`);
      
      // Try to SignIn to get ID
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });
      
      if (signInData.user) {
        userId = signInData.user.id;
      }
    }

    if (userId) {
      userMap.set(user.email, userId);
      console.log(`   ✅ User ${user.email} ready (${userId})`);

      // 1.2 Upsert Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          phone: user.phone,
          preferences: user.preferences || {},
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (profileError) {
        console.error(`   ❌ Failed to update profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`   ✅ Profile updated for ${user.email}`);
      }
    } else {
      console.error(`   ❌ Could not get ID for user ${user.email}`);
    }
  }

  // 2. Merchants & Food Items
  console.log('\n🏪 Seeding Merchants & Items...');
  
  // Clean up existing merchants? (Optional - maybe risky if production)
  // await supabase.from('merchants').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 

  for (const merchantData of MOCK_MERCHANTS) {
    // Determine user_id if linked
    let merchantUserId = null;
    const linkedUserEmail = MOCK_USERS.find(u => u.link_to_merchant === merchantData.business_name)?.email;
    if (linkedUserEmail && userMap.has(linkedUserEmail)) {
      merchantUserId = userMap.get(linkedUserEmail);
    }

    // Insert Merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .insert({
        business_name: merchantData.business_name,
        business_type: merchantData.business_type,
        description: merchantData.description,
        address: merchantData.address,
        city: merchantData.city,
        quartier: merchantData.quartier,
        phone: merchantData.phone,
        email: merchantData.email,
        rating: merchantData.rating,
        total_reviews: merchantData.total_reviews,
        is_verified: merchantData.is_verified,
        is_active: merchantData.is_active,
        user_id: merchantUserId,
        // Default coords for Libreville if not provided
        latitude: 0.4162,
        longitude: 9.4673,
      })
      .select()
      .single();

    if (merchantError) {
      console.error(`   ❌ Failed to insert merchant ${merchantData.business_name}:`, merchantError.message);
      continue;
    }

    console.log(`   ✅ Merchant ${merchantData.business_name} created (${merchant.id})`);

    // Insert Items
    if (merchantData.items && merchantData.items.length > 0) {
      const itemsToInsert = merchantData.items.map(item => {
        const now = new Date();
        const pickupStart = new Date(now.getTime() + item.pickup_start_hours * 60 * 60 * 1000);
        const pickupEnd = new Date(now.getTime() + item.pickup_end_hours * 60 * 60 * 1000);
        const expiry = new Date(now.getTime() + item.expiry_hours * 60 * 60 * 1000);

        return {
          merchant_id: merchant.id,
          name: item.name,
          description: item.description,
          category: item.category,
          original_price: item.original_price,
          discounted_price: item.discounted_price,
          discount_percentage: item.discount_percentage,
          quantity_available: item.quantity_available,
          quantity_initial: item.quantity_initial,
          pickup_start: pickupStart.toISOString(),
          pickup_end: pickupEnd.toISOString(),
          expiry_date: expiry.toISOString(),
          is_available: item.is_available,
          badges: item.badges,
        };
      });

      const { error: itemsError } = await supabase
        .from('food_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error(`      ❌ Failed to insert items for ${merchantData.business_name}:`, itemsError.message);
      } else {
        console.log(`      ✅ ${itemsToInsert.length} items added`);
      }
    }
  }

  console.log('\n✨ Seed completed!');
}

seed().catch(console.error);
