import type { QuizSchema, TasteRecord } from './types';

const SWIPE_WORLDS = ['musica', 'peliculas', 'series', 'anime', 'libros', 'videojuegos'] as const;

/**
 * Pulls the most "showable" specific tags from a quiz response, to render as
 * pills (IG story / OG image). Per world: typed favorites (most specific) first,
 * then the loved category names. Round-robins across worlds so every selected
 * world is represented.
 */
export function extractTags(q: QuizSchema, max = 6): string[] {
  const clean = (s?: string) => (s ?? '').trim();

  const worldPool = (recs?: TasteRecord[]): string[] => {
    if (!recs) return [];
    const typed: string[] = [];
    const cats: string[] = [];
    for (const r of recs) {
      if (r.reaction !== 'love') continue;
      if (r.otro && clean(r.otro)) typed.push(clean(r.otro));
      else if (r.category && r.category !== '✨ Otro') cats.push(r.category);
      for (const t of r.typed ?? []) if (clean(t)) typed.push(clean(t));
    }
    return [...typed, ...cats];
  };

  const pools: string[][] = [];
  for (const w of SWIPE_WORLDS) {
    const p = worldPool(q.taste?.[w]);
    if (p.length) pools.push(p);
  }

  const dep = q.taste?.deportes;
  if (dep) {
    const p = [...(dep.typed ?? []).map(clean).filter(Boolean)];
    if (p.length) pools.push(p);
  }

  const otro = clean(q.taste?.otro);
  if (otro) {
    pools.push(
      otro
        .split(/[,;·•\n]| y | and /i)
        .map((x) => x.trim())
        .filter((x) => x.length > 1 && x.length <= 32),
    );
  }

  // Round-robin: one tag per world per pass until `max` is reached.
  const seen = new Set<string>();
  const result: string[] = [];
  const cursor = pools.map(() => 0);
  let progress = true;
  while (result.length < max && progress) {
    progress = false;
    for (let i = 0; i < pools.length && result.length < max; i++) {
      while (cursor[i] < pools[i].length) {
        const tag = pools[i][cursor[i]++];
        const key = tag.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          result.push(tag);
          progress = true;
          break;
        }
      }
    }
  }
  return result;
}
