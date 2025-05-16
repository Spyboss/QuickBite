const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Supabase client with Service Role Key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase URL or Service Role Key is not defined. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = { supabase };
