import type {
  ExportData,
  EdgeMode,
  FindPlansOptions,
  PlanCluster,
  PoolUser,
  TasteTag,
} from './types';
import { extractTaste } from './taste';

type UserIndex = Map<string, PoolUser>;

/** Build the slug → PoolUser index, computing taste tags once per user. */
export function buildIndex(data: ExportData): UserIndex {
  const idx: UserIndex = new Map();
  for (const r of data.responses) {
    const slug = (r.slug || '').trim();
    if (!slug) continue;
    const name = `${r.firstName || ''} ${r.lastName || ''}`.trim() || slug;
    idx.set(slug, {
      slug,
      name,
      referredBy: (r.referredBy || '').trim() || undefined,
      tags: extractTaste(r.payload || ({} as never)),
    });
  }
  return idx;
}

/** Undirected adjacency from referral edges and/or confirmed friendships. */
export function buildGraph(
  idx: UserIndex,
  friendships: ExportData['friendships'],
  edgeMode: EdgeMode
): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const slug of idx.keys()) adj.set(slug, new Set());

  const link = (a?: string, b?: string) => {
    if (!a || !b || a === b) return;
    if (!adj.has(a) || !adj.has(b)) return;
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  };

  if (edgeMode === 'referral' || edgeMode === 'both') {
    for (const u of idx.values()) link(u.slug, u.referredBy);
  }
  if (edgeMode === 'confirmed' || edgeMode === 'both') {
    for (const f of friendships) link(f.fromSlug?.trim(), f.toSlug?.trim());
  }
  return adj;
}

/** Everyone within `depth` hops of `ego` (inclusive of ego). */
export function poolFor(
  ego: string,
  adj: Map<string, Set<string>>,
  depth = 2
): Set<string> {
  const pool = new Set<string>([ego]);
  let frontier = new Set<string>([ego]);
  for (let d = 0; d < depth; d++) {
    const next = new Set<string>();
    for (const node of frontier) {
      for (const nb of adj.get(node) ?? []) {
        if (!pool.has(nb)) {
          pool.add(nb);
          next.add(nb);
        }
      }
    }
    frontier = next;
    if (!frontier.size) break;
  }
  return pool;
}

/** Keys present in every one of the given users' tag maps. */
function commonKeys(users: PoolUser[]): string[] {
  if (!users.length) return [];
  let acc = new Set<string>(users[0].tags.keys());
  for (let i = 1; i < users.length && acc.size; i++) {
    const t = users[i].tags;
    acc = new Set([...acc].filter((k) => t.has(k)));
  }
  return [...acc];
}

function scoreCluster(titleTags: string[], categoryTags: string[], size: number): number {
  // Title-level overlap is a far stronger signal than category-level.
  return titleTags.length * 3 + categoryTags.length * 1 + size * 0.1;
}

/**
 * Find candidate plans inside one ego's pool.
 * A candidate = a group of `minSize..maxSize` pool members who all share at
 * least one interest, enriched with every interest the whole group shares.
 */
export function findPlans(
  ego: string,
  idx: UserIndex,
  adj: Map<string, Set<string>>,
  opts: FindPlansOptions = {}
): PlanCluster[] {
  const minSize = opts.minSize ?? 4;
  const maxSize = opts.maxSize ?? 9;
  const requireEgo = opts.requireEgo ?? true;

  if (!idx.has(ego)) return [];

  const poolSlugs = poolFor(ego, adj);
  const poolUsers = [...poolSlugs].map((s) => idx.get(s)!).filter(Boolean);

  // tag key → member slugs (within this pool); and a display lookup.
  const tagMembers = new Map<string, string[]>();
  const tagInfo = new Map<string, TasteTag>();
  for (const u of poolUsers) {
    for (const [k, tag] of u.tags) {
      if (!tagMembers.has(k)) {
        tagMembers.set(k, []);
        tagInfo.set(k, tag);
      }
      tagMembers.get(k)!.push(u.slug);
    }
  }

  const seen = new Set<string>(); // member-set signatures, to dedupe
  const clusters: PlanCluster[] = [];

  for (const [, slugs] of tagMembers) {
    if (slugs.length < minSize || slugs.length > maxSize) continue;
    if (requireEgo && !slugs.includes(ego)) continue;

    const sig = [...slugs].sort().join(',');
    if (seen.has(sig)) continue;
    seen.add(sig);

    const setUsers = slugs.map((s) => idx.get(s)!);
    const titleTags: string[] = [];
    const categoryTags: string[] = [];
    for (const k of commonKeys(setUsers)) {
      const info = tagInfo.get(k)!;
      (info.tier === 'title' ? titleTags : categoryTags).push(info.display);
    }
    titleTags.sort();
    categoryTags.sort();

    clusters.push({
      members: setUsers
        .map((u) => ({ slug: u.slug, name: u.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      size: setUsers.length,
      titleTags,
      categoryTags,
      score: scoreCluster(titleTags, categoryTags, setUsers.length),
      egos: [ego],
    });
  }

  clusters.sort((a, b) => b.score - a.score || b.size - a.size);
  return clusters.slice(0, opts.maxResults ?? 60);
}

/**
 * Network-wide view: run every user as an ego and union the results,
 * deduping identical groups and recording which pools each surfaced in.
 */
export function findAllPlans(
  idx: UserIndex,
  adj: Map<string, Set<string>>,
  opts: FindPlansOptions = {}
): PlanCluster[] {
  const merged = new Map<string, PlanCluster>();

  for (const ego of idx.keys()) {
    for (const c of findPlans(ego, idx, adj, { ...opts, maxResults: Infinity })) {
      const sig = c.members.map((m) => m.slug).sort().join(',');
      const existing = merged.get(sig);
      if (existing) {
        if (!existing.egos.includes(ego)) existing.egos.push(ego);
      } else {
        merged.set(sig, c);
      }
    }
  }

  const out = [...merged.values()];
  out.sort((a, b) => b.score - a.score || b.size - a.size);
  return out.slice(0, opts.maxResults ?? 60);
}
