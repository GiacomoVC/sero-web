import type { QuizResponses } from '@/lib/types';
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

/** Split a free-text answer into individual titles. Mirrors extractTags. */
function splitFree(s?: string): string[] {
  if (!s) return [];
  return s
    .split(/[,;·•\n]| y | and /i)
    .map((x) => x.trim())
    .filter((x) => x.length > 1 && x.length <= 40);
}

function chips(arr?: string[]): string[] {
  return (arr ?? []).filter((c) => c && c !== 'Otro');
}

const SPORT_LABELS: Record<string, string> = {
  futbol: 'Fútbol',
  basket: 'NBA',
  tennis: 'Tenis',
  f1: 'Fórmula 1',
  combate: 'UFC / boxeo',
  americanos: 'NFL / MLB',
};

interface WorldSpec {
  key: keyof QuizResponses;
  label: string;
  /** Array fields whose chips are category-level signals. */
  catArrays: string[];
  /** Array fields whose chips are controlled title-level signals. */
  titleArrays: string[];
  /** String fields to split into title-level signals. */
  freeFields: string[];
}

const WORLDS: WorldSpec[] = [
  { key: 'musica',      label: 'Música',      catArrays: ['categories', 'eras'], titleArrays: ['picks'], freeFields: ['topArtists'] },
  { key: 'series',      label: 'Series',      catArrays: ['categories', 'region'], titleArrays: ['picks'], freeFields: ['favorites', 'seriesOtro'] },
  { key: 'peliculas',   label: 'Películas',   catArrays: ['categories', 'tipo'], titleArrays: ['picks'], freeFields: ['favorites'] },
  { key: 'anime',       label: 'Anime',       catArrays: ['categories'], titleArrays: ['picks'], freeFields: ['favorites', 'current'] },
  { key: 'libros',      label: 'Libros',      catArrays: ['categories'], titleArrays: ['picks'], freeFields: ['topBooks', 'recent'] },
  { key: 'videojuegos', label: 'Videojuegos', catArrays: ['categories'], titleArrays: ['picks'], freeFields: ['favorites'] },
];

/**
 * Turn a quiz response into a deduped map of taste tags, keyed for matching.
 * Categories and titles are namespaced by world so "Acción" in películas
 * never collides with "Acción" in series.
 */
export function extractTaste(q: QuizResponses): Map<string, TasteTag> {
  const tags = new Map<string, TasteTag>();

  const add = (world: string, label: string, raw: string, tier: Tier) => {
    const n = norm(raw);
    if (n.length < 2) return;
    const key = `${world}:${tier}:${n}`;
    if (tags.has(key)) return;
    tags.set(key, { key, display: `${label} · ${raw.trim()}`, tier });
  };

  for (const w of WORLDS) {
    const block = q[w.key] as Record<string, unknown> | undefined;
    if (!block) continue;

    for (const f of w.catArrays) {
      for (const v of chips(block[f] as string[] | undefined)) add(w.key, w.label, v, 'category');
    }
    for (const f of w.titleArrays) {
      for (const v of chips(block[f] as string[] | undefined)) add(w.key, w.label, v, 'title');
    }
    for (const f of w.freeFields) {
      for (const v of splitFree(block[f] as string | undefined)) add(w.key, w.label, v, 'title');
    }
  }

  // Deportes: selected sports are category-level; free text is title-level.
  if (q.deportes?.selected?.length) {
    for (const s of q.deportes.selected) {
      if (s === 'otros') continue;
      const label = SPORT_LABELS[s];
      if (label) add('deportes', 'Deportes', label, 'category');
    }
    for (const v of splitFree(q.deportes.otros)) add('deportes', 'Deportes', v, 'title');
  }

  return tags;
}
