// One-time migration: pull existing rows from the legacy Apps Script / Google
// Sheets export and insert them into Supabase. Safe to re-run (idempotent
// upserts on handle / (user_id,world) / (from_handle,to_handle)).
//
// Usage (Node 20+):
//   node --env-file=.env.local scripts/migrate-to-supabase.mjs
//
// Requires env: APPS_SCRIPT_URL, WEBHOOK_SECRET (if the script uses one),
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Note: only `payload.taste` (the current quiz shape) is migrated into the
// `taste` table. Pre-redesign legacy rows have no `payload.taste` and already
// contribute no taste tags to the matching engine, so nothing is lost.

import { createClient } from '@supabase/supabase-js';

const {
  APPS_SCRIPT_URL,
  WEBHOOK_SECRET,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

if (!APPS_SCRIPT_URL) throw new Error('APPS_SCRIPT_URL not set');
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)
  throw new Error('Supabase env not set (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SWIPE_WORLDS = ['musica', 'peliculas', 'series', 'anime', 'libros', 'videojuegos'];

function tasteRows(userId, taste) {
  const rows = [];
  if (!taste) return rows;
  for (const w of SWIPE_WORLDS) {
    const recs = taste[w];
    if (Array.isArray(recs) && recs.length) rows.push({ user_id: userId, world: w, records: recs });
  }
  if (taste.deportes) rows.push({ user_id: userId, world: 'deportes', records: taste.deportes });
  if (typeof taste.otro === 'string' && taste.otro.trim())
    rows.push({ user_id: userId, world: 'otro', records: taste.otro });
  return rows;
}

async function main() {
  const u = new URL(APPS_SCRIPT_URL);
  u.searchParams.set('action', 'export');
  if (WEBHOOK_SECRET) u.searchParams.set('secret', WEBHOOK_SECRET);

  console.log('Fetching legacy export…');
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error(`export failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`export error: ${data.error}`);

  const responses = data.responses || [];
  const friendships = data.friendships || [];
  console.log(`Got ${responses.length} responses, ${friendships.length} friendships.`);

  let usersOk = 0;
  let tasteOk = 0;
  for (const r of responses) {
    const slug = String(r.slug || '').trim();
    if (!slug) continue;
    const p = r.payload || {};

    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        {
          handle: slug,
          name: r.firstName || p.name || '',
          apellido: r.lastName || p.apellido || null,
          ciudad: p.ciudad || null,
          edad: p.edad || null,
          whatsapp: p.whatsapp || null,
          referred_by: r.referredBy || p.referred_by || null,
          worlds: Array.isArray(p.worlds) ? p.worlds : [],
          logistics: p.logistics || {},
        },
        { onConflict: 'handle' }
      )
      .select('id')
      .single();
    if (error || !user) {
      console.error(`  ✗ user ${slug}:`, error?.message);
      continue;
    }
    usersOk++;

    const rows = tasteRows(user.id, p.taste);
    if (rows.length) {
      const { error: tErr } = await supabase
        .from('taste')
        .upsert(rows, { onConflict: 'user_id,world' });
      if (tErr) console.error(`  ✗ taste ${slug}:`, tErr.message);
      else tasteOk += rows.length;
    }
  }

  let edgesOk = 0;
  for (const f of friendships) {
    const from = String(f.fromSlug || '').trim();
    const to = String(f.toSlug || '').trim();
    if (!from || !to) continue;
    const { error } = await supabase
      .from('friend_edges')
      .upsert({ from_handle: from, to_handle: to }, { onConflict: 'from_handle,to_handle' });
    if (error) console.error(`  ✗ edge ${from}->${to}:`, error.message);
    else edgesOk++;
  }

  console.log(`\nDone. users: ${usersOk}/${responses.length}, taste rows: ${tasteOk}, edges: ${edgesOk}/${friendships.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
