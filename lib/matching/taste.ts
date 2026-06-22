import type { QuizSchema, TasteRecord } from '@/lib/types';
import type { TasteTag, Tier } from './types';

/** Normalize text into a stable match key: lowercase, no accents, alnum only. */
function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitFree(s?: string): string[] {
  if (!s) return [];
  return s
    .split(/[,;·•\n]| y | and /i)
    .map((x) => x.trim())
    .filter((x) => x.length > 1 && x.length <= 40);
}

const WORLD_LABELS: Record<string, string> = {
  musica: 'Música',
  peliculas: 'Películas',
  series: 'Series',
  anime: 'Anime',
  libros: 'Libros',
  videojuegos: 'Videojuegos',
};

/**
 * Turn a quiz response into a deduped map of taste tags, keyed for matching.
 * NOTE: deliberately minimal — `typed` → title tier, `category/sub/eras` →
 * category tier. The real signal-weighting redesign is a separate task; this
 * only maps the new schema into the engine's existing TasteTag shape.
 */
export function extractTaste(q: QuizSchema): Map<string, TasteTag> {
  const tags = new Map<string, TasteTag>();

  const add = (world: string, label: string, raw: string, tier: Tier) => {
    const n = norm(raw);
    if (n.length < 2) return;
    const key = `${world}:${tier}:${n}`;
    if (tags.has(key)) return;
    tags.set(key, { key, display: `${label} · ${raw.trim()}`, tier });
  };

  const eat = (world: string, recs?: TasteRecord[]) => {
    if (!recs) return;
    const label = WORLD_LABELS[world] ?? world;
    for (const r of recs) {
      if (r.reaction !== 'love') continue;
      if (r.category && r.category !== '✨ Otro') add(world, label, r.category, 'category');
      for (const s of r.sub ?? []) add(world, label, s, 'category');
      for (const t of r.typed ?? []) add(world, label, t, 'title');
      for (const t of splitFree(r.otro)) add(world, label, t, 'title');
    }
  };

  eat('musica', q.taste?.musica);
  eat('peliculas', q.taste?.peliculas);
  eat('series', q.taste?.series);
  eat('anime', q.taste?.anime);
  eat('libros', q.taste?.libros);
  eat('videojuegos', q.taste?.videojuegos);

  if (q.taste?.deportes) {
    for (const t of q.taste.deportes.typed ?? []) add('deportes', 'Deportes', t, 'title');
  }
  for (const t of splitFree(q.taste?.otro)) add('otro', 'Otro', t, 'title');

  return tags;
}
