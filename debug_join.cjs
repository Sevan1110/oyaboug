
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://geqvbpghvmcglzfkqmvj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXZicGdodm1jZ2x6ZmtxbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NzQ4NTksImV4cCI6MjA4MzE1MDg1OX0.tbuBJZEB7T_0WJFFM5gPlwdlJ8dXThXNl4wbE70VYsE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debug() {
    console.log('--- Testing Query with LEFT JOIN ---');

    // Exact query from searchFoodItems (simplified)
    const { data, error } = await supabase
        .from('food_items')
        .select('id, name, is_available, quantity_available, merchants(*)')
        .eq('is_available', true)
        .gt('quantity_available', 0)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Query Error:', error);
    } else {
        console.log(`Query returned ${data.length} items.`);
        data.forEach(item => {
            const merchantStatus = item.merchants ? `Found (${item.merchants.business_name})` : 'NULL (Hidden/Missing)';
            console.log(`- [${item.id.substring(0, 8)}] ${item.name} | Merchant: ${merchantStatus}`);
        });
    }
}

debug();
