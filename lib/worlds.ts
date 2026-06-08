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
      'Taylor Swift', 'Olivia Rodrigo', 'Sabrina Carpenter', 'Dua Lipa',
      'Billie Eilish', 'The Weeknd', 'Harry Styles', 'Bruno Mars', 'Charli XCX',
    ],
    'Rock': [
      'Coldplay', 'Arctic Monkeys', 'The Strokes', 'Imagine Dragons',
      'Foo Fighters', 'Muse', 'Greta Van Fleet', 'Måneskin',
    ],
    'Indie / alternativo': [
      'Tame Impala', 'Mac DeMarco', 'Mitski', 'Phoebe Bridgers',
      'beabadoobee', 'boygenius', 'Cuco', 'Clairo',
    ],
    'Electrónica': [
      'Fred again..', 'Disclosure', 'Calvin Harris', 'Daft Punk',
      'Skrillex', 'ODESZA', 'Bicep', 'Four Tet', 'Peggy Gou',
    ],
    'Hip-hop / rap / urbano': [
      'Drake', 'Kendrick Lamar', 'Tyler, the Creator', 'Travis Scott',
      'Kanye West', 'J. Cole', 'Doja Cat', 'Ice Spice',
    ],
    'R&B / soul / jazz': [
      'SZA', 'Frank Ocean', 'Steve Lacy', 'Daniel Caesar',
      'H.E.R.', 'Norah Jones', 'Amy Winehouse',
    ],
    'Latin': [
      'Bad Bunny', 'Karol G', 'Rauw Alejandro', 'Feid', 'Peso Pluma',
      'Rosalía', 'J Balvin', 'Maluma', 'Quevedo', 'Anuel AA',
    ],
    'Salsa': [
      'Héctor Lavoe', 'Rubén Blades', 'Marc Anthony', 'Willie Colón',
      'Eddie Palmieri', 'Gilberto Santa Rosa', 'La Lupe', 'Frankie Ruiz',
    ],
    'K-pop': [
      'BTS', 'BLACKPINK', 'NewJeans', 'TWICE', 'Stray Kids',
      'LE SSERAFIM', 'ITZY', 'IVE', 'aespa',
    ],
    'Metal': [
      'Metallica', 'Iron Maiden', 'Slipknot', 'Tool',
      'System of a Down', 'Sleep Token', 'Gojira', 'Bring Me The Horizon',
    ],
    'Clásica': [
      'Hans Zimmer', 'Ludovico Einaudi', 'Yiruma', 'Joe Hisaishi',
      'Max Richter', 'Ólafur Arnalds', 'Beethoven',
    ],
  },

  series: {
    'Drama': [
      'Succession', 'The Bear', 'Breaking Bad', 'Better Call Saul',
      'Mad Men', 'Yellowjackets', 'Fleabag', 'Euphoria', 'White Lotus',
    ],
    'Comedia': [
      'The Office', 'Brooklyn 99', 'Friends', 'Parks and Rec',
      'Schitt\'s Creek', 'Abbott Elementary', 'Hacks', 'Ted Lasso',
    ],
    'Sci-fi / fantasía': [
      'Stranger Things', 'The Last of Us', 'Game of Thrones',
      'House of the Dragon', 'Severance', 'Andor', 'Loki', 'Dark',
    ],
    'Crimen / Thriller': [
      'Narcos', 'Mindhunter', 'Money Heist', 'Ozark', 'You',
      'Dahmer', 'Black Mirror', 'True Detective',
    ],
    'Realities': [
      'Love Island', 'Love is Blind', 'The Bachelor',
      'Selling Sunset', 'Survivor', 'Married at First Sight',
    ],
    'Documentales / True Crime': [
      'Tiger King', 'Making a Murderer', 'Wild Wild Country',
      'The Tinder Swindler', 'Don\'t F**k With Cats',
    ],
    'Acción / aventura': [
      'Wednesday', 'Reacher', 'Peaky Blinders', 'Lupin',
      'The Boys', 'Jack Ryan', 'Vikings',
    ],
  },

  peliculas: {
    'Drama': [
      'La La Land', 'Whiplash', 'Past Lives', 'Aftersun',
      'Manchester by the Sea', 'Marriage Story', 'Anatomy of a Fall',
    ],
    'Comedia': [
      'Superbad', 'Bridesmaids', 'Easy A', 'Lady Bird',
      'Anyone But You', 'The Holdovers', 'Booksmart',
    ],
    'Sci-fi / fantasía': [
      'Dune', 'Interstellar', 'Inception', 'Blade Runner 2049',
      'Everything Everywhere All at Once', 'Arrival', 'Oppenheimer',
    ],
    'Crimen / Thriller': [
      'Parasite', 'Gone Girl', 'Se7en', 'El Padrino',
      'Pulp Fiction', 'Joker', 'The Departed',
    ],
    'Documentales / True Crime': [
      'My Octopus Teacher', 'Free Solo', 'The Social Dilemma',
      'Won\'t You Be My Neighbor', 'Searching for Sugar Man',
    ],
    'Acción / Aventura': [
      'Top Gun Maverick', 'John Wick', 'Mad Max Fury Road',
      'Indiana Jones', 'Tenet', 'Mission Impossible',
    ],
  },

  anime: {
    'Shonen / acción': [
      'One Piece', 'Naruto', 'Demon Slayer', 'Jujutsu Kaisen',
      'My Hero Academia', 'Chainsaw Man', 'Bleach', 'Dragon Ball',
    ],
    'Seinen / maduro': [
      'Berserk', 'Vinland Saga', 'Vagabond', 'Monster',
      'Tokyo Ghoul', 'Mushishi', '20th Century Boys',
    ],
    'Romance / slice of life': [
      'Frieren', 'Spy x Family', 'Komi-san', 'Horimiya',
      'Toradora', 'Your Lie in April', 'Fruits Basket',
    ],
    'Fantasía / isekai': [
      'Frieren', 'Re:Zero', 'Mushoku Tensei', 'Konosuba',
      'Sword Art Online', 'Overlord', 'That Time I Got Reincarnated as a Slime',
    ],
    'Deportes': [
      'Haikyuu', 'Slam Dunk', 'Kuroko no Basket', 'Free!',
      'Blue Lock', 'Ace of Diamond',
    ],
    'Terror / psicológico': [
      'Tokyo Ghoul', 'Death Note', 'Another', 'Higurashi',
      'Junji Ito', 'Devilman Crybaby',
    ],
    'Clásicos': [
      'Cowboy Bebop', 'Evangelion', 'Akira', 'Ghost in the Shell',
      'Trigun', 'Samurai Champloo',
    ],
    'Studio Ghibli': [
      'Spirited Away', 'Princess Mononoke', 'Howl\'s Moving Castle',
      'Mi Vecino Totoro', 'Kiki', 'El Castillo Vagabundo', 'Ponyo',
    ],
  },

  libros: {
    'Ficción literaria': [
      'Murakami', 'Bolaño', 'García Márquez', 'Sally Rooney',
      'Cortázar', 'Vargas Llosa', 'Donna Tartt', 'Han Kang',
    ],
    'Fantasía': [
      'Brandon Sanderson', 'Tolkien', 'Patrick Rothfuss',
      'Sarah J. Maas', 'George R.R. Martin', 'Robin Hobb', 'Neil Gaiman',
    ],
    'Sci-fi': [
      'Dune (Frank Herbert)', 'Liu Cixin', 'Isaac Asimov',
      'Ted Chiang', 'Ursula K. Le Guin', 'Philip K. Dick',
    ],
    'Romance': [
      'Colleen Hoover', 'Emily Henry', 'Sarah J. Maas',
      'Taylor Jenkins Reid', 'Jane Austen',
    ],
    'Thriller / misterio': [
      'Gillian Flynn', 'Stephen King', 'Tana French',
      'Donna Tartt', 'Agatha Christie', 'Paula Hawkins',
    ],
    'Terror': [
      'Stephen King', 'Mariana Enríquez', 'Junji Ito',
      'Shirley Jackson', 'Carmen Maria Machado',
    ],
    'Filosofía / ensayo': [
      'Camus', 'Byung-Chul Han', 'Yuval Noah Harari',
      'Nietzsche', 'Han Kang', 'Maggie Nelson',
    ],
    'Poesía': [
      'Neruda', 'Pizarnik', 'Idea Vilariño', 'Borges',
      'Mary Oliver', 'Ocean Vuong',
    ],
    'No ficción / divulgación': [
      'Sapiens', 'Atomic Habits', 'Educated', 'Bad Blood',
      'The Body Keeps the Score', 'Outliers',
    ],
  },

  videojuegos: {
    'RPG': [
      'Elden Ring', 'Baldur\'s Gate 3', 'Witcher 3', 'Persona 5',
      'Final Fantasy XVI', 'Dark Souls', 'Skyrim',
    ],
    'Shooters / battle royale': [
      'Fortnite', 'Valorant', 'Call of Duty', 'Apex Legends',
      'PUBG', 'CS2', 'Overwatch',
    ],
    'Estrategia': [
      'Civilization', 'Age of Empires', 'StarCraft',
      'Total War', 'Crusader Kings', 'Stellaris',
    ],
    'Aventura / mundo abierto': [
      'Zelda BOTW / TOTK', 'GTA V', 'Red Dead Redemption 2',
      'Assassin\'s Creed', 'Spider-Man', 'Cyberpunk 2077',
    ],
    'Lucha': [
      'Tekken 8', 'Street Fighter 6', 'Smash Bros',
      'Mortal Kombat', 'Guilty Gear',
    ],
    'Deportes / carreras': [
      'FIFA / EA FC', 'NBA 2K', 'Forza Horizon',
      'Mario Kart', 'F1', 'Gran Turismo',
    ],
    'MOBA (LoL, Dota)': [
      'League of Legends', 'Dota 2', 'Smite', 'Heroes of the Storm',
    ],
    'Indies': [
      'Hades', 'Stardew Valley', 'Hollow Knight',
      'Celeste', 'Disco Elysium', 'Cuphead', 'Undertale',
    ],
    'Cozy / casual': [
      'Animal Crossing', 'Stardew Valley', 'Los Sims',
      'Coral Island', 'Disney Dreamlight Valley', 'Spiritfarer',
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
