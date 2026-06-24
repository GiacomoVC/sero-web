import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cookie-aware server Supabase client (anon key) for the App Router.
 *
 * Use this in server components / route handlers that need the *logged-in
 * user's* session (RLS-scoped). For privileged writes that must bypass RLS,
 * use the service-role client in `./admin` instead.
 *
 * This session provisions it; the logged-in feed (later session) consumes it.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // The session refresh in middleware handles writes — safe to ignore.
          }
        },
      },
    }
  );
}
