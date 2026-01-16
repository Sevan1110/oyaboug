// Temporary debug script - paste this in browser console

console.log('=== SUPABASE DEBUG ===');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('KEY (first 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20));
console.log('Is configured:', !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY));
