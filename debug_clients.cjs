
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://geqvbpghvmcglzfkqmvj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXZicGdodm1jZ2x6ZmtxbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NzQ4NTksImV4cCI6MjA4MzE1MDg1OX0.tbuBJZEB7T_0WJFFM5gPlwdlJ8dXThXNl4wbE70VYsE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugClients() {
    console.log('--- Debugging Clients Fetching ---');

    // 1. Login as admin (simulate or use anon if RLS allows public read which it shouldn't)
    // Since we are using anon key here, we might not see "user" data if RLS is strict.
    // But let's check what we can see.

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, user_id, email, role')
        .eq('role', 'user');

    if (error) {
        console.error('Error fetching profiles:', error.message);
    } else {
        console.log(`Found ${profiles.length} profiles with role 'user':`, profiles);
    }
}

debugClients();
