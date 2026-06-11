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

// ─── Quick-pick suggestions per (world, category) ────────────────────────────
// Shown as multi-select chips inside each world step, AFTER the user picks
// their categories. Helps recall and gives us much richer profile data than
// the categories alone. Curated for UP Lima (~18-26 yo) — biased toward
// what's actually popular in that audience right now (Nov 2025 / Jun 2026).
type SuggestionsMap = Partial<
  Record<Exclude<World, 'otros' | 'deportes'>, Record<string, string[]>>
>;

export const SUGGESTIONS: SuggestionsMap = {
  musica: {
    'Pop': [
      'Taylor Swift', 'Harry Styles', 'Sabrina Carpenter',
      'The Weeknd', 'Lady Gaga',
    ],
    'Rock': [
      'Coldplay', 'Arctic Monkeys', 'The Strokes',
      'Imagine Dragons', 'Foo Fighters',
    ],
    'Indie / alternativo': [
      'Tame Impala', 'Mac DeMarco', 'Mitski',
      'Phoebe Bridgers', 'Clairo',
    ],
    'Electrónica': [
      'Fred again..', 'Disclosure', 'Calvin Harris',
      'Daft Punk', 'ODESZA',
    ],
    'Hip-hop / rap / urbano': [
      'Drake', 'Kendrick Lamar', 'Tyler, the Creator',
      'Travis Scott', 'Doja Cat',
    ],
    'R&B / soul / jazz': [
      'SZA', 'Frank Ocean', 'Steve Lacy',
      'Daniel Caesar', 'Amy Winehouse',
    ],
    'Latin': [
      'Bad Bunny', 'Karol G', 'Rauw Alejandro',
      'Feid', 'Peso Pluma',
    ],
    'Salsa': [
      'Héctor Lavoe', 'Rubén Blades', 'Marc Anthony',
      'Willie Colón', 'Eddie Palmieri',
    ],
    'K-pop': [
      'BTS', 'BLACKPINK', 'NewJeans',
      'TWICE', 'Stray Kids',
    ],
    'Metal': [
      'Metallica', 'Iron Maiden', 'Slipknot',
      'Tool', 'System of a Down',
    ],
    'Clásica': [
      'Hans Zimmer', 'Ludovico Einaudi', 'Yiruma',
      'Joe Hisaishi', 'Max Richter',
    ],
  },

  series: {
    'Drama': [
      'Succession', 'The Bear', 'Breaking Bad',
      'Euphoria', 'White Lotus',
    ],
    'Comedia': [
      'The Office', 'Brooklyn 99', 'Friends',
      'Schitt\'s Creek', 'Ted Lasso',
    ],
    'Sci-fi / fantasía': [
      'Stranger Things', 'The Last of Us', 'Game of Thrones',
      'House of the Dragon', 'Severance',
    ],
    'Crimen / Thriller': [
      'Narcos', 'Money Heist', 'Ozark',
      'You', 'Black Mirror',
    ],
    'Realities': [
      'Love Island', 'Love is Blind', 'The Bachelor',
      'Selling Sunset', 'Survivor',
    ],
    'Documentales / True Crime': [
      'Tiger King', 'Making a Murderer', 'Wild Wild Country',
      'The Tinder Swindler', 'Don\'t F**k With Cats',
    ],
    'Acción / aventura': [
      'Wednesday', 'Peaky Blinders', 'Lupin',
      'The Boys', 'Vikings',
    ],
  },

  peliculas: {
    'Drama': [
      'La La Land', 'Whiplash', 'Past Lives',
      'Aftersun', 'Anatomy of a Fall',
    ],
    'Comedia': [
      'Superbad', 'Bridesmaids', 'Easy A',
      'Lady Bird', 'Booksmart',
    ],
    'Sci-fi / fantasía': [
      'Dune', 'Interstellar', 'Inception',
      'Everything Everywhere All at Once', 'Oppenheimer',
    ],
    'Crimen / Thriller': [
      'Parasite', 'Gone Girl', 'El Padrino',
      'Pulp Fiction', 'Joker',
    ],
    'Documentales / True Crime': [
      'My Octopus Teacher', 'Free Solo', 'The Social Dilemma',
      'Won\'t You Be My Neighbor', 'Searching for Sugar Man',
    ],
    'Acción / Aventura': [
      'Top Gun Maverick', 'John Wick', 'Mad Max Fury Road',
      'Indiana Jones', 'Mission Impossible',
    ],
  },

  anime: {
    'Shonen / acción': [
      'One Piece', 'Naruto', 'Demon Slayer',
      'Jujutsu Kaisen', 'My Hero Academia',
    ],
    'Seinen / maduro': [
      'Berserk', 'Vinland Saga', 'Vagabond',
      'Monster', 'Tokyo Ghoul',
    ],
    'Romance / slice of life': [
      'Frieren', 'Spy x Family', 'Komi-san',
      'Horimiya', 'Your Lie in April',
    ],
    'Fantasía / isekai': [
      'Frieren', 'Re:Zero', 'Mushoku Tensei',
      'Konosuba', 'Sword Art Online',
    ],
    'Deportes': [
      'Haikyuu', 'Slam Dunk', 'Kuroko no Basket',
      'Blue Lock', 'Free!',
    ],
    'Terror / psicológico': [
      'Tokyo Ghoul', 'Death Note', 'Another',
      'Junji Ito', 'Devilman Crybaby',
    ],
    'Clásicos': [
      'Cowboy Bebop', 'Evangelion', 'Akira',
      'Ghost in the Shell', 'Samurai Champloo',
    ],
    'Studio Ghibli': [
      'Spirited Away', 'Princess Mononoke', 'Howl\'s Moving Castle',
      'Mi Vecino Totoro', 'Ponyo',
    ],
  },

  libros: {
    'Ficción literaria': [
      'Murakami', 'García Márquez', 'Sally Rooney',
      'Cortázar', 'Vargas Llosa',
    ],
    'Fantasía': [
      'Brandon Sanderson', 'Tolkien', 'Sarah J. Maas',
      'George R.R. Martin', 'Neil Gaiman',
    ],
    'Sci-fi': [
      'Dune (Frank Herbert)', 'Liu Cixin', 'Isaac Asimov',
      'Ted Chiang', 'Ursula K. Le Guin',
    ],
    'Romance': [
      'Colleen Hoover', 'Emily Henry', 'Sarah J. Maas',
      'Taylor Jenkins Reid', 'Jane Austen',
    ],
    'Thriller / misterio': [
      'Gillian Flynn', 'Stephen King', 'Tana French',
      'Donna Tartt', 'Agatha Christie',
    ],
    'Terror': [
      'Stephen King', 'Mariana Enríquez', 'Junji Ito',
      'Shirley Jackson', 'Carmen Maria Machado',
    ],
    'Filosofía / ensayo': [
      'Camus', 'Byung-Chul Han', 'Yuval Noah Harari',
      'Nietzsche', 'Han Kang',
    ],
    'Poesía': [
      'Neruda', 'Pizarnik', 'Borges',
      'Mary Oliver', 'Ocean Vuong',
    ],
    'No ficción / divulgación': [
      'Sapiens', 'Atomic Habits', 'Educated',
      'Bad Blood', 'Outliers',
    ],
  },

  videojuegos: {
    'RPG': [
      'Elden Ring', 'Baldur\'s Gate 3', 'Witcher 3',
      'Persona 5', 'Final Fantasy XVI',
    ],
    'Shooters / battle royale': [
      'Fortnite', 'Valorant', 'Call of Duty',
      'Apex Legends', 'CS2',
    ],
    'Estrategia': [
      'Civilization', 'Age of Empires', 'StarCraft',
      'Total War', 'Crusader Kings',
    ],
    'Aventura / mundo abierto': [
      'Zelda BOTW / TOTK', 'GTA V', 'Red Dead Redemption 2',
      'Spider-Man', 'Cyberpunk 2077',
    ],
    'Lucha': [
      'Tekken 8', 'Street Fighter 6', 'Smash Bros',
      'Mortal Kombat', 'Guilty Gear',
    ],
    'Deportes / carreras': [
      'FIFA / EA FC', 'NBA 2K', 'Forza Horizon',
      'Mario Kart', 'F1',
    ],
    'MOBA (LoL, Dota)': [
      'League of Legends', 'Dota 2', 'Smite', 'Heroes of the Storm',
    ],
    'Indies': [
      'Hades', 'Stardew Valley', 'Hollow Knight',
      'Celeste', 'Undertale',
    ],
    'Cozy / casual': [
      'Animal Crossing', 'Stardew Valley', 'Los Sims',
      'Coral Island', 'Disney Dreamlight Valley',
    ],
  },
};

/**
 * Returns a deduplicated, ordered list of suggestion chips for a world,
 * built from the categories the user has selected. If none of the selected
 * categories has a suggestion list, returns [].
 */
export function suggestionsFor(
  world: Exclude<World, 'otros' | 'deportes'>,
  selectedCategories: string[],
): string[] {
  const map = SUGGESTIONS[world];
  if (!map) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const cat of selectedCategories) {
    const items = map[cat];
    if (!items) continue;
    for (const item of items) {
      if (!seen.has(item)) {
        seen.add(item);
        out.push(item);
      }
    }
  }
  return out;
}
