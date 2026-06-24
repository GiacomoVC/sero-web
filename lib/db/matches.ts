import { createAdminClient } from '@/lib/supabase/admin';

/** Shape consumed by ShareScreen's "¿Son amigos tuyos?" carousel. */
export interface Match {
  slug: string;
  name: string;
  commonCount: number;
  mutualFriend?: string;
}

interface UserRow {
  handle: string;
  name: string | null;
  apellido: string | null;
  referred_by: string | null;
  worlds: string[] | null;
}

/**
 * Friend-match suggestions for a freshly-submitted user — a faithful port of
 * the old Apps Script `findMatches_` (and a fix for the bug where it read the
 * wrong payload keys). Priority: the user's referrer and people referred by the
 * same person; then anyone sharing ≥1 world. Ranked by shared-world count.
 */
export async function findMatches(
  newHandle: string,
  referredBy: string,
  newWorlds: string[]
): Promise<Match[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('handle, name, apellido, referred_by, worlds');
  if (error) throw new Error(`findMatches: ${error.message}`);

  const users = (data ?? []) as UserRow[];
  const newSet = new Set(newWorlds);

  const referrer = referredBy ? users.find((u) => u.handle === referredBy) : undefined;
  const referrerFirstName = (referrer?.name ?? '').trim();

  const candidates = users
    .filter((u) => u.handle && u.handle !== newHandle)
    .map((u) => {
      const worlds = u.worlds ?? [];
      const commonCount = worlds.filter((w) => newSet.has(w)).length;
      const isReferrer = u.handle === referredBy;
      const isCoReferral = Boolean(referredBy && u.referred_by === referredBy);
      const isPriority = isReferrer || isCoReferral;
      return { u, commonCount, isReferrer, isCoReferral, isPriority };
    })
    .filter((c) => c.isPriority || c.commonCount > 0)
    .map((c) => ({
      slug: c.u.handle,
      name: `${c.u.name ?? ''}${c.u.apellido ? ` ${c.u.apellido}` : ''}`.trim(),
      commonCount: c.commonCount,
      // Co-referrals share the referrer as a mutual friend; the referrer
      // themselves invited you directly, so no "en común" label.
      mutualFriend: c.isCoReferral && !c.isReferrer ? referrerFirstName : '',
      priority: c.isPriority ? 1 : 0,
    }));

  candidates.sort(
    (a, b) => b.priority - a.priority || b.commonCount - a.commonCount
  );

  return candidates.map(({ priority: _priority, ...m }) => m);
}
