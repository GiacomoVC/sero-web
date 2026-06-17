import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: {
    fromSlug: string;
    toSlug: string;
    toName: string;
    mutualFriend?: string;
    commonCount?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    console.log('[sero] (no APPS_SCRIPT_URL) would confirm friend:', body);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'confirmFriend',
        secret: process.env.WEBHOOK_SECRET || '',
        ...body,
      }),
    });
    if (!res.ok) throw new Error(`Apps Script error: ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[sero] confirm-friend failed:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 502 });
  }
}
