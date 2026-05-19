require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('\n⚠️ WARNING: Supabase URL or Key is missing in backend/.env!');
  console.warn('⚠️ File uploads to Supabase Storage will fail.\n');
}

// Fallback to dummy values to prevent server crash during boot if env vars are missing
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder_key'
);

module.exports = supabase;
