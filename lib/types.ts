// ─── Sero quiz schema (swipe-stories taste quiz) ────────────────────────────
// Unified cross-world schema. The identity page + matching engine read this
// shape directly, so field names and nesting here are the stable contract.

export type WorldId =
  | 'musica'
  | 'peliculas'
  | 'series'
  | 'anime'
  | 'libros'
  | 'videojuegos'
  | 'deportes'
  | 'otro';

export type Reaction = 'love' | 'pass';

/**
 * One Layer-1 category card's result within a world.
 *
 * `sub` and `eras` are INDEPENDENT sibling arrays (never nested): they are two
 * different signal types downstream — `sub` = category breadth, `eras` =
 * bonding enrichment. `typed` = the costly precise-match signal.
 */
export interface TasteRecord {
  /** Layer-1 card name, verbatim (e.g. "Indie / Alternative"). */
  category: string;
  /** Swipe result. Passes are kept — honest "not my world" data. */
  reaction: Reaction;
  /** Layer-2 adaptive multi-select: sub-genre / studio / region / origin. */
  sub?: string[];
  /** VIDEOJUEGOS social genres only — Consola / PC / Móvil. */
  platform?: string[];
  /** User-typed favorites — precise-match tier, high weight. */
  typed?: string[];
  /** VIDEOJUEGOS only — internal gathering tag from the card. */
  plan_able?: boolean;
  /** Free text from the "✨ Otro" card (category === "✨ Otro"). */
  otro?: string;
}

/** Deportes is intentionally simple — practiced/watched is its real axis. */
export interface DeportesRecord {
  relation: ('practico' | 'veo')[];
  typed?: string[];
}

export interface QuizSchema {
  // ── Lo básico ──
  name: string;
  apellido: string;
  ciudad: string;
  edad: string;
  whatsapp: string;

  /** Captured silently from ?ref in the URL. */
  referred_by?: string;

  /** Worlds selected on page 2. Determines which sections appear. */
  worlds: WorldId[];

  // ── Per-world taste ──
  taste: {
    musica?: TasteRecord[];
    peliculas?: TasteRecord[];
    series?: TasteRecord[];
    anime?: TasteRecord[];
    libros?: TasteRecord[];
    videojuegos?: TasteRecord[];
    deportes?: DeportesRecord;
    /** Heart-icon world → free text (high-signal identity). */
    otro?: string;
  };

  /**
   * Obsessions captured early (right after Lo básico) — the living, shareable
   * signals. Each row: a specific item + optional link, tagged to a seeded
   * `world` (gastronomía/viajes have no world → stored under `world='otro'`,
   * with the human label kept in `category`). Empty rows are dropped on submit.
   */
  obsesiones?: { world: string; category?: string; item_text: string; link?: string }[];

  // ── Lo último ──
  logistics: {
    rol: 'hablar' | 'escuchar';
    plus_one: boolean;
    /** Low-effort availability bucket (was a 7-day multi-select). */
    disponibilidad: 'entre_semana' | 'fin_de_semana' | 'cualquiera';
    dieta: ('ninguna' | 'vegetariano' | 'vegano' | 'alergias')[];
    dieta_note?: string;
  };

  created_at?: string;
}

/**
 * Back-compat alias. Existing imports (`matching/*`, `extractTags`, `api/submit`)
 * keep referencing `QuizResponses`, now pointing at the new schema.
 */
export type QuizResponses = QuizSchema;

export interface SubmitResult {
  slug: string;
  url: string;
  igUrl: string;
  whatsappMessage: string;
  tags: string[];
  matches?: Array<{
    slug: string;
    name: string;
    commonCount: number;
    mutualFriend?: string;
  }>;
}
