import type { WorldId } from './types';

// ─── Page 2 grid — "¿Qué ama [Nombre]?" ─────────────────────────────────────
export const WORLDS: { id: WorldId; label: string; emoji: string }[] = [
  { id: 'musica', label: 'música', emoji: '🎵' },
  { id: 'series', label: 'series', emoji: '📺' },
  { id: 'peliculas', label: 'películas', emoji: '🎬' },
  { id: 'anime', label: 'anime/manga', emoji: '🀄' },
  { id: 'libros', label: 'libros', emoji: '📚' },
  { id: 'videojuegos', label: 'videojuegos', emoji: '🕹️' },
  { id: 'deportes', label: 'deportes', emoji: '🏆' },
  { id: 'otro', label: 'otro', emoji: '❤️' },
];

// ─── Obsesiones dropdown ────────────────────────────────────────────────────
// Broader than the 8 worlds (adds gastronomía + viajes). The single source for
// the category→world map: gastronomía/viajes/otro have no own world, so they
// persist under world='otro' with the human label kept in obsesiones.category.
// SCHEMA.md: "never hardcode the set elsewhere" — derive the world from here.
export const OBSESION_CATEGORIES: { label: string; emoji: string; world: WorldId }[] = [
  { label: 'música', emoji: '🎵', world: 'musica' },
  { label: 'series', emoji: '📺', world: 'series' },
  { label: 'películas', emoji: '🎬', world: 'peliculas' },
  { label: 'anime', emoji: '🀄', world: 'anime' },
  { label: 'libros', emoji: '📚', world: 'libros' },
  { label: 'videojuegos', emoji: '🕹️', world: 'videojuegos' },
  { label: 'deportes', emoji: '🏆', world: 'deportes' },
  { label: 'gastronomía', emoji: '🍝', world: 'otro' },
  { label: 'viajes', emoji: '✈️', world: 'otro' },
  { label: 'otro', emoji: '✨', world: 'otro' },
];

/** Map an obsesión category label → its seeded world id (falls back to 'otro'). */
export const worldForCategory = (label: string): WorldId =>
  OBSESION_CATEGORIES.find((c) => c.label === label)?.world ?? 'otro';

export type SwipeWorldId = Exclude<WorldId, 'deportes' | 'otro'>;
export const SECTION_ORDER: SwipeWorldId[] = [
  'musica',
  'peliculas',
  'series',
  'anime',
  'libros',
  'videojuegos',
];

export const OTRO_CARD = '✨ Otro';

// ─── Content model ──────────────────────────────────────────────────────────
export interface SubOption {
  name: string;
  /** Up to ~3 real example titles/artists, shown as a recall cue on the Layer-2 page. */
  examples?: string;
}

export interface WorldCard {
  /** Category name, verbatim — stored as TasteRecord.category. */
  name: string;
  emoji?: string;
  /** Single, display-only recall example shown on the Layer-1 swipe card. */
  example?: string;
  /** MÚSICA only — sub-genres (name + examples) → Layer-2 `sub`. */
  subGenres?: SubOption[];
  /** Other worlds — non-era adaptive Layer-2 multi-select → `sub`. */
  subAxis?: SubOption[];
  /** VIDEOJUEGOS social genres — Consola/PC/Móvil platform select. */
  platform?: boolean;
  planAble?: boolean;
}

export interface WorldSection {
  id: SwipeWorldId;
  label: string;
  emoji: string;
  /** Layer-2 typed prompt — "what did we miss" framing, same page as the sub-select. */
  typedLabel: string;
  typedPlaceholder: string;
  cards: WorldCard[];
}

const first = (s?: string) => (s ? s.split(',')[0].trim() : undefined);

