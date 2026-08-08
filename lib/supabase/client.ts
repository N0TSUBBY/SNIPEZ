// lib/supabase/client.ts
// Browser-safe Supabase client for client components (public anon key).
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Do not throw during module import in case envs are not set in certain environments.
  // Client components require these to be present at runtime; show a descriptive error when used.
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Client-side Supabase may fail.');
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in your environment.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Default export for convenience (used in client components)
export const supabaseClient = (() => {
  try {
    return getSupabaseClient();
  } catch (e) {
    // Fall back to a dummy object with minimal shape to avoid crashing imports in some environments.
    // Calls will throw clearly when used.
    return {} as SupabaseClient;
  }
})();
