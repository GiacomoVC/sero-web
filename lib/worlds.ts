import type { World, Sport } from './types';

export const WORLDS: { id: World; label: string; emoji: string }[] = [
  { id: 'musica', label: 'Música', emoji: '🎧' },
  { id: 'series', label: 'Series', emoji: '📺' },
  { id: 'peliculas', label: 'Películas', emoji: '🎬' },
  { id: 'anime', label: 'Anime/Manga', emoji: '🌀' },
  { id: 'libros', label: 'Libros', emoji: '📚' },
  { id: 'deportes', label: 'Deporte', emoji: '⚽' },
  { id: 'videojuegos', label: 'Videojuegos', emoji: '🎮' },
  { id: 'otros', label: 'Otros mundos', emoji: '✨' },
];

// New deportes list — fan-only, no práctica.
export const SPORTS: { id: Sport; label: string }[] = [
  { id: 'futbol', label: 'Fútbol' },
  { id: 'basket', label: 'Básquet (NBA)' },
  { id: 'tennis', label: 'Tenis' },
  { id: 'f1', label: 'Fórmula 1 / motor' },
  { id: 'combate', label: 'Combate (UFC, box)' },
  { id: 'americanos', label: 'US sports (NFL, MLB)' },
  { id: 'otros', label: 'Otro' },
];

// Category chips shown BEFORE the open-ended questions on each world page,
// to aid recall and reduce fatigue.
export const CATEGORIES: Record<
  Exclude<World, 'otros' | 'deportes'>,
  string[]
> = {
  musica: [
    'Pop',
    'Rock',
    'Indie / alternativo',
    'Electrónica',
    'Hip-hop / rap / urbano',
    'R&B / soul / jazz',
    'Latin',
    'Salsa',
    'K-pop',
    'Metal',
    'Clásica',
    'Otro',
  ],
  series: [
    'Drama',
    'Comedia',
    'Sci-fi / fantasía',
    'Crimen / Thriller',
    'Realities',
    'Documentales / True Crime',
    'Acción / aventura',
    'Otro',
  ],
  peliculas: [
    'Drama',
    'Comedia',
    'Sci-fi / fantasía',
    'Crimen / Thriller',
    'Realities',
    'Documentales / True Crime',
    'Acción / Aventura',
  ],
  anime: [
    'Shonen / acción',
    'Seinen / maduro',
    'Romance / slice of life',
    'Fantasía / isekai',
    'Deportes',
    'Terror / psicológico',
    'Clásicos',
    'Studio Ghibli',
    'Otro',
  ],
  libros: [
    'Ficción literaria',
    'Fantasía',
    'Sci-fi',
    'Romance',
    'Thriller / misterio',
    'Terror',
    'Filosofía / ensayo',
    'Poesía',
    'No ficción / divulgación',
    'Otro',
  ],
  videojuegos: [
    'RPG',
    'Shooters / battle royale',
    'Estrategia',
    'Aventura / mundo abierto',
    'Lucha',
    'Deportes / carreras',
    'MOBA (LoL, Dota)',
    'Indies',
    'Cozy / casual',
    'Otro',
  ],
};

export const MAX_WORLDS = 4;

export const MUSIC_ERAS = ['50s', '60s', '70s', '80s', '90s', '2000s', '2010s a más'];

export const SERIES_REGIONS = ['Americanas', 'Latinas', 'Europeas', 'Asiáticas'];

export const NETFLIX_PICKS = [
  'Stranger Things',
  'El juego del calamar',
  'Merlina',
  'Bridgerton',
  'Dahmer',
];

export const PELICULA_TIPOS = [
  'Clásicos',
  'Cine de autor / indie',
  'Hollywood moderno',
  'Bollywood',
  'Asiáticas',
  'Europeas',
  'Latino',
  'Pixar / Disney / Dreamworks',
];