// ─── MÚSICA — genre → sub-genre (+examples & typed on one page) ──────────────
const MUSICA: WorldSection = {
  id: 'musica',
  label: 'música',
  emoji: '🎵',
  typedLabel: '¿qué artistas nos faltaron?',
  typedPlaceholder: 'tus artistas',
  cards: [
    {
      name: 'Rock',
      subGenres: [
        { name: 'Hard rock', examples: "Guns N' Roses, Foo Fighters" },
        { name: 'Punk/pop-punk', examples: 'Green Day, Blink-182' },
        { name: 'Prog', examples: 'Pink Floyd, Radiohead' },
        { name: 'Grunge', examples: 'Nirvana, Pearl Jam' },
        { name: 'Rock en español', examples: 'Soda Stereo, Héroes del Silencio, Maná' },
      ],
    },
    {
      name: 'Indie / Alternative',
      subGenres: [
        { name: 'Alt rock', examples: 'Arctic Monkeys, The Strokes' },
        { name: 'Indie', examples: 'Tame Impala, Mac DeMarco, Gorillaz' },
        { name: 'Emo/pop-punk', examples: 'My Chemical Romance, Paramore, Fall Out Boy' },
        { name: 'Hyperpop', examples: 'Charli XCX, 100 gecs' },
      ],
    },
    {
      name: 'Pop',
      subGenres: [
        { name: 'Dance-pop', examples: 'Dua Lipa, Lady Gaga' },
        { name: 'Pop rock', examples: 'Olivia Rodrigo, Jonas Brothers, One Direction' },
        { name: 'Autoras pop', examples: 'Taylor Swift, Sabrina Carpenter, Mitski' },
        { name: 'K-pop', examples: 'BTS, BLACKPINK, KATSEYE' },
        { name: 'Pop latino', examples: 'Shakira, Karol G, Juanes' },
      ],
    },
    {
      name: 'R&B / Soul',
      subGenres: [
        { name: 'Soul/neo-soul', examples: "Amy Winehouse, Frank Ocean, D'Angelo" },
        { name: 'R&B contemporáneo', examples: 'SZA, The Weeknd, Teddy Swims' },
      ],
    },
    {
      name: 'Jazz',
      subGenres: [
        { name: 'Standards / vocal', examples: 'Nat King Cole, Frank Sinatra, Ella Fitzgerald' },
        { name: 'Cool / bebop', examples: 'Chet Baker, Miles Davis, John Coltrane' },
        { name: 'Bossa nova', examples: 'João Gilberto, Tom Jobim' },
      ],
    },
    {
      name: 'Electrónica / EDM',
      subGenres: [
        { name: 'House', examples: 'Daft Punk, Calvin Harris, Disclosure' },
        { name: 'Techno underground', examples: 'Boris Brejcha, Sara Landry, Kobosil' },
        { name: 'Tech-house/festival', examples: 'Fisher, John Summit, Cloonee' },
        { name: 'Synth/electropop', examples: 'Depeche Mode, The Killers' },
      ],
    },
    {
      name: 'Hip-Hop / Rap',
      subGenres: [
        { name: 'Conscious/lyrical', examples: 'Kendrick Lamar, J. Cole, Tyler the Creator' },
        { name: 'Trap/urbano', examples: 'Travis Scott, Drake, Bad Bunny' },
        { name: 'Old-school/boom bap', examples: 'Nas, Notorious B.I.G., Kanye West' },
      ],
    },
    {
      name: 'Salsa',
      subGenres: [
        { name: 'Salsa clásica', examples: 'Héctor Lavoe, Willie Colón, Rubén Blades' },
        { name: 'Salsa romántica', examples: 'Marc Anthony, Víctor Manuelle' },
      ],
    },
    {
      name: 'Reggaetón',
      subGenres: [
        { name: 'Reggaetón clásico', examples: 'Daddy Yankee, Don Omar, Wisin & Yandel' },
        { name: 'Urbano actual', examples: 'Bad Bunny, Feid, Karol G' },
      ],
    },
    {
      name: 'Metal',
      subGenres: [
        { name: 'Heavy', examples: 'Black Sabbath, Metallica, Iron Maiden' },
        { name: 'Thrash', examples: 'Megadeth, Slayer, System of a Down' },
        { name: 'Nu/alt-metal', examples: 'Slipknot, Tool' },
      ],
    },
  ],
};

