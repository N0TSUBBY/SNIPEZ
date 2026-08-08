// lib/supabase/server.ts
// Server-side Supabase client for App Router server components and API routes.
// Uses the Supabase service role key ONLY on trusted server environment (API routes).
// IMPORTANT: Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL env var');
}

if (!supabaseServiceRoleKey) {
  // For SSR routes that do not require the service role, you can create a keyless client:
  // BUT many storage operations and admin-level tasks require the service role.
  // Throwing here encourages the developer to provide the service role in server environments.
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var for server operations');
}

export const supabaseServerClient: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});
