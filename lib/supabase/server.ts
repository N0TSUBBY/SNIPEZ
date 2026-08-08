// lib/supabase/server.ts
// Safe server-side Supabase client factory.
// This avoids throwing during module import when SUPABASE_SERVICE_ROLE_KEY is not set.
// Use getSupabaseServerClient() inside API route handlers or server functions.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  // Warn but do not throw during import; runtime calls will throw with clearer message.
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_URL is not set. Ensure environment variables are configured in production.');
}

/**
 * Create a server-side Supabase client.
 * If SUPABASE_SERVICE_ROLE_KEY exists we'll use it (full privileges).
 * Otherwise fallback to using the anon key for non-admin operations.
 *
 * IMPORTANT: Do NOT expose a service role key to client-side code.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL env var');
  }

  if (serviceRole) {
    return createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  }

  if (anonKey) {
    return createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  }

  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY. Add env vars in Vercel.');
}