const studio: SubOption[] = [
  { name: 'Pixar', examples: 'Toy Story, Up' },
  { name: 'DreamWorks', examples: 'Shrek, Madagascar' },
  { name: 'Ghibli', examples: "Spirited Away, Howl's" },
  { name: 'Disney', examples: 'Lion King, Frozen' },
];

// Clásico / Moderno / Contemporáneo era axis with per-era recall examples.
const era = (clasico: string, moderno: string, contemporaneo: string): SubOption[] => [
  { name: 'Clásico', examples: clasico },
  { name: 'Moderno', examples: moderno },
  { name: 'Contemporáneo', examples: contemporaneo },
];

// ─── PELÍCULAS — sensibility → adaptive sub-axis (era/studio/region) + typed ──
const PELICULAS: WorldSection = {
  id: 'peliculas',
  label: 'películas',
  emoji: '🎬',
  typedLabel: '¿qué pelis nos faltaron?',
  typedPlaceholder: 'tus pelis',
  cards: [
    { name: 'Drama', emoji: '🎭', example: 'Whiplash', subAxis: era('El Padrino, Forrest Gump', 'American Beauty, There Will Be Blood', 'Whiplash, Past Lives, Anatomy of a Fall') },
    { name: 'Películas animadas', emoji: '🧸', example: 'Toy Story', subAxis: studio },
    {
      name: 'Cine del mundo',
      emoji: '🌏',
      example: 'Amélie',
      subAxis: [
        { name: 'Asiático', examples: 'Parasite, Oldboy' },
        { name: 'Europeo', examples: 'Amélie, La Vita è Bella' },
        { name: 'Latino', examples: 'Roma' },
        { name: 'Clásicos', examples: 'El Padrino, Casablanca' },
      ],
    },
    { name: 'Sci-fi', emoji: '🧠', example: 'Interstellar', subAxis: era('2001, Blade Runner', 'Matrix, Interstellar', 'Dune, Everything Everywhere') },
    { name: 'Thriller / crimen', emoji: '🔪', example: 'Parasite', subAxis: era('Pulp Fiction, El Padrino', 'Se7en, The Departed', 'Gone Girl, Parasite') },
    { name: 'Terror', emoji: '👻', example: 'Hereditary', subAxis: era('El Exorcista, The Shining', 'Scream, El Conjuro', 'Hereditary, Midsommar') },
    { name: 'Romance', emoji: '❤️', example: 'La La Land', subAxis: era('Casablanca, Titanic', 'La La Land, The Notebook', 'Past Lives, Call Me By Your Name') },
    { name: 'Acción / superhéroes', emoji: '🦸' },
  ],
};

// ─── SERIES — genre/tone → (non-era origin) + typed ──────────────────────────
const SERIES: WorldSection = {
  id: 'series',
  label: 'series',
  emoji: '📺',
  typedLabel: '¿qué series nos faltaron?',
  typedPlaceholder: 'tus series',
  cards: [
    {
      name: 'Drama',
      emoji: '📺',
      // Absorbs K-drama + romance — 3 mainstream titles across regions signal the breadth.
      example: "Grey's Anatomy, Crash Landing on You, Élite",
      subAxis: [{ name: 'Americana' }, { name: 'Coreana' }, { name: 'Europea' }, { name: 'Latina' }],
    },
    {
      name: 'Crimen / thriller',
      emoji: '🔪',
      example: 'Narcos',
      subAxis: [
        { name: 'Americana', examples: 'You' },
        { name: 'Europea', examples: 'Lupin, Casa de Papel' },
        { name: 'Asiática' },
        { name: 'Latina', examples: 'Narcos' },
      ],
    },
    {
      name: 'True crime / documentales',
      emoji: '🕵️',
      example: 'Dahmer',
      subAxis: [{ name: 'Dahmer' }, { name: 'The Tinder Swindler' }, { name: 'Tiger King' }, { name: 'Making a Murderer' }],
    },
    {
      name: 'Sci-fi / distopía',
      emoji: '🧠',
      example: 'Stranger Things',
      subAxis: [{ name: 'Stranger Things' }, { name: 'Black Mirror' }, { name: 'Severance' }, { name: 'The Last of Us' }, { name: 'Dark' }],
    },
    {
      name: 'Sitcoms / comedia',
      emoji: '😂',
      example: 'The Office',
      subAxis: [{ name: 'Friends' }, { name: 'The Office' }, { name: 'Brooklyn 99' }, { name: 'How I Met Your Mother' }, { name: 'The Big Bang Theory' }],
    },
    {
      name: 'Fantasía / épica',
      emoji: '🐉',
      example: 'Game of Thrones',
      subAxis: [{ name: 'Game of Thrones' }, { name: 'House of the Dragon' }, { name: 'The Witcher' }, { name: 'Wednesday' }, { name: 'Vikings' }],
    },
    {
      name: 'Reality / competencia',
      emoji: '🏆',
      example: 'Love is Blind',
      subAxis: [{ name: 'Citas', examples: 'Love is Blind' }, { name: 'Competencia' }],
    },
  ],
};

