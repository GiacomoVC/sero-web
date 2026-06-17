// One-off: turn the 9 legacy (previous-quiz) responses into rows for the
// current `responses` sheet, with a valid rawJson the matching engine reads.
//
//   node scripts/legacy-import.mjs > ~/sero-responses-import.tsv
//
// Category labels are PRESERVED from the old quiz on purpose (the taxonomy
// changed; titles are the cross-cohort signal). referredBy is toSlug(name of
// "Dato de") — verify those slugs match the real referrers in your sheet,
// especially "giacomo".

function toSlug(first, last = '') {
  const norm = (s) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const f = norm(first), l = norm(last);
  return f && l ? `${f}-${l}` : f || l || 'sero';
}

// dining: Escucho más→escuchar · Hablo bastante→hablar · Depende…→depende
// Each record lists worlds with preserved categories + the loved titles.
const PEOPLE = [
  {
    ts: '2026-06-02T01:06:12.298Z', first: 'Arlette', last: '', wsp: '969772611',
    datoDe: 'Cecilia', age: '29', dining: 'escuchar', dietary: 'ninguna', dietaryNote: '',
    worlds: {
      musica: { categories: ['K-pop', 'Indie alt', 'Rock clásico', 'Electrónica', 'Hyperpop / experimental'], topArtists: 'BTS, Arctic Monkeys, Beatles, The Strokes' },
      series: { categories: ['Sci-fi / distopía', 'Sitcoms', 'Animación occidental seria'], favorites: 'Abbott Elementary' },
      peliculas: { categories: ['Cine asiático', 'A24 / indie reciente'], favorites: 'Notting Hill' },
      libros: { categories: ['Ficción literaria'] },
    },
  },
  {
    ts: '2026-06-02T01:08:35.636Z', first: 'Fabiana', last: '', wsp: '953526203',
    datoDe: 'Giacomo', age: '24', dining: 'depende', dietary: 'ninguna', dietaryNote: '',
    worlds: {
      musica: { categories: ['Autoras pop', 'Indie alt'], topArtists: 'Taylor Swift, Mari becerra' },
      series: { categories: ['HBO drama', 'Sitcoms'], favorites: 'Game of Thrones, Friends, La Casa de Papel' },
    },
  },
  {
    ts: '2026-06-02T02:59:29.150Z', first: 'Dante', last: 'Zeña', wsp: '939457329',
    datoDe: '', age: '28', dining: 'hablar', dietary: 'ninguna', dietaryNote: '',
    worlds: {
      musica: { categories: ['Jazz / R&B / neo soul', 'Rock clásico', 'Indie alt'], topArtists: 'Paul McCartney, Nat King Cole, Chet Baker, Marvin Gaye, João Gilberto' },
      peliculas: { categories: ['Sci-fi pensante', 'Clásicos'], favorites: 'Magnolia, El Padrino, Goodfellas' },
    },
  },
  {
    ts: '2026-06-02T16:39:38.615Z', first: 'Yanel', last: '', wsp: '935149948',
    datoDe: 'Giacomo', age: '25', dining: 'escuchar', dietary: 'ninguna', dietaryNote: '',
    worlds: {
      series: { categories: ['Género con culto', 'Sitcoms', 'Animación occidental seria'] },
      peliculas: { categories: ['Cine asiático', 'Sci-fi pensante', 'Marvel / DC / superhéroes'] },
    },
  },
  {
    ts: '2026-06-02T20:13:14.520Z', first: 'Claudia', last: '', wsp: '924760106',
    datoDe: 'Giacomo', age: '34', dining: 'depende', dietary: 'ninguna', dietaryNote: '',
    worlds: {
      musica: { categories: ['Indie alt', 'Rock clásico', 'Rock ESP', 'Hyperpop / experimental', 'Electrónica'], topArtists: 'Arctic Monkeys, Led Zeppelin, Soda Stereo' },
      peliculas: { categories: ['Animadas', 'Clásicos'] },
      libros: { categories: ['Filosofía / ensayos', 'Ficción literaria'] },
    },
  },
  {
    ts: '2026-06-02T20:26:22.366Z', first: 'Claudia', last: 'Perez', wsp: '931969557',
    datoDe: 'Giacomo', age: '27', dining: 'depende', dietary: 'ninguna', dietaryNote: '',
    worlds: {
      musica: { categories: ['Autoras pop', 'Emo / pop punk', 'Hyperpop / experimental', 'Rock clásico', 'Rock ESP'] },
      series: { categories: ['True crime y documentales', 'HBO drama', 'Reality competitivo', 'Animación occidental seria', 'Sci-fi / distopía'] },
    },
  },
  {
    ts: '2026-06-03T23:23:26.692Z', first: 'Santiago', last: 'Velasquez', wsp: '946079424',
    datoDe: 'Giacomo', age: '30', dining: 'depende', dietary: 'ninguna', dietaryNote: '',
    worlds: {
      musica: { categories: ['Emo / pop punk', 'Indie alt', 'Electrónica', 'Rock clásico'], topArtists: 'Placebo, Ye, Blink182, Roxy Music, Bowie' },
      libros: { categories: ['Sci-fi', 'Ficción literaria'], topBooks: 'Libros de ficción histórica' },
    },
  },
  {
    ts: '2026-06-04T00:19:26.800Z', first: 'Sebastián', last: '', wsp: '924786232',
    datoDe: '', age: '20', dining: 'depende', dietary: 'alergia', dietaryNote: 'Habas, Pallares',
    worlds: {
      musica: { categories: [], topArtists: 'Kenshi Yonezu, Eve, Ado, WOS, Katseye, Sumika, DECO*27, Yorushika' },
      peliculas: { categories: ['Animadas'], favorites: 'The Father, 5 centímetros por segundo, Parasyte, Chainsaw Man Reze Arc' },
      anime: { categories: ['Isekai', 'Seinen / psicológico', 'Romance / slice of life', 'Shonen con capas'], favorites: 'Chainsaw Man, Vinland Saga, Frieren, One Punch Man, Rastros de Sangre', preference: 'ambos' },
    },
  },
  {
    ts: '2026-06-05T00:52:56.688Z', first: 'Andrea', last: '', wsp: '924845496',
    datoDe: '', age: '31', dining: 'depende', dietary: 'alergia', dietaryNote: 'Sin lactosa',
    worlds: {
      musica: { categories: ['Electrónica'], topArtists: 'Sara landry, kobosil, cloonee, Franky rizardo, fisher, Jhon summit, maluggi, novah, anhedonia' },
    },
  },
];

