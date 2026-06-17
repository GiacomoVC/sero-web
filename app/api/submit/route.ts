import { NextResponse } from 'next/server';
import { toSlug } from '@/lib/slug';
import { extractTags } from '@/lib/extractTags';
import { buildWhatsAppMessage } from '@/lib/whatsapp';
import { getBaseUrl } from '@/lib/baseUrl';
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

function pickLoveExample(q: QuizResponses): string | undefined {
  const tags = extractTags(q, 1);
  return tags[0];
}

type AppsScriptResponse = {
  slug: string;
  matches?: Array<{ name: string; commonCount: number }>;
};

async function reserveSlugViaAppsScript(
  desiredSlug: string,
  payload: QuizResponses
): Promise<AppsScriptResponse> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    console.log('[sero] (no APPS_SCRIPT_URL) would save:', { slug: desiredSlug, payload });
    return { slug: desiredSlug, matches: [] };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.WEBHOOK_SECRET || '',
      desiredSlug,
      payload,
    }),
  });
  if (!res.ok) {
    throw new Error(`Apps Script error: ${res.status}`);
  }
  const data = (await res.json()) as AppsScriptResponse;
  if (!data?.slug) throw new Error('Apps Script returned no slug');
  return { slug: data.slug, matches: data.matches || [] };
}

export async function POST(req: Request) {
  let q: QuizResponses;
  try {
    q = (await req.json()) as QuizResponses;
  } catch {
    return jsonUtf8({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!q?.firstName || !q?.lastName) {
    return jsonUtf8(
      { error: 'firstName and lastName are required' },
      { status: 400 }
    );
  }

  const desiredSlug = toSlug(q.firstName, q.lastName);
  let scriptResponse: AppsScriptResponse;
  try {
    scriptResponse = await reserveSlugViaAppsScript(desiredSlug, q);
  } catch (e) {
    console.error('[sero] submit failed:', e);
    return jsonUtf8(
      { error: 'No pudimos guardar tu respuesta.' },
      { status: 502 }
    );
  }

  const { slug, matches } = scriptResponse;
  const base = getBaseUrl(req);
  const url = `${base}/${slug}`;
  const tags = extractTags(q, 6);
  const igUrl = `${base}/api/og/${slug}?${new URLSearchParams({
    n: q.firstName,
    t: tags.join('|'),
  }).toString()}`;
  const whatsappMessage = buildWhatsAppMessage({
    url,
    tags,
  });

  const result: SubmitResult = {
    slug,
    url,
    igUrl,
    whatsappMessage,
    tags,
    matches,
  };
  return jsonUtf8(result);
}
