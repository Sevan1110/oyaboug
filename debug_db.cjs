
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://geqvbpghvmcglzfkqmvj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXZicGdodm1jZ2x6ZmtxbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NzQ4NTksImV4cCI6MjA4MzE1MDg1OX0.tbuBJZEB7T_0WJFFM5gPlwdlJ8dXThXNl4wbE70VYsE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debug() {
    const targetId = '54e03052-8d9a-41ea-b34a-bae9ae2974f9';
    console.log(`\n--- Probing Target Merchant [${targetId}] ---`);

    // Try to Insert to verify existence
    const { data, error } = await supabase
        .from('merchants')
        .insert({
            id: targetId,
            user_id: '00000000-0000-0000-0000-000000000000', // Dummy user
            business_name: 'Ghost Merchant Probe',
            city: 'Libreville',
            quartier: 'Centre',
            phone: '00000000',
            email: 'ghost@probe.com',
            is_active: true,
            is_verified: true,
            business_type: 'other',
            address: 'Probe Address',
            slug: 'ghost-probe-' + Date.now()
        })
        .select()
        .single();

    if (error) {
        console.log('Insert Result:', error.message);
        if (error.code === '23505') {
            console.log("CONCLUSION: Record EXISTS but is HIDDEN by RLS.");
        } else {
            console.log("CONCLUSION: Insert failed for other reason.");
        }
    } else {
        console.log("CONCLUSION: Record was MISSING and has now been CREATED.");
        // Cleanup if needed, or leave it to fix the broken relation? 
        // If we leave it, the products will appear!
        console.log("New Merchant Data:", data);
    }
}

debug();
