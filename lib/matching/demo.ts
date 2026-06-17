import type { QuizResponses } from '@/lib/types';
import type { ExportData, ExportRow } from './types';

/**
 * The scenario from the spec: Person A (Ana) referred by B (Bruno).
 * B also referred C, D, E. A referred F, who referred G, H, I.
 * A's 2-hop pool is all 9 people. Tastes are seeded so several
 * overlapping plans of size 4–6 emerge — including one tight group
 * (Ana, Elena, Fabio, Gabriela) that shares BOTH Pop and One Piece.
 */
function mk(
  slug: string,
  first: string,
  referredBy: string | undefined,
  taste: Partial<QuizResponses>
): ExportRow {
  return {
    slug,
    firstName: first,
    lastName: '',
    referredBy,
    payload: {
      firstName: first,
      lastName: '',
      city: 'Lima',
      age: '20',
      whatsapp: '',
      selectedWorlds: [],
      diningStyle: 'depende',
      dietary: 'ninguna',
      expPreference: 'cualquiera',
      ...taste,
    } as QuizResponses,
  };
}

const pop = { categories: ['Pop'] };
const onePiece = { categories: [], picks: ['One Piece'] };

export const DEMO_DATA: ExportData = {
  responses: [
    mk('bruno', 'Bruno', undefined, { musica: { categories: ['Pop'], eras: [], topArtists: '' } }),
    mk('ana', 'Ana', 'bruno', {
      musica: { ...pop, eras: [], topArtists: '' },
      series: { categories: ['Drama'], region: [], picks: [] },
      anime: { ...onePiece, preference: 'anime', favorites: '', current: '' },
      libros: { categories: ['Fantasía'], picks: [], topBooks: '', recent: '' },
    }),
    mk('carla', 'Carla', 'bruno', {
      musica: { ...pop, eras: [], topArtists: '' },
      videojuegos: { categories: ['Shooter'], picks: [], favorites: '' },
    }),
    mk('diego', 'Diego', 'bruno', {
      series: { categories: ['Drama'], region: [], picks: [] },
      libros: { categories: ['Fantasía'], picks: [], topBooks: '', recent: '' },
    }),
    mk('elena', 'Elena', 'bruno', {
      musica: { ...pop, eras: [], topArtists: '' },
      anime: { ...onePiece, preference: 'anime', favorites: '', current: '' },
      videojuegos: { categories: ['Shooter'], picks: [], favorites: '' },
    }),
    mk('fabio', 'Fabio', 'ana', {
      musica: { ...pop, eras: [], topArtists: '' },
      series: { categories: ['Drama'], region: [], picks: [] },
      anime: { ...onePiece, preference: 'anime', favorites: '', current: '' },
    }),
    mk('gabriela', 'Gabriela', 'fabio', {
      musica: { ...pop, eras: [], topArtists: '' },
      anime: { ...onePiece, preference: 'anime', favorites: '', current: '' },
      libros: { categories: ['Fantasía'], picks: [], topBooks: '', recent: '' },
    }),
    mk('hugo', 'Hugo', 'fabio', {
      series: { categories: ['Drama'], region: [], picks: [] },
      videojuegos: { categories: ['Shooter'], picks: [], favorites: '' },
    }),
    mk('ines', 'Ines', 'fabio', {
      series: { categories: ['Drama'], region: [], picks: [] },
      libros: { categories: ['Fantasía'], picks: [], topBooks: '', recent: '' },
      videojuegos: { categories: ['Shooter'], picks: [], favorites: '' },
    }),
  ],
  friendships: [],
};

export const DEMO_EGO = 'ana';
