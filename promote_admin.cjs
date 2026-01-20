
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://geqvbpghvmcglzfkqmvj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXZicGdodm1jZ2x6ZmtxbXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NzQ4NTksImV4cCI6MjA4MzE1MDg1OX0.tbuBJZEB7T_0WJFFM5gPlwdlJ8dXThXNl4wbE70VYsE';

// Create a client - NOTE: Using ANON key, so this relies on RLS allowing updates (which might be restricted)
// or the user being found. In a real restricted env, we'd need service role key.
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function promote() {
    const targetEmail = 'sevan@cnx4-0.com';
    const targetPwd = '123456';

    console.log(`--- Authenticating as [${targetEmail}] ---`);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPwd
    });

    if (authError) {
        console.error('Login failed:', authError.message);
        return;
    }

    const userId = authData.user.id;
    console.log(`Login successful! User ID: ${userId}`);

    console.log(`--- Promoting User to Admin ---`);

    // 2. Update the role
    const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select()
        .maybeSingle();

    if (updateError) {
        console.error('Error updating role:', updateError.message);
    } else if (!updated) {
        console.log("FAILURE: Update returned no data. This usually means RLS blocked the update (You cannot change your own role).");
    } else {
        console.log(`SUCCESS: User role updated to: ${updated.role}`);
    }
}

promote();
