
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://geqvbpghvmcglzfkqmvj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXZicGdodm1jZ2x6ZmtxbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NzQ4NTksImV4cCI6MjA4MzE1MDg1OX0.tbuBJZEB7T_0WJFFM5gPlwdlJ8dXThXNl4wbE70VYsE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debug() {
    console.log('--- Debugging Merchants ---');
    const { data: merchants, error: mError } = await supabase
        .from('merchants')
        .select('id, business_name, city, latitude, longitude, is_active, business_type');

    if (mError) {
        console.error('Error fetching merchants:', mError);
    } else {
        console.log(`Found ${merchants.length} merchants:`);
        merchants.forEach(m => {
            console.log(`- [${m.id.substring(0, 8)}] ${m.business_name} (${m.city}) | Lat/Lon: ${m.latitude}/${m.longitude} | Active: ${m.is_active}`);
        });
    }

    console.log('\n--- Debugging Food Items ---');
    const { data: items, error: iError } = await supabase
        .from('food_items')
        .select('id, name, merchant_id, is_available, quantity_available, created_at');

    if (iError) {
        console.error('Error fetching food items:', iError);
    } else {
        console.log(`Found ${items.length} food items:`);
        // Sort by created_at desc to see newest
        items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        items.forEach(i => {
            // Find merchant name
            const m = merchants.find(m => m.id === i.merchant_id);
            console.log(`- [${i.id.substring(0, 8)}] ${i.name} (Merchant: ${m ? m.business_name : i.merchant_id}) | Available: ${i.is_available} | Qty: ${i.quantity_available} | Created: ${i.created_at}`);
        });
    }
}

debug();
