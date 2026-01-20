
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://geqvbpghvmcglzfkqmvj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXZicGdodm1jZ2x6ZmtxbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NzQ4NTksImV4cCI6MjA4MzE1MDg1OX0.tbuBJZEB7T_0WJFFM5gPlwdlJ8dXThXNl4wbE70VYsE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectAdminActivities() {
    console.log('--- Testing Admin Activities INSERT ---');

    const { data, error } = await supabase
        .from('admin_activities')
        .insert({
            type: 'test_activity',
            description: 'Test description',
            metadata: { test: true }
        })
        .select();

    if (error) {
        console.error('INSERT Error:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
    } else {
        console.log('INSERT Success:', data);
    }
}

inspectAdminActivities();
