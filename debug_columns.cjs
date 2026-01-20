
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://geqvbpghvmcglzfkqmvj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXZicGdodm1jZ2x6ZmtxbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NzQ4NTksImV4cCI6MjA4MzE1MDg1OX0.tbuBJZEB7T_0WJFFM5gPlwdlJ8dXThXNl4wbE70VYsE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectSchema() {
    console.log('--- Inspecting Merchants Table Schema ---');
    // Since we can't query schema directly easily with anon key, we'll try to select the suspect columns
    // If they fail, we know they are missing.

    const { data, error } = await supabase
        .from('merchants')
        .select('id, validated_at, refused_at, refusal_reason')
        .limit(1);

    if (error) {
        console.error('Schema Check Error:', error.message);
    } else {
        console.log('Columns exist! Data:', data);
    }
}

inspectSchema();
