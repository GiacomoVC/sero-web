import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client — SERVER ONLY. Bypasses Row Level Security.
 *
 * Never import this from client components. It is the path all server-side
 * writes take this session (RLS is enabled with no anon policies yet, so the
 * service role is how the quiz/friend/plans routes persist data).
 *
 * Built as a factory (not a module-level singleton) so that importing this file
 * during `next build` never touches env vars — clients are created lazily, only
 * when a request actually runs.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase admin not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True when the server has the env it needs to talk to Supabase. */
export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
