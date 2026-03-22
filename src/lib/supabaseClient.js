/**
 * @fileoverview Supabase Client Singleton
 *
 * Initializes the official Supabase JavaScript client using environment variables.
 * It expects VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be present in .env.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase environment variables are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
  );
}

// We pass empty strings if undefined to prevent the client constructor from throwing crashing errors immediately,
// allowing the warning to be visible in the console during development before configuring.
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
