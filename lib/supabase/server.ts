// lib/supabase/server.ts
// Safe server-side Supabase client factory for use in server functions and API routes.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL env var');
  }

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (serviceRole) {
    return createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  }

  if (anonKey) {
    return createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  }

  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY. Add env vars in Vercel.');
}
