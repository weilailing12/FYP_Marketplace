import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Replaces the browser navigator.locks implementation to prevent
    // "Lock was released because another request stole it" errors during concurrent auth calls
    lock: async (_name, _acquireTimeout, fn) => {
      return await fn();
    },
  },
});