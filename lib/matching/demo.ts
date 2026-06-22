import type { QuizSchema } from '@/lib/types';
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
  taste: QuizSchema['taste'],
): ExportRow {
  return {
    slug,
    firstName: first,
    lastName: '',
    referredBy,
    payload: {
      name: first,
      apellido: '',
      ciudad: 'Lima',
      edad: '20',
      whatsapp: '',
      referred_by: referredBy,
      worlds: [],
      taste,
      logistics: { rol: 'hablar', plus_one: false, disponibilidad: 'cualquiera', dieta: ['ninguna'] },
    },
  };
}

const pop: QuizSchema['taste'] = { musica: [{ category: 'Pop', reaction: 'love' }] };
const onePiece: QuizSchema['taste'] = {
  anime: [{ category: 'Shonen / acción', reaction: 'love', typed: ['One Piece'] }],
};
const drama: QuizSchema['taste'] = { series: [{ category: 'Drama prestigio', reaction: 'love' }] };
const fantasy: QuizSchema['taste'] = { libros: [{ category: 'Fantasía / sci-fi', reaction: 'love' }] };
const shooter: QuizSchema['taste'] = {
  videojuegos: [{ category: 'Shooters / battle royale', reaction: 'love', plan_able: true }],
};

export const DEMO_DATA: ExportData = {
  responses: [
    mk('bruno', 'Bruno', undefined, { ...pop }),
    mk('ana', 'Ana', 'bruno', { ...pop, ...drama, ...onePiece, ...fantasy }),
    mk('carla', 'Carla', 'bruno', { ...pop, ...shooter }),
    mk('diego', 'Diego', 'bruno', { ...drama, ...fantasy }),
    mk('elena', 'Elena', 'bruno', { ...pop, ...onePiece, ...shooter }),
    mk('fabio', 'Fabio', 'ana', { ...pop, ...drama, ...onePiece }),
    mk('gabriela', 'Gabriela', 'fabio', { ...pop, ...onePiece, ...fantasy }),
    mk('hugo', 'Hugo', 'fabio', { ...drama, ...shooter }),
    mk('ines', 'Ines', 'fabio', { ...drama, ...fantasy, ...shooter }),
  ],
  friendships: [],
};

export const DEMO_EGO = 'ana';
