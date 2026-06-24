import { NextResponse } from 'next/server';
import { toSlug } from '@/lib/slug';
import { extractTags } from '@/lib/extractTags';
import { buildWhatsAppMessage } from '@/lib/whatsapp';
import { getBaseUrl } from '@/lib/baseUrl';
import { supabaseConfigured } from '@/lib/supabase/admin';
import { createUserFromQuiz } from '@/lib/db/users';
import { findMatches, type Match } from '@/lib/db/matches';
import { logEvent } from '@/lib/logEvent';
import type { QuizResponses, SubmitResult } from '@/lib/types';

function jsonUtf8(data: unknown, init?: ResponseInit) {
  // Force charset=utf-8 to keep emojis from being decoded as latin-1
  // by any intermediate proxy / client.
  return new NextResponse(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers || {}),
    },
  });
}

export const runtime = 'nodejs';

/**
 * Persist the submission to Supabase and compute friend-match suggestions.
 * Returns the resolved handle (collision-counted) + matches, the exact shape
 * ShareScreen consumes. When Supabase is not configured (e.g. local dev with no
 * env), it degrades to a logged no-op so the quiz UX still completes.
 */
async function persistAndMatch(
  desiredSlug: string,
  q: QuizResponses
): Promise<{ slug: string; matches: Match[] }> {
  if (!supabaseConfigured()) {
    console.log('[sero] (no Supabase env) would save:', { slug: desiredSlug });
    return { slug: desiredSlug, matches: [] };
  }
  const { handle } = await createUserFromQuiz(q);
  const matches = await findMatches(handle, q.referred_by ?? '', q.worlds ?? []);
  // Instrumentation skeleton in action — one canonical surface event.
  await logEvent('quiz_submitted', {
    handle,
    source_ref: q.referred_by,
    worlds: q.worlds ?? [],
    match_count: matches.length,
  });
  return { slug: handle, matches };
}

export async function POST(req: Request) {
  let q: QuizResponses;
  try {
    q = (await req.json()) as QuizResponses;
  } catch {
    return jsonUtf8({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!q?.name || !q?.apellido) {
    return jsonUtf8(
      { error: 'name and apellido are required' },
      { status: 400 }
    );
  }

  const desiredSlug = toSlug(q.name, q.apellido);
  let result: { slug: string; matches: Match[] };
  try {
    result = await persistAndMatch(desiredSlug, q);
  } catch (e) {
    console.error('[sero] submit failed:', e);
    return jsonUtf8(
      { error: 'No pudimos guardar tu respuesta.' },
      { status: 502 }
    );
  }

  const { slug, matches } = result;
  const base = getBaseUrl(req);
  const url = `${base}/${slug}`;
  const tags = extractTags(q, 6);
  const igUrl = `${base}/api/og/${slug}?${new URLSearchParams({
    n: q.name,
    t: tags.join('|'),
  }).toString()}`;
  const whatsappMessage = buildWhatsAppMessage({
    url,
    tags,
  });

  const submitResult: SubmitResult = {
    slug,
    url,
    igUrl,
    whatsappMessage,
    tags,
    matches,
  };
  return jsonUtf8(submitResult);
}
