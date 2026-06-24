import { createAdminClient } from '@/lib/supabase/admin';
import { toSlug } from '@/lib/slug';
import { logEvent } from '@/lib/logEvent';
import type { QuizSchema } from '@/lib/types';

const SWIPE_WORLDS = [
  'musica',
  'peliculas',
  'series',
  'anime',
  'libros',
  'videojuegos',
] as const;

/**
 * Collision-free handle, mirroring the old Apps Script `resolveSlug_`:
 * `ana-perez`, then `ana-perez-2`, `ana-perez-3`, …
 *
 * Fetches existing handles with the desired prefix and resolves in JS (the
 * extra prefix matches are harmless — we only test the exact candidates).
 */
async function resolveHandle(desired: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('handle')
    .ilike('handle', `${desired}%`);
  if (error) throw new Error(`resolveHandle: ${error.message}`);

  const taken = new Set((data ?? []).map((r) => String(r.handle).toLowerCase()));
  if (!taken.has(desired.toLowerCase())) return desired;
  let i = 2;
  while (taken.has(`${desired}-${i}`.toLowerCase())) i++;
  return `${desired}-${i}`;
}

/**
 * Maps the quiz `taste` object into one `taste` row per world, preserving each
 * world's existing shape verbatim in `records`:
 *   swipe worlds → TasteRecord[]   deportes → {relation,typed}   otro → string
 */
function buildTasteRows(
  userId: string,
  taste: QuizSchema['taste'] | undefined
): { user_id: string; world: string; records: unknown }[] {
  const rows: { user_id: string; world: string; records: unknown }[] = [];
  if (!taste) return rows;
  for (const w of SWIPE_WORLDS) {
    const recs = taste[w];
    if (recs && recs.length) rows.push({ user_id: userId, world: w, records: recs });
  }
  if (taste.deportes) {
    rows.push({ user_id: userId, world: 'deportes', records: taste.deportes });
  }
  if (taste.otro && taste.otro.trim()) {
    rows.push({ user_id: userId, world: 'otro', records: taste.otro });
  }
  return rows;
}

/**
 * Maps the early-captured obsessions into `obsesiones` rows. Empty rows are
 * skipped. `world` is already a seeded world id (gastronomía/viajes/otro →
 * 'otro') so the NOT NULL FK to `worlds` is always satisfied; `category` keeps
 * the human label for the obsession-only categories.
 */
function buildObsesionRows(
  userId: string,
  obsesiones: QuizSchema['obsesiones']
): { user_id: string; world: string; category: string | null; item_text: string; link: string | null }[] {
  const rows: { user_id: string; world: string; category: string | null; item_text: string; link: string | null }[] = [];
  for (const o of obsesiones ?? []) {
    const text = (o.item_text ?? '').trim();
    if (!text) continue;
    rows.push({
      user_id: userId,
      world: o.world,
      category: o.category ?? null,
      item_text: text,
      link: o.link?.trim() ? o.link.trim() : null,
    });
  }
  return rows;
}

export interface CreateUserResult {
  id: string;
  handle: string;
}

/**
 * Persist one quiz submission: a `users` row (profile + logistics + selected
 * worlds) plus its per-world `taste` rows. Returns the resolved handle (slug).
 */
export async function createUserFromQuiz(q: QuizSchema): Promise<CreateUserResult> {
  const supabase = createAdminClient();
  const desired = toSlug(q.name, q.apellido);
  const handle = await resolveHandle(desired);

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      handle,
      name: q.name,
      apellido: q.apellido,
      ciudad: q.ciudad,
      edad: q.edad,
      whatsapp: q.whatsapp,
      referred_by: q.referred_by ?? null,
      worlds: q.worlds ?? [],
      logistics: q.logistics ?? {},
    })
    .select('id, handle')
    .single();
  if (error || !user) throw new Error(`createUserFromQuiz: ${error?.message}`);

  const tasteRows = buildTasteRows(user.id, q.taste);
  if (tasteRows.length) {
    const { error: tErr } = await supabase.from('taste').insert(tasteRows);
    if (tErr) throw new Error(`createUserFromQuiz(taste): ${tErr.message}`);
  }

  // Obsesiones: best-effort. The user + taste already exist, so a failure here
  // must NOT throw (that would 502 a successful signup and risk a duplicate
  // resubmit). Logged instead. One `obsesion_created` event per row saved.
  const obsesionRows = buildObsesionRows(user.id, q.obsesiones);
  if (obsesionRows.length) {
    const { error: oErr } = await supabase.from('obsesiones').insert(obsesionRows);
    if (oErr) {
      console.error('[sero] createUserFromQuiz(obsesiones):', oErr.message);
    } else {
      for (const r of obsesionRows) {
        await logEvent('obsesion_created', { handle: user.handle, world: r.world });
      }
    }
  }

  return { id: user.id, handle: user.handle };
}
