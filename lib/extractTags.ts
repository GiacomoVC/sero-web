import type { QuizResponses } from './types';

/**
 * Pulls the most "showable" specific titles from a quiz response,
 * to render as pills inside the IG story image.
 *
 * Strategy: build a tag pool per world (free text first, then chips),
 * then round-robin across worlds so every selected world gets at least
 * one representative tag in the final output.
 */
export function extractTags(q: QuizResponses, max = 6): string[] {
  const parseFreeText = (s?: string): string[] => {
    if (!s) return [];
    return s
      .split(/[,;·•\n]| y | and /i)
      .map((x) => x.trim())
      .filter((x) => x.length > 1 && x.length <= 32);
  };

  const chips = (arr?: string[]) =>
    (arr ?? []).filter((c) => c && c !== 'Otro');

  // One pool per world, ordered: free text (most specific) → category chips (fallback)
  const pools: string[][] = [];

  if (q.musica) {
    const p = [
      ...chips(q.musica.picks),               // quick-pick chips (highest signal)
      ...parseFreeText(q.musica.topArtists),
      ...chips(q.musica.categories),
    ];
    if (p.length) pools.push(p);
  }

  if (q.series) {
    const p = [
      ...chips(q.series.picks),
      ...chips(q.series.netflixPick),
      ...parseFreeText(q.series.seriesOtro),
      ...chips(q.series.categories),
      ...chips(q.series.region),
    ];
    if (p.length) pools.push(p);
  }

  if (q.peliculas) {
    const p = [
      ...chips(q.peliculas.picks),
      ...parseFreeText(q.peliculas.favorites),
      ...chips(q.peliculas.tipo),
      ...chips(q.peliculas.categories),
    ];
    if (p.length) pools.push(p);
  }

  if (q.anime) {
    const p = [
      ...chips(q.anime.picks),
      ...parseFreeText(q.anime.favorites),
      ...parseFreeText(q.anime.current),
      ...chips(q.anime.categories),
    ];
    if (p.length) pools.push(p);
  }

  if (q.libros) {
    const p = [
      ...chips(q.libros.picks),
      ...parseFreeText(q.libros.topBooks),
      ...parseFreeText(q.libros.recent),
      ...chips(q.libros.categories),
    ];
    if (p.length) pools.push(p);
  }

  if (q.videojuegos) {
    const p = [
      ...chips(q.videojuegos.picks),
      ...parseFreeText(q.videojuegos.favorites),
      ...chips(q.videojuegos.categories),
    ];
    if (p.length) pools.push(p);
  }

  if (q.deportes?.selected?.length) {
    const SPORT_LABELS: Record<string, string> = {
      futbol: 'Fútbol',
      basket: 'NBA',
      tennis: 'Tenis',
      f1: 'Fórmula 1',
      combate: 'UFC / boxeo',
      americanos: 'NFL / MLB',
    };
    const p: string[] = [
      ...q.deportes.selected
        .filter((s) => s !== 'otros')
        .map((s) => SPORT_LABELS[s])
        .filter(Boolean),
      ...parseFreeText(q.deportes.otros),
    ];
    if (p.length) pools.push(p);
  }

  if (q.otrosMundos) {
    const p = parseFreeText(q.otrosMundos);
    if (p.length) pools.push(p);
  }

  // Round-robin: one tag per world per pass until `max` reached.
  // This guarantees every selected world appears at least once.
  const seen = new Set<string>();
  const result: string[] = [];
  const cursor = pools.map(() => 0);

  let progress = true;
  while (result.length < max && progress) {
    progress = false;
    for (let i = 0; i < pools.length && result.length < max; i++) {
      // Advance past already-seen entries
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
