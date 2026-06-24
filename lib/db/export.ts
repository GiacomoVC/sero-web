import { createAdminClient } from '@/lib/supabase/admin';
import type { ExportData } from '@/lib/matching/types';
import type { QuizSchema } from '@/lib/types';

/**
 * Build the matching engine's `ExportData` from Supabase — the drop-in
 * replacement for the old Apps Script `export` endpoint. The engine
 * (`lib/matching/*`) is unchanged; only the data source moved.
 *
 * `extractTaste` reads only `payload.taste`, so we reconstruct a minimal
 * payload `{ taste }` per user from their `taste` rows.
 */
export async function loadExportData(): Promise<ExportData> {
  const supabase = createAdminClient();
  const [users, taste, edges] = await Promise.all([
    supabase.from('users').select('id, handle, name, apellido, referred_by'),
    supabase.from('taste').select('user_id, world, records'),
    supabase.from('friend_edges').select('from_handle, to_handle'),
  ]);
  if (users.error) throw new Error(`loadExportData(users): ${users.error.message}`);
  if (taste.error) throw new Error(`loadExportData(taste): ${taste.error.message}`);
  if (edges.error) throw new Error(`loadExportData(edges): ${edges.error.message}`);

  // Regroup per-world taste rows back into the QuizSchema['taste'] shape.
  const tasteByUser = new Map<string, NonNullable<QuizSchema['taste']>>();
  for (const row of taste.data ?? []) {
    const t = tasteByUser.get(row.user_id) ?? {};
    (t as Record<string, unknown>)[row.world] = row.records;
    tasteByUser.set(row.user_id, t);
  }

  const responses = (users.data ?? []).map((u) => ({
    slug: u.handle,
    firstName: u.name ?? '',
    lastName: u.apellido ?? '',
    referredBy: u.referred_by ?? undefined,
    payload: { taste: tasteByUser.get(u.id) ?? {} } as QuizSchema,
  }));

  const friendships = (edges.data ?? []).map((e) => ({
    fromSlug: e.from_handle,
    toSlug: e.to_handle,
  }));

  return { responses, friendships };
}
