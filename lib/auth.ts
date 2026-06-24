'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Auth helper SKELETON — provisioned for later sessions. No UI wires these yet.
 *
 * Strategy (frictionless):
 *   • PRIMARY  — Google OAuth (verified email, one click).
 *   • FALLBACK — email magic-link.
 *
 * The quiz stays anonymous; users are created server-side at submit time. When
 * someone later signs in with Google we get a verified email and CLAIM their
 * existing `users` row by matching email/handle, setting users.auth_user_id.
 *
 * NOTE on "one-tap": Google One Tap uses `auth.signInWithIdToken({ provider:
 * 'google', token, nonce })` with the GSI widget. The redirect-based
 * `signInWithOAuth` below is the simpler equivalent and a fine starting point;
 * upgrade to One Tap when the login surface is built.
 */

const callbackUrl = (redirectTo?: string) =>
  redirectTo ??
  (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined);

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl(redirectTo) },
  });
}

export async function signInWithMagicLink(email: string, redirectTo?: string) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callbackUrl(redirectTo) },
  });
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signOut();
}
