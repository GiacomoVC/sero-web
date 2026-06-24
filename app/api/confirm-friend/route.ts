import { NextResponse } from 'next/server';
import { supabaseConfigured } from '@/lib/supabase/admin';
import { confirmFriend } from '@/lib/db/friends';
import { logEvent } from '@/lib/logEvent';

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

  if (!supabaseConfigured()) {
    console.log('[sero] (no Supabase env) would confirm friend:', body);
    return NextResponse.json({ ok: true });
  }

  try {
    await confirmFriend(body);
    await logEvent('friend_confirmed', {
      handle: body.fromSlug,
      source_ref: body.toSlug,
      common_count: body.commonCount ?? 0,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[sero] confirm-friend failed:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 502 });
  }
}