const HEADERS = [
  'timestamp', 'slug', 'referredBy', 'firstName', 'lastName', 'city', 'age', 'whatsapp',
  'selectedWorlds', 'otrosMundos',
  'musica.categories', 'musica.picks', 'musica.eras', 'musica.topArtists',
  'series.categories', 'series.picks', 'series.seriesOtro', 'series.region', 'series.netflixPick',
  'peliculas.categories', 'peliculas.picks', 'peliculas.tipo', 'peliculas.favorites',
  'anime.categories', 'anime.picks', 'anime.preference', 'anime.favorites', 'anime.current',
  'libros.categories', 'libros.picks', 'libros.topBooks', 'libros.recent',
  'deportes.selected', 'deportes.otros',
  'videojuegos.categories', 'videojuegos.picks', 'videojuegos.favorites',
  'diningStyle', 'dietary', 'dietaryNote', 'expPreference', 'rawJson',
];

const join = (a) => (a && a.length ? a.join(', ') : '');

function buildPayload(p, slug) {
  const w = p.worlds;
  const payload = {
    firstName: p.first, lastName: p.last, city: '', age: p.age, whatsapp: p.wsp,
    selectedWorlds: Object.keys(w),
    diningStyle: p.dining, dietary: p.dietary,
    ...(p.dietaryNote ? { dietaryNote: p.dietaryNote } : {}),
    expPreference: 'cualquiera',
    ...(p.datoDe ? { referredBy: toSlug(p.datoDe) } : {}),
  };
  if (w.musica) payload.musica = { categories: w.musica.categories || [], eras: [], topArtists: w.musica.topArtists || '' };
  if (w.series) payload.series = { categories: w.series.categories || [], region: [], favorites: w.series.favorites || '' };
  if (w.peliculas) payload.peliculas = { categories: w.peliculas.categories || [], tipo: [], favorites: w.peliculas.favorites || '' };
  if (w.anime) payload.anime = { categories: w.anime.categories || [], preference: w.anime.preference || 'ambos', favorites: w.anime.favorites || '', current: '' };
  if (w.libros) payload.libros = { categories: w.libros.categories || [], topBooks: w.libros.topBooks || '', recent: '' };
  if (w.videojuegos) payload.videojuegos = { categories: w.videojuegos.categories || [], favorites: w.videojuegos.favorites || '' };
  return payload;
}

const rows = [HEADERS.join('\t')];

for (const p of PEOPLE) {
  const slug = toSlug(p.first, p.last);
  const w = p.worlds;
  const payload = buildPayload(p, slug);
  const cell = {
    timestamp: p.ts, slug, referredBy: p.datoDe ? toSlug(p.datoDe) : '',
    firstName: p.first, lastName: p.last, city: '', age: p.age, whatsapp: p.wsp,
    selectedWorlds: join(Object.keys(w)), 'otrosMundos': '',
    'musica.categories': join(w.musica?.categories), 'musica.picks': '', 'musica.eras': '', 'musica.topArtists': w.musica?.topArtists || '',
    'series.categories': join(w.series?.categories), 'series.picks': '', 'series.seriesOtro': '', 'series.region': '', 'series.netflixPick': w.series?.favorites || '',
    'peliculas.categories': join(w.peliculas?.categories), 'peliculas.picks': '', 'peliculas.tipo': '', 'peliculas.favorites': w.peliculas?.favorites || '',
    'anime.categories': join(w.anime?.categories), 'anime.picks': '', 'anime.preference': w.anime?.preference || '', 'anime.favorites': w.anime?.favorites || '', 'anime.current': '',
    'libros.categories': join(w.libros?.categories), 'libros.picks': '', 'libros.topBooks': w.libros?.topBooks || '', 'libros.recent': '',
    'deportes.selected': '', 'deportes.otros': '',
    'videojuegos.categories': join(w.videojuegos?.categories), 'videojuegos.picks': '', 'videojuegos.favorites': w.videojuegos?.favorites || '',
    diningStyle: p.dining, dietary: p.dietary, dietaryNote: p.dietaryNote || '', expPreference: 'cualquiera',
    rawJson: JSON.stringify(payload),
  };
  rows.push(HEADERS.map((h) => String(cell[h] ?? '')).join('\t'));
}

process.stdout.write(rows.join('\n') + '\n');