// ─── ANIME / MANGA — demographic → typed ─────────────────────────────────────
const ANIME: WorldSection = {
  id: 'anime',
  label: 'anime / manga',
  emoji: '🀄',
  typedLabel: '¿qué animes nos faltaron?',
  typedPlaceholder: 'tus animes',
  cards: [
    {
      name: 'Shonen / acción',
      emoji: '⚔️',
      example: 'One Piece',
      subAxis: [{ name: 'One Piece' }, { name: 'Naruto' }, { name: 'Jujutsu Kaisen' }, { name: 'Demon Slayer' }, { name: 'Attack on Titan' }],
    },
    {
      name: 'Seinen / psicológico',
      emoji: '🩸',
      example: 'Death Note',
      subAxis: [{ name: 'Death Note' }, { name: 'Tokyo Ghoul' }, { name: 'Berserk' }, { name: 'Monster' }, { name: 'Vinland Saga' }],
    },
    {
      name: 'Romance / slice of life',
      emoji: '💕',
      example: 'Spy×Family',
      subAxis: [{ name: 'Spy×Family' }, { name: 'Your Lie in April' }, { name: 'Horimiya' }, { name: 'Fruits Basket' }, { name: 'Toradora' }],
    },
    {
      name: 'Isekai / fantasía',
      emoji: '🌀',
      example: 'Re:Zero',
      subAxis: [{ name: 'Sword Art Online' }, { name: 'Re:Zero' }, { name: 'Konosuba' }, { name: 'Mushoku Tensei' }],
    },
    {
      name: 'Ghibli / clásicos',
      emoji: '🎐',
      example: 'Totoro',
      subAxis: [{ name: 'Spirited Away' }, { name: 'Totoro' }, { name: 'Princess Mononoke' }, { name: 'Akira' }, { name: 'Cowboy Bebop' }],
    },
    {
      name: 'Deportes',
      emoji: '⚽',
      example: 'Haikyuu',
      subAxis: [{ name: 'Haikyuu' }, { name: 'Blue Lock' }, { name: 'Kuroko no Basket' }, { name: 'Slam Dunk' }],
    },
  ],
};

// ─── LIBROS — genre → typed-author primary ───────────────────────────────────
const LIBROS: WorldSection = {
  id: 'libros',
  label: 'libros',
  emoji: '📚',
  typedLabel: '¿qué autores nos faltaron?',
  typedPlaceholder: 'tus autores',
  cards: [
    { name: 'Ficción literaria', emoji: '📖', example: 'García Márquez, Murakami, Vargas Llosa' },
    { name: 'YA / sagas', emoji: '🏹', example: 'Hunger Games, Red Rising, Shadowhunters' },
    { name: 'Fantasía', emoji: '🐉', example: 'Sanderson, Tolkien, Sarah J. Maas' },
    { name: 'Sci-fi', emoji: '🚀', example: 'Dune, Asimov, Liu Cixin' },
    { name: 'Romance / romantasy', emoji: '❤️', example: 'BookTok cluster' },
    { name: 'Thriller / misterio', emoji: '🔪', example: 'Stephen King, Agatha Christie, Gillian Flynn' },
    { name: 'Filosofía / ensayos', emoji: '💭', example: 'Camus, Nietzsche' },
    { name: 'Literatura latinoamericana', emoji: '🌎', example: 'Borges, Cortázar, García Márquez' },
    { name: 'Poesía', emoji: '✒️', example: 'Neruda, Pizarnik' },
    { name: 'No ficción / divulgación', emoji: '📚', example: 'Atomic Habits' },
  ],
};

// ─── VIDEOJUEGOS — play-type → platform for social genres + typed ────────────
const PLATFORM_OPTIONS: SubOption[] = [{ name: 'Consola' }, { name: 'PC' }, { name: 'Móvil' }];

const VIDEOJUEGOS: WorldSection = {
  id: 'videojuegos',
  label: 'videojuegos',
  emoji: '🕹️',
  typedLabel: '¿qué juegos nos faltaron?',
  typedPlaceholder: 'tus juegos',
  cards: [
    { name: 'Party / Nintendo', emoji: '🎉', example: 'Mario Kart', platform: true, planAble: true },
    { name: 'Shooters / battle royale', emoji: '🔫', example: 'Fortnite', platform: true, planAble: true },
    {
      name: 'Aventura / mundo abierto',
      emoji: '🌍',
      example: 'GTA',
      planAble: false,
      subAxis: [{ name: 'GTA V' }, { name: 'Red Dead Redemption 2' }, { name: 'Zelda' }, { name: 'Elden Ring' }, { name: 'The Witcher 3' }],
    },
    { name: 'Lucha', emoji: '🥊', example: 'Mortal Kombat', platform: true, planAble: true },
    { name: 'Deportes / carreras', emoji: '⚽', example: 'FIFA', platform: true, planAble: true },
    {
      name: 'Estrategia',
      emoji: '🧠',
      example: 'Age of Empires',
      planAble: false,
      subAxis: [{ name: 'Age of Empires' }, { name: 'Civilization' }, { name: 'StarCraft' }, { name: 'Total War' }],
    },
    {
      name: 'Cozy / casual',
      emoji: '🌱',
      example: 'Stardew',
      planAble: false,
      subAxis: [{ name: 'Stardew Valley' }, { name: 'Animal Crossing' }, { name: 'Minecraft' }, { name: 'The Sims' }, { name: 'Pokémon' }],
    },
    {
      name: 'RPG / narrativos',
      emoji: '🎭',
      example: 'Final Fantasy',
      planAble: false,
      subAxis: [{ name: 'Final Fantasy' }, { name: 'The Last of Us' }, { name: 'Persona 5' }, { name: 'Life is Strange' }, { name: 'God of War' }],
    },
  ],
};

export const SECTIONS: Record<SwipeWorldId, WorldSection> = {
  musica: MUSICA,
  peliculas: PELICULAS,
  series: SERIES,
  anime: ANIME,
  libros: LIBROS,
  videojuegos: VIDEOJUEGOS,
};

export { PLATFORM_OPTIONS, first };

// ─── Swipe stop conditions ──────────────────────────────────────────────────
export const STOP_LOVES = 5;
export const STOP_PASS_STREAK = 5;

// ─── Lo último ──────────────────────────────────────────────────────────────
export const DISPONIBILIDAD: { id: 'entre_semana' | 'fin_de_semana' | 'cualquiera'; label: string }[] = [
  { id: 'entre_semana', label: 'entre semana' },
  { id: 'fin_de_semana', label: 'fin de semana' },
  { id: 'cualquiera', label: 'cualquier día' },
];

export const DIETAS: { id: 'ninguna' | 'vegetariano' | 'vegano' | 'alergias'; label: string }[] = [
  { id: 'ninguna', label: 'ninguna' },
  { id: 'vegetariano', label: 'vegetariano' },
  { id: 'vegano', label: 'vegano' },
  { id: 'alergias', label: 'alergias' },
];
